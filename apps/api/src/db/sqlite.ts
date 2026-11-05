import { mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import type { Db } from "../store.js";

/**
 * SQLite kalıcı depolama (ADR-005).
 * Node.js 22'nin yerleşik `node:sqlite` modülü kullanılır; ek paket gerekmez.
 *
 * Çalışma şekli: uygulama verileri bellekte işler (iş kuralları domain.ts / routes.ts'de),
 * her başarılı değişiklikten sonra tüm tabloları tek bir işlem (transaction) içinde dosyaya yazar.
 * Sunucu açılırken dosyadan yükler; dosya boşsa tohum verisiyle doldurur.
 */

const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));

export function openDatabase(path: string): DatabaseSync {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const conn = new DatabaseSync(path);
  conn.exec(readFileSync(schemaPath, "utf8"));
  return conn;
}

type Row = Record<string, string | number | null>;
const bool = (v: unknown) => v === 1 || v === 1n;

export function loadDb(conn: DatabaseSync): Db | null {
  const count = conn.prepare("SELECT count(*) AS n FROM users").get() as { n: number };
  if (!count || Number(count.n) === 0) return null;
  const all = (sql: string) => conn.prepare(sql).all() as Row[];
  return {
    users: all("SELECT * FROM users").map((r) => ({ id: String(r.id), name: String(r.name), email: String(r.email), passwordHash: String(r.password_hash), role: r.role as Db["users"][number]["role"] })),
    members: all("SELECT * FROM members").map((r) => ({ id: String(r.id), firstName: String(r.first_name), lastName: String(r.last_name), email: String(r.email), phone: r.phone === null ? null : String(r.phone), isActive: bool(r.is_active), createdAt: String(r.created_at) })),
    plans: all("SELECT * FROM plans").map((r) => ({ id: String(r.id), name: String(r.name), priceKurus: Number(r.price_kurus), durationDays: Number(r.duration_days), monthlyClassLimit: r.monthly_class_limit === null ? null : Number(r.monthly_class_limit), isOnSale: bool(r.is_on_sale) })),
    memberships: all("SELECT * FROM memberships").map((r) => ({ id: String(r.id), memberId: String(r.member_id), planId: String(r.plan_id), startDate: String(r.start_date), endDate: String(r.end_date) })),
    classes: all("SELECT * FROM class_sessions").map((r) => ({ id: String(r.id), title: String(r.title), instructorId: String(r.instructor_id), startsAt: String(r.starts_at), durationMin: Number(r.duration_min), capacity: Number(r.capacity) })),
    bookings: all("SELECT * FROM bookings").map((r) => ({ id: String(r.id), memberId: String(r.member_id), classId: String(r.class_id), createdAt: String(r.created_at) })),
  };
}

/** Bellekteki durumu tek işlemde yazar. Bir kısıt ihlal edilirse (ör. mükerrer e-posta) işlem geri alınır ve hata fırlatılır. */
export function saveDb(conn: DatabaseSync, db: Db) {
  conn.exec("BEGIN");
  try {
    // Önce çocuk tablolar silinir, sonra ebeveynlerden itibaren yazılır (yabancı anahtar sırası)
    for (const t of ["bookings", "memberships", "class_sessions", "plans", "members", "users"]) conn.exec(`DELETE FROM ${t}`);
    const ins = (sql: string) => conn.prepare(sql);
    const u = ins("INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)");
    for (const x of db.users) u.run(x.id, x.name, x.email, x.passwordHash, x.role);
    const m = ins("INSERT INTO members (id, first_name, last_name, email, phone, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    for (const x of db.members) m.run(x.id, x.firstName, x.lastName, x.email, x.phone, x.isActive ? 1 : 0, x.createdAt);
    const p = ins("INSERT INTO plans (id, name, price_kurus, duration_days, monthly_class_limit, is_on_sale) VALUES (?, ?, ?, ?, ?, ?)");
    for (const x of db.plans) p.run(x.id, x.name, x.priceKurus, x.durationDays, x.monthlyClassLimit, x.isOnSale ? 1 : 0);
    const ms = ins("INSERT INTO memberships (id, member_id, plan_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)");
    for (const x of db.memberships) ms.run(x.id, x.memberId, x.planId, x.startDate, x.endDate);
    const c = ins("INSERT INTO class_sessions (id, title, instructor_id, starts_at, duration_min, capacity) VALUES (?, ?, ?, ?, ?, ?)");
    for (const x of db.classes) c.run(x.id, x.title, x.instructorId, x.startsAt, x.durationMin, x.capacity);
    const b = ins("INSERT INTO bookings (id, member_id, class_id, created_at) VALUES (?, ?, ?, ?)");
    for (const x of db.bookings) b.run(x.id, x.memberId, x.classId, x.createdAt);
    conn.exec("COMMIT");
  } catch (err) {
    conn.exec("ROLLBACK");
    throw err;
  }
}
