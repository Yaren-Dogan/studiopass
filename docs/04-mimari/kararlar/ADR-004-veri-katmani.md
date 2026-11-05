# ADR-004 · v1.0'da bellek içi veri, v1.1'de PostgreSQL

- **Durum:** Kabul edildi

## Bağlam
v1.0 hedefi pilot stüdyolarla akışları doğrulamak ve kabul testlerini otomatikleştirmek. Kalıcı veri, yedekleme ve göç (migration) altyapısı bu aşamada geri bildirimi yavaşlatıyor.

## Karar
- v1.0: Tüm veri `store.ts` içinde, tohum verisi her açılışta yeniden oluşur. Test ortamında `POST /api/test/reset` ile sıfırlanır.
- v1.1: Aynı tip tanımları (`Member`, `Plan`, `Membership`…) korunarak PostgreSQL + Docker Compose; `docs/01-analiz/gereksinimler.md` § 5'teki veri modeli tablo şeması olarak uygulanacak.

## Sonuçlar
- ✅ Testler deterministik ve hızlı (48 API testi ~4 sn)
- ⚠️ Sunucu yeniden başlarsa veri kaybolur → **yalnız demo/test ortamı için**, README'de belirtildi
- ⚠️ NFR-01 (performans) gerçek veritabanıyla v1.1'de ölçülecek
