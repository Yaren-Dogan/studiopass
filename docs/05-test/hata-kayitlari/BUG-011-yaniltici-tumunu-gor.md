# BUG-011 · Özet'teki "Tümünü gör" bağlantısı farklı bir liste açıyor

| Alan | Değer |
|---|---|
| Önem | Orta — kullanıcıyı yanıltıyor, veri yanlış değil · Öncelik P2 |
| Katman | Ön yüz — `DashboardPage.tsx` |
| İlgili | US-09, FR-11 |

## Adımlar
1. `elif@studiopass.dev` ile giriş yap → Özet.
2. "Bu ay bitecek üyelikler" kartında **Tümünü gör**'e tıkla.

## Beklenen
Kart başlığıyla aynı liste: bu ay bitecek üyelikler (11 kayıt).

## Gerçekleşen
Üyeler sayfası **tüm aktif üyelerle** (18 kayıt) açılıyor. Kullanıcı "bu ay bitecek 18 kişi var" sanabilir.

## Kök neden
Üyeler API'sinde "bu ay bitecek" filtresi yok; bağlantı en yakın filtre olan `status=active` ile kurulmuş, metin ise güncellenmemiş.

## Çözüm (v1.0)
Bağlantı metni gerçekte açılan listeyi anlatacak şekilde **"Aktif üyeler"** olarak değiştirildi. Asıl ihtiyaç (bu ay bitecek listenin tamamı) [BUG-015](BUG-015-ozet-ilk-5-kayit.md) altında ürün kararı olarak backlog'a alındı.

## Doğrulama
- [x] Bağlantı metni ↔ hedef sayfa eşleşiyor
- [x] E2E seçicileri güncellendi (yeni metin "Üyeler" menüsüyle çakışıyordu, `goTo()` yardımcısı menü içinde arayacak şekilde düzeltildi)
- Durum: **Doğrulandı**
