import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { DEMO_PASSWORD, DEMO_USERS, initPersistence } from "./store.js";

const port = Number(process.env.PORT ?? 4000);
const dbPath = process.env.DB_PATH ?? fileURLToPath(new URL("../data/studiopass.db", import.meta.url));
const { loaded } = initPersistence(dbPath);
console.log(`Veritabanı (SQLite) → ${dbPath}  ${loaded ? "(mevcut veriler yüklendi)" : "(yeni oluşturuldu, demo verisi yazıldı)"}`);

createApp().listen(port, () => {
  console.log(`StudioPass API → http://localhost:${port}  ·  Swagger → http://localhost:${port}/docs`);
  console.log(`Demo kullanıcılar (şifre: ${DEMO_PASSWORD}): ${Object.values(DEMO_USERS).map((u) => `${u.email} [${u.role}]`).join(", ")}`);
});
