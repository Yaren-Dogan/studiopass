import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeTr } from "../src/lib/text.js";
import { resetDb } from "../src/store.js";
import { startServer } from "./helpers.js";

describe("Üyeler · US-02, US-03, US-04, US-05, US-10", () => {
  let s: Awaited<ReturnType<typeof startServer>>;
  let owner: string, manager: string, instructor: string;
  before(async () => {
    s = await startServer();
    [owner, manager, instructor] = await Promise.all([s.login("owner"), s.login("manager"), s.login("instructor")]);
  });
  beforeEach(() => resetDb());
  after(() => s.close());

  describe("Türkçe duyarsız arama (BUG-007 regresyon testi)", () => {
    for (const [input, expected] of [["AYŞE", "ayse"], ["İlker", "ilker"], ["IŞIL", "isil"], ["Gökçe", "gokce"], ["  Şule ", "sule"]]) {
      it(`normalizeTr("${input}") → "${expected}"`, () => assert.equal(normalizeTr(input), expected));
    }

    for (const q of ["ayşe", "AYŞE", "ayse", "Ayşe Yıl"]) {
      it(`TC-08 "${q}" araması Ayşe Yılmaz'ı bulur`, async () => {
        const res = await s.call("GET", `/api/members?search=${encodeURIComponent(q)}`, { token: manager });
        assert.ok(res.body.items.some((m: { firstName: string }) => m.firstName === "Ayşe"));
      });
    }

    it('"ilker" araması "İlker Çelik"i bulur', async () => {
      const res = await s.call("GET", "/api/members?search=ilker", { token: manager });
      assert.equal(res.body.items[0]?.lastName, "Çelik");
    });
  });

  it("TC-09 'Süresi dolmuş' filtresi sadece bitişi geçmiş üyeleri döner", async () => {
    const res = await s.call("GET", "/api/members?status=expired", { token: manager });
    assert.ok(res.body.total > 0);
    for (const m of res.body.items) {
      assert.equal(m.status, "expired");
      assert.ok(m.plan.endDate < "2026-11-04");
    }
  });

  it("TC-10 sonuç yoksa boş liste döner", async () => {
    const res = await s.call("GET", "/api/members?search=zzzz", { token: manager });
    assert.deepEqual([res.body.items.length, res.body.total], [0, 0]);
  });

  it("TC-29 liste 20'şer kayıt sayfalanır", async () => {
    const p1 = await s.call("GET", "/api/members", { token: manager });
    const p2 = await s.call("GET", "/api/members?page=2", { token: manager });
    assert.equal(p1.body.items.length, 20);
    assert.equal(p2.body.items.length, p1.body.total - 20);
    assert.equal(p1.body.totalPages, 2);
  });

  describe("Rol bazlı görünüm · US-02", () => {
    it("TC-05 eğitmen e-posta ve telefon göremez", async () => {
      const res = await s.call("GET", "/api/members", { token: instructor });
      assert.equal(res.status, 200);
      for (const m of res.body.items) {
        assert.equal(m.email, undefined);
        assert.equal(m.phone, undefined);
      }
    });

    it("eğitmen e-postayla arama yapıp üyenin e-postasını tahmin edemez", async () => {
      const res = await s.call("GET", "/api/members?search=ornek.com", { token: instructor });
      assert.equal(res.body.total, 0);
    });

    it("TC-06 eğitmen üye ekleyemez (403)", async () => {
      const res = await s.call("POST", "/api/members", { token: instructor, body: { firstName: "A", lastName: "B", email: "a@b.com" } });
      assert.equal(res.status, 403);
    });

    it("TC-07 eğitmen özet paneli göremez (403)", async () => {
      const res = await s.call("GET", "/api/dashboard", { token: instructor });
      assert.equal(res.status, 403);
    });
  });

  describe("Üye ekleme · US-04", () => {
    it("TC-11 geçerli kayıt 201 döner ve listenin başına eklenir", async () => {
      const res = await s.call("POST", "/api/members", { token: manager, body: { firstName: " Yeni ", lastName: "Üye", email: "Yeni.Uye@Ornek.com" } });
      assert.equal(res.status, 201);
      assert.equal(res.body.firstName, "Yeni");
      assert.equal(res.body.email, "yeni.uye@ornek.com");
      assert.equal(res.body.status, "none");
      const list = await s.call("GET", "/api/members", { token: manager });
      assert.equal(list.body.items[0].id, res.body.id);
    });

    it("TC-12 mükerrer e-posta 409 döner (büyük/küçük harf duyarsız)", async () => {
      const res = await s.call("POST", "/api/members", { token: manager, body: { firstName: "A", lastName: "B", email: "AYSE.YILMAZ@ornek.com" } });
      assert.equal(res.status, 409);
      assert.equal(res.body.error.fields.email, "Bu e-posta ile kayıtlı bir üye zaten var");
    });

    it("TC-13 geçersiz e-posta alan hatası döner", async () => {
      const res = await s.call("POST", "/api/members", { token: manager, body: { firstName: "A", lastName: "B", email: "ayse@" } });
      assert.equal(res.status, 400);
      assert.equal(res.body.error.fields.email, "Geçerli bir e-posta adresi girin");
    });

    it("TC-14 zorunlu alanlar eksikse hepsi birlikte raporlanır", async () => {
      const res = await s.call("POST", "/api/members", { token: manager, body: {} });
      assert.deepEqual(Object.keys(res.body.error.fields).sort(), ["email", "firstName", "lastName"]);
    });
  });

  describe("Plan atama · US-05", () => {
    async function firstPlan(name: string) {
      const plans = await s.call("GET", "/api/plans", { token: owner });
      return plans.body.items.find((p: { name: string }) => p.name === name);
    }

    it("TC-15 bitiş tarihi = başlangıç + plan süresi", async () => {
      const member = (await s.call("POST", "/api/members", { token: manager, body: { firstName: "A", lastName: "B", email: "plan@test.com" } })).body;
      const plan = await firstPlan("Aylık Sınırsız");
      const res = await s.call("POST", `/api/members/${member.id}/memberships`, { token: manager, body: { planId: plan.id, startDate: "2026-11-01" } });
      assert.equal(res.status, 201);
      assert.equal(res.body.membership.endDate, "2026-12-01");
      assert.equal(res.body.member.status, "active");
    });

    it("TC-16 yeni plan eski aktif üyeliği bugün kapatır (BR-01)", async () => {
      const list = await s.call("GET", "/api/members?search=ayşe", { token: manager });
      const ayse = list.body.items[0];
      assert.equal(ayse.status, "active");
      const plan = await firstPlan("3 Aylık Sınırsız");
      await s.call("POST", `/api/members/${ayse.id}/memberships`, { token: manager, body: { planId: plan.id } });
      const detail = await s.call("GET", `/api/members/${ayse.id}`, { token: manager });
      assert.equal(detail.body.history.length, 2);
      assert.equal(detail.body.history[1].endDate, "2026-11-04");
      assert.equal(detail.body.plan.name, "3 Aylık Sınırsız");
    });

    it("satıştan kaldırılmış plan atanamaz (BR-04)", async () => {
      const list = await s.call("GET", "/api/members?search=ayşe", { token: manager });
      const plan = await firstPlan("Yaz Kampanyası");
      const res = await s.call("POST", `/api/members/${list.body.items[0].id}/memberships`, { token: manager, body: { planId: plan.id } });
      assert.equal(res.status, 422);
    });
  });

  it("TC-28 pasife alınan üye 'inactive' olur ve silinmez", async () => {
    const list = await s.call("GET", "/api/members?search=burak", { token: manager });
    const id = list.body.items[0].id;
    const res = await s.call("POST", `/api/members/${id}/deactivate`, { token: manager });
    assert.equal(res.body.status, "inactive");
    const again = await s.call("GET", `/api/members/${id}`, { token: manager });
    assert.equal(again.status, 200);
  });

  it("bilinmeyen üye 404 döner", async () => {
    const res = await s.call("GET", "/api/members/yok", { token: manager });
    assert.equal(res.status, 404);
  });
});
