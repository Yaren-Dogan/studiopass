# Sprint 3 Planlama · 07.10.2026

**Katılımcılar:** Ürün Sahibi, Mimar, Geliştirici, Koordinasyon (not alan)
**Süre:** 45 dk

## Gündem
1. Sprint 2 kapanışı ve taşınan işler
2. Sprint 3 hedefi
3. Backlog önceliklendirme (RICE)

## Kararlar
| # | Karar | Gerekçe | Sahip |
|---|---|---|---|
| K-1 | Sprint hedefi: **"Resepsiyon bir üyeyi kurallara uygun şekilde derse yazabilir"** | Ürünün varoluş nedeni (P1, P2) | Ürün Sahibi |
| K-2 | US-08 (rezervasyon) RICE puanı düşük olsa da MVP'de zorunlu | Diğer özellikler rezervasyon olmadan değer üretmiyor | Ürün Sahibi |
| K-3 | Rezervasyon kuralları **yalnız API'de** uygulanır, arayüz API'nin hata mesajını gösterir | Tek doğruluk kaynağı; arayüz atlatılsa da kural bozulmaz | Mimar |
| K-4 | Kural kontrol sırası sözleşmenin parçası: geçmiş → mükerrer → üyelik → kapasite | Kullanıcıya en anlamlı mesajı göstermek | Mimar + QA |

## Aksiyonlar
| Aksiyon | Sahip | Tarih | Durum |
|---|---|---|---|
| Rezervasyon karar tablosunu test planına ekle | Koordinasyon / QA | 09.10 | ✅ |
| `openapi.yaml`'a 409/422 hata kodlarını yaz | Geliştirici | 10.10 | ✅ |
| Figma'da CapacityBar'ın üç durumunu (normal / %90+ / dolu) hazırla | Tasarım | 10.10 | ✅ |
