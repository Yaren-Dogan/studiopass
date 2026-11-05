# Çalışma Anlaşmaları: DoR, DoD ve Akış

## Hazır olma tanımı (Definition of Ready)
Bir hikâye sprint'e ancak şunlar tamamsa alınır:
- [ ] Hikâye "rol / amaç / fayda" biçiminde yazılmış
- [ ] Gherkin kabul kriterleri var; mutlu yol + en az 2 hata durumu
- [ ] Figma ekranı "Ready for dev" durumunda ve linki issue'da
- [ ] API sözleşmesi (OpenAPI) taslağı var ya da gerek yok diye işaretlenmiş
- [ ] Bağımlılıklar çözülmüş, tahmin (story point) verilmiş

## Bitti tanımı (Definition of Done)
- [ ] Kod PR ile `main`'e girdi; en az 1 bağımsız inceleme onayı (insan ya da yapay zekâ denetçi + insan)
- [ ] Birim testleri ve ilgili Playwright senaryosu yeşil; CI geçti
- [ ] Ekran Figma ile karşılaştırıldı, fark raporu kapandı ([şablon](../05-test/sablonlar/tasarim-karsilastirma-sablonu.md))
- [ ] Erişilebilirlik kontrolü: klavye ile kullanım + axe taramasında kritik/ciddi bulgu yok
- [ ] Kabul kriterleri test ortamında QA tarafından doğrulandı
- [ ] CHANGELOG ve ilgili doküman güncellendi

## Dal ve PR akışı
```
main ──●────────●────────●──── (her zaman yayınlanabilir)
        \      /  \      /
         feat/US-04-uye-ekleme
                    fix/BUG-007-turkce-arama
```
- Dal adı: `feat/US-xx-kisa-ad`, `fix/BUG-xxx-kisa-ad`, `docs/...`, `chore/...`
- Commit mesajı: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `chore:`)
- PR açıklaması şablondan doldurulur; ilgili issue `Closes #xx` ile bağlanır.

## Issue akışı (GitHub Projects)
`Backlog → Hazır → Geliştiriliyor → İncelemede → Test ortamında → Kabul edildi → Yayında`

| Geçiş | Sorumlu | Koşul |
|---|---|---|
| Backlog → Hazır | Ürün Sahibi | DoR tamam |
| İncelemede → Test ortamında | Geliştirici | PR onaylı, CI yeşil |
| Test ortamında → Kabul edildi | QA / Koordinasyon | Kabul kriterleri ve tasarım kontrolü geçti |
| Kabul edildi → Yayında | Koordinasyon | Sürüm notu yazıldı, müşteri bilgilendirildi |
