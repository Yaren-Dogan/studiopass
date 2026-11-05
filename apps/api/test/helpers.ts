import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../src/app.js";
import { DEMO_PASSWORD, DEMO_USERS, resetDb } from "../src/store.js";

export type RoleKey = keyof typeof DEMO_USERS;

export async function startServer() {
  resetDb();
  const server: Server = createApp();
  await new Promise<void>((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  async function call(method: string, path: string, opts: { token?: string; body?: unknown } = {}) {
    const res = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  }

  async function login(role: RoleKey) {
    const res = await call("POST", "/api/auth/login", { body: { email: DEMO_USERS[role].email, password: DEMO_PASSWORD } });
    return res.body.token as string;
  }

  return { base, call, login, close: () => new Promise<void>((r) => server.close(() => r())) };
}
