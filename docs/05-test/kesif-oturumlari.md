# Keşif Testi Oturum Notları

Zaman kutulu (30 dk), hedefli oturumlar. Her oturumun sonunda bulgular ya hata kaydına ya da backlog'a dönüşür.

## Oturum 1 · Resepsiyonun yoğun saati
**Hedef:** Tablet genişliğinde (1024 px) üye bulup derse yazma akışını hızlı tekrarlarla zorlamak.
**Veri:** Tohum verisi, yönetici hesabı.

| Zaman | Ne denendi | Gözlem | Sonuç |
|---|---|---|---|
| 0–3 dk | Tablet genişliğinde menüden "Dersler"e git (otomasyon betiğiyle) | Betik menü bağlantısını adıyla bulamadı: 1024 px'de etiketler `display: none` ile gizlendiği için bağlantıların erişilebilir adı yok | 🐞 BUG-016 |
| 3–5 dk | Aynı derse art arda 5 üye | Doluluk çubuğu her eklemede güncelleniyor, bildirim okunaklı | ✅ |
| 5–10 dk | Panel açıkken üyeyi başka oturumdan (API) ekle, sonra bu panelden tekrar ekle | Arayüz "Ekle" gösteriyor ama API 409 dönüyor; satırın altında "Üye bu derse zaten kayıtlı" görünüyor | ✅ Kurallar sunucuda olduğu için güvenli |
| 10–15 dk | İsteği 1,5 sn geciktir, "Ekle"ye hızlıca iki kez bas | Buton yükleniyor durumunda kapalı; sunucuya **1** istek gitti | ✅ |
| 15–20 dk | Ağı kapat (çevrimdışı), "Ekle"ye bas | "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin." | ✅ |
| 20–25 dk | Özet → "Bu ay bitecek" | Sayaç 11, liste 5 | 🐞 BUG-015 |
| 25–30 dk | Özet bağlantısı | Farklı liste açılıyor | 🐞 BUG-011 |

## Oturum 2 · API'yi Swagger ile zorlamak
**Hedef:** Arayüzün engellediği ama API'ye doğrudan gönderilebilecek istekler.

| İstek | Beklenen | Gözlem |
|---|---|---|
| Eğitmen token'ı ile `POST /api/plans` | 403 | ✅ 403 |
| `priceKurus: 12.5` (ondalık) | 400 | ✅ 400 "Fiyat 0'dan büyük olmalı" — ⚠️ mesaj ondalık değeri tam açıklamıyor, metin iyileştirmesi backlog'a yazıldı |
| `capacity: "10"` (metin) | 400 | ✅ 400 |
| Bozuk JSON gövdesi | 400 | ✅ `INVALID_JSON` |
| 200 KB gövde | 413 | ✅ `PAYLOAD_TOO_LARGE` |
| `GET /api/members?page=-3` | Sayfa 1 | ✅ |
| Var olmayan uç nokta | 404 JSON | ✅ |
| `PUT /api/members` (desteklenmeyen yöntem) | 405 | ✅ |
| Sunucu hatası durumunda yanıt | İç ayrıntı yok | ✅ yalnız `INTERNAL_ERROR` (NFR-03) |

## Oturum 3 · Erişilebilirlik ve klavye
Sonuçlar: [erisilebilirlik-denetimi.md](erisilebilirlik-denetimi.md) · Bulgu: BUG-012 (e2e ile yakalandı), BUG-014.
