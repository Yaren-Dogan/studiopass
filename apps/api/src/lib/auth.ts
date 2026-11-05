import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { HttpError, type Ctx } from "./http.js";

export type Role = "owner" | "manager" | "instructor";
export interface AuthUser { id: string; name: string; email: string; role: Role }

const SECRET = process.env.JWT_SECRET ?? "dev-only-secret-change-me";
export const TOKEN_TTL_SECONDS = 8 * 60 * 60; // FR-02: 8 saat

// --- Şifre (NFR-02). Bağımlılık eklememek için bcrypt yerine Node'un yerleşik scrypt'i kullanıldı (ADR-002).
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const candidate = scryptSync(plain, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// --- JWT (HS256)
const b64url = (input: Buffer | string) => Buffer.from(input).toString("base64url");

export function signToken(user: AuthUser, nowSeconds = Math.floor(Date.now() / 1000)): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ sub: user.id, name: user.name, email: user.email, role: user.role, iat: nowSeconds, exp: nowSeconds + TOKEN_TTL_SECONDS }));
  const sig = createHmac("sha256", SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

export function verifyToken(token: string, nowSeconds = Math.floor(Date.now() / 1000)): AuthUser {
  const parts = token.split(".");
  if (parts.length !== 3) throw new HttpError(401, "INVALID_TOKEN", "Oturum geçersiz");
  const [header, payload, sig] = parts;
  const expected = createHmac("sha256", SECRET).update(`${header}.${payload}`).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw new HttpError(401, "INVALID_TOKEN", "Oturum geçersiz");
  }
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (typeof data.exp !== "number" || data.exp < nowSeconds) {
    throw new HttpError(401, "TOKEN_EXPIRED", "Oturumunuzun süresi doldu, lütfen tekrar giriş yapın");
  }
  return { id: data.sub, name: data.name, email: data.email, role: data.role };
}

// --- Ara katmanlar
export function requireAuth(ctx: Ctx) {
  const header = ctx.req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError(401, "UNAUTHENTICATED", "Bu işlem için giriş yapmalısınız");
  ctx.user = verifyToken(token);
}

/** FR-03: Rol kontrolü API'de de uygulanır; arayüzde gizlemek tek başına yeterli değildir. */
export function requireRole(...roles: Role[]) {
  return (ctx: Ctx) => {
    if (!ctx.user) throw new HttpError(401, "UNAUTHENTICATED", "Bu işlem için giriş yapmalısınız");
    if (!roles.includes(ctx.user.role)) throw new HttpError(403, "FORBIDDEN", "Bu işlem için yetkiniz yok");
  };
}
