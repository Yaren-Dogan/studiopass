# BUG-013 · Veri sıfırlanınca açık oturumlar geçersiz oluyor; bir test yanlış yere geçiyordu

| Alan | Değer |
|---|---|
| Önem | **Yüksek** (test güvenilirliği — yanlış pozitif) · Öncelik P1 |
| Katman | API (`store.ts`) + test (`classes.test.ts`) |
| Bulan | Test kodu incelemesi |

## Belirti
"Eğitmen sadece kendi dersine katılımcı ekleyebilir" testi **geçiyordu**, ancak inceleme sırasında testin aslında hiçbir şeyi kanıtlamadığı fark edildi.

## Adımlar (tekrar üretme)
1. Eğitmen olarak giriş yap, token'ı sakla.
2. `POST /api/test/reset` çağır.
3. Aynı token ile kendi dersine katılımcı eklemeye çalış.

## Beklenen
`201 Created` (eğitmen kendi dersine ekleyebilir).

## Gerçekleşen
`403 Forbidden`. Sıfırlama kullanıcı kimliklerini **yeniden üretiyordu**; token'daki eski kimlik hiçbir dersin eğitmeniyle eşleşmiyor, bu yüzden eğitmen her derse "başkasının dersi" olarak bakıyordu.

## Testin neden yanıltıcı olduğu
- Test yalnız "başkasının dersine 403" durumunu kontrol ediyordu → kimlik uyuşmazlığı yüzünden **her durumda** 403 döndüğü için geçti.
- İkinci kontrol `items.every(...)` idi → boş liste için `every()` her zaman `true` döner. Liste boştu, test yine geçti.

## Çözüm
1. Demo kullanıcı kimlikleri sabitlendi (`usr_owner`, `usr_instructor`…). Sıfırlama sonrası açık oturumlar geçerli kalıyor.
2. Test güçlendirildi: önce listenin **boş olmadığı** doğrulanıyor, ardından **pozitif durum** (kendi dersine 201) ekleniyor.

## Ders
"Yeşil test" ile "doğru test" aynı şey değil. Yetki testlerinde her zaman **hem izin verilen hem reddedilen** durum birlikte test edilir; `every()`/`some()` kullanan doğrulamalardan önce liste uzunluğu kontrol edilir. Bu kural [PR şablonuna](../../../.github/pull_request_template.md) eklendi.

- Durum: **Doğrulandı**
