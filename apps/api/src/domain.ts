import type { Role } from "./lib/auth.js";
import { addDays, nowMs, today } from "./lib/dates.js";
import { db, type ClassSession, type Member, type Membership, type Plan } from "./store.js";

export type MemberStatus = "active" | "expired" | "none" | "inactive";

/** Üyenin güncel (en geç biten) üyeliği. BR-01 gereği aynı anda tek aktif üyelik olabilir. */
export function currentMembership(memberId: string): Membership | undefined {
  return db.memberships
    .filter((m) => m.memberId === memberId)
    .sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
}

/** FR-07: bitiş ≥ bugün → aktif; bitiş < bugün → süresi dolmuş. Pasif üye her zaman "inactive". */
export function memberStatus(member: Member, on = today()): MemberStatus {
  if (!member.isActive) return "inactive";
  const ms = currentMembership(member.id);
  if (!ms) return "none";
  return ms.endDate >= on ? "active" : "expired";
}

export const EXPIRING_SOON_DAYS = 7;

/** Rol bazlı görünüm (FR-03, US-02): eğitmen iletişim bilgisi göremez. */
export function toMemberDto(member: Member, role: Role) {
  const ms = currentMembership(member.id);
  const plan = ms ? db.plans.find((p) => p.id === ms.planId) : undefined;
  const status = memberStatus(member);
  const t = today();
  const base = {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    status,
    expiringSoon: status === "active" && !!ms && ms.endDate <= addDays(t, EXPIRING_SOON_DAYS),
    plan: plan && ms ? { id: plan.id, name: plan.name, startDate: ms.startDate, endDate: ms.endDate } : null,
  };
  if (role === "instructor") return base;
  return { ...base, email: member.email, phone: member.phone, isActive: member.isActive, createdAt: member.createdAt };
}

export function toPlanDto(p: Plan) {
  return { ...p, activeMemberCount: db.members.filter((m) => memberStatus(m) === "active" && currentMembership(m.id)?.planId === p.id).length };
}

export function bookingCount(classId: string) {
  return db.bookings.filter((b) => b.classId === classId).length;
}

export function toClassDto(c: ClassSession) {
  const instructor = db.users.find((u) => u.id === c.instructorId);
  const booked = bookingCount(c.id);
  return {
    ...c,
    instructor: instructor ? { id: instructor.id, name: instructor.name } : null,
    booked,
    isFull: booked >= c.capacity,
    isPast: Date.parse(c.startsAt) < nowMs(),
  };
}
