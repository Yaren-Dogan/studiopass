# Test Özet Raporu — v1.0.0

| Alan | Bilgi |
|---|---|
| Sürüm | 1.0.0 |
| Ortam | Yerel test ortamı (Node 22, Chromium) |
| Karar | ✅ **Yayına uygun** — açık hatalar Düşük/Orta, ana akışları engellemiyor |

## Sonuçlar

| Paket | Komut | Test | Geçti | Kaldı |
|---|---|---|---|---|
| API (birim + entegrasyon) | `npm test -w @studiopass/api` | 48 | 48 | 0 |
| Web (birim) | `npm test -w @studiopass/web` | 20 | 20 | 0 |
| Uçtan uca (Chrome masaüstü + mobil 390) | `npm run e2e` | 36 | 36 | 0 |
| Kontrast | `npm run check:contrast` | 13 çift | 13 | 0 |
| **Toplam** | | **117** | **117** | **0** |

## Kabul kriterleri
Must hikâyeler (US-01…US-08): **tüm senaryolar geçti.** Should hikâyeler (US-09, US-10): geçti; US-09 için ürün boşluğu kaydedildi (BUG-015).

## Hatalar

| Önem | Açılan | Kapanan | Açık |
|---|---|---|---|
| Yüksek | 3 | 3 | 0 |
| Orta | 3 | 2 | 1 (BUG-015 — ürün kararı) |
| Düşük | 2 | 1 | 1 (BUG-014 — v1.0.1) |

## Riskler ve notlar
- Testler yalnız Chromium'da çalıştı; Safari ve Firefox v1.0.1'de manuel kontrol edilecek.
- Veriler bellek içinde; gerçek veritabanıyla performans testi (NFR-01) v1.1'de.
- Ekran okuyucu testi planlandı ([erişilebilirlik denetimi](erisilebilirlik-denetimi.md)).
- Bir API testinin yanlış pozitif verdiği inceleme sırasında fark edildi ve düzeltildi ([BUG-013](hata-kayitlari/BUG-013-sifirlamada-oturum-dusuyor.md)); diğer yetki testleri aynı kalıp için tarandı, başka örnek bulunmadı.
