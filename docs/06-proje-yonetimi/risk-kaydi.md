# Risk Kaydı

Puan = Olasılık (1–3) × Etki (1–3). 6 ve üzeri her haftalık raporda görünür.

| # | Risk | O | E | Puan | Sahip | Aksiyon | Durum |
|---|---|---|---|---|---|---|---|
| R-01 | Yapay zekâ ile üretilen kodda testlerin yanlış pozitif vermesi | 2 | 3 | **6** | QA | Yetki testlerinde pozitif+negatif durum zorunlu; PR şablonu maddesi; test kodu satır satır incelenir | 🟢 Azaltıldı (BUG-013 sonrası) |
| R-02 | KVKK: eğitmenin üye iletişim bilgisine erişmesi | 1 | 3 | 3 | Güvenlik | API'de alan çıkarma + yan kanal testleri | 🟢 Kontrol altında |
| R-03 | Pilot stüdyoların tablet ekranlarında düzen bozulması | 2 | 2 | 4 | Koordinasyon | 1024 px görünümde keşif testi; pilot öncesi cihaz listesi istenir | 🟡 İzleniyor |
| R-04 | Online ödeme kapsamının v1.0'a çekilmesi talebi | 2 | 3 | **6** | Ürün Sahibi | Karar kaydı: v1.2; müşteriye gerekçeli yol haritası sunuldu | 🟡 İzleniyor |
| R-05 | Bellek içi veri nedeniyle demo sırasında veri kaybı | 2 | 1 | 2 | Mimar | Demo öncesi sıfırlama kontrol listesi; v1.1'de PostgreSQL | 🟢 Kabul |
| R-06 | Safari'de test edilmemiş olması | 2 | 2 | 4 | QA | v1.0.1 öncesi manuel Safari turu | 🟡 Açık |
| R-07 | "Bu ay bitecek" listesinin eksik görünmesi müşteri güvenini sarsar | 2 | 2 | 4 | Ürün Sahibi | BUG-015 için karar haftalık raporda istendi | 🟡 Karar bekliyor |
