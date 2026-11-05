import { requireAuth, requireRole, signToken, verifyPassword } from "./lib/auth.js";
import { addDays, endOfMonth, isIsoDate, nowMs, startOfWeek, today } from "./lib/dates.js";
import { HttpError, Router, type Ctx } from "./lib/http.js";
import { normalizeTr } from "./lib/text.js";
import { rules as r, validate } from "./lib/validate.js";
import { bookingCount, currentMembership, memberStatus, toClassDto, toMemberDto, toPlanDto, type MemberStatus } from "./domain.js";
import { db, newId, resetDb, type Member } from "./store.js";

export const PAGE_SIZE = 20; // FR-13

const findMember = (id: string) => {
  const m = db.members.find((x) => x.id === id);
  if (!m) throw new HttpError(404, "MEMBER_NOT_FOUND", "Üye bulunamadı");
  return m;
};
const findClass = (id: string) => {
  const c = db.classes.find((x) => x.id === id);
  if (!c) throw new HttpError(404, "CLASS_NOT_FOUND", "Ders bulunamadı");
  return c;
};
const emailTaken = (email: string, exceptId?: string) =>
  db.members.some((m) => m.id !== exceptId && m.email.toLowerCase() === email.toLowerCase());

const staff = requireRole("owner", "manager");
const owner = requireRole("owner");

