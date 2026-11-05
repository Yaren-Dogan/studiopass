import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { db, resetDb } from "../src/store.js";
import { startServer } from "./helpers.js";

/** STUDIOPASS_TODAY=2026-11-04 (Çarşamba) — hafta 2026-11-02 Pazartesi başlar. */
describe("Planlar, dersler ve rezervasyon · US-06, US-07, US-08, US-09", () => {
  let s: Awaited<ReturnType<typeof startServer>>;
  let owner: string, manager: string, deniz: string, selin: string;
  before(async () => {
    s = await startServer();
    [owner, manager, deniz, selin] = await Promise.all([s.login("owner"), s.login("manager"), s.login("instructor"), s.login("instructor2")]);
  });
  beforeEach(() => resetDb());
  after(() => s.close());

  const futureClass = (pred: (c: (typeof db.classes)[number]) => boolean = () => true) =>
    db.classes.find((c) => Date.parse(c.startsAt) > Date.parse("2026-11-04T09:00:00Z") && pred(c))!;
  const memberByName = (first: string) => db.members.find((m) => m.firstName === first)!;

  describe("Planlar · US-06", () => {
    it("TC-18 sahip plan oluşturabilir", async () => {
      const res = await s.call("POST", "/api/plans", { token: owner, body: { name: "10 Ders Paketi", priceKurus: 125000, durationDays: 60, monthlyClassLimit: 10 } });
      assert.equal(res.status, 201);
      assert.equal(res.body.isOnSale, true);
    });

    it("TC-19 negatif fiyat reddedilir", async () => {
      const res = await s.call("POST", "/api/plans", { token: owner, body: { name: "X", priceKurus: -500, durationDays: 30 } });
      assert.equal(res.status, 400);
      assert.equal(res.body.error.fields.priceKurus, "Fiyat 0'dan büyük olmalı");
    });

    it("TC-20 yönetici plan oluşturamaz (sadece sahip)", async () => {
      const res = await s.call("POST", "/api/plans", { token: manager, body: { name: "X", priceKurus: 100, durationDays: 30 } });
      assert.equal(res.status, 403);
    });

    it("plan satıştan kaldırılabilir (BR-04)", async () => {
      const plan = db.plans[0];
      const res = await s.call("PATCH", `/api/plans/${plan.id}`, { token: owner, body: { isOnSale: false } });
      assert.equal(res.body.isOnSale, false);
      assert.equal(db.plans.length, 5, "plan silinmez");
    });
  });

  describe("Ders oluşturma · US-07", () => {
    it("TC-21 geçerli ders oluşturulur", async () => {
      const instr = db.users.find((u) => u.role === "instructor")!;
      const res = await s.call("POST", "/api/classes", { token: manager, body: { title: "Akşam Akışı", instructorId: instr.id, startsAt: "2026-11-06T16:00:00Z", durationMin: 60, capacity: 10 } });
      assert.equal(res.status, 201);
      assert.equal(res.body.booked, 0);
    });

    it("TC-22 kapasite 1-50 dışında reddedilir", async () => {
      const instr = db.users.find((u) => u.role === "instructor")!;
      for (const capacity of [0, 51]) {
        const res = await s.call("POST", "/api/classes", { token: manager, body: { title: "X", instructorId: instr.id, startsAt: "2026-11-06T16:00:00Z", durationMin: 60, capacity } });
        assert.equal(res.status, 400);
        assert.equal(res.body.error.fields.capacity, "Kapasite 1 ile 50 arasında olmalı");
      }
    });

    it("geçmiş tarihe ders oluşturulamaz", async () => {
      const instr = db.users.find((u) => u.role === "instructor")!;
      const res = await s.call("POST", "/api/classes", { token: manager, body: { title: "X", instructorId: instr.id, startsAt: "2026-11-01T16:00:00Z", durationMin: 60, capacity: 5 } });
      assert.equal(res.status, 400);
    });

    it("haftalık liste Pazartesi'den başlar ve sıralıdır", async () => {
      const res = await s.call("GET", "/api/classes", { token: manager });
      assert.equal(res.body.from, "2026-11-02");
      assert.equal(res.body.items.length, 9);
      const times = res.body.items.map((c: { startsAt: string }) => c.startsAt);
      assert.deepEqual(times, [...times].sort());
    });
  });

  describe("Rezervasyon kuralları · US-08 / FR-10", () => {
    it("TC-23 aktif üye boş yere yazılır, doluluk artar", async () => {
      const c = futureClass((x) => x.capacity - db.bookings.filter((b) => b.classId === x.id).length >= 2);
      const before = db.bookings.filter((b) => b.classId === c.id).length;
      const free = db.members.find((m) => m.firstName === "Melis")!;
      db.bookings = db.bookings.filter((b) => !(b.classId === c.id && b.memberId === free.id));
      const res = await s.call("POST", `/api/classes/${c.id}/bookings`, { token: manager, body: { memberId: free.id } });
      assert.equal(res.status, 201);
      assert.ok(res.body.class.booked >= before);
    });

    it("TC-24 dolu derse yazılamaz (409 CLASS_FULL) — kapasite sınırında", async () => {
      const c = futureClass();
      c.capacity = 2;
      db.bookings = db.bookings.filter((b) => b.classId !== c.id);
      const [a, b, third] = ["Ayşe", "Burak", "Zeynep"].map(memberByName);
      assert.equal((await s.call("POST", `/api/classes/${c.id}/bookings`, { token: manager, body: { memberId: a.id } })).status, 201);
      const second = await s.call("POST", `/api/classes/${c.id}/bookings`, { token: manager, body: { memberId: b.id } });
      assert.equal(second.status, 201, "son boş yer alınabilmeli (sınır değer)");
      assert.equal(second.body.class.isFull, true);
      const res = await s.call("POST", `/api/classes/${c.id}/bookings`, { token: manager, body: { memberId: third.id } });
      assert.equal(res.status, 409);
      assert.equal(res.body.error.code, "CLASS_FULL");
    });

    it("TC-25 süresi dolmuş üyelik reddedilir (422)", async () => {
      const c = futureClass();
      const ilker = memberByName("İlker"); // 3 gün önce bitti
      const res = await s.call("POST", `/api/classes/${c.id}/bookings`, { token: manager, body: { memberId: ilker.id } });
      assert.equal(res.status, 422);
      assert.equal(res.body.error.message, "Üyenin aktif bir planı yok");
    });

    it("bugün biten üyelik hâlâ aktiftir (sınır değer)", async () => {
      const c = futureClass();
      const selinTas = db.members.find((m) => m.lastName === "Taş")!;
      const ms = db.memberships.find((x) => x.memberId === selinTas.id)!;
      ms.endDate = "2026-11-04";
      db.bookings = db.bookings.filter((b) => !(b.classId === c.id && b.memberId === selinTas.id));
      c.capacity = 50;
      const res = await s.call("POST", `/api/classes/${c.id}/bookings`, { token: manager, body: { memberId: selinTas.id } });
      assert.equal(res.status, 201);
    });

    it("TC-26 aynı üye aynı derse iki kez yazılamaz (409)", async () => {
      const c = futureClass();
      c.capacity = 50;
      const m = memberByName("Zeynep");
      db.bookings = db.bookings.filter((b) => !(b.classId === c.id && b.memberId === m.id));
      await s.call("POST", `/api/classes/${c.id}/bookings`, { token: manager, body: { memberId: m.id } });
      const res = await s.call("POST", `/api/classes/${c.id}/bookings`, { token: manager, body: { memberId: m.id } });
      assert.equal(res.status, 409);
      assert.equal(res.body.error.code, "ALREADY_BOOKED");
    });

    it("geçmiş derse rezervasyon yapılamaz (BR-03)", async () => {
      const past = db.classes.find((c) => Date.parse(c.startsAt) < Date.parse("2026-11-04T09:00:00Z"))!;
      const res = await s.call("POST", `/api/classes/${past.id}/bookings`, { token: manager, body: { memberId: memberByName("Zeynep").id } });
      assert.equal(res.status, 422);
      assert.equal(res.body.error.code, "CLASS_IN_PAST");
    });

    it("eğitmen sadece kendi dersine katılımcı ekleyebilir", async () => {
      const denizId = db.users.find((u) => u.email === "deniz@studiopass.dev")!.id;
      const selinsClass = futureClass((c) => c.instructorId !== denizId);
      const res = await s.call("POST", `/api/classes/${selinsClass.id}/bookings`, { token: deniz, body: { memberId: memberByName("Zeynep").id } });
      assert.equal(res.status, 403);
      const own = await s.call("GET", "/api/classes?mine=true", { token: selin });
      assert.ok(own.body.items.length > 0);
      assert.ok(own.body.items.every((c: { instructor: { name: string } }) => c.instructor.name === "Selin Öztürk"));
      const ownClass = db.classes.find((c) => c.instructorId === denizId && Date.parse(c.startsAt) > Date.parse("2026-11-04T09:00:00Z"))!;
      ownClass.capacity = 50;
      const m = memberByName("Zeynep");
      db.bookings = db.bookings.filter((b) => !(b.classId === ownClass.id && b.memberId === m.id));
      const ok = await s.call("POST", `/api/classes/${ownClass.id}/bookings`, { token: deniz, body: { memberId: m.id } });
      assert.equal(ok.status, 201, "kendi dersine ekleyebilir");
    });
  });

  describe("Özet panel · US-09", () => {
    it("TC-27 göstergeler veriyle tutarlıdır", async () => {
      const res = await s.call("GET", "/api/dashboard", { token: owner });
      assert.equal(res.status, 200);
      const members = await s.call("GET", "/api/members?status=active", { token: owner });
      assert.equal(res.body.activeMembers, members.body.total);
      assert.ok(res.body.expiringThisMonth.items.every((i: { endDate: string }) => i.endDate >= "2026-11-04" && i.endDate <= "2026-11-30"));
      const { booked, capacity, rate } = res.body.weekOccupancy;
      assert.equal(rate, Math.round((booked / capacity) * 100));
      const distTotal = res.body.planDistribution.reduce((s: number, p: { count: number }) => s + p.count, 0);
      assert.equal(distTotal, res.body.activeMembers);
    });
  });
});
