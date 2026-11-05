import { expect, goTo, loginAs, test } from "./fixtures";

/** NFR-05: 390 px genişlikte ana akışlar */
test.describe("Mobil (390 px)", () => {
  test("alt menü görünür ve yatay kaydırma yoktur", async ({ page }) => {
    await loginAs(page, "manager");
    await expect(page.getByRole("navigation", { name: "Ana menü" })).toBeVisible();
    for (const path of ["/", "/members", "/classes", "/plans"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} yatay taşma`).toBeLessThanOrEqual(0);
    }
  });

  test("mobilde üye bulunup derse yazılabilir", async ({ page }) => {
    await loginAs(page, "manager");
    await goTo(page, "Dersler");
    await page.getByRole("button", { name: "Sonraki hafta" }).click();
    await page.locator(".class-card").first().click();
    await page.getByRole("button", { name: "Katılımcı ekle" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Üye ara").fill("melis");
    await dialog.getByRole("button", { name: "Melis Yıldız kişisini ekle" }).click();
    await expect(page.getByRole("link", { name: "Melis Yıldız" })).toBeVisible();
  });
});
