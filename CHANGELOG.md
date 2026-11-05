# Sürüm Notları

Biçim: [Keep a Changelog](https://keepachangelog.com/tr/1.1.0/) · Sürümleme: [SemVer](https://semver.org/lang/tr/)

## [1.0.0] — 2026-11-05

### Eklendi
- **Özet panel** (US-09): aktif üye, bu ay bitecek üyelikler, haftalık doluluk, plan dağılımı, aylık satış
- **Üyeyi pasife alma** (US-10): onay penceresiyle; geri alınabilir, kayıtlar silinmez
- Uçtan uca kabul testleri (Playwright, 36 senaryo) ve erişilebilirlik kontrolleri CI'da
- Tasarım token kontrast kontrolü (`npm run check:contrast`)

### Düzeltildi
- Tablet genişliğinde menü bağlantılarının erişilebilir adı yoktu (BUG-016)
- "İçeriğe geç" bağlantısı ilk Tab'da atlanıyordu (BUG-012)
- Özet'teki bağlantı metni açılan listeyle uyuşmuyordu (BUG-011)
- Kenar çubuğunda uzun kullanıcı adları kesiliyordu (BUG-010)
- Veri sıfırlandığında açık oturumlar geçersiz oluyordu (BUG-013)

### Bilinen sorunlar
- Geçmiş dersler listede yalnız soluk renkle ayırt ediliyor (BUG-014 · v1.0.1)
- Özet'te "bu ay bitecek" listesi ilk 5 kaydı gösteriyor (BUG-015 · karar bekleniyor)

## [0.3.0] — 2026-10-21
### Eklendi
- Abonelik planları: oluşturma, satıştan kaldırma (US-06)
- Haftalık ders takvimi, doluluk göstergesi (US-07)
- Rezervasyon kuralları: geçmiş ders, mükerrer kayıt, aktif üyelik, kapasite (US-08)
- Süresi dolmuş üyede hata mesajının yanında "Plan ata" bağlantısı (demo geri bildirimi G-1)

## [0.2.0] — 2026-10-07
### Eklendi
- Üye listesi, Türkçe duyarsız arama, durum filtresi, sayfalama (US-03)
- Yeni üye ekleme, mükerrer e-posta kontrolü (US-04)
- Üyeye plan atama, bitiş tarihi hesaplama (US-05)
- Eğitmen rolünde iletişim bilgilerinin gizlenmesi (US-02)

### Düzeltildi
- Türkçe karakterle arama sonuç vermiyordu (BUG-007)

## [0.1.0] — 2026-09-28
### Eklendi
- Proje iskeleti, CI, giriş ve oturum yönetimi (US-01)
