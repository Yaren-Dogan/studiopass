# Test Planı — StudioPass v1.0

| Alan | Bilgi |
|---|---|
| Kapsam | Web paneli (React) + REST API, sürüm 1.0.0 |
| Test ortamı | `npm run dev` · API :4000 · Web :5173 · veriler `POST /api/test/reset` ile sıfırlanır |
| Giriş kriteri | Hikâye "Test ortamında" sütununda, CI yeşil, kabul kriterleri yazılı |
| Çıkış kriteri | Kritik/Yüksek açık hata yok · Must hikâyelerin tüm kabul senaryoları geçti · axe/klavye kontrolünde kritik bulgu yok |

## 1. Test yaklaşımı (test piramidi)

| Katman | Araç | Ne test edilir | Sayı | Nerede |
|---|---|---|---|---|
| Birim / API entegrasyon | `node:test` + gerçek HTTP sunucusu | İş kuralları, doğrulama, rol yetkisi, hata kodları, sınır değerler | 48 | `apps/api/test/` |
| Birim (ön yüz) | `node:test` | Para/tarih biçimleri, doluluk seviyesi | 20 | `apps/web/test/` |
| Uçtan uca kabul | Playwright (Chrome masaüstü + 390 px mobil) | Kullanıcı akışları, rol görünümü, erişilebilirlik kontrolleri | 36 | `apps/web/e2e/` |
| Manuel keşif testi | Tarayıcı geliştirici araçları, Swagger UI | Görsel uyum, hata mesajları, ağ istekleri, kenar durumlar | Oturum notları | Bu klasör |
| Kontrast | `scripts/contrast-check.py` | Tasarım token çiftleri | 13 çift | CI |

## 2. Kapsam

| Alan | Kapsamda | Not |
|---|---|---|
| Giriş, oturum süresi | ✅ | |
| Rol bazlı erişim (UI + API) | ✅ | Her yetki kuralı hem arayüzde hem API'de ayrı test edilir |
| Üye arama, filtre, ekleme, pasife alma | ✅ | Türkçe karakter seti ayrıca test edilir |
| Plan atama, bitiş tarihi hesaplama | ✅ | Ay/yıl geçişi sınır değerleri |
| Ders ve rezervasyon kuralları | ✅ | Kapasite sınırı, bugün biten üyelik, geçmiş ders |
| Özet panel | ✅ | Göstergelerin ham veriyle tutarlılığı |
| Performans (NFR-01) | ⚠️ Kısmi | Bellek içi veri; gerçek veritabanıyla v1.1'de |
| Ekran okuyucu (NVDA/VoiceOver) | ⏳ Planlandı | Otomatik kontroller yapıldı, manuel SR testi v1.0.1 |
| Safari / Firefox | ⏳ Planlandı | CI'da yalnız Chromium çalışıyor |

## 3. Test teknikleri
- **Sınır değer analizi:** kapasite (N-1, N, N+1), bitiş tarihi (dün, bugün, yarın), plan süresi (1, 730, 731), kapasite (0, 1, 50, 51)
- **Denklik sınıfları:** üye durumu (aktif / süresi dolmuş / plansız / pasif) × rol (sahip / yönetici / eğitmen)
- **Karar tablosu:** rezervasyon kuralları (aşağıda)
- **Keşif testi:** 30 dakikalık zaman kutulu oturumlar, notlar `kesif-oturumlari.md`

### Rezervasyon karar tablosu (FR-10)

| # | Ders geçmişte mi? | Zaten kayıtlı mı? | Üyelik aktif mi? | Yer var mı? | Beklenen | Kod |
|---|---|---|---|---|---|---|
| 1 | Evet | – | – | – | Ret | 422 `CLASS_IN_PAST` |
| 2 | Hayır | Evet | – | – | Ret | 409 `ALREADY_BOOKED` |
| 3 | Hayır | Hayır | Hayır | – | Ret | 422 `NO_ACTIVE_MEMBERSHIP` |
| 4 | Hayır | Hayır | Evet | Hayır | Ret | 409 `CLASS_FULL` |
| 5 | Hayır | Hayır | Evet | Evet | Kabul | 201 |

> Kontrol sırası sözleşmenin parçasıdır: aynı istekte birden çok kural ihlal edilirse tablodaki ilk satırın hatası döner. Bu, arayüzde kullanıcıya en anlamlı mesajın gösterilmesini sağlar.

## 4. Hata önem dereceleri

| Derece | Tanım | Örnek | Hedef çözüm süresi |
|---|---|---|---|
| Kritik | Veri kaybı, güvenlik açığı, ana akış tamamen çalışmıyor | Eğitmen üye telefonlarını görüyor | Aynı gün, yayın durdurulur |
| Yüksek | Ana akış hatalı sonuç veriyor, geçici çözüm yok | Türkçe karakterle arama çalışmıyor | Sprint içinde |
| Orta | Akış çalışıyor ama yanıltıcı ya da zor | Bağlantı metni yanlış sayfayı ima ediyor | Sonraki sprint |
| Düşük | Görsel/metin kusuru | Satır yüksekliği tasarımdan 2 px farklı | Backlog |

## 5. Roller
| Rol | Sorumluluk |
|---|---|
| QA / Koordinasyon | Test planı, kabul testi, hata raporu, kabul kararı |
| Geliştirici (insan + yapay zekâ) | Birim testleri, hata düzeltme, PR |
| Ürün Sahibi | Kabul kriterleri, öncelik kararı |
| Bağımsız denetçi | Kod ve test incelemesi |

İlgili: [Test senaryoları](test-senaryolari.md) · [Hata kayıtları](hata-kayitlari/) · [Test raporu v1.0](test-raporu-v1.0.md) · [Erişilebilirlik denetimi](erisilebilirlik-denetimi.md)
