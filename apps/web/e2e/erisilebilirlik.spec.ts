import { expect, goTo, loginAs, test } from "./fixtures";

/** NFR-04 · WCAG 2.2 AA — otomatikleştirilebilen kontroller. Manuel kontroller: docs/05-test/erisilebilirlik-denetimi.md */
test.describe("Erişilebilirlik", () => {
  test("klavyeyle giriş yapılabilir (2.1.1)", async ({ page }) => {
    await page.goto("/login");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("E-posta")).toBeFocused();
    await page.keyboard.type("mert@studiopass.dev");
    await page.keyboard.press("Tab");
    await page.keyboard.type("Studio123!");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
  });

  test("'İçeriğe geç' bağlantısı ilk odaklanan öğedir (2.4.1)", async ({ page }) => {
    await loginAs(page, "manager");
    await page.reload(); // ilk yüklemede odak sıfırdan başlar
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "İçeriğe geç" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
  });

  test("yan panel: odak içeride kalır, Esc kapatır, odak açan butona döner (2.4.3, 2.1.2)", async ({ page }) => {
    await loginAs(page, "manager");
    await goTo(page, "Üyeler");
    const opener = page.getByRole("button", { name: "Yeni üye" });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Yeni üye" });
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog.getByRole("textbox", { name: "Ad", exact: true })).toBeFocused();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test("her form alanının erişilebilir adı vardır (1.3.1, 4.1.2)", async ({ page }) => {
    await loginAs(page, "owner");
    for (const path of ["/members", "/classes", "/plans"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const unlabeled = await page.locator("input, select, textarea").evaluateAll((els) =>
        els.filter((el) => {
          const id = el.getAttribute("id");
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          return !hasLabel && !el.getAttribute("aria-label") && !el.closest("label");
        }).map((el) => el.outerHTML),
      );
      expect(unlabeled, `${path} sayfasında etiketsiz alan`).toEqual([]);
    }
  });

  test("durum rozetleri renk dışında metin de taşır (1.4.1)", async ({ page }) => {
    await loginAs(page, "manager");
    await goTo(page, "Üyeler");
    const texts = await page.locator("tbody .badge").allTextContents();
    expect(texts.length).toBeGreaterThan(0);
    for (const t of texts) expect(t.trim().length).toBeGreaterThan(0);
  });

  test("sayfa başlığı (title) sayfaya göre değişir (2.4.2)", async ({ page }) => {
    await loginAs(page, "manager");
    await expect(page).toHaveTitle("Özet · StudioPass");
    await goTo(page, "Üyeler");
    await expect(page).toHaveTitle("Üyeler · StudioPass");
  });

  test("tablet genişliğinde (1024 px) ikon menüsünün bağlantı adları korunur (4.1.2 · BUG-016)", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await loginAs(page, "manager");
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    for (const label of ["Özet", "Üyeler", "Dersler", "Planlar"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    const box = await page.locator(".nav__label").first().boundingBox();
    expect(box!.width).toBeLessThanOrEqual(1); // görsel olarak gizli
  });

  test("dokunma hedefleri en az 24×24 px (2.5.8)", async ({ page }) => {
    await loginAs(page, "manager");
    await goTo(page, "Üyeler");
    const small = await page.locator("button, a, input, select").evaluateAll((els) =>
      els.filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.width < 24 || r.height < 24) && !el.closest("td, .list__row, .skip-link"); })
        .map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(small).toEqual([]);
  });
});
