# Erişilebilirlik Denetimi — WCAG 2.2 AA

| Alan | Bilgi |
|---|---|
| Sürüm | StudioPass web v1.0.0 |
| Yöntem | Otomatik (Playwright + kontrast betiği) + manuel klavye testi |
| Ekranlar | S-01 … S-08 (masaüstü 1440 px, mobil 390 px) |
| Sonuç | Denetimde 1 yüksek (BUG-016) ve 1 orta (BUG-012) bulgu çıktı, ikisi de düzeltildi. 1 düşük bulgu açık (BUG-014). Ekran okuyucu testi planlandı. |

## Özet tablo

| Ölçüt | Açıklama | Nasıl kontrol edildi | Sonuç |
|---|---|---|---|
| 1.1.1 Metin dışı içerik | İkonlar dekoratif (`aria-hidden`), anlamı yanındaki metin taşır; yalnız ikonlu butonların `aria-label`'ı var | Kod incelemesi | ✅ |
| 1.3.1 Bilgi ve ilişkiler | Tablolarda `<th scope>` ve `<caption>`; formlarda `<label for>`; bölümler `aria-labelledby` | E2E "her form alanının adı var" + inceleme | ✅ |
| 1.4.1 Renk kullanımı | Durum rozetleri ikon + metin + renk | E2E | ✅ · ⚠️ geçmiş ders kartları ([BUG-014](hata-kayitlari/BUG-014-gecmis-ders-sadece-soluk.md)) |
| 1.4.3 Kontrast (metin) | Tüm metin çiftleri ≥ 4.5:1 | `scripts/contrast-check.py` (CI) | ✅ en düşük 4.84:1 |
| 1.4.10 Yeniden akış | 390 px'de yatay kaydırma yok | E2E `mobil.spec.ts` | ✅ |
| 1.4.11 Metin dışı kontrast | Form kontrol kenarı 3.79:1, odak halkası 5.68:1 | Kontrast betiği | ✅ |
| 2.1.1 Klavye | Giriş, üye ekleme, plan atama, rezervasyon yalnız klavyeyle yapılabilir | E2E + manuel | ✅ |
| 2.1.2 Klavye tuzağı yok | Yan panelde odak döngüsü + Esc ile çıkış | E2E | ✅ |
| 2.4.1 Blokları atlama | "İçeriğe geç" bağlantısı | E2E · [BUG-012](hata-kayitlari/BUG-012-icerige-gec-atlaniyor.md) düzeltildi | ✅ |
| 2.4.2 Sayfa başlığı | Her sayfada `<title>` değişir | E2E | ✅ |
| 2.4.3 Odak sırası | Panel kapanınca odak açan butona döner | E2E | ✅ |
| 2.4.7 / 2.4.11 Odak görünür / gizlenmez | 2 px kil turuncusu halka, 2 px boşluk; yapışkan öğe odağı örtmüyor | Ekran görüntüleri incelendi | ✅ |
| 2.5.8 Hedef boyutu (en az) | Tüm etkileşimli öğeler ≥ 24×24 (çoğu 44×44) | E2E | ✅ |
| 3.3.1 Hata tanımlama | Hata alanın altında metinle, `aria-invalid` + `aria-describedby` | E2E | ✅ |
| 3.3.2 Etiket / talimat | Zorunlu alan işareti + "* işaretli alanlar zorunludur" notu | Manuel | ✅ |
| 3.3.7 Gereksiz tekrar giriş | Formlar yeniden açılınca sıfırlanıyor (beklenen) | Manuel | ✅ |
| 4.1.2 Ad, rol, değer | Yan panel `role=dialog` + `aria-modal`; doluluk çubuğu `role=progressbar` + `aria-valuetext`; tablet ikon menüsünde bağlantı adları korunur | Kod incelemesi + E2E · [BUG-016](hata-kayitlari/BUG-016-tablet-menu-adsiz-baglanti.md) düzeltildi | ✅ |
| 4.1.3 Durum mesajları | Bildirimler `role=status` / `aria-live=polite`; form genel hatası `role=alert` | E2E (bildirim metinleri) | ✅ |

## Klavye testi — "Üyeyi derse yaz" akışı
Yalnız klavye olaylarıyla (Tab / Enter / yazı) yürütüldü; adımlar bir Playwright betiğiyle tekrarlanabilir.
| Adım | Tuş | Gözlem |
|---|---|---|
| 1 | Tab | "İçeriğe geç" görünür |
| 2 | Enter, Tab… | Menüde "Dersler" → Enter |
| 3 | Tab… | Ders kartları sırayla odak alıyor; erişilebilir ad: "07:30 Sabah Vinyasa, Deniz Aydın, 2/12" |
| 4 | Enter | Ders detayı; odak `<main>`'e taşındı |
| 5 | Tab → Enter | "Katılımcı ekle" paneli açıldı, odak arama kutusunda |
| 6 | Yazı + Tab | Sonuç listesinde "Ekle" butonları, adla birlikte okunuyor |
| 7 | Enter | Bildirim duyuruldu, panel kapandı, odak "Katılımcı ekle" butonuna döndü |

## Bilinen sınırlamalar ve plan
| Konu | Plan |
|---|---|
| NVDA (Windows) ve VoiceOver (macOS/iOS) ile ekran okuyucu testi henüz yapılmadı | v1.0.1 öncesi 1 oturum |
| `prefers-reduced-motion` desteklendi ancak sistem ayarıyla manuel doğrulanmadı | v1.0.1 |
| axe-core taraması CI'a eklenecek (`@axe-core/playwright`) | v1.1 |
