import { test as base, expect, type Page } from "@playwright/test";

export const USERS = {
  owner: "elif@studiopass.dev",
  manager: "mert@studiopass.dev",
  instructor: "deniz@studiopass.dev",
} as const;
export const PASSWORD = "Studio123!";

export async function loginAs(page: Page, role: keyof typeof USERS) {
  await page.goto("/login");
  await page.getByLabel("E-posta").fill(USERS[role]);
  await page.getByLabel("Şifre").fill(PASSWORD);
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** Ana menüden sayfaya gider (sayfadaki başka bağlantılarla karışmaması için menü içinde arar). */
export async function goTo(page: Page, label: "Özet" | "Üyeler" | "Dersler" | "Planlar") {
  await page.getByRole("navigation", { name: "Ana menü" }).getByRole("link", { name: label, exact: true }).click();
}

/** Her testten önce veriyi tohum durumuna döndürür. */
export const test = base.extend<{ resetData: void }>({
  resetData: [
    async ({ request }, use) => {
      const res = await request.post("http://localhost:4100/api/test/reset");
      expect(res.ok(), "API E2E=1 ile çalışmalı").toBeTruthy();
      await use();
    },
    { auto: true },
  ],
});

export { expect };
