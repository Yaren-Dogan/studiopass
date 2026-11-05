# BUG-016 · Tablet genişliğinde menü bağlantılarının erişilebilir adı yok

| Alan | Değer |
|---|---|
| Önem | **Yüksek** — ekran okuyucu kullanıcısı tablette menüyü kullanamıyor (WCAG 4.1.2 Ad, Rol, Değer · 2.4.4 Bağlantı amacı) |
| Öncelik | P1 |
| Katman | Ön yüz — `app.css`, `@media (max-width: 1024px)` |
| Ortam | Chrome, 1024×768 (resepsiyon tableti, yatay) |
| Bulan | Keşif testi: otomasyon betiği menü bağlantısını adıyla bulamadı |

## Adımlar
1. Tarayıcı penceresini 1024 px genişliğe getir (DevTools › cihaz araç çubuğu).
2. Yönetici ile giriş yap.
3. DevTools › **Accessibility** panelinde soldaki menü bağlantılarından birini incele.

## Beklenen
Bağlantının erişilebilir adı **"Dersler"** (etiket görsel olarak gizli olsa bile).

## Gerçekleşen
Erişilebilir ad **boş**. Ekran okuyucu yalnız "bağlantı" diyor; ikon `aria-hidden` olduğu için başka bir ipucu yok. Masaüstünde (1440 px) sorun yok, çünkü etiket görünür.

## Kök neden
Tablet kırılmasında yer açmak için `.nav__label { display: none; }` kullanılmış. `display: none` öğeyi **erişilebilirlik ağacından da** çıkarır.

## Çözüm
Etiket `display: none` yerine "görsel olarak gizli" (visually-hidden) kalıbıyla gizlendi: 1×1 px, `clip`, `overflow: hidden`. Görsel tasarım değişmedi, ad korundu. Mobilde (< 768 px) etiket yeniden görünür.

## Doğrulama
- [x] E2E: "tablet genişliğinde (1024 px) ikon menüsünün bağlantı adları korunur" — 4 bağlantı adıyla bulunuyor, etiket genişliği ≤ 1 px
- [x] Görsel kontrol: tablet düzeni değişmedi
- [x] Masaüstü ve mobil regresyon: e2e paketi yeşil
- Durum: **Doğrulandı**

## Not
Bu hatayı ilk yakalayan bir test değil, test **betiği** oldu: Playwright'ın `getByRole("link", { name })` sorgusu ekran okuyucuyla aynı erişilebilirlik ağacını kullanır. Erişilebilir ad üzerinden seçici yazmak, testleri aynı zamanda erişilebilirlik kontrolüne dönüştürür.
