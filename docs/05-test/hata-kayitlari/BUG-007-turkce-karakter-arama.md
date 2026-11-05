# BUG-007 · Türkçe karakterle arama sonuç vermiyor

| Alan | Değer |
|---|---|
| Önem | **Yüksek** — resepsiyonun en sık işlemi (üye bulma) etkileniyor |
| Öncelik | P1 |
| Katman | API (`GET /api/members?search=`) |
| Ortam | Test ortamı · Chrome 1xx · macOS / tablet |
| Bulan | QA, kullanılabilirlik testi bulgusu UT-04 üzerine |
| İlgili | US-03, FR-04, TC-08 |

## Ön koşul
Veriler sıfırlanmış; "Ayşe Yılmaz", "İlker Çelik", "Işıl Güneş" üyeleri mevcut. Yönetici (`mert@studiopass.dev`) ile giriş yapılmış.

## Adımlar
1. **Üyeler** sayfasını aç.
2. Arama kutusuna `AYŞE` yaz.
3. Kutuyu temizle, `ayse` yaz.
4. Kutuyu temizle, `ilker` yaz.

## Beklenen
Her üç aramada ilgili üye listelenir (FR-04: "büyük/küçük harf ve Türkçe karakter duyarsız").

## Gerçekleşen
- `AYŞE` → sonuç yok
- `ayse` → sonuç yok
- `ilker` → sonuç yok (yalnız `İlker` yazınca bulunuyor)

## Kanıt
Geliştirici araçları → Ağ sekmesi: istek doğru gidiyor (`/api/members?search=AY%C5%9EE`), yanıt `200` ve `"items": []`. → **Hata ön yüzde değil, sunucuda.**

```http
GET /api/members?search=ilker
200 OK
{ "items": [], "total": 0, ... }
```

## Kök neden
Arama `toLowerCase()` + `includes()` ile yapılıyordu. JavaScript'te `"İ".toLowerCase()` → `"i̇"` (i + birleşik nokta, U+0307) olur; bu yüzden "ilker" ile eşleşmez. Ayrıca "ş", "ı" gibi harfler ASCII karşılıklarına çevrilmiyordu.

## Çözüm
`apps/api/src/lib/text.ts` → `normalizeTr()`: `toLocaleLowerCase("tr-TR")` + Türkçe harf eşleme + birleşik işaretlerin temizlenmesi. Hem aranan metin hem arama kelimesi aynı fonksiyondan geçer.

## Doğrulama
- [x] Birim: `normalizeTr` için 5 durum (`members.test.ts`)
- [x] API: 4 farklı yazımla arama (`members.test.ts` › TC-08)
- [x] E2E: 3 yazım (`uyeler.spec.ts` › TC-08)
- [x] Manuel: tablet (yatay) üzerinde Türkçe klavye ile denendi
- Kabul: QA · Durum: **Doğrulandı ve kapatıldı**
