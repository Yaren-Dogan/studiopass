# Yapay Zekâ Destekli Geliştirme: İnceleme Notları

Bu projenin kodunun büyük kısmı yapay zekâ destekli yazıldı. Bu doküman, **ortaya çıkan işin nasıl denetlendiğini** ve incelemede yakalanan gerçek sorunları anlatır. Hepsi bu depodaki koddan alınmış örneklerdir; her biri ilgili hata kaydına ya da teste bağlıdır.

## İnceleme yaklaşımı

Yapay zekânın ürettiği kod genellikle **çalışır görünür**: derlenir, testler yeşil yanar, ekran açılır. Asıl risk, "çalışıyor" ile "doğru" arasındaki fark. Bu yüzden her değişikliğe şu sorularla bakıldı:

| Soru | Neden |
|---|---|
| Test, kanıtlamak istediği şeyi gerçekten kanıtlıyor mu? Ters durumda kırılır mı? | Yeşil test ≠ doğru test (bkz. 1) |
| Kural sunucuda mı uygulanıyor, yoksa sadece arayüzde mi gizleniyor? | Arayüz atlatılabilir (FR-03) |
| Geliştirme ve üretim modunda aynı davranıyor mu? | React StrictMode, derleme farkları (bkz. 3) |
| Metin, kullanıcıya gerçekte olanı söylüyor mu? | Kod doğru, mesaj yanlış olabilir (bkz. 5) |
| Görsel olarak gizlenen bir şey erişilebilirlik ağacından da kayboluyor mu? | `display: none` (bkz. 6) |
| Gereksinimdeki sınır değerler (N, N+1, bugün, dün) test edilmiş mi? | Yapay zekâ çoğunlukla "mutlu yolu" test eder |

---

## 1. Yanlış pozitif veren yetki testi
**Nerede:** `apps/api/test/classes.test.ts` · **Kayıt:** [BUG-013](../05-test/hata-kayitlari/BUG-013-sifirlamada-oturum-dusuyor.md)

İlk yazılan test:
```ts
it("eğitmen sadece kendi dersine katılımcı ekleyebilir", async () => {
  const res = await s.call("POST", `/api/classes/${selinsClass.id}/bookings`, { token: deniz, ... });
  assert.equal(res.status, 403);
  const own = await s.call("GET", "/api/classes?mine=true", { token: selin });
  assert.ok(own.body.items.every((c) => c.instructor.name === "Selin Öztürk"));
});
```
**Sorun:** Test geçiyordu, ama iki ayrı nedenle hiçbir şey kanıtlamıyordu:
- Her testten önce veriler sıfırlanınca kullanıcı kimlikleri yeniden üretiliyordu. Token'daki eski kimlik hiçbir dersle eşleşmediği için eğitmen **her** derste 403 alıyordu.
- `[].every(...)` her zaman `true` döner. Liste boştu.

**Düzeltme:** Kimlikler sabitlendi; testin başına "liste boş değil" kontrolü ve **pozitif durum** (kendi dersine 201) eklendi.
**Kalıcı kural:** Yetki testlerinde izin verilen ve reddedilen durum birlikte test edilir. → [PR şablonu](../../.github/pull_request_template.md)

## 2. Arayüzde gizlemek yetkilendirme değildir
**Nerede:** `apps/api/src/routes.ts` · **Gereksinim:** FR-03, US-02

Eğitmenin e-posta göremeyeceği kuralı yalnız sütunu gizleyerek uygulanırsa iki yan kanal kalır: (a) API yanıtında alan yine gelir ve tarayıcının Ağ sekmesinden okunur, (b) arama e-posta alanında da yapılırsa eğitmen `?search=ornek.com` gibi sorgularla sonuç sayısından adresleri tahmin edebilir.

**İnceleme sonucu:** Kodda iki kanalın da kapalı olduğu doğrulandı: eğitmen rolünde `toMemberDto` iletişim alanlarını yanıttan tamamen çıkarıyor ve arama yalnız ad/soyad üzerinde yapılıyor. Kural ileride bozulmasın diye her iki kanal için ayrı test yazıldı.
**Test:** `members.test.ts` › "TC-05 eğitmen e-posta ve telefon göremez" · "eğitmen e-postayla arama yapıp üyenin e-postasını tahmin edemez"

