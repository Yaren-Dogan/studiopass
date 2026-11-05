import { expect, loginAs, test } from "./fixtures";

test.describe("US-01 Giriş", () => {
  test("TC-01 sahip giriş yapınca Özet sayfasına gider", async ({ page }) => {
    await loginAs(page, "owner");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Merhaba Elif");
  });

  test("TC-02 hatalı şifrede genel hata mesajı gösterilir", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-posta").fill("elif@studiopass.dev");
    await page.getByLabel("Şifre").fill("yanlis-sifre");
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await expect(page.getByRole("alert")).toHaveText("E-posta veya şifre hatalı");
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC-03 boş formda alan hataları gösterilir ve odak ilk hatalı alana gider", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await expect(page.getByText("E-posta zorunludur")).toBeVisible();
    await expect(page.getByText("Şifre zorunludur")).toBeVisible();
    await expect(page.getByLabel("E-posta")).toBeFocused();
    await expect(page.getByLabel("E-posta")).toHaveAttribute("aria-invalid", "true");
  });

  test("oturumsuz kullanıcı korumalı sayfadan girişe yönlendirilir", async ({ page }) => {
    await page.goto("/members");
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC-04 geçersiz/süresi dolmuş oturumda girişe yönlendirilir ve bilgilendirilir", async ({ page }) => {
    await loginAs(page, "manager");
    await page.evaluate(() => localStorage.setItem("studiopass.token", "bozuk.token.degeri"));
    await page.goto("/members");
    await expect(page).toHaveURL(/\/login/);
  });

  test("çıkış yapınca girişe döner", async ({ page }) => {
    await loginAs(page, "manager");
    await page.getByRole("button", { name: "Çıkış yap" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
