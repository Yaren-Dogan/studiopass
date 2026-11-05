# Tasarım ↔ Uygulama Karşılaştırma Raporu

Tasarım sistemi spesifikasyonu ([`tasarim-sistemi.md`](../03-ux-ui/tasarim-sistemi.md), [Figma](../03-ux-ui/figma.md)) ile test ortamındaki ekranların karşılaştırması. Ölçümler tarayıcı geliştirici araçlarındaki **Computed** sekmesinden alındı.

Şablon: [`sablonlar/tasarim-karsilastirma-sablonu.md`](sablonlar/tasarim-karsilastirma-sablonu.md)

| # | Ekran / bileşen | Özellik | Tasarım | Uygulama | Fark | Önem | Karar |
|---|---|---|---|---|---|---|---|
| D-01 | Tablo başlığı (S-03) | Satır yüksekliği | 12 / **16** | 12 / **18** (gövdeden 1.5 miras) | +2 px | Düşük | ✅ Düzeltildi (`line-height: 16px`) |
| D-02 | Sayfa başlığı H1 | Satır yüksekliği | 28 / **36** | 28 / **35** (`1.25`) | −1 px | Düşük | Kabul — görsel fark yok, `1.25` oranı mobilde 24 px'e ölçeklenince daha dengeli |
| D-03 | StatCard değeri | Satır yüksekliği | 36 / **44** | 36 / **43.2** (`1.2`) | −0.8 px | Düşük | Kabul — alt piksel |
| D-04 | Me kartı (kenar çubuğu) | Ad satırı | Tek satır, tam ad | Kesiliyordu ("Deniz Ay…") | Metin kaybı | Düşük | ✅ [BUG-010](hata-kayitlari/BUG-010-kenar-cubugu-ad-kesiliyor.md) |
| D-05 | Özet › Bu ay bitecek | Bağlantı metni | "Tümünü gör" | Hedef liste farklı | Anlam | Orta | ✅ [BUG-011](hata-kayitlari/BUG-011-yaniltici-tumunu-gor.md) — spesifikasyondaki metin de "Aktif üyeler" olarak güncellendi |
| D-06 | ClassCard | Geçmiş durum | `state=past` varyantı yok | Sadece opaklık | Eksik varyant | Düşük | 🟡 [BUG-014](hata-kayitlari/BUG-014-gecmis-ders-sadece-soluk.md) — önce Figma'ya varyant eklenecek |
| D-07 | Buton (md) | Yükseklik | 44 | 44 | – | – | ✅ Uyumlu |
| D-08 | Buton (sm) | Yükseklik | 36 | 36 | – | – | ✅ Uyumlu |
| D-09 | TextField | Kenar rengi / hata kalınlığı | `border.control` 1 px / hata 2 px `danger` | Aynı | – | – | ✅ Uyumlu |
| D-10 | Badge | İkon + metin | 14 px ikon, 12/700 metin | Aynı | – | – | ✅ Uyumlu |
| D-11 | Kenar çubuğu | Tablet (≤ 1024 px) | 72 px ikon modu | 72 px | – | – | ✅ Uyumlu |
| D-12 | Mobil (< 768 px) | Gezinme | Alt sekme çubuğu | Alt sekme çubuğu | – | – | ✅ Uyumlu |
| D-13 | Renkler | Tüm token'lar | `tokens.json` | `tokens.css` (birebir) | – | – | ✅ Uyumlu |

**Özet:** 13 kontrol · 8 uyumlu · 3 düzeltildi · 2 gerekçeyle kabul · 1 açık.
