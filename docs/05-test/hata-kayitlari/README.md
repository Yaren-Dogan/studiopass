# Hata Kayıtları

Her hata, başkasının **ilk denemede tekrarlayabileceği** açıklıkta yazılır: ortam, ön koşul, adımlar, beklenen, gerçekleşen, kanıt, kök neden (biliniyorsa) ve doğrulama. GitHub'da aynı içerik [hata bildirimi şablonuyla](../../../.github/ISSUE_TEMPLATE/hata-bildirimi.yml) issue olarak açılır.

| Kod | Başlık | Önem | Katman | Kaynak | Durum |
|---|---|---|---|---|---|
| [BUG-007](BUG-007-turkce-karakter-arama.md) | Türkçe karakterle arama sonuç vermiyor | Yüksek | API | Kullanılabilirlik testi (UT-04) | ✅ Doğrulandı |
| [BUG-010](BUG-010-kenar-cubugu-ad-kesiliyor.md) | Kenar çubuğunda kullanıcı adı kesiliyor | Düşük | Ön yüz (CSS) | Görsel kontrol | ✅ Doğrulandı |
| [BUG-011](BUG-011-yaniltici-tumunu-gor.md) | Özet'teki "Tümünü gör" bağlantısı farklı bir liste açıyor | Orta | Ön yüz | Keşif testi | ✅ Doğrulandı |
| [BUG-012](BUG-012-icerige-gec-atlaniyor.md) | "İçeriğe geç" bağlantısı ilk Tab'da atlanıyor | Orta | Ön yüz (a11y) | Otomatik e2e | ✅ Doğrulandı |
| [BUG-013](BUG-013-sifirlamada-oturum-dusuyor.md) | Veri sıfırlanınca açık oturumlar geçersiz oluyor; bir test yanlış yere geçiyordu | Yüksek (test güvenilirliği) | API + test | Kod incelemesi | ✅ Doğrulandı |
| [BUG-016](BUG-016-tablet-menu-adsiz-baglanti.md) | Tablet genişliğinde menü bağlantılarının erişilebilir adı yok | **Yüksek** (a11y — ekran okuyucu menüyü kullanamıyor) | Ön yüz (CSS) | Keşif testi (otomasyon betiği) | ✅ Doğrulandı |
| [BUG-014](BUG-014-gecmis-ders-sadece-soluk.md) | Geçmiş dersler yalnızca soluk renkle ayırt ediliyor | Düşük | Ön yüz (a11y) | Erişilebilirlik denetimi | 🟡 Açık (v1.0.1) |
| [BUG-015](BUG-015-ozet-ilk-5-kayit.md) | Özet'te "bu ay bitecek" listesi ilk 5 kayıtta kalıyor | Orta | Ürün / ön yüz | Keşif testi | 🟡 Açık (backlog) |

