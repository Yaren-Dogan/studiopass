# BUG-014 · Geçmiş dersler yalnızca soluk renkle ayırt ediliyor

| Alan | Değer |
|---|---|
| Önem | Düşük (erişilebilirlik — WCAG 1.4.1 Use of Color) · Öncelik P3 |
| Katman | Ön yüz — `ClassesPage.tsx`, `.class-card.is-past` |
| Durum | 🟡 **Açık** — v1.0.1'e planlandı |

## Adımlar
1. Dersler sayfasını aç (bu hafta).
2. Bugünden önceki günlerin derslerine bak.

## Beklenen
Geçmiş ders, rengin yanında **metin ya da ikonla** da belirtilir (ör. "Geçmiş" rozeti). Ders detay sayfasında bu zaten var.

## Gerçekleşen
Liste görünümünde geçmiş dersler yalnızca %70 opaklıkla gösteriliyor. Ekran okuyucu için `aria-label` içinde "geçmiş ders" var, ancak az gören ya da düşük kontrastlı ekran kullanan biri farkı göremeyebilir.

## Öneri
Kartın sağ üstüne `Badge tone="neutral" icon="clock"` ile "Geçmiş" etiketi; Figma'da `ClassCard` bileşenine `state=past` varyantı.

## Neden v1.0'ı engellemiyor
Geçmiş derslerde rezervasyon zaten API ve arayüzde engelli (BR-03), yani yanlış işlem yapılamıyor; sorun yalnız bilgilendirme.
