# ADR-003 · Ön yüz: React 19 + TypeScript + esbuild, yönlendirici kütüphanesi yok

- **Durum:** Kabul edildi

## Bağlam
Panel 8 ekrandan oluşuyor; sunucu tarafı render, SEO ya da karmaşık veri önbelleği ihtiyacı yok.

## Karar
- **React 19 + TypeScript** (ekip ve sektör standardı; ilandaki ürünlerle aynı yığın)
- **esbuild** ile derleme (`build.mjs`): tek dosyalık yapılandırma, ~150 ms derleme, geliştirme sunucusu `/api` isteklerini API'ye yönlendirir
- **Yönlendirme:** `useSyncExternalStore` üzerinde 40 satırlık yönlendirici (`lib/router.tsx`)
- **Stil:** Düz CSS + tasarım token'ları (`tokens.css` ↔ Figma Variables)

## Sonuçlar
- ✅ Bağımlılıklar: yalnız `react`, `react-dom`
- ✅ Figma bileşen adları kodda birebir (`Button`, `TextField`, `Badge`, `CapacityBar`…) → tasarım karşılaştırması kolay
- ⚠️ Ekran sayısı artarsa React Router / TanStack Router'a geçiş — yönlendirici arayüzü (`navigate`, `Link`, `usePath`) bu geçişi kolaylaştıracak şekilde sınırlı tutuldu
