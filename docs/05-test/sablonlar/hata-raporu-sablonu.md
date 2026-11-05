# BUG-XXX · [Kısa ve somut başlık: ne, nerede]

| Alan | Değer |
|---|---|
| Önem | Kritik / Yüksek / Orta / Düşük — neden? |
| Öncelik | P1 / P2 / P3 |
| Katman | Ön yüz / API / Veri / Tasarım / İçerik |
| Ortam | Test ortamı URL · tarayıcı + sürüm · cihaz · ekran genişliği |
| Sürüm / commit | `v1.0.0` · `abc1234` |
| İlgili | US-xx · FR-xx · TC-xx · Figma kare bağlantısı |

## Ön koşul
Hangi hesapla, hangi veriyle? (ör. "Veriler sıfırlanmış, yönetici ile giriş yapılmış")

## Adımlar
1.
2.
3.

## Beklenen
Kabul kriterinden ya da Figma'dan alıntı.

## Gerçekleşen
Ne oldu? Tam hata mesajı tırnak içinde.

## Kanıt
- Ekran görüntüsü / kısa video
- Ağ isteği ve yanıtı (yöntem, URL, durum kodu, gövde)
- Konsol hatası

## Ön yüz mü, sunucu mu?
- İstek doğru gidiyor mu? (Ağ sekmesi: URL, gövde, başlıklar)
- Yanıt doğru mu? (Durum kodu ve gövde sözleşmeye uygun mu → `openapi.yaml`)
- Yanıt doğruysa ve ekran yanlışsa → **ön yüz**; yanıt yanlışsa → **sunucu**

## Kök neden (geliştirici doldurur)

## Doğrulama (QA doldurur)
- [ ] Adımlar tekrarlandı, hata yok
- [ ] Regresyon testi eklendi (`...test.ts` / `...spec.ts`)
- [ ] İlgili ekranlar Figma ile yeniden karşılaştırıldı
