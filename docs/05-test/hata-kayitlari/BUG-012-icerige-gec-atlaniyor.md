# BUG-012 · "İçeriğe geç" bağlantısı ilk Tab'da atlanıyor

| Alan | Değer |
|---|---|
| Önem | Orta (erişilebilirlik — WCAG 2.4.1 Bypass Blocks) · Öncelik P2 |
| Katman | Ön yüz — `main.tsx` odak yönetimi |
| Bulan | Otomatik e2e testi (`erisilebilirlik.spec.ts`) |

## Adımlar
1. Yönetici ile giriş yap.
2. Sayfayı yenile (F5).
3. Klavyeden **Tab**'a bas.

## Beklenen
İlk odaklanan öğe sayfanın en üstünde görünen **"İçeriğe geç"** bağlantısıdır.

## Gerçekleşen
Odak doğrudan ana içerikteki ilk butona gidiyor; "İçeriğe geç" hiç görünmüyor.

## Kök neden
Sayfa değişiminde ekran okuyucu kullanıcıları için odak `<main>`'e taşınıyordu. Bu kod **ilk yüklemede de** çalıştığı için odak başlangıçta zaten `<main>` içindeydi ve Tab sıradaki öğeye geçiyordu.

## Çözüm — iki deneme
1. **İlk düzeltme:** "ilk render mı?" bilgisini bir `ref` ile tutup ilk çalışmada atlamak. → Geliştirme modunda hâlâ hatalı: React `StrictMode` efektleri iki kez çalıştırıyor ve ikinci çalışmada `ref` zaten `false` olduğu için odak yine taşınıyordu.
2. **Kalıcı düzeltme:** Önceki yolu bir `ref`'te tutup **yalnız yol gerçekten değiştiğinde** odağı taşımak. StrictMode'un çift çalıştırmasında yol aynı kaldığı için etkilenmiyor.

> Bu hata, yapay zekâ destekli yazılan ilk düzeltmenin incelemede nasıl gözden kaçabileceğine iyi bir örnek: düzeltme üretim derlemesinde çalışıyor, geliştirme modunda çalışmıyordu. Ayrıntı: [yapay zekâ kodu inceleme notları](../../07-yapay-zeka-inceleme/inceleme-notlari.md#3-odak-yönetimi-ve-strictmode)

## Doğrulama
- [x] E2E: "İçeriğe geç ilk odaklanan öğedir" (yenileme sonrası)
- [x] Sayfa geçişlerinde odağın `<main>`'e taşınmaya devam ettiği manuel kontrol edildi
- Durum: **Doğrulandı**
