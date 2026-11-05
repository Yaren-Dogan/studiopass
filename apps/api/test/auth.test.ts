import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { signToken, verifyToken, TOKEN_TTL_SECONDS } from "../src/lib/auth.js";
import { startServer } from "./helpers.js";

describe("Kimlik doğrulama · US-01 / FR-01, FR-02", () => {
  let s: Awaited<ReturnType<typeof startServer>>;
  before(async () => { s = await startServer(); });
  after(() => s.close());

  it("TC-01 doğru bilgilerle token ve kullanıcı döner", async () => {
    const res = await s.call("POST", "/api/auth/login", { body: { email: "elif@studiopass.dev", password: "Studio123!" } });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, "owner");
    assert.match(res.body.token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
  });

  it("TC-02 hatalı şifrede hangi alanın yanlış olduğunu söylemez", async () => {
    const wrongPw = await s.call("POST", "/api/auth/login", { body: { email: "elif@studiopass.dev", password: "yanlis" } });
    const unknown = await s.call("POST", "/api/auth/login", { body: { email: "yok@studiopass.dev", password: "Studio123!" } });
    assert.equal(wrongPw.status, 401);
    assert.deepEqual(wrongPw.body, unknown.body, "iki durumda yanıt aynı olmalı");
    assert.equal(wrongPw.body.error.message, "E-posta veya şifre hatalı");
  });

  it("TC-03 boş formda alan bazlı doğrulama hatası döner", async () => {
    const res = await s.call("POST", "/api/auth/login", { body: {} });
    assert.equal(res.status, 400);
    assert.deepEqual(Object.keys(res.body.error.fields).sort(), ["email", "password"]);
  });

  it("TC-04 süresi dolan token reddedilir", () => {
    const user = { id: "u1", name: "Test", email: "t@t.com", role: "owner" as const };
    const issuedAt = 1_700_000_000;
    const token = signToken(user, issuedAt);
    assert.equal(verifyToken(token, issuedAt + TOKEN_TTL_SECONDS - 1).id, "u1");
    assert.throws(() => verifyToken(token, issuedAt + TOKEN_TTL_SECONDS + 1), /süresi doldu/);
  });

  it("değiştirilmiş token reddedilir", async () => {
    const token = await s.login("instructor");
    const [h, p, sig] = token.split(".");
    const payload = JSON.parse(Buffer.from(p, "base64url").toString());
    payload.role = "owner";
    const forged = `${h}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${sig}`;
    const res = await s.call("GET", "/api/dashboard", { token: forged });
    assert.equal(res.status, 401);
  });

  it("token olmadan korumalı uç noktaya erişilemez", async () => {
    const res = await s.call("GET", "/api/members");
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "UNAUTHENTICATED");
  });
});
