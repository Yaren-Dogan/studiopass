# ADR-005 · Kalıcı depolama için SQLite (`node:sqlite`)

- **Durum:** Kabul edildi · ADR-004'ün v1.0 kısmını günceller
- **Tarih:** 2026-11-05

## Bağlam
v1.0'da veriler yalnız bellekteydi (ADR-004). Pilot stüdyolar ve inceleyenler için iki sorun çıktı:
1. Sunucu yeniden başlayınca eklenen veriler kayboluyor.
2. Verilere bakmanın tek yolu API; tabloları doğrudan görmek, SQL ile sorgulamak mümkün değil.

## Seçenekler
| Seçenek | Artı | Eksi |
|---|---|---|
| PostgreSQL + Docker | Üretime en yakın | Docker kurulumu gerekir; demo için ağır |
| SQLite + `better-sqlite3` | Olgun, hızlı | Yerel derleme gerektiren dış bağımlılık (ADR-002 ile çelişir) |
| **SQLite + `node:sqlite` (Node 22.13+)** | Sıfır bağımlılık, tek dosya, her SQLite aracıyla açılır | Modül "experimental" etiketli |

## Karar
`node:sqlite` ile SQLite. Şema, gereksinimlerdeki veri modelinin birebir karşılığı; iş kuralları ayrıca veritabanı kısıtlarıyla da korunur (UNIQUE, CHECK, FOREIGN KEY).

Geçiş riskini düşük tutmak için iş kuralları değişmedi: veriler bellekte işlenir ve her başarılı değişiklikten sonra tüm tablolar tek işlemde dosyaya yazılır (`saveDb`). Kısıt ihlalinde işlem geri alınır, bellek dosyadaki son tutarlı duruma döner.

## Sonuçlar
- ✅ Veriler kalıcı; DB Browser for SQLite / VS Code ile görüntülenebilir
- ✅ Veritabanı "son savunma hattı": uygulama hatası olsa bile mükerrer rezervasyon yazılamaz (testle doğrulandı)
- ✅ Çalışma zamanı bağımlılığı hâlâ sıfır
- ⚠️ Her değişiklikte tüm tablolar yeniden yazılır: demo ölçeğinde (yüzlerce satır) milisaniyeler sürer, binlerce satırda uygun değildir
- ⚠️ Tek süreç varsayımı: aynı dosyaya iki sunucu yazarsa son yazan kazanır
- 🔁 v1.1: satır bazlı sorgulara (repository katmanı) ve PostgreSQL'e geçiş; şema büyük ölçüde aynı kalır