export function buildRouter() {
  const router = new Router();

  router.get("/api/health", () => ({ status: "ok", version: "1.0.0" }));

  // ---------- Kimlik doğrulama (FR-01, FR-02)
  router.post("/api/auth/login", (ctx) => {
    const body = validate<{ email: string; password: string }>(ctx.body, {
      email: [r.required("E-posta zorunludur"), r.email()],
      password: [r.required("Şifre zorunludur")],
    });
    const user = db.users.find((u) => u.email.toLowerCase() === body.email.trim().toLowerCase());
    // Hangi alanın hatalı olduğu söylenmez (kullanıcı adı tahminini zorlaştırır).
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "E-posta veya şifre hatalı");
    }
    const authUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    return { token: signToken(authUser), user: authUser };
  });

  router.get("/api/auth/me", requireAuth, (ctx) => ({ user: ctx.user }));

  // ---------- Üyeler (FR-04, FR-05, FR-12, FR-13)
  router.get("/api/members", requireAuth, (ctx) => {
    const q = normalizeTr(ctx.query.get("search") ?? "");
    const status = ctx.query.get("status") as MemberStatus | "all" | null;
    const page = Math.max(1, Number(ctx.query.get("page")) || 1);
    const canSeeEmail = ctx.user!.role !== "instructor";

    let list = db.members.filter((m) => {
      if (status && status !== "all" && memberStatus(m) !== status) return false;
      if (!q) return true;
      const haystack = normalizeTr(`${m.firstName} ${m.lastName}${canSeeEmail ? ` ${m.email}` : ""}`);
      return haystack.includes(q);
    });
    list = list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = list.length;
    const items = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((m) => toMemberDto(m, ctx.user!.role));
    return { items, total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
  });

  const memberSchema = {
    firstName: [r.required("Ad zorunludur"), r.string(60)],
    lastName: [r.required("Soyad zorunludur"), r.string(60)],
    email: [r.required("E-posta zorunludur"), r.email()],
    phone: [r.phone()],
  };

  router.post("/api/members", requireAuth, staff, (ctx) => {
    const body = validate<{ firstName: string; lastName: string; email: string; phone?: string }>(ctx.body, memberSchema);
    const email = body.email.trim().toLowerCase();
    if (emailTaken(email)) {
      throw new HttpError(409, "EMAIL_TAKEN", "Bu e-posta ile kayıtlı bir üye zaten var", { email: "Bu e-posta ile kayıtlı bir üye zaten var" });
    }
    const member: Member = {
      id: newId(), firstName: body.firstName.trim(), lastName: body.lastName.trim(), email,
      phone: body.phone?.trim() || null, isActive: true, createdAt: new Date(nowMs()).toISOString(),
    };
    db.members.push(member);
    ctx.res.statusCode = 201;
    return toMemberDto(member, ctx.user!.role);
  });

  router.get("/api/members/:id", requireAuth, (ctx) => {
    const m = findMember(ctx.params.id);
    const history = db.memberships
      .filter((ms) => ms.memberId === m.id)
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .map((ms) => ({ ...ms, planName: db.plans.find((p) => p.id === ms.planId)?.name ?? "—" }));
    return { ...toMemberDto(m, ctx.user!.role), history: ctx.user!.role === "instructor" ? [] : history };
  });

  router.patch("/api/members/:id", requireAuth, staff, (ctx) => {
    const m = findMember(ctx.params.id);
    const partial = Object.fromEntries(Object.entries(memberSchema).map(([k, v]) => [k, v.slice(1)]));
    const body = validate<Partial<Pick<Member, "firstName" | "lastName" | "email" | "phone">>>(ctx.body, partial);
    if (body.email && emailTaken(body.email, m.id)) {
      throw new HttpError(409, "EMAIL_TAKEN", "Bu e-posta ile kayıtlı bir üye zaten var", { email: "Bu e-posta ile kayıtlı bir üye zaten var" });
    }
    if (body.firstName !== undefined) m.firstName = body.firstName.trim();
    if (body.lastName !== undefined) m.lastName = body.lastName.trim();
    if (body.email !== undefined) m.email = body.email.trim().toLowerCase();
    if (body.phone !== undefined) m.phone = body.phone?.trim() || null;
    return toMemberDto(m, ctx.user!.role);
  });

  router.post("/api/members/:id/deactivate", requireAuth, staff, (ctx) => {
    const m = findMember(ctx.params.id);
    m.isActive = false;
    return toMemberDto(m, ctx.user!.role);
  });

  router.post("/api/members/:id/activate", requireAuth, staff, (ctx) => {
    const m = findMember(ctx.params.id);
    m.isActive = true;
    return toMemberDto(m, ctx.user!.role);
  });

  // FR-06, BR-01: plan atama
  router.post("/api/members/:id/memberships", requireAuth, staff, (ctx) => {
    const m = findMember(ctx.params.id);
    if (!m.isActive) throw new HttpError(422, "MEMBER_INACTIVE", "Pasif üyeye plan atanamaz");
    const body = validate<{ planId: string; startDate?: string }>(ctx.body, { planId: [r.required("Plan seçin")] });
    const plan = db.plans.find((p) => p.id === body.planId);
    if (!plan) throw new HttpError(404, "PLAN_NOT_FOUND", "Plan bulunamadı");
    if (!plan.isOnSale) throw new HttpError(422, "PLAN_NOT_ON_SALE", "Bu plan satıştan kaldırılmış");
    const startDate = body.startDate ?? today();
    if (!isIsoDate(startDate)) throw new HttpError(400, "VALIDATION_ERROR", "Formda hatalı alanlar var", { startDate: "Geçerli bir tarih girin" });

    const t = today();
    const current = currentMembership(m.id);
    if (current && current.endDate >= t) current.endDate = t; // eski üyelik bugün kapanır

    const membership = { id: newId(), memberId: m.id, planId: plan.id, startDate, endDate: addDays(startDate, plan.durationDays) };
    db.memberships.push(membership);
    ctx.res.statusCode = 201;
    return { membership, member: toMemberDto(m, ctx.user!.role) };
  });

  // ---------- Planlar (FR-08, BR-02, BR-04)
  router.get("/api/plans", requireAuth, () => ({ items: db.plans.map(toPlanDto) }));

  const planSchema = {
    name: [r.required("Plan adı zorunludur"), r.string(60)],
    priceKurus: [r.required("Fiyat zorunludur"), r.int(1, 100_000_000, "Fiyat 0'dan büyük olmalı")],
    durationDays: [r.required("Süre zorunludur"), r.int(1, 730, "Süre 1 ile 730 gün arasında olmalı")],
    monthlyClassLimit: [r.int(1, 100, "Ders hakkı 1 ile 100 arasında olmalı")],
  };

  router.post("/api/plans", requireAuth, owner, (ctx) => {
    const body = validate<{ name: string; priceKurus: number; durationDays: number; monthlyClassLimit?: number | null }>(ctx.body, planSchema);
    const plan = { id: newId(), name: body.name.trim(), priceKurus: body.priceKurus, durationDays: body.durationDays, monthlyClassLimit: body.monthlyClassLimit ?? null, isOnSale: true };
    db.plans.push(plan);
    ctx.res.statusCode = 201;
    return toPlanDto(plan);
  });

  router.patch("/api/plans/:id", requireAuth, owner, (ctx) => {
    const plan = db.plans.find((p) => p.id === ctx.params.id);
    if (!plan) throw new HttpError(404, "PLAN_NOT_FOUND", "Plan bulunamadı");
    const partial = { ...Object.fromEntries(Object.entries(planSchema).map(([k, v]) => [k, v.filter((_, i) => k === "monthlyClassLimit" || i > 0)])), isOnSale: [] };
    const body = validate<Partial<typeof plan>>(ctx.body, partial);
    if (typeof body.isOnSale === "boolean") plan.isOnSale = body.isOnSale;
    if (body.name !== undefined) plan.name = body.name.trim();
    if (body.priceKurus !== undefined) plan.priceKurus = body.priceKurus;
    if (body.durationDays !== undefined) plan.durationDays = body.durationDays;
    if (body.monthlyClassLimit !== undefined) plan.monthlyClassLimit = body.monthlyClassLimit;
    return toPlanDto(plan);
  });

  // ---------- Dersler ve rezervasyon (FR-09, FR-10, BR-03)
  router.get("/api/classes", requireAuth, (ctx) => {
    const from = ctx.query.get("from") ?? startOfWeek(today());
    const to = ctx.query.get("to") ?? addDays(from, 7);
    if (!isIsoDate(from) || !isIsoDate(to)) throw new HttpError(400, "VALIDATION_ERROR", "Tarih biçimi YYYY-MM-DD olmalı");
    const fromMs = Date.parse(`${from}T00:00:00+03:00`);
    const toMs = Date.parse(`${to}T00:00:00+03:00`);
    const mine = ctx.query.get("mine") === "true";
    const items = db.classes
      .filter((c) => { const s = Date.parse(c.startsAt); return s >= fromMs && s < toMs; })
      .filter((c) => !mine || c.instructorId === ctx.user!.id)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map(toClassDto);
    return { from, to, items };
  });

  router.post("/api/classes", requireAuth, staff, (ctx) => {
    const body = validate<{ title: string; instructorId: string; startsAt: string; durationMin: number; capacity: number }>(ctx.body, {
      title: [r.required("Ders adı zorunludur"), r.string(80)],
      instructorId: [r.required("Eğitmen seçin")],
      startsAt: [r.required("Tarih ve saat zorunludur")],
      durationMin: [r.required("Süre zorunludur"), r.int(15, 240, "Süre 15 ile 240 dakika arasında olmalı")],
      capacity: [r.required("Kapasite zorunludur"), r.int(1, 50, "Kapasite 1 ile 50 arasında olmalı")],
    });
    const instructor = db.users.find((u) => u.id === body.instructorId && u.role === "instructor");
    if (!instructor) throw new HttpError(400, "VALIDATION_ERROR", "Formda hatalı alanlar var", { instructorId: "Geçerli bir eğitmen seçin" });
    const starts = Date.parse(body.startsAt);
    if (Number.isNaN(starts)) throw new HttpError(400, "VALIDATION_ERROR", "Formda hatalı alanlar var", { startsAt: "Geçerli bir tarih ve saat girin" });
    if (starts < nowMs()) throw new HttpError(400, "VALIDATION_ERROR", "Formda hatalı alanlar var", { startsAt: "Geçmiş bir tarihe ders oluşturulamaz" });
    const c = { id: newId(), title: body.title.trim(), instructorId: instructor.id, startsAt: new Date(starts).toISOString(), durationMin: body.durationMin, capacity: body.capacity };
    db.classes.push(c);
    ctx.res.statusCode = 201;
    return toClassDto(c);
  });

  router.get("/api/classes/:id", requireAuth, (ctx) => {
    const c = findClass(ctx.params.id);
    const attendees = db.bookings
      .filter((b) => b.classId === c.id)
      .map((b) => {
        const m = db.members.find((x) => x.id === b.memberId)!;
        return { bookingId: b.id, member: toMemberDto(m, ctx.user!.role) };
      });
    return { ...toClassDto(c), attendees };
  });

  router.post("/api/classes/:id/bookings", requireAuth, (ctx) => {
    const c = findClass(ctx.params.id);
    const role = ctx.user!.role;
    if (role === "instructor" && c.instructorId !== ctx.user!.id) {
      throw new HttpError(403, "FORBIDDEN", "Sadece kendi dersinize katılımcı ekleyebilirsiniz");
    }
    const body = validate<{ memberId: string }>(ctx.body, { memberId: [r.required("Üye seçin")] });
    const m = findMember(body.memberId);

    // Kontrol sırası önemlidir ve test edilmiştir: geçmiş → mükerrer → üyelik → kapasite
    if (Date.parse(c.startsAt) < nowMs()) throw new HttpError(422, "CLASS_IN_PAST", "Geçmiş bir derse rezervasyon yapılamaz");
    if (db.bookings.some((b) => b.classId === c.id && b.memberId === m.id)) {
      throw new HttpError(409, "ALREADY_BOOKED", "Üye bu derse zaten kayıtlı");
    }
    const status = memberStatus(m);
    if (status !== "active") {
      const msg = status === "inactive" ? "Pasif üye derse yazılamaz" : "Üyenin aktif bir planı yok";
      throw new HttpError(422, "NO_ACTIVE_MEMBERSHIP", msg);
    }
    if (bookingCount(c.id) >= c.capacity) throw new HttpError(409, "CLASS_FULL", "Ders kapasitesi dolu");

    const booking = { id: newId(), memberId: m.id, classId: c.id, createdAt: new Date(nowMs()).toISOString() };
    db.bookings.push(booking);
    ctx.res.statusCode = 201;
    return { booking, class: toClassDto(c) };
  });

  router.delete("/api/classes/:id/bookings/:bookingId", requireAuth, staff, (ctx) => {
    findClass(ctx.params.id);
    const idx = db.bookings.findIndex((b) => b.id === ctx.params.bookingId && b.classId === ctx.params.id);
    if (idx === -1) throw new HttpError(404, "BOOKING_NOT_FOUND", "Rezervasyon bulunamadı");
    db.bookings.splice(idx, 1);
    ctx.res.statusCode = 204;
    return null;
  });

  router.get("/api/instructors", requireAuth, () => ({
    items: db.users.filter((u) => u.role === "instructor").map((u) => ({ id: u.id, name: u.name })),
  }));

  // ---------- Özet panel (FR-11, BR-05)
  router.get("/api/dashboard", requireAuth, staff, () => {
    const t = today();
    const eom = endOfMonth(t);
    const statuses = db.members.map((m) => ({ m, s: memberStatus(m) }));
    const active = statuses.filter((x) => x.s === "active");
    const expiringThisMonth = active
      .map(({ m }) => ({ m, ms: currentMembership(m.id)! }))
      .filter(({ ms }) => ms.endDate >= t && ms.endDate <= eom)
      .sort((a, b) => a.ms.endDate.localeCompare(b.ms.endDate));

    const weekStart = startOfWeek(t);
    const wFrom = Date.parse(`${weekStart}T00:00:00+03:00`);
    const wTo = Date.parse(`${addDays(weekStart, 7)}T00:00:00+03:00`);
    const weekClasses = db.classes.filter((c) => { const s = Date.parse(c.startsAt); return s >= wFrom && s < wTo; });
    const capacity = weekClasses.reduce((sum, c) => sum + c.capacity, 0);
    const booked = weekClasses.reduce((sum, c) => sum + bookingCount(c.id), 0);

    const planDistribution = db.plans
      .map((p) => ({ planId: p.id, name: p.name, count: active.filter(({ m }) => currentMembership(m.id)?.planId === p.id).length }))
      .filter((p) => p.count > 0)
      .sort((a, b) => b.count - a.count);

    const monthlyRevenueKurus = db.memberships
      .filter((ms) => ms.startDate.slice(0, 7) === t.slice(0, 7))
      .reduce((sum, ms) => sum + (db.plans.find((p) => p.id === ms.planId)?.priceKurus ?? 0), 0);

    return {
      today: t,
      activeMembers: active.length,
      expiredMembers: statuses.filter((x) => x.s === "expired").length,
      expiringThisMonth: {
        count: expiringThisMonth.length,
        items: expiringThisMonth.slice(0, 5).map(({ m, ms }) => ({ id: m.id, name: `${m.firstName} ${m.lastName}`, endDate: ms.endDate })),
      },
      weekOccupancy: { booked, capacity, rate: capacity ? Math.round((booked / capacity) * 100) : 0, classCount: weekClasses.length },
      planDistribution,
      monthlyRevenueKurus,
    };
  });

  // ---------- Yalnızca test ortamı: uçtan uca testlerde verileri sıfırlar
  if (process.env.NODE_ENV === "test" || process.env.E2E === "1") {
    router.post("/api/test/reset", () => { resetDb(); return { ok: true }; });
  }

  return router;
}

export type { Ctx };
