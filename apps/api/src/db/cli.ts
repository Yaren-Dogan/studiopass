// Terminalden veritabanına bakmak ve sıfırlamak için küçük araç.
//   npm run db:tablolar -w @studiopass/api     → tablolar, kayıt sayıları ve örnek satırlar
//   npm run db:sifirla  -w @studiopass/api     → dosyayı silmeden demo verisine döndürür
import { fileURLToPath } from "node:url";
import { openDatabase, saveDb } from "./sqlite.js";
import { createSeedDb } from "../store.js";

const path = process.env.DB_PATH ?? fileURLToPath(new URL("../../data/studiopass.db", import.meta.url));
const conn = openDatabase(path);
const cmd = process.argv[2] ?? "tablolar";

if (cmd === "sifirla") {
  saveDb(conn, createSeedDb());
  console.log(`Demo verisi yazıldı → ${path}`);
} else {
  console.log(`Veritabanı: ${path}\n`);
  const tables = ["users", "members", "plans", "memberships", "class_sessions", "bookings"];
  for (const t of tables) {
    const { n } = conn.prepare(`SELECT count(*) AS n FROM ${t}`).get() as { n: number };
    console.log(`── ${t} (${n} kayıt)`);
    const rows = conn.prepare(`SELECT * FROM ${t} LIMIT 3`).all() as Record<string, unknown>[];
    console.table(rows.map((r) => (t === "users" ? { ...r, password_hash: "•••" } : r)));
  }
  console.log("── v_member_status (görünüm: üyelerin güncel durumu)");
  console.table(conn.prepare("SELECT * FROM v_member_status LIMIT 10").all());
  console.log("── v_class_occupancy (görünüm: ders doluluğu)");
  console.table(conn.prepare("SELECT * FROM v_class_occupancy").all());
}
