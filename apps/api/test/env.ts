// Testlerden önce yüklenir (package.json › test). Ortam değişkenleri burada tanımlandığı için
// komut Windows, macOS ve Linux'ta aynı şekilde çalışır.
process.env.NODE_ENV ??= "test";
process.env.STUDIOPASS_TODAY ??= "2026-11-04";
