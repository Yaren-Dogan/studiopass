# Proje Planı — StudioPass v1.0

## Kilometre taşları

```mermaid
gantt
  title StudioPass v1.0
  dateFormat YYYY-MM-DD
  axisFormat %d.%m
  section Keşif
  İhtiyaç analizi ve görüşmeler     :done, a1, 2026-09-07, 10d
  Gereksinimler + kabul kriterleri  :done, a2, after a1, 5d
  section Tasarım
  Bilgi mimarisi + wireframe         :done, d1, 2026-09-21, 5d
  Tasarım sistemi + ekranlar (Figma) :done, d2, after d1, 7d
  Kullanılabilirlik testi            :done, d3, after d2, 3d
  section Geliştirme
  Sprint 1 · Giriş, roller, CI       :done, s1, 2026-09-28, 14d
  Sprint 2 · Üyeler, plan atama      :done, s2, after s1, 14d
  Sprint 3 · Planlar, dersler, rezervasyon :done, s3, after s2, 14d
  Sprint 4 · Özet, a11y, kabul testi :active, s4, after s3, 10d
  section Yayın
  Pilot (5 stüdyo)                   :milestone, m1, 2026-11-16, 0d
```

## RACI

| İş | Ürün Sahibi | Mimar | Geliştirici (insan + YZ) | Bağımsız denetçi | Koordinasyon / QA | Müşteri |
|---|---|---|---|---|---|---|
| Gereksinim ve kabul kriterleri | **A** | C | C | I | R | C |
| Figma tasarımları | A | C | I | C | R | C |
| API ve web geliştirme | I | A | **R** | C | C | – |
| Kod incelemesi | I | A | R | **R** | C | – |
| Kabul testi ve hata raporu | C | I | C | I | **A/R** | I |
| Haftalık rapor, toplantı notları | I | I | I | I | **A/R** | I |
| Sürüm notu ve yayın kararı | **A** | C | I | C | R | I |

R: Yapan · A: Hesap veren · C: Danışılan · I: Bilgilendirilen

## İletişim planı

| Paydaş | Kanal | Sıklık | İçerik |
|---|---|---|---|
| Müşteri (stüdyo sahibi) | E-posta + 30 dk görüntülü demo | Haftalık | Haftalık rapor, demo, karar talepleri |
| Ekip | Slack `#studiopass` | Günlük | Engeller, PR'lar |
| Ekip | GitHub Projects | Sürekli | Tek gerçek kaynak: kim neyi bekliyor |
| Pilot kullanıcılar | WhatsApp destek hattı | Pilot süresince | Hata bildirimi → issue |
