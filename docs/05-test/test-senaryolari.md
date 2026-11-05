# Test Senaryoları

Her senaryo bir kabul kriterine bağlıdır. "Otomasyon" sütunu senaryonun hangi testle korunduğunu gösterir; manuel senaryolar her sürüm öncesi elle çalıştırılır.

Ön koşul (tümü için): Test ortamı ayakta, veri sıfırlanmış (`POST /api/test/reset`), demo şifresi `Studio123!`.

| TC | Hikâye | Senaryo | Adımlar | Beklenen sonuç | Otomasyon | Sonuç v1.0 |
|---|---|---|---|---|---|---|
| TC-01 | US-01 | Doğru bilgilerle giriş | 1. `/login` aç 2. `elif@studiopass.dev` + şifre 3. "Giriş yap" | Özet sayfası, "Merhaba Elif" | API `auth.test` · E2E `giris.spec` | ✅ |
| TC-02 | US-01 | Hatalı şifre | 1. Doğru e-posta, yanlış şifre 2. "Giriş yap" | "E-posta veya şifre hatalı"; kayıtlı olmayan e-postayla aynı yanıt | API · E2E | ✅ |
| TC-03 | US-01 | Boş form | "Giriş yap"a doğrudan bas | Her alanın altında hata; odak E-posta alanında; `aria-invalid=true` | API · E2E | ✅ |
| TC-04 | US-01 | Oturum süresi doldu | Token'ı geçersiz kıl, korumalı sayfaya git | Girişe yönlendirme, bilgilendirme mesajı | API (birim) · E2E | ✅ |
| TC-05 | US-02 | Eğitmen görünümü | Deniz ile giriş → Üyeler | Özet menüde yok; E-posta sütunu yok; "Yeni üye" yok | API · E2E `roller.spec` | ✅ |
| TC-06 | US-02 | Eğitmen API ile üye ekleyemez | Eğitmen token'ı ile `POST /api/members` | 403 `FORBIDDEN` | API | ✅ |
| TC-07 | US-02 | Eğitmen özet verisini alamaz | Eğitmen token'ı ile `GET /api/dashboard` | 403 | API | ✅ |
| TC-08 | US-03 | Türkçe duyarsız arama | "ayşe", "AYŞE", "ayse", "Ayşe Yıl" ara | Her durumda Ayşe Yılmaz bulunur | API · E2E | ✅ (BUG-007 sonrası) |
| TC-09 | US-03 | Durum filtresi | "Süresi dolmuş" seç | Yalnızca bitişi geçmiş üyeler; adres çubuğunda `status=expired` | API · E2E | ✅ |
| TC-10 | US-03 | Sonuç yok | "zzzz" ara | Boş durum mesajı + "Filtreleri temizle" | API · E2E | ✅ |
| TC-11 | US-04 | Geçerli üye kaydı | Ad, Soyad, E-posta gir → Kaydet | "Üye eklendi"; detay sayfası; durum "Plan yok"; e-posta küçük harfe çevrilir | API · E2E | ✅ |
| TC-12 | US-04 | Mükerrer e-posta | Var olan e-postayı (farklı büyük/küçük harfle) gir | Alan altında hata; odak E-posta'da; API 409 | API · E2E | ✅ |
| TC-13 | US-04 | Geçersiz e-posta | `ayse@` gir | "Geçerli bir e-posta adresi girin" | API · E2E | ✅ |
| TC-14 | US-04 | Zorunlu alanlar | Boş form → Kaydet | Üç hata birlikte, odak ilk hatalı alanda | API · E2E | ✅ |
| TC-15 | US-05 | Bitiş tarihi | 30 günlük plan, başlangıç 01.11.2026 | Önizleme ve kayıt: 01.12.2026 | API · E2E · birim | ✅ |
| TC-16 | US-05 | Yeni plan eskisini kapatır | Aktif planı olan üyeye yeni plan ata | Eski üyelik bugün biter; geçmişte 2 kayıt | API | ✅ |
| TC-17 | US-05 | Durum hesaplama | Bitişi dün / bugün / yarın olan üyeler | Süresi dolmuş / Aktif / Aktif | API (sınır değer) | ✅ |
| TC-18 | US-06 | Plan oluşturma | "10 Ders Paketi", "1.250,00", 60 gün | Kartta "₺1.250,00 · 60 gün" | API · E2E | ✅ |
| TC-19 | US-06 | Negatif fiyat | Fiyat "-5" | "Fiyat 0'dan büyük olmalı" | API · E2E | ✅ |
| TC-20 | US-06 | Yönetici plan oluşturamaz | Mert ile Planlar | "Yeni plan" butonu yok; API 403 | API · E2E | ✅ |
| TC-21 | US-07 | Ders oluşturma | Geçerli alanlarla `POST /api/classes` | 201, doluluk 0 | API | ✅ |
| TC-22 | US-07 | Kapasite sınırı | Kapasite 0 ve 51 | "Kapasite 1 ile 50 arasında olmalı" | API | ✅ |
| TC-23 | US-08 | Başarılı rezervasyon | Gelecek ders → Katılımcı ekle → aktif üye | Bildirim; doluluk +1; listede görünür | API · E2E | ✅ |
| TC-24 | US-08 | Dolu ders | Kapasite 2: 2 kişi ekle, 3. kişiyi dene | 2. kabul (son yer), 3. ret 409 `CLASS_FULL`; arayüzde buton kapalı | API · E2E | ✅ |
| TC-25 | US-08 | Süresi dolmuş üyelik | Hakan Özdemir'i derse ekle | "Üyenin aktif bir planı yok" + "Plan ata" bağlantısı; 422 | API · E2E | ✅ |
| TC-26 | US-08 | Mükerrer rezervasyon | Kayıtlı üyeyi tekrar ekle | Arayüzde "Kayıtlı" (kapalı buton); API 409 `ALREADY_BOOKED` | API · E2E | ✅ |
| TC-27 | US-09 | Özet tutarlılığı | Özet göstergelerini liste uç noktalarıyla karşılaştır | Aktif üye sayısı = aktif filtre toplamı; dağılım toplamı = aktif üye | API | ✅ |
| TC-28 | US-10 | Pasife alma | Üye detayı → pasife al → onay | Onay penceresinde açıklama; durum "Pasif"; geri alınabilir | API · E2E | ✅ |
| TC-29 | US-03 | Sayfalama | 24 üyede liste | Sayfa 1: 20, sayfa 2: 4 | API | ✅ |
| TC-30 | NFR-04 | Klavye ile kullanım | Yalnız Tab/Enter/Esc ile giriş + üye ekleme | Tüm adımlar yapılabilir, odak görünür | E2E `erisilebilirlik.spec` | ✅ |
| TC-31 | NFR-05 | 390 px duyarlılık | Mobil görünümde tüm sayfalar | Yatay taşma yok; alt menü | E2E `mobil.spec` | ✅ |
| TC-32 | BR-03 | Geçmiş derse rezervasyon | Geçmiş derse `POST /bookings` | 422 `CLASS_IN_PAST`; arayüzde buton yok | API | ✅ |
