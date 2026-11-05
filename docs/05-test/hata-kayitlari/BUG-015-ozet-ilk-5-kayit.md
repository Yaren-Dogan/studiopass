# BUG-015 · Özet'te "bu ay bitecek" listesi ilk 5 kayıtta kalıyor

| Alan | Değer |
|---|---|
| Tür | Ürün eksikliği (gereksinimle uyumlu, ihtiyaçla uyumsuz) |
| Önem | Orta · Öncelik P2 |
| Katman | API `GET /api/dashboard` + ön yüz |
| Durum | 🟡 **Açık** — Ürün Sahibi kararı bekleniyor, backlog US-14 |

## Gözlem
Kart başlığı "Bu ay bitecek üyelikler" ve sayaç **11** diyor, liste **5** kişi gösteriyor; geri kalan 6 kişiye ulaşmanın yolu yok. Stüdyo sahibinin bu ekranı açma nedeni (P1 — biten üyelikleri kaçırmamak) tam karşılanmıyor.

## Gereksinim açısından
FR-11 yalnız "göstermelidir" diyor, liste uzunluğu tanımlı değil → teknik olarak hata değil, **gereksinim boşluğu**.

## Önerilen seçenekler (Ürün Sahibine sunuldu)
| Seçenek | Efor | Not |
|---|---|---|
| A. Üyeler API'sine `expiring=month` filtresi + "Tümünü gör" bağlantısı | 0.5 gün | Önerilen; BUG-011'i de tamamen çözer |
| B. Kartta "Daha fazla göster" ile 5'er açılma | 0.25 gün | Liste uzunsa kart şişer |
| C. Değişiklik yok | – | Sayaç ile liste uyumsuzluğu sürer |

Karar: [Haftalık durum raporu · 2026-W45](../../06-proje-yonetimi/haftalik-raporlar/2026-W45.md) "Kararınızı bekleyenler" bölümünde.
