import { expect, goTo, loginAs, test } from "./fixtures";

test.describe("US-03 / US-04 Üyeler", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "manager");
    await goTo(page, "Üyeler");
  });

  for (const q of ["ayşe", "AYŞE", "ayse"]) {
    test(`TC-08 "${q}" araması Ayşe Yılmaz'ı bulur (BUG-007 regresyonu)`, async ({ page }) => {
      await page.getByLabel("Üye ara").fill(q);
      await expect(page.getByRole("link", { name: "Ayşe Yılmaz" })).toBeVisible();
      await expect(page.getByRole("row")).toHaveCount(2); // başlık + 1 sonuç
    });
  }

  test("TC-09 'Süresi dolmuş' filtresi ve adres çubuğu", async ({ page }) => {
    await page.getByLabel("Durum").selectOption("expired");
    await expect(page).toHaveURL(/status=expired/);
    const badges = page.locator("tbody .badge");
    await expect(badges.first()).toHaveText("Süresi dolmuş");
    for (const text of await badges.allTextContents()) expect(text).toBe("Süresi dolmuş");
  });

  test("TC-10 sonuç yoksa boş durum mesajı gösterilir", async ({ page }) => {
    await page.getByLabel("Üye ara").fill("zzzz");
    await expect(page.getByText("Aramanızla eşleşen üye bulunamadı")).toBeVisible();
    await page.getByRole("button", { name: "Filtreleri temizle" }).click();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("TC-11 yeni üye eklenir ve detay sayfası açılır", async ({ page }) => {
    await page.getByRole("button", { name: "Yeni üye" }).click();
    const dialog = page.getByRole("dialog", { name: "Yeni üye" });
    await dialog.getByRole("textbox", { name: "Ad", exact: true }).fill("Deneme");
    await dialog.getByLabel("Soyad").fill("Kullanıcı");
    await dialog.getByLabel("E-posta").fill("deneme.kullanici@ornek.com");
    await dialog.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByRole("status").getByText("Üye eklendi")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Deneme Kullanıcı");
    await expect(page.getByText("Plan yok").first()).toBeVisible();
  });

  test("TC-12 mükerrer e-posta alan altında gösterilir", async ({ page }) => {
    await page.getByRole("button", { name: "Yeni üye" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Ad", exact: true }).fill("Ayşe");
    await dialog.getByLabel("Soyad").fill("Başka");
    await dialog.getByLabel("E-posta").fill("ayse.yilmaz@ornek.com");
    await dialog.getByRole("button", { name: "Kaydet" }).click();
    await expect(dialog.getByText("Bu e-posta ile kayıtlı bir üye zaten var")).toBeVisible();
    await expect(dialog.getByLabel("E-posta")).toBeFocused();
  });

  test("TC-13 / TC-14 istemci doğrulaması", async ({ page }) => {
    await page.getByRole("button", { name: "Yeni üye" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("E-posta").fill("ayse@");
    await dialog.getByRole("button", { name: "Kaydet" }).click();
    await expect(dialog.getByText("Ad zorunludur", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Soyad zorunludur")).toBeVisible();
    await expect(dialog.getByText("Geçerli bir e-posta adresi girin")).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: "Ad", exact: true })).toBeFocused();
  });

  test("TC-15 üyeye plan atanınca bitiş tarihi hesaplanır", async ({ page }) => {
    await page.getByLabel("Üye ara").fill("onur");
    await page.getByRole("link", { name: "Onur Aslan" }).click();
    await page.getByRole("button", { name: "Plan ata" }).click();
    const dialog = page.getByRole("dialog", { name: "Plan ata" });
    await dialog.getByLabel("Plan").selectOption({ label: "Aylık Sınırsız · ₺1.890,00 · 30 gün" });
    await dialog.getByLabel("Başlangıç tarihi").fill("2026-11-01");
    await expect(dialog.getByText("01.12.2026")).toBeVisible();
    await dialog.getByRole("button", { name: "Planı ata" }).click();
    await expect(page.locator(".card").first().getByText("Aylık Sınırsız")).toBeVisible();
  });

  test("TC-28 pasife alma onay ister ve geri alınabilir (UT-01)", async ({ page }) => {
    await page.getByLabel("Üye ara").fill("burak");
    await page.getByRole("link", { name: "Burak Şahin" }).click();
    await page.getByRole("button", { name: "Üyeliği dondur / pasife al" }).click();
    const dialog = page.getByRole("dialog", { name: "Üyeyi pasife al" });
    await expect(dialog.getByText("Üye silinmez")).toBeVisible();
    await dialog.getByRole("button", { name: "Pasife al" }).click();
    await expect(page.getByText("Pasif", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Yeniden etkinleştir" }).click();
    await expect(page.getByText("Aktif", { exact: true })).toBeVisible();
  });
});
