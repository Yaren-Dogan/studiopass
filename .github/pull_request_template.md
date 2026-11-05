## Ne değişti?
<!-- Kullanıcı açısından bir-iki cümle -->

Closes #

## İlgili
- Hikâye / hata: US-xx · BUG-xxx
- Figma: <!-- kare bağlantısı -->

## Kontrol listesi
### Kod
- [ ] Rol kontrolü **API'de** de var (arayüzde gizlemek yetmez)
- [ ] Yeni/değişen uç nokta `apps/api/openapi.yaml`'da güncellendi
- [ ] Hata mesajları Türkçe, kullanıcıya ne yapacağını söylüyor

### Testler
- [ ] Kabul kriterlerinin her senaryosu bir teste karşılık geliyor
- [ ] **Bu test, ters durumda kırılıyor mu?** (yetki testinde izin verilen + reddedilen durum birlikte)
- [ ] `every()` / `some()` ile doğrulamadan önce listenin boş olmadığı kontrol edildi
- [ ] Sınır değerler: N-1 / N / N+1, dün / bugün / yarın
- [ ] E2E seçicileri rol + erişilebilir adla yazıldı (CSS sınıfıyla değil)

### Tasarım ve erişilebilirlik
- [ ] Ekran Figma ile karşılaştırıldı (1440 / 1024 / 390 px)
- [ ] Klavye ile kullanılabiliyor, odak görünür
- [ ] Görsel olarak gizlenen öğe erişilebilir adını kaybetmedi

### Doküman
- [ ] `CHANGELOG.md` güncellendi
- [ ] Gerekiyorsa ilgili doküman (gereksinim, test senaryosu, ADR) güncellendi

## Ekran görüntüsü / kayıt
