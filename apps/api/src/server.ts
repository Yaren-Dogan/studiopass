import { createApp } from "./app.js";
import { DEMO_PASSWORD, DEMO_USERS } from "./store.js";

const port = Number(process.env.PORT ?? 4000);

createApp().listen(port, () => {
  console.log(`StudioPass API → http://localhost:${port}  ·  Swagger → http://localhost:${port}/docs`);
  console.log(`Demo kullanıcılar (şifre: ${DEMO_PASSWORD}): ${Object.values(DEMO_USERS).map((u) => `${u.email} [${u.role}]`).join(", ")}`);
});
