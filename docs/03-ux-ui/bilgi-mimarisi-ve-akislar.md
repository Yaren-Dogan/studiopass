# Bilgi Mimarisi ve Kullanıcı Akışları

> 📌 Ölçüm değerleri (tıklama süresi) vaka çalışmasının örnek kullanılabilirlik testine aittir.

## Site haritası
```mermaid
flowchart TD
  L[Giriş] --> D[Özet]
  L --> M[Üyeler]
  L --> C[Dersler]
  L --> P[Planlar]
  M --> M1[Üye detayı]
  M --> M2[Yeni üye]
  M1 --> M3[Plan ata]
  C --> C1[Ders detayı ve katılımcılar]
  C --> C2[Yeni ders]
  P --> P1[Yeni plan]
```

Menü sırası kart sıralama sonucuna göre: **Özet · Üyeler · Dersler · Planlar**. Eğitmen girişinde varsayılan sayfa **Dersler**'dir.

## Akış 1 — Üyeyi derse yazma (resepsiyon, en sık görev)
```mermaid
flowchart LR
  A[Dersler] --> B[Bugünkü dersi seç]
  B --> C[Katılımcı ekle]
  C --> D[Üye ara]
  D --> E{Üyelik aktif?}
  E -- Hayır --> F[Hata: Aktif plan yok\nPlan ata bağlantısı]
  E -- Evet --> G{Kapasite?}
  G -- Dolu --> H[Hata: Ders dolu]
  G -- Uygun --> I[Rezervasyon eklendi\nDoluluk güncellenir]
```
Hedef: **3 tıklama** (Ders → Katılımcı ekle → Üye seç). Ölçülen: 3 tıklama, ortalama 11 sn (kullanılabilirlik testi).

## Akış 2 — Yeni üye ve plan
```mermaid
sequenceDiagram
  actor R as Resepsiyon
  participant W as Web paneli
  participant A as API
  R->>W: "Yeni üye" formunu doldurur
  W->>W: İstemci doğrulaması (zorunlu alan, e-posta biçimi)
  W->>A: POST /api/members
  alt e-posta mevcut
    A-->>W: 409 Conflict
    W-->>R: "Bu e-posta ile kayıtlı bir üye zaten var"
  else başarılı
    A-->>W: 201 Created
    W-->>R: "Üye eklendi" bildirimi
    R->>W: Plan ata
    W->>A: POST /api/members/{id}/memberships
    A-->>W: 201 (endDate hesaplanmış)
  end
```

## Ekran envanteri

| Kod | Ekran | Roller | Durumlar |
|---|---|---|---|
| S-01 | Giriş | Herkes | Varsayılan, doğrulama hatası, sunucu hatası, yükleniyor |
| S-02 | Özet | Sahip, Yönetici | Veri var, boş stüdyo, yükleniyor |
| S-03 | Üye listesi | Herkes (eğitmen kısıtlı) | Liste, arama sonucu yok, boş, yükleniyor, hata |
| S-04 | Yeni üye (yan panel) | Sahip, Yönetici | Varsayılan, doğrulama hatası, mükerrer e-posta |
| S-05 | Üye detayı + plan ata | Sahip, Yönetici | Aktif, süresi dolmuş, pasif |
| S-06 | Ders listesi (haftalık) | Herkes | Dersler, boş hafta |
| S-07 | Ders detayı + katılımcılar | Herkes | Yer var, %90+, dolu, geçmiş ders |
| S-08 | Planlar | Herkes (düzenleme sadece sahip) | Liste, satış dışı plan |
