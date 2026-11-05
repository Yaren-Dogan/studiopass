# Tasarım Sistemi — "Sakin Stüdyo"

Kaynak token dosyası: [`design/tokens.json`](../../design/tokens.json) (Figma'da **Tokens Studio** eklentisiyle içe aktarılabilir; Figma Variables olarak da tanımlıdır.)
Kod karşılığı: [`apps/web/src/styles/tokens.css`](../../apps/web/src/styles/tokens.css)

## Yön
Stüdyo ortamının sakinliği: sıcak kum tonlu zemin, derin petrol yeşili ana eylem, kil turuncusu yalnızca odak ve vurgu için. Başlıklarda karakterli bir serif (Fraunces), veri ve formlarda okunaklı bir sans (Manrope). Resepsiyonda tablet kullanımı nedeniyle dokunma hedefleri en az **44×44 px**.

## Renk ve kontrast (WCAG 2.2 AA doğrulandı)

| Token | Değer | Kullanım | Kontrast |
|---|---|---|---|
| `text.primary` | `#1B2320` | Ana metin | 14.74:1 (canvas üzerinde) |
| `text.secondary` | `#5A6460` | Yardımcı metin | 6.13:1 (surface) · 5.62:1 (canvas) |
| `action.primary` | `#0F5C55` | Birincil buton, link | 7.83:1 (beyaz metinle) |
| `action.focus` | `#A84B25` | Odak halkası (2 px + 2 px boşluk) | 5.68:1 |
| `border.control` | `#7D8580` | Input, select, checkbox kenarı | 3.79:1 (≥ 3:1 bileşen kuralı) |
| `status.active` | `#1D6B37` / `#DCF0E2` | "Aktif" rozeti | 5.48:1 |
| `status.warning` | `#7F5300` / `#FBEBC8` | "Bitmek üzere", %90+ doluluk | 5.68:1 |
| `status.danger` | `#AE2418` / `#FBE0DD` | "Süresi dolmuş", "Dolu", hata | 5.48:1 |

> Kontrast değerleri `scripts/contrast-check.py` ile hesaplanır ve CI'da kontrol edilir.
> Durum **asla yalnızca renkle** anlatılmaz: rozet = ikon + metin + renk (UT-05).

## Tipografi

| Stil | Font | Boyut / Satır | Ağırlık |
|---|---|---|---|
| Display | Fraunces | 36 / 44 | 600 |
| Başlık 1 | Fraunces | 28 / 36 | 600 |
| Başlık 2 | Manrope | 20 / 28 | 700 |
| Gövde | Manrope | 16 / 24 | 500 |
| Küçük | Manrope | 14 / 20 | 500 |
| Etiket / tablo başlığı | Manrope | 12 / 16 | 700, %4 harf aralığı, büyük harf |

## Boşluk ve ızgara
- 4 px tabanlı ölçek: 4, 8, 12, 16, 24, 32, 48
- Masaüstü: 240 px sabit yan menü + 12 kolonluk içerik, 24 px oluk
- Tablet (≥ 768): yan menü 72 px ikon moduna küçülür
- Mobil (< 768): alt sekme çubuğu, 16 px kenar boşluğu

## Bileşenler

✅ = Figma'da variant'lı bileşen olarak var · ⏳ = yalnız kodda, Figma'ya eklenecek

| Bileşen | Variant'lar | Durumlar |
|---|---|---|
| ✅ Button | primary, secondary, ghost, danger · sm, md | default, hover, focus, disabled, loading |
| ✅ TextField | text, email, password, search | default, focus, error, disabled |
| ⏳ Select | – | default, focus, open, error |
| ✅ Badge | active, warning, danger, neutral | – |
| ✅ CapacityBar | – | normal (< %90), high (≥ %90), full |
| ⏳ StatCard | – | default, loading |
| ⏳ Table | – | satır hover, boş durum, yükleniyor |
| ⏳ Drawer (yan panel) | right | open/closed |
| ⏳ Toast | success, error | – |
| ⏳ NavItem | – | default, active, focus |

## Figma dosyası
🔗 [StudioPass — Tasarım](https://www.figma.com/design/gKfS7dCMKRTlJrJPEh8TRU) · ayrıntılar: [figma.md](figma.md)
```
📄 StudioPass — Tasarım
 ├─ 00 Kapak
 ├─ 01 Tasarım sistemi   (Variables: Primitives, Color, Spacing & Radius · 7 metin stili · Button, Badge, TextField, CapacityBar)
 └─ 02 Ekranlar          (S-03 Üyeler · S-07 Ders detayı + Katılımcı ekle paneli)
```
