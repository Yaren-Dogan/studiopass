# Kullanıcı Hikâyeleri ve Kabul Kriterleri

Biçim: *"Bir [rol] olarak, [amaç] istiyorum, böylece [fayda]."*
Kabul kriterleri Gherkin (Verilen / Eğer / O zaman) biçimindedir; QA senaryoları ve Playwright testleri doğrudan bu kriterlerden türetilmiştir.

Hazır olma tanımı (DoR) ve bitti tanımı (DoD): [`../02-urun/calisma-anlasmalari.md`](../02-urun/calisma-anlasmalari.md)

---

## US-01 · Giriş yapma
**Bir** stüdyo çalışanı **olarak**, e-posta ve şifremle giriş yapmak **istiyorum**, **böylece** sadece yetkili kişiler stüdyo verilerine erişebilir.

Puan: 3 · Öncelik: Must · Gereksinim: FR-01, FR-02

```gherkin
Senaryo: Doğru bilgilerle giriş
  Verilen kayıtlı bir kullanıcıyım
  Eğer doğru e-posta ve şifremi girip "Giriş yap"a basarsam
  O zaman rolüme uygun ana sayfaya yönlendirilirim

Senaryo: Hatalı şifre
  Verilen kayıtlı bir kullanıcıyım
  Eğer yanlış şifre girersem
  O zaman "E-posta veya şifre hatalı" mesajını görürüm
  Ve hangi alanın hatalı olduğu belirtilmez

Senaryo: Boş form
  Eğer alanları boş bırakıp "Giriş yap"a basarsam
  O zaman her alanın altında zorunluluk mesajı görürüm
  Ve odak ilk hatalı alana taşınır
```

## US-02 · Rol bazlı erişim
**Bir** stüdyo sahibi **olarak**, eğitmenlerin üyelerin iletişim bilgilerini görmemesini **istiyorum**, **böylece** KVKK'ya uygun çalışırım.

Puan: 5 · Öncelik: Must · Gereksinim: FR-03

```gherkin
Senaryo: Eğitmen menüsü
  Verilen eğitmen olarak giriş yaptım
  O zaman menüde "Özet" ve "Planlar (düzenleme)" seçeneklerini görmem
  Ve üye listesinde e-posta ve telefon sütunları yoktur

Senaryo: API yetki kontrolü
  Verilen eğitmen token'ıyla
  Eğer POST /api/members isteği atarsam
  O zaman 403 Forbidden yanıtı alırım
```

## US-03 · Üyeleri arama ve filtreleme
**Bir** resepsiyon görevlisi **olarak**, üyeyi adından ya da e-postasından hızlıca bulmak **istiyorum**, **böylece** kapıda bekletmem.

Puan: 3 · Öncelik: Must · Gereksinim: FR-04, FR-13

```gherkin
Senaryo: Ada göre arama
  Verilen "Ayşe Yılmaz" adlı bir üye var
  Eğer arama kutusuna "ayşe" yazarsam
  O zaman listede "Ayşe Yılmaz" görünür
  Ve arama büyük/küçük harf ve Türkçe karakter duyarsızdır ("AYŞE", "ayse" de bulur)

Senaryo: Duruma göre filtre
  Eğer "Süresi dolmuş" filtresini seçersem
  O zaman yalnızca bitiş tarihi bugünden önce olan üyeler listelenir

Senaryo: Sonuç yok
  Eğer eşleşmeyen bir arama yaparsam
  O zaman "Aramanızla eşleşen üye bulunamadı" boş durum mesajını görürüm
```

## US-04 · Yeni üye ekleme
**Bir** yönetici **olarak**, yeni üye kaydı açmak **istiyorum**, **böylece** üye derslere katılabilir.

Puan: 3 · Öncelik: Must · Gereksinim: FR-05

