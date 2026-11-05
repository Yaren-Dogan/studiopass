# ADR-002 · API'de çalışma zamanı bağımlılığı kullanmamak (Node.js yerleşik modülleri)

- **Durum:** Kabul edildi (MVP için) · v1.1'de yeniden değerlendirilecek
- **Karar vericiler:** Mimar, Güvenlik incelemesi

## Bağlam
MVP'nin API yüzeyi küçük (15 uç nokta). Express, bcrypt, jsonwebtoken gibi paketler kullanışlı, ancak her bağımlılık güvenlik denetimi ve güncelleme yükü getiriyor. Node.js 22'de `http`, `crypto.scrypt`, `crypto.createHmac`, `fetch`, `node:test` yerleşik.

## Seçenekler
| Seçenek | Artı | Eksi |
|---|---|---|
| Express + bcrypt + jsonwebtoken + zod | Yaygın, ekip tanıyor | 4 doğrudan + ~60 dolaylı bağımlılık |
| Fastify + şema doğrulama | Hızlı, OpenAPI üretimi | Öğrenme eğrisi |
| **Yerleşik modüller + küçük yardımcılar** | Sıfır çalışma zamanı bağımlılığı, tamamen okunabilir | Yönlendirici ve doğrulama elle yazılır (~200 satır) |

## Karar
Yerleşik modüller. Yönlendirici (`lib/http.ts`), kimlik (`lib/auth.ts`) ve doğrulama (`lib/validate.ts`) küçük ve test edilmiş yardımcılar olarak yazıldı.

## Sonuçlar
- ✅ `npm audit` yüzeyi yalnız geliştirme araçları
- ✅ Kimlik doğrulama kodu tamamen incelenebilir (JWT doğrulaması 20 satır)
- ⚠️ OpenAPI dosyası elle güncel tutulmalı → PR şablonunda kontrol maddesi
- 🔁 Uç nokta sayısı 30'u geçerse Fastify'a geçiş değerlendirilecek