## 3. Odak yönetimi ve StrictMode
**Nerede:** `apps/web/src/main.tsx` · **Kayıt:** [BUG-012](../05-test/hata-kayitlari/BUG-012-icerige-gec-atlaniyor.md)

Sayfa değişiminde odağı `<main>`'e taşıyan kod ilk yüklemede de çalışınca "İçeriğe geç" bağlantısı atlanıyordu. Önerilen **ilk düzeltme**:
```ts
const firstRender = useRef(true);
useEffect(() => {
  if (firstRender.current) { firstRender.current = false; return; }
  document.getElementById("main")?.focus();
}, [path]);
```
Bu, üretim derlemesinde çalışıyor; **geliştirme modunda çalışmıyor**. React StrictMode efektleri iki kez çalıştırır ve `ref` değerini korur: ikinci çalışmada `firstRender` zaten `false` olduğu için odak yine taşınır.

**Kalıcı düzeltme:** "Yol gerçekten değişti mi?" diye bakmak (`prevPath` ref'i). Çift çalıştırmada yol aynı kaldığı için güvenli.
**Ders:** Düzeltmeyi, hatayı bulan testle **aynı ortamda** tekrar çalıştırmak.

## 4. Kırılgan test seçicileri
**Nerede:** `apps/web/e2e/*.spec.ts`

| Belirti | Neden | Çözüm |
|---|---|---|
| `getByLabel("Ad")` iki alan buldu | "So**yad**" de eşleşiyordu | `exact: true` |
| `getByLabel("Ad", { exact: true })` hiçbir alan bulmadı | Etiket metni "Ad *" (yıldız `aria-hidden` ama metin eşlemesine giriyor) | `getByRole("textbox", { name: "Ad", exact: true })` — ekran okuyucunun duyduğu adla eşleşir |
| `getByRole("link", { name: "Üyeler" })` iki bağlantı buldu | BUG-011 düzeltmesinden sonra Özet'te "Aktif üyeler" bağlantısı oluştu | Menü içinde arayan `goTo()` yardımcısı |

**Ders:** Seçiciyi CSS sınıfıyla değil **rol + erişilebilir adla** yazmak hem testi sağlamlaştırıyor hem de erişilebilirliği ücretsiz test ediyor (bkz. 6).

## 5. Doğru veri, yanlış metin
**Nerede:** `DashboardPage.tsx` · **Kayıt:** [BUG-011](../05-test/hata-kayitlari/BUG-011-yaniltici-tumunu-gor.md)

"Bu ay bitecek üyelikler" kartındaki "Tümünü gör" bağlantısı tüm aktif üyeleri açıyordu. Kod hatasız, test edilecek bir "hata" yok; sorun ancak ekranı **kullanıcı gözüyle** kullanınca görünüyor. Otomatik testler bunu yakalamadı (yakalayamazdı); ekranı kart başlığıyla birlikte okuyan keşif testi yakaladı.

## 6. Görsel gizleme ≠ erişilebilir gizleme
**Nerede:** `app.css` tablet kırılması · **Kayıt:** [BUG-016](../05-test/hata-kayitlari/BUG-016-tablet-menu-adsiz-baglanti.md)

Tablet düzeninde yer açmak için menü etiketleri `display: none` ile gizlenmişti; bağlantıların erişilebilir adı kayboldu. Görsel kontrolde tasarımla **birebir uyumlu** görünüyordu. Hata, bir Playwright betiği menü bağlantısını adıyla bulamayınca ortaya çıktı.

---

## Özet: kim neyi yakaladı?

| # | Sorun | Yakalayan |
|---|---|---|
| 1 | Yanlış pozitif test | Test kodunun satır satır okunması |
| 2 | E-posta sızıntısı riski (yan kanal) — kapalı olduğu doğrulandı, testle sabitlendi | Gereksinimle API'nin karşılaştırılması |
| 3 | StrictMode'da kırılan düzeltme | Düzeltmenin aynı test ortamında tekrar çalıştırılması |
| 4 | Kırılgan seçiciler | E2E çalıştırması |
| 5 | Yanıltıcı metin | Keşif testi (kullanıcı gözüyle) |
| 6 | Adsız menü bağlantıları | Erişilebilir ad üzerinden yazılmış otomasyon |

Hiçbiri derleyici ya da "testler yeşil mi?" sorusuyla yakalanamazdı. Yapay zekâ destekli bir ekipte kalite rolünün asıl değeri burada.
