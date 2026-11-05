# ADR-001 · Tek depo (npm workspaces): `apps/api` + `apps/web`

- **Durum:** Kabul edildi
- **Karar vericiler:** Mimar, Ürün Sahibi, Koordinasyon

## Bağlam
API ve web paneli aynı ekip tarafından, aynı sprintlerde geliştiriliyor. Bir özellik çoğunlukla iki tarafı birlikte değiştiriyor (ör. yeni hata kodu + ön yüzde gösterimi).

## Karar
Tek depo, npm workspaces. Dokümanlar (`docs/`) ve tasarım token'ları (`design/`) da aynı depoda, kodla birlikte sürümlenir.

## Sonuçlar
- ✅ Bir PR'da API + web + doküman + test birlikte incelenir; sürüm notu tek yerde
- ✅ CI tek iş akışında her şeyi test eder
- ⚠️ Mobil uygulama eklendiğinde (`apps/mobile`) derleme süreleri izlenmeli
