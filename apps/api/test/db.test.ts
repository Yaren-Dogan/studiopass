import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadDb, openDatabase, saveDb } from "../src/db/sqlite.js";
import { createSeedDb } from "../src/store.js";

describe("SQLite kalıcı depolama · ADR-005", () => {
  const dir = mkdtempSync(join(tmpdir(), "studiopass-"));
  after(() => rmSync(dir, { recursive: true, force: true }));

  it("boş veritabanında loadDb null döner", () => {
    const conn = openDatabase(join(dir, "bos.db"));
    assert.equal(loadDb(conn), null);
  });

  it("kaydedilen veri aynen geri okunur (round-trip)", () => {
    const path = join(dir, "rt.db");
    const seed = createSeedDb();
    saveDb(openDatabase(path), seed);
    const loaded = loadDb(openDatabase(path))!; // yeni bağlantı = sunucu yeniden başlamış gibi
    for (const k of Object.keys(seed) as (keyof typeof seed)[]) {
      const byId = (a: { id: string }[]) => [...a].sort((x, y) => x.id.localeCompare(y.id));
      assert.deepEqual(byId(loaded[k]), byId(seed[k]), `${k} tablosu farklı`);
    }
  });

  it("şema kısıtı ihlalinde işlem geri alınır, eski veri korunur", () => {
    const path = join(dir, "kisit.db");
    const conn = openDatabase(path);
    const seed = createSeedDb();
    saveDb(conn, seed);
    const broken = structuredClone(seed);
    broken.members[1].email = broken.members[0].email.toUpperCase(); // UNIQUE COLLATE NOCASE
    assert.throws(() => saveDb(conn, broken), /UNIQUE/);
    assert.equal(loadDb(conn)!.members.length, seed.members.length);
    assert.notEqual(loadDb(conn)!.members[1].email, broken.members[1].email);
  });

  it("aynı üye aynı derse iki kez yazılamaz (veritabanı seviyesinde, FR-10)", () => {
    const conn = openDatabase(join(dir, "booking.db"));
    const seed = createSeedDb();
    seed.bookings.push({ ...seed.bookings[0], id: "kopya" });
    assert.throws(() => saveDb(conn, seed), /UNIQUE/);
  });

  it("görünümler sorgulanabilir", () => {
    const conn = openDatabase(join(dir, "view.db"));
    saveDb(conn, createSeedDb());
    const rows = conn.prepare("SELECT durum, count(*) AS n FROM v_member_status GROUP BY durum").all() as { durum: string; n: number }[];
    assert.ok(rows.some((r) => r.durum === "aktif"));
    const occ = conn.prepare("SELECT * FROM v_class_occupancy").all();
    assert.equal(occ.length, 11);
  });
});

describe("Veritabanı görüntüleyici · GET /api/admin/database", async () => {
  const { startServer } = await import("./helpers.js");
  let s: Awaited<ReturnType<typeof startServer>>;
  before(async () => { s = await startServer(); });
  after(() => s.close());

  it("sahip 6 tabloyu ve 2 görünümü SQL'den okur, şifre özeti gizlidir", async () => {
    const res = await s.call("GET", "/api/admin/database", { token: await s.login("owner") });
    assert.equal(res.status, 200);
    const names = res.body.items.map((i: { name: string }) => i.name);
    for (const t of ["users", "members", "plans", "memberships", "class_sessions", "bookings", "v_member_status", "v_class_occupancy"]) assert.ok(names.includes(t), t);
    const users = res.body.items.find((i: { name: string }) => i.name === "users");
    assert.equal(users.total, 4);
    assert.ok(users.rows.every((r: { password_hash: string }) => !r.password_hash.startsWith("scrypt$")));
    const bookings = res.body.items.find((i: { name: string }) => i.name === "bookings");
    assert.deepEqual(bookings.foreignKeys.map((f: { references: string }) => f.references).sort(), ["class_sessions.id", "members.id"]);
  });

  it("yönetici ve eğitmen erişemez (403)", async () => {
    for (const role of ["manager", "instructor"] as const) {
      const res = await s.call("GET", "/api/admin/database", { token: await s.login(role) });
      assert.equal(res.status, 403);
    }
  });
});
