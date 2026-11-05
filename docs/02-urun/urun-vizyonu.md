# Ürün Vizyonu — StudioPass

## Vizyon cümlesi
**Butik stüdyolar için**; üyeliklerini, derslerini ve gelirlerini Excel ve WhatsApp arasında kaybetmeden yönetmek isteyen sahiplere,
**StudioPass**, üyelik durumunu, ders kapasitesini ve plan satışlarını tek panelde toplayan bir **abonelik yönetim yazılımıdır (SaaS)**.
**Genel salon yazılımlarından farklı olarak**, 1-3 eğitmenli küçük ekipler için kurulumu 15 dakika süren, Türkçe ve KVKK'ya uygun rol yapısıyla gelir.

## Ürün Vizyon Kanvası

| Hedef kitle | İhtiyaçlar | Ürün | İş hedefleri |
|---|---|---|---|
| 20-300 üyeli yoga, pilates, fonksiyonel antrenman stüdyoları | Biten üyeliği kaçırmamak | Rol bazlı web paneli | İlk 6 ayda 40 ücretli stüdyo |
| Sahip + 1-2 resepsiyon + 2-6 eğitmen | Kapasiteyi doğru takip etmek | Üye, plan, ders, rezervasyon yönetimi | Aylık kayıp (churn) < %4 |
| Teknik bilgisi sınırlı kullanıcılar | Satışları görmek | Özet panel | Stüdyo başı aylık ₺899 |

## Kuzey Yıldızı Metriği
**Haftalık doğrulanmış rezervasyon sayısı** (aktif üyelikle, kapasite içinde yapılan rezervasyon). Hem ürünün kullanıldığını hem de çözdüğü problemi (biten üyelik, çifte rezervasyon) gösterir.

## Ürün ilkeleri
1. **Önce doğruluk:** Sistem yanlış rezervasyona asla izin vermez; iş kuralları API'de uygulanır, arayüz sadece yansıtır.
2. **Üç tıklama kuralı:** Resepsiyondaki en sık işlem (üyeyi bul → derse yaz) üç tıklamayı geçmez.
3. **Herkes kullanabilir:** WCAG 2.2 AA bir "özellik" değil, kabul kriteridir.
4. **Kayıt altında karar:** Her ürün kararı bir ADR ya da toplantı notuna bağlanır.

## Rekabet analizi

| | Excel + WhatsApp | Genel salon yazılımı | **StudioPass** |
|---|---|---|---|
| Kurulum süresi | 0 | 1-2 gün + eğitim | **15 dk** |
| Biten üyelik kontrolü | Elle | Var | **Var, rezervasyonda zorunlu** |
| Rol bazlı veri gizliliği | Yok | Kısmi | **Var (KVKK)** |
| Fiyat | Ücretsiz | ₺2.000+ / ay | **₺899 / ay** |
| Türkçe ve yerel biçimler | – | Çoğunlukla çeviri | **Yerel** |
