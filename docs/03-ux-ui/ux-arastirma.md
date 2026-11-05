# UX Araştırması

> 📌 **Vaka çalışması notu:** StudioPass bir portfolyo projesidir. Görüşme sayıları, katılımcılar ve alıntılar, gerçek bir ihtiyaç analizinin nasıl belgeleneceğini göstermek için hazırlanmış **örnek verilerdir**.

## Yöntem
| Yöntem | Katılımcı | Süre | Çıktı |
|---|---|---|---|
| Yarı yapılandırılmış görüşme | 12 stüdyo sahibi, 5 resepsiyon görevlisi | 45 dk | Problem listesi, alıntılar |
| Bağlamsal gözlem | 3 stüdyoda yoğun saat (18:00–20:00) | 2 saat | Görev süreleri |
| Kart sıralama (açık) | 8 kişi | 20 dk | Menü yapısı |
| Kullanılabilirlik testi (Figma prototipi) | 6 kişi | 30 dk | 14 bulgu, 9'u düzeltildi |

## Personalar

### 👩‍💼 Elif · Stüdyo Sahibi · 38
- 140 üyeli bir pilates stüdyosu işletiyor, aynı zamanda ders veriyor.
- **Hedefleri:** Gelir kaybını durdurmak, hangi paketin sattığını görmek.
- **Engelleri:** Akşamları Excel'i güncellemeye vakti yok; personelin her veriyi görmesinden rahatsız.
- **Cümlesi:** *"Kimin üyeliğinin bittiğini ancak ay sonu hesap yaparken fark ediyorum."*
- **Cihaz:** Laptop (ofis), telefon (akşam kontrol).

### 🧑‍💻 Mert · Resepsiyon · 24
- Yoğun saatlerde 5 dakikada 15 üye karşılıyor.
- **Hedefleri:** Üyeyi saniyeler içinde bulup derse yazmak.
- **Engelleri:** Türkçe karakterlerle arama yapınca sonuç çıkmıyor ("Şule" → "Sule").
- **Cümlesi:** *"Kapıda sıra varken üç ekran gezemem."*
- **Cihaz:** Resepsiyonda tablet (yatay).

### 🧘 Deniz · Eğitmen · 31
- 3 stüdyoda serbest çalışıyor.
- **Hedefleri:** Derse kimin geleceğini önceden bilmek.
- **Engelleri:** Ders listesi WhatsApp'ta, son dakika değişiklikleri kayboluyor.
- **Cümlesi:** *"Bana sadece bugünkü derslerimi ve kimin geleceğini göster."*
- **Cihaz:** Telefon.

## Kullanıcı yolculuk haritası — Mert, akşam yoğunluğu

| Aşama | Üye kapıya gelir | Üyeyi bulur | Üyelik kontrolü | Derse yazar | Ders başlar |
|---|---|---|---|---|---|
| **Eylem (As-Is)** | Selamlar | Excel'de Ctrl+F | Bitiş sütununa bakar | WhatsApp listesine ekler | Kâğıt yoklama |
| **Düşünce** | "Sıra uzuyor" | "Adı nasıl yazılmıştı?" | "Tarih doğru mu?" | "Kaç kişi oldu?" | "Kimse eksik mi?" |
| **Duygu** | 😐 | 😣 | 😟 | 😰 | 😐 |
| **Fırsat (To-Be)** | – | Türkçe duyarsız anlık arama | Durum rozeti (Aktif / Süresi dolmuş) | Tek tık rezervasyon, doluluk göstergesi | Eğitmen panelde listeyi görür |

## Kullanılabilirlik testi bulguları (öne çıkanlar)

| # | Bulgu | Önem | Karar |
|---|---|---|---|
| UT-01 | 4/6 kişi "Pasife al" butonunu silme sandı | Yüksek | Etiket "Üyeliği dondur / pasife al" + onay penceresinde açıklama |
| UT-02 | Doluluk "9/10" yeterince fark edilmiyor | Orta | İlerleme çubuğu + %90 üstünde turuncu, dolu olunca kırmızı rozet |
| UT-03 | Tarih seçicide hafta Pazar'dan başlıyor | Orta | Hafta Pazartesi'den başlar (tr-TR) |
| UT-04 | Arama "ş" harfinde sonuç vermiyor | Yüksek | Türkçe karakter normalizasyonu (BUG-007 olarak kayıtlı) |
| UT-05 | Durum renkleri renk körü kullanıcıda ayırt edilemiyor | Yüksek | Renk + ikon + metin üçlüsü zorunlu |
