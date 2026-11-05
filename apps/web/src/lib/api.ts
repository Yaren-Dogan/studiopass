// API istemcisi. Tipler apps/api/openapi.yaml sözleşmesine karşılık gelir.

export type Role = "owner" | "manager" | "instructor";
export type MemberStatus = "active" | "expired" | "none" | "inactive";

export interface User { id: string; name: string; email: string; role: Role }
export interface Member {
  id: string; firstName: string; lastName: string; status: MemberStatus; expiringSoon: boolean;
  email?: string; phone?: string | null; isActive?: boolean; createdAt?: string;
  plan: { id: string; name: string; startDate: string; endDate: string } | null;
}
export interface MemberDetail extends Member { history: Array<{ id: string; planName: string; startDate: string; endDate: string }> }
export interface Paged<T> { items: T[]; total: number; page: number; pageSize: number; totalPages: number }
export interface Plan { id: string; name: string; priceKurus: number; durationDays: number; monthlyClassLimit: number | null; isOnSale: boolean; activeMemberCount: number }
export interface ClassSession {
  id: string; title: string; startsAt: string; durationMin: number; capacity: number; booked: number; isFull: boolean; isPast: boolean;
  instructor: { id: string; name: string } | null;
}
export interface ClassDetail extends ClassSession { attendees: Array<{ bookingId: string; member: Member }> }
export interface Dashboard {
  today: string; activeMembers: number; expiredMembers: number; monthlyRevenueKurus: number;
  expiringThisMonth: { count: number; items: Array<{ id: string; name: string; endDate: string }> };
  weekOccupancy: { booked: number; capacity: number; rate: number; classCount: number };
  planDistribution: Array<{ planId: string; name: string; count: number }>;
}

export interface DbObject {
  name: string; kind: "table" | "view"; total: number;
  columns: Array<{ name: string; type: string; primaryKey: boolean; notNull: boolean }>;
  foreignKeys: Array<{ column: string; references: string }>;
  rows: Array<Record<string, unknown>>;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields: Record<string, string> = {}) {
    super(message);
  }
}

const TOKEN_KEY = "studiopass.token";
let token: string | null = safeGet();
let onUnauthorized: () => void = () => {};

function safeGet() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } }
export function setToken(t: string | null) {
  token = t;
  try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch { /* özel pencere */ }
}
export const hasToken = () => !!token;
export function setUnauthorizedHandler(fn: () => void) { onUnauthorized = fn; }

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.");
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = data?.error ?? {};
    // FR-02: oturum süresi dolduysa girişe yönlendir (giriş isteğinin kendisi hariç)
    if (res.status === 401 && path !== "/api/auth/login") { setToken(null); onUnauthorized(); }
    throw new ApiError(res.status, e.code ?? "UNKNOWN", e.message ?? "Beklenmeyen bir hata oluştu", e.fields ?? {});
  }
  return data as T;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") s.set(k, String(v));
  const str = s.toString();
  return str ? `?${str}` : "";
};

export const api = {
  login: (email: string, password: string) => request<{ token: string; user: User }>("POST", "/api/auth/login", { email, password }),
  me: () => request<{ user: User }>("GET", "/api/auth/me"),
  database: () => request<{ engine: string; file: string; items: DbObject[] }>("GET", "/api/admin/database"),
  dashboard: () => request<Dashboard>("GET", "/api/dashboard"),
  members: (p: { search?: string; status?: string; page?: number }) => request<Paged<Member>>("GET", `/api/members${qs(p)}`),
  member: (id: string) => request<MemberDetail>("GET", `/api/members/${id}`),
  createMember: (body: { firstName: string; lastName: string; email: string; phone?: string }) => request<Member>("POST", "/api/members", body),
  deactivateMember: (id: string) => request<Member>("POST", `/api/members/${id}/deactivate`),
  activateMember: (id: string) => request<Member>("POST", `/api/members/${id}/activate`),
  assignPlan: (id: string, planId: string, startDate?: string) => request<{ member: Member }>("POST", `/api/members/${id}/memberships`, { planId, startDate }),
  plans: () => request<{ items: Plan[] }>("GET", "/api/plans"),
  createPlan: (body: { name: string; priceKurus: number; durationDays: number; monthlyClassLimit: number | null }) => request<Plan>("POST", "/api/plans", body),
  updatePlan: (id: string, body: Partial<Plan>) => request<Plan>("PATCH", `/api/plans/${id}`, body),
  classes: (p: { from?: string; to?: string; mine?: boolean }) => request<{ from: string; to: string; items: ClassSession[] }>("GET", `/api/classes${qs({ ...p, mine: p.mine ? "true" : undefined })}`),
  classDetail: (id: string) => request<ClassDetail>("GET", `/api/classes/${id}`),
  book: (classId: string, memberId: string) => request<{ class: ClassSession }>("POST", `/api/classes/${classId}/bookings`, { memberId }),
  cancelBooking: (classId: string, bookingId: string) => request<void>("DELETE", `/api/classes/${classId}/bookings/${bookingId}`),
};
