import { expect, goTo, loginAs, test } from "./fixtures";

test.describe("US-02 Rol bazlı erişim", () => {
  test("TC-05 eğitmen Özet menüsünü ve iletişim bilgilerini görmez", async ({ page }) => {
    await loginAs(page, "instructor");
    await expect(page).toHaveURL("/classes");
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    await expect(nav.getByRole("link", { name: "Özet" })).toHaveCount(0);
    await nav.getByRole("link", { name: "Üyeler" }).click();
    await expect(page.getByRole("columnheader", { name: "E-posta" })).toHaveCount(0);
    await expect(page.getByText("@ornek.com")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Yeni üye" })).toHaveCount(0);
  });

  test("eğitmen adres çubuğundan Özet'e giderse Derslere yönlendirilir", async ({ page }) => {
    await loginAs(page, "instructor");
    await page.goto("/");
    await expect(page).toHaveURL("/classes");
  });

  test("eğitmen varsayılan olarak sadece kendi derslerini görür", async ({ page }) => {
    await loginAs(page, "instructor");
    const cards = page.locator(".class-card");
    await expect(cards.first()).toBeVisible();
    for (const meta of await page.locator(".class-card__meta").allTextContents()) expect(meta).toContain("Deniz Aydın");
    await page.getByLabel("Sadece benim derslerim").uncheck();
    await expect(page.locator(".class-card__meta", { hasText: "Selin Öztürk" }).first()).toBeVisible();
  });

  test("yönetici plan oluşturamaz, sahip oluşturabilir (TC-20 / TC-18)", async ({ page }) => {
    await loginAs(page, "manager");
    await goTo(page, "Planlar");
    await expect(page.getByRole("button", { name: "Yeni plan" })).toHaveCount(0);

    await page.getByRole("button", { name: "Çıkış yap" }).click();
    await loginAs(page, "owner");
    await goTo(page, "Planlar");
    await page.getByRole("button", { name: "Yeni plan" }).click();
    const dialog = page.getByRole("dialog", { name: "Yeni plan" });
    await dialog.getByLabel("Plan adı").fill("10 Ders Paketi");
    await dialog.getByLabel("Fiyat (₺, KDV dahil)").fill("1.250,00");
    await dialog.getByLabel("Süre (gün)").fill("60");
    await dialog.getByRole("button", { name: "Kaydet" }).click();
    const card = page.locator(".plan", { hasText: "10 Ders Paketi" });
    await expect(card.locator(".plan__price")).toHaveText("₺1.250,00");
    await expect(card).toContainText("60 gün");
  });

  test("TC-19 negatif fiyat reddedilir", async ({ page }) => {
    await loginAs(page, "owner");
    await goTo(page, "Planlar");
    await page.getByRole("button", { name: "Yeni plan" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Plan adı").fill("Hatalı");
    await dialog.getByLabel("Fiyat (₺, KDV dahil)").fill("-5");
    await dialog.getByRole("button", { name: "Kaydet" }).click();
    await expect(dialog.getByText("Fiyat 0'dan büyük olmalı")).toBeVisible();
  });
});

test.describe("Veritabanı görüntüleyici", () => {
  test("sahip SQLite tablolarını ve görünümleri görür", async ({ page }) => {
    await loginAs(page, "owner");
    await page.getByRole("navigation", { name: "Ana menü" }).getByRole("link", { name: "Veritabanı", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Veritabanı");
    const tabs = page.getByRole("navigation", { name: "Tablolar ve görünümler" });
    for (const t of ["users", "members", "plans", "memberships", "class_sessions", "bookings", "v_member_status", "v_class_occupancy"]) {
      await expect(tabs.getByRole("button", { name: new RegExp(`^${t},`) })).toBeVisible();
    }
    await tabs.getByRole("button", { name: /^bookings,/ }).click();
    await expect(page.getByText("FK → members.id")).toBeVisible();
    await tabs.getByRole("button", { name: /^users,/ }).click();
    await expect(page.getByRole("cell", { name: /scrypt özeti gizlendi/ }).first()).toBeVisible();
  });

  test("yönetici menüde Veritabanı'nı görmez", async ({ page }) => {
    await loginAs(page, "manager");
    await expect(page.getByRole("navigation", { name: "Ana menü" }).getByRole("link", { name: "Veritabanı" })).toHaveCount(0);
  });
});
