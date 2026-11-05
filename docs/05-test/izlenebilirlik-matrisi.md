# İzlenebilirlik Matrisi

Gereksinim → Kullanıcı hikâyesi → Test senaryosu → Otomatik test. Bir gereksinim değiştiğinde etkilenen testler bu tablodan bulunur.

| Gereksinim | Hikâye | Test senaryoları | API testi | E2E testi | Kapsandı |
|---|---|---|---|---|---|
| FR-01 Giriş | US-01 | TC-01, 02, 03 | `auth.test.ts` | `giris.spec.ts` | ✅ |
| FR-02 Oturum süresi | US-01 | TC-04 | `auth.test.ts` (TC-04) | `giris.spec.ts` | ✅ |
| FR-03 Rol yetkisi | US-02 | TC-05, 06, 07, 20 | `members.test.ts` · `classes.test.ts` | `roller.spec.ts` | ✅ |
| FR-04 Arama/filtre | US-03 | TC-08, 09, 10 | `members.test.ts` | `uyeler.spec.ts` | ✅ |
| FR-05 Üye ekleme | US-04 | TC-11–14 | `members.test.ts` | `uyeler.spec.ts` | ✅ |
| FR-06 Bitiş hesaplama | US-05 | TC-15 | `members.test.ts` | `uyeler.spec.ts` | ✅ |
| FR-07 Durum hesaplama | US-05 | TC-17 | `classes.test.ts` (bugün biten) | – | ✅ |
| FR-08 Plan oluşturma | US-06 | TC-18, 19, 20 | `classes.test.ts` | `roller.spec.ts` | ✅ |
| FR-09 Ders oluşturma | US-07 | TC-21, 22 | `classes.test.ts` | – (arayüz v1.1) | ⚠️ API |
| FR-10 Rezervasyon | US-08 | TC-23–26, 32 | `classes.test.ts` | `rezervasyon.spec.ts` | ✅ |
| FR-11 Özet panel | US-09 | TC-27 | `classes.test.ts` | – | ✅ |
| FR-12 Pasife alma | US-10 | TC-28 | `members.test.ts` | `uyeler.spec.ts` | ✅ |
| FR-13 Sayfalama | US-03 | TC-29 | `members.test.ts` | – | ✅ |
| NFR-04 Erişilebilirlik | – | TC-30 | – | `erisilebilirlik.spec.ts` | ✅ (otomatik kısım) |
| NFR-05 Duyarlılık | – | TC-31 | – | `mobil.spec.ts` | ✅ (Chromium) |
| NFR-06 Yerel biçim | – | – | – | `format.test.ts` (birim) | ✅ |
| BR-01 Tek aktif plan | US-05 | TC-16 | `members.test.ts` | – | ✅ |
| BR-03 Geçmiş ders | US-08 | TC-32 | `classes.test.ts` | – | ✅ |
| BR-04 Plan silinmez | US-06 | – | `classes.test.ts` · `members.test.ts` | – | ✅ |

> **Açık nokta:** FR-09 (ders oluşturma) API'de hazır ve test edildi, ancak arayüzde ders oluşturma formu v1.0 kapsamından çıkarıldı (karar: [2026-10-21 sprint incelemesi](../06-proje-yonetimi/toplanti-notlari/2026-10-21-sprint-inceleme-s3.md)). Demo verisi tohum ile gelir.