```gherkin
Senaryo: Geçerli kayıt
  Eğer ad, soyad ve geçerli bir e-posta girip "Kaydet"e basarsam
  O zaman "Üye eklendi" bildirimi görürüm
  Ve üye listenin başında görünür

Senaryo: Mükerrer e-posta
  Verilen "ayse@ornek.com" e-postasıyla bir üye var
  Eğer aynı e-postayla yeni üye eklemeye çalışırsam
  O zaman "Bu e-posta ile kayıtlı bir üye zaten var" hatasını görürüm
  Ve API 409 Conflict döner

Senaryo: Geçersiz e-posta
  Eğer e-posta alanına "ayse@" yazarsam
  O zaman "Geçerli bir e-posta adresi girin" mesajını görürüm
```

## US-05 · Üyeye plan atama
**Bir** yönetici **olarak**, üyeye abonelik planı atamak **istiyorum**, **böylece** üyeliğinin ne zaman biteceği otomatik hesaplanır.

Puan: 5 · Öncelik: Must · Gereksinim: FR-06, FR-07, BR-01

```gherkin
Senaryo: Bitiş tarihi hesaplama
  Verilen 30 günlük "Aylık Sınırsız" planı
  Eğer üyeye 01.11.2026 başlangıçlı bu planı atarsam
  O zaman bitiş tarihi 01.12.2026 olur
  Ve üye durumu "Aktif" görünür

Senaryo: Yeni plan eskisini kapatır
  Verilen üyenin aktif bir planı var
  Eğer yeni bir plan atarsam
  O zaman eski üyeliğin bitiş tarihi bugün olarak güncellenir
```

## US-06 · Abonelik planı oluşturma
**Bir** stüdyo sahibi **olarak**, farklı fiyat ve sürelerde planlar tanımlamak **istiyorum**, **böylece** kampanya yapabilirim.

Puan: 3 · Öncelik: Must · Gereksinim: FR-08, BR-02, BR-04

```gherkin
Senaryo: Plan oluşturma
  Eğer ad "10 Ders Paketi", fiyat "1.250,00", süre "60" girersem
  O zaman plan listede "₺1.250,00 · 60 gün" olarak görünür

Senaryo: Negatif fiyat
  Eğer fiyata "-5" girersem
  O zaman "Fiyat 0'dan büyük olmalı" hatası görünür
```

## US-07 · Ders oluşturma
**Bir** yönetici **olarak**, haftalık ders programını oluşturmak **istiyorum**, **böylece** rezervasyon alınabilir.

Puan: 3 · Öncelik: Must · Gereksinim: FR-09

## US-08 · Derse rezervasyon
**Bir** resepsiyon görevlisi **olarak**, üyeyi bir derse yazmak **istiyorum**, **böylece** kapasite doğru takip edilir.

Puan: 5 · Öncelik: Must · Gereksinim: FR-10, BR-03

```gherkin
Senaryo: Başarılı rezervasyon
  Verilen kapasitesi 10, dolu yeri 9 olan bir ders
  Ve aktif üyeliği olan bir üye
  Eğer üyeyi derse yazarsam
  O zaman doluluk "10/10" olur
  Ve ders "Dolu" etiketiyle gösterilir

Senaryo: Dolu ders
  Verilen kapasitesi dolu bir ders
  Eğer üye eklemeye çalışırsam
  O zaman "Ders kapasitesi dolu" hatası alırım ve API 409 döner

Senaryo: Süresi dolmuş üyelik
  Verilen üyeliği dün bitmiş bir üye
  Eğer derse yazmaya çalışırsam
  O zaman "Üyenin aktif bir planı yok" hatası alırım ve API 422 döner

Senaryo: Mükerrer rezervasyon
  Verilen üye derse zaten yazılı
  Eğer tekrar yazmaya çalışırsam
  O zaman "Üye bu derse zaten kayıtlı" hatası alırım
```

## US-09 · Özet panel
**Bir** stüdyo sahibi **olarak**, işletmemin durumunu tek ekranda görmek **istiyorum**, **böylece** haftalık kararlarımı veriye dayandırırım.

Puan: 5 · Öncelik: Should · Gereksinim: FR-11, BR-05

## US-10 · Üyeyi pasife alma
**Bir** yönetici **olarak**, ayrılan üyeyi silmeden pasife almak **istiyorum**, **böylece** geçmiş kayıtlar korunur.

Puan: 2 · Öncelik: Should · Gereksinim: FR-12
