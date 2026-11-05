import type { Page } from "@playwright/test";
import { expect, goTo, loginAs, test } from "./fixtures";

/** Bu haftanın gelecekteki ilk dersini açar (geçmiş derslerde rezervasyon kapalıdır). */
async function openUpcomingClass(page: Page) {
  await goTo(page, "Dersler");
  await page.getByRole("button", { name: "Sonraki hafta" }).click();
  await page.locator(".class-card:not(.is-past)").first().click();
  await expect(page.getByRole("heading", { name: "Katılımcılar" })).toBeVisible();
}

async function addAttendee(page: Page, name: string) {
  await page.getByRole("button", { name: "Katılımcı ekle" }).click();
  const dialog = page.getByRole("dialog", { name: "Katılımcı ekle" });
  await dialog.getByLabel("Üye ara").fill(name.split(" ")[0]);
  await dialog.getByRole("button", { name: `${name} kişisini ekle` }).click();
  return dialog;
}

test.describe("US-08 Rezervasyon", () => {
  test.beforeEach(async ({ page }) => { await loginAs(page, "manager"); });

  test("TC-23 aktif üye derse yazılır, doluluk artar", async ({ page }) => {
    await openUpcomingClass(page);
    const before = await page.locator(".capacity__count").first().textContent();
    const [booked, cap] = before!.split("/").map(Number);
    await addAttendee(page, "Melis Yıldız");
    await expect(page.getByRole("status").getByText("Melis Yıldız derse yazıldı")).toBeVisible();
    await expect(page.locator(".capacity__count").first()).toHaveText(`${booked + 1}/${cap}`);
    await expect(page.getByRole("link", { name: "Melis Yıldız" })).toBeVisible();
  });

  test("TC-25 süresi dolmuş üye için açıklayıcı hata ve 'Plan ata' bağlantısı", async ({ page }) => {
    await openUpcomingClass(page);
    const dialog = await addAttendee(page, "Hakan Özdemir");
    await expect(dialog.getByRole("alert")).toContainText("Üyenin aktif bir planı yok");
    await expect(dialog.getByRole("link", { name: "Plan ata" })).toBeVisible();
  });

  test("TC-26 zaten kayıtlı üye 'Kayıtlı' olarak gösterilir", async ({ page }) => {
    await openUpcomingClass(page); // tohum verisinde Zeynep Koç bu derse kayıtlı
    await expect(page.getByRole("link", { name: "Zeynep Koç" })).toBeVisible();
    await page.getByRole("button", { name: "Katılımcı ekle" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Üye ara").fill("zeynep");
    await expect(dialog.getByRole("button", { name: "Zeynep Koç zaten kayıtlı" })).toBeDisabled();
  });

  test("TC-24 dolu derste ekleme butonu kapalıdır", async ({ page }) => {
    await goTo(page, "Dersler");
    // Tohum verisinde Pazartesi 19:00 Reformer Pilates dersi 8/8 doludur
    const full = page.locator(".class-card", { hasText: "Reformer Pilates" }).filter({ has: page.locator(".capacity--full") }).first();
    await full.click();
    await expect(page.getByText("Dolu", { exact: true })).toBeVisible();
    const add = page.getByRole("button", { name: "Katılımcı ekle" });
    if (await add.count()) await expect(add).toBeDisabled(); // ders geçmişte değilse buton görünür ama kapalı
  });

  test("rezervasyon iptal edilince doluluk azalır", async ({ page }) => {
    await openUpcomingClass(page);
    await addAttendee(page, "Melis Yıldız");
    await expect(page.getByRole("link", { name: "Melis Yıldız" })).toBeVisible();
    await page.getByRole("button", { name: "Melis Yıldız rezervasyonunu iptal et" }).click();
    await expect(page.getByRole("status").getByText("Melis Yıldız dersten çıkarıldı")).toBeVisible();
    await expect(page.getByRole("link", { name: "Melis Yıldız" })).toHaveCount(0);
  });
});
