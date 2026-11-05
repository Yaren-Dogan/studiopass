"""StudioPass proje dokümanı (PDF) üreticisi.

Kullanım:  python3 scripts/build-docs-pdf.py
Çıktı:     docs/StudioPass-Proje-Dokumani.html → (Playwright/Chromium ile) docs/StudioPass-Proje-Dokumani.pdf
"""
import base64
import html
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
A = ROOT / "docs" / "assets"
FIGMA_URL = "https://www.figma.com/design/gKfS7dCMKRTlJrJPEh8TRU"
REPO_URL = "https://github.com/Yaren-Dogan/studiopass"


def img(path: pathlib.Path, cls: str = "shot", alt: str = "", crop: float | None = None) -> str:
    """crop: genişliğe oranla en fazla yükseklik (ör. 0.75 → 1200x900). Uzun tam sayfa görüntüleri üstten kırpar."""
    raw = path.read_bytes()
    if crop:
        from io import BytesIO
        from PIL import Image
        im = Image.open(BytesIO(raw))
        h = int(im.width * crop)
        if im.height > h:
            buf = BytesIO(); im.crop((0, 0, im.width, h)).save(buf, "PNG"); raw = buf.getvalue()
    data = base64.b64encode(raw).decode()
    return f'<img class="{cls}" alt="{html.escape(alt)}" src="data:image/png;base64,{data}">'


def table(head, rows, cls=""):
    th = "".join(f"<th>{h}</th>" for h in head)
    tr = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f'<table class="{cls}"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>'


def entity(name, desc, fields):
    rows = "".join(
        f'<tr><td><code>{f}</code></td><td>{t}</td><td>{k}</td><td>{d}</td></tr>' for f, t, k, d in fields
    )
    return f'''<div class="entity"><div class="entity__head"><span>{name}</span><small>{desc}</small></div>
<table class="tight"><thead><tr><th>Alan</th><th>Tip</th><th>Anahtar</th><th>Açıklama</th></tr></thead><tbody>{rows}</tbody></table></div>'''


def db_samples() -> str:
    """Gerçek veritabanı dosyasından örnek sorgu sonuçları (dosya yoksa atlanır)."""
    import sqlite3
    path = ROOT / "apps" / "api" / "data" / "studiopass.db"
    if not path.exists():
        return '<p class="cap">Örnek sorgu sonuçları için önce API\'yi bir kez çalıştırın.</p>'
    con = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    out = []
    for title, sql in [
        ("Üyelerin güncel durumu — <code>SELECT * FROM v_member_status LIMIT 8</code>", "SELECT uye, email, plan, bitis, durum FROM v_member_status LIMIT 8"),
        ("Ders doluluğu — <code>SELECT * FROM v_class_occupancy LIMIT 6</code>", "SELECT ders, baslangic_istanbul, egitmen, kayitli, kapasite FROM v_class_occupancy LIMIT 6"),
    ]:
        cur = con.execute(sql)
        head = [d[0] for d in cur.description]
        out.append(f"<h3>{title}</h3>" + table(head, [[html.escape("" if v is None else str(v)) for v in r] for r in cur.fetchall()], "tight"))
    counts = [[t, str(con.execute(f"SELECT count(*) FROM {t}").fetchone()[0])] for t in ["users", "members", "plans", "memberships", "class_sessions", "bookings"]]
    con.close()
    return '<p class="cap">Aşağıdaki tablolar <code>apps/api/data/studiopass.db</code> dosyasından bu PDF üretilirken alınan gerçek sorgu sonuçlarıdır.</p>' + "".join(out) + "<h3>Kayıt sayıları</h3>" + table(["Tablo", "Kayıt"], counts, "tight")


CSS = """
@page { size: A4; margin: 18mm 16mm 20mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Inter", "DejaVu Sans", sans-serif; font-size: 10pt; line-height: 1.55; color: #1B2320; margin: 0; }
h1, h2, h3 { font-family: "Inter Display", "Inter", sans-serif; letter-spacing: -0.01em; color: #1B2320; }
h1 { font-size: 22pt; margin: 0 0 6pt; color: #0F5C55; }
section + section { break-before: page; }
img { page-break-inside: avoid; }
.grid2 > div, .grid4 > div { page-break-inside: avoid; }
h2 { font-size: 14pt; margin: 18pt 0 6pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #DDD8CC; }
h3 { font-size: 11pt; margin: 12pt 0 4pt; }
p { margin: 0 0 6pt; }
a { color: #0F5C55; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 8.5pt; background: #EEEBE3; padding: 0 3pt; border-radius: 3pt; }
pre { font-family: "DejaVu Sans Mono", monospace; font-size: 8pt; background: #F7F5F0; border: 1pt solid #DDD8CC; border-radius: 6pt; padding: 8pt 10pt; white-space: pre-wrap; margin: 4pt 0 8pt; }
ul { margin: 2pt 0 8pt; padding-left: 14pt; } li { margin: 1pt 0; }
table { width: 100%; border-collapse: collapse; margin: 4pt 0 10pt; font-size: 8.8pt; page-break-inside: auto; }
tr { page-break-inside: avoid; }
th { text-align: left; background: #0F5C55; color: #fff; font-weight: 700; padding: 4pt 6pt; }
td { padding: 4pt 6pt; border-bottom: 0.75pt solid #DDD8CC; vertical-align: top; }
tbody tr:nth-child(even) td { background: #F7F5F0; }
table.tight { font-size: 8pt; margin: 0; } table.tight th { background: #E8F2F0; color: #0F5C55; }
.page { } .avoid { page-break-inside: avoid; }
.lead { font-size: 11pt; color: #5A6460; }
.note { border-left: 3pt solid #A84B25; background: #F6E3D9; padding: 6pt 10pt; border-radius: 0 6pt 6pt 0; margin: 6pt 0 10pt; font-size: 9pt; }
.ok { border-left-color: #1D6B37; background: #DCF0E2; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8pt; align-items: start; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8pt; margin: 8pt 0 12pt; }
.kpi { border: 1pt solid #DDD8CC; border-radius: 8pt; padding: 8pt 10pt; }
.kpi b { display: block; font-family: "Inter Display", sans-serif; font-size: 18pt; color: #0F5C55; }
.kpi span { font-size: 8.5pt; color: #5A6460; }
.shot { width: 100%; page-break-inside: avoid; border: 1pt solid #DDD8CC; border-radius: 6pt; display: block; margin: 4pt 0 2pt; }
.cap { font-size: 8.5pt; color: #5A6460; margin: 0 0 10pt; }
.comp { width: 100%; border: 1pt solid #DDD8CC; border-radius: 6pt; background: #fff; }
.entity { border: 1pt solid #DDD8CC; border-radius: 8pt; overflow: hidden; margin-bottom: 8pt; page-break-inside: avoid; }
.entity__head { background: #0F5C55; color: #fff; padding: 5pt 8pt; font-weight: 700; display: flex; justify-content: space-between; gap: 8pt; }
.entity__head small { font-weight: 500; opacity: .85; }
.swatches { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6pt; margin: 6pt 0 10pt; }
.sw { border: 1pt solid #DDD8CC; border-radius: 6pt; overflow: hidden; font-size: 7.5pt; }
.sw i { display: block; height: 28pt; } .sw div { padding: 3pt 5pt; }
.arch { display: grid; grid-template-columns: 1fr 24pt 1.4fr 24pt 1fr; align-items: center; margin: 8pt 0 12pt; }
.box { border: 1.5pt solid #0F5C55; border-radius: 8pt; padding: 8pt; background: #E8F2F0; font-size: 8.5pt; }
.box b { display: block; color: #0F5C55; font-size: 9.5pt; margin-bottom: 2pt; }
.layers div { background: #fff; border: 1pt solid #CFE4E0; border-radius: 5pt; padding: 3pt 6pt; margin: 3pt 0; }
.arrow { text-align: center; color: #0F5C55; font-size: 16pt; }
.cover { height: 257mm; display: flex; flex-direction: column; justify-content: space-between; background: #0F5C55; color: #F7F5F0; margin: -18mm -16mm 0; padding: 26mm 20mm; }
.cover h1 { color: #F7F5F0; font-size: 44pt; margin: 0; }
.cover .sub { font-size: 15pt; opacity: .9; max-width: 140mm; }
.cover .meta { font-size: 10pt; line-height: 1.8; }
.cover .meta b { color: #FBEBC8; }
.toc li { margin: 3pt 0; font-size: 10.5pt; }
.badge { display: inline-block; padding: 0 6pt; border-radius: 99pt; font-size: 8pt; font-weight: 700; }
.b-ok { background: #DCF0E2; color: #1D6B37; } .b-warn { background: #FBEBC8; color: #7F5300; } .b-no { background: #FBE0DD; color: #AE2418; }
"""


def build() -> str:
    E = A / "ekranlar"
    F = A / "figma"
    s = []
    # ------------------------------------------------------------------ Kapak
    s.append(f'''<section class="cover page">
<div><p style="letter-spacing:.2em;font-size:9pt;opacity:.8">PROJE DOKÜMANI · v1.1</p>
<h1>StudioPass</h1>
<p class="sub">Butik spor, yoga ve pilates stüdyoları için üyelik ve abonelik yönetim paneli (SaaS)</p></div>
<div class="meta">
<div><b>Hazırlayan</b> · Yaren Doğan</div>
<div><b>Tarih</b> · 5 Kasım 2026</div>
<div><b>Kaynak kod</b> · {REPO_URL}</div>
<div><b>Figma</b> · {FIGMA_URL}</div>
</div></section>''')

    # ------------------------------------------------------------------ İçindekiler
    s.append('''<section class="page"><h1>İçindekiler</h1><ol class="toc">
<li>Proje özeti: ne yapıyor, kimin için</li>
<li>Özellikler ve ekranlar</li>
<li>Roller ve yetkiler</li>
<li>Mimari</li>
<li>Veritabanı ve veri modeli</li>
<li>API (REST uç noktaları ve hata sözleşmesi)</li>
<li>İş kuralları</li>
<li>Figma: tasarım sistemi, bileşenler ve ekranlar</li>
<li>Test ve kalite güvencesi</li>
<li>Kullanılan yapay zekâ ve araçlar</li>
<li>Kurulum ve çalıştırma</li>
<li>Bilinen sınırlamalar ve yol haritası</li>
<li>Doküman haritası</li>
</ol>
<div class="note">📌 <b>Vaka çalışması notu.</b> StudioPass bir portfolyo projesidir. Analiz dokümanlarındaki görüşme verileri, müşteri adı, sprint takvimi ve toplantılar <b>örnek senaryodur</b>. Kod, veri modeli, testler, hata kayıtları, denetimler, Figma dosyası ve inceleme notları ise gerçek çalışmadır.</div>
</section>''')

    # ------------------------------------------------------------------ 1. Özet
    s.append(f'''<section><h1>1. Proje özeti</h1>
<p class="lead">StudioPass, küçük ve orta ölçekli stüdyoların üyeliklerini, derslerini ve abonelik planlarını tek bir web panelinden yönetmesini sağlar.</p>
<h2>Çözdüğü problem</h2>
<p>Stüdyolar üyelikleri çoğunlukla Excel tabloları, WhatsApp grupları ve kâğıt yoklama listeleriyle takip ediyor. Bunun sonuçları:</p>
<ul><li>Üyeliği biten kişiler derslere katılmaya devam ediyor (gelir kaybı).</li>
<li>Ders kapasitesi takip edilemiyor, çifte rezervasyon oluyor.</li>
<li>Eğitmen, derste kimin olduğunu önceden bilmiyor.</li>
<li>Sahip hangi planın sattığını göremiyor.</li>
<li>Personelin hangi kişisel verilere erişebildiği kontrol edilemiyor (KVKK).</li></ul>
<h2>Çözüm</h2>
<p>Kurallar <b>sunucuda</b> uygulanır: süresi dolmuş üyelikle rezervasyon yapılamaz, dolu derse kayıt alınmaz, aynı kişi aynı derse iki kez yazılamaz, eğitmen üyelerin iletişim bilgilerini göremez. Arayüz bu kuralların sonucunu açık Türkçe mesajlarla gösterir.</p>
<h2>Bir bakışta</h2>
<div class="kpis">
<div class="kpi"><b>8</b><span>ekran (masaüstü, tablet, mobil)</span></div>
<div class="kpi"><b>21</b><span>REST uç noktası + Swagger</span></div>
<div class="kpi"><b>6</b><span>veri varlığı (tablo)</span></div>
<div class="kpi"><b>126</b><span>otomatik test, CI'da yeşil</span></div>
</div>
<h2>Teknoloji</h2>
{table(["Katman", "Teknoloji", "Neden"], [
        ["Ön yüz", "React 19, TypeScript (strict), esbuild", "Sektör standardı; hızlı derleme, az bağımlılık (ADR-003)"],
        ["API", "Node.js 22, yerleşik <code>http</code> ve <code>crypto</code> modülleri", "Çalışma zamanında sıfır dış bağımlılık, tamamen incelenebilir (ADR-002)"],
        ["Kimlik", "scrypt şifre özeti, HS256 JWT (8 saat)", "NFR-02 güvenlik gereksinimi"],
        ["Veritabanı", "SQLite (<code>node:sqlite</code>), tek dosya", "Sıfır bağımlılık, her SQLite aracıyla açılır (ADR-005)"],
        ["Test", "node:test, Playwright (Chromium, masaüstü + 390 px)", "Kabul kriterlerine bire bir bağlı testler"],
        ["Tasarım", "Figma (Variables, bileşenler), <code>design/tokens.json</code>", "Tasarım ve kod aynı token adlarını kullanır"],
        ["CI", "GitHub Actions", "Her push ve PR'da tip kontrolü, testler, e2e"],
    ])}
</section>''')

    # ------------------------------------------------------------------ 2. Ekranlar
    s.append(f'''<section class="page"><h1>2. Özellikler ve ekranlar</h1>
{table(["Kod", "Ekran", "Ne yapar", "Roller"], [
        ["S-01", "Giriş", "E-posta + şifre; alan bazlı hata, genel hata mesajı, oturum süresi uyarısı", "Herkes"],
        ["S-02", "Özet", "Aktif üye, bu ay bitecek üyelikler, haftalık doluluk, plan dağılımı, aylık satış", "Sahip, Yönetici"],
        ["S-03", "Üyeler", "Türkçe duyarsız arama, durum filtresi, sayfalama, yeni üye ekleme", "Herkes (eğitmen kısıtlı)"],
        ["S-05", "Üye detayı", "Profil, plan geçmişi, plan atama (bitiş tarihi otomatik), pasife alma", "Sahip, Yönetici"],
        ["S-06", "Dersler", "Pazartesi başlangıçlı haftalık takvim, doluluk göstergesi", "Herkes"],
        ["S-07", "Ders detayı", "Katılımcı listesi, katılımcı ekleme ve iptal", "Herkes (eğitmen kendi dersine)"],
        ["S-08", "Planlar", "Plan oluşturma, satıştan kaldırma", "Sahip düzenler, diğerleri görür"],
        ["S-09", "Veritabanı", "SQLite tabloları ve görünümleri: sütunlar, PK/FK, satırlar", "Sahip"],
    ])}
<div class="grid2">
<div>{img(E / "02-dashboard.png", alt="Özet", crop=0.625)}<p class="cap">S-02 Özet panel</p></div>
<div>{img(E / "01-login-errors.png", alt="Giriş")}<p class="cap">S-01 Giriş — boş form gönderildiğinde alan hataları</p></div>
</div>
{img(E / "03-members.png", alt="Üyeler", crop=0.6)}<p class="cap">S-03 Üyeler — durum rozetleri ikon + metin + renk ile</p>
</section>''')
    s.append(f'''<section class="page">
<div class="grid2">
<div>{img(E / "04-new-member.png", crop=0.625, alt="Yeni üye")}<p class="cap">S-04 Yeni üye paneli — doğrulama hataları</p></div>
<div>{img(E / "05-member-detail.png", crop=0.625, alt="Üye detayı")}<p class="cap">S-05 Üye detayı ve plan geçmişi</p></div>
<div>{img(E / "06-classes.png", crop=0.625, alt="Dersler")}<p class="cap">S-06 Haftalık ders takvimi (dolu ders kırmızı, %90+ turuncu)</p></div>
<div>{img(E / "07-class-detail.png", crop=0.625, alt="Ders detayı")}<p class="cap">S-07 Ders detayı ve katılımcılar</p></div>
<div>{img(E / "08-plans.png", crop=0.625, alt="Planlar")}<p class="cap">S-08 Abonelik planları</p></div>
<div>{img(E / "11-instructor-members.png", crop=0.625, alt="Eğitmen görünümü")}<p class="cap">Eğitmen görünümü — e-posta sütunu ve "Özet" menüsü yok</p></div>
</div>
<div class="grid2" style="grid-template-columns:1fr 2fr"><div>{img(E / "09-mobile-dashboard.png", alt="Mobil", crop=1.6)}<p class="cap">Mobil (390 px) — alt sekme menüsü</p></div>
<div><h3>Erişilebilirlik (WCAG 2.2 AA)</h3><ul>
<li>Tüm metin kontrastları ≥ 4.5:1 (otomatik kontrol edilir)</li>
<li>Klavye ile tam kullanım, görünür odak halkası</li>
<li>"İçeriğe geç" bağlantısı, sayfa başlığı değişimi</li>
<li>Yan panellerde odak döngüsü, Esc ile kapanma</li>
<li>Form hataları <code>aria-invalid</code> + <code>aria-describedby</code></li>
<li>Bildirimler <code>aria-live</code> ile duyurulur</li>
<li>Dokunma hedefleri çoğunlukla 44×44 px</li></ul></div></div>
</section>''')

    # ------------------------------------------------------------------ 3. Roller
    y, n = '<span class="badge b-ok">Evet</span>', '<span class="badge b-no">Hayır</span>'
    s.append(f'''<section><h1>3. Roller ve yetkiler</h1>
<p>Rol kontrolü her uç noktada <b>sunucuda</b> yapılır. Arayüzdeki gizleme yalnızca kullanıcı deneyimi içindir; API'ye doğrudan istek atılsa da kural bozulmaz.</p>
{table(["Yetki", "Stüdyo sahibi", "Yönetici", "Eğitmen"], [
        ["Özet paneli", y, y, n],
        ["Üye listesi", y, y, '<span class="badge b-warn">Ad ve plan</span>'],
        ["Üye e-posta / telefon", y, y, n + " (yanıtta da yok)"],
        ["Üye ekleme, düzenleme, pasife alma", y, y, n],
        ["Plan atama", y, y, n],
        ["Plan oluşturma / satıştan kaldırma", y, n, n],
        ["Ders oluşturma (API)", y, y, n],
        ["Rezervasyon ekleme", y, y, '<span class="badge b-warn">Kendi dersine</span>'],
        ["Rezervasyon iptali", y, y, n],
        ["Veritabanı görüntüleyici", y, n, n],
    ])}
<h3>Demo hesapları (şifre: <code>Studio123!</code>)</h3>
{table(["E-posta", "Ad", "Rol", "Sabit kimlik"], [
        ["elif@studiopass.dev", "Elif Arslan", "Stüdyo sahibi", "<code>usr_owner</code>"],
        ["mert@studiopass.dev", "Mert Kaya", "Yönetici", "<code>usr_manager</code>"],
        ["deniz@studiopass.dev", "Deniz Aydın", "Eğitmen", "<code>usr_instructor</code>"],
        ["selin@studiopass.dev", "Selin Öztürk", "Eğitmen", "<code>usr_instructor2</code>"],
    ])}
</section>''')

    # ------------------------------------------------------------------ 4. Mimari
    s.append(f'''<section class="page"><h1>4. Mimari</h1>
<div class="arch">
<div class="box"><b>Tarayıcı</b>React 19 + TypeScript<br>Sayfalar · bileşenler · API istemcisi · yönlendirici</div>
<div class="arrow">⇄</div>
<div class="box"><b>API · Node.js 22</b><div class="layers">
<div>1 · Yönlendirici — <code>lib/http.ts</code></div>
<div>2 · Kimlik + rol — <code>lib/auth.ts</code></div>
<div>3 · Doğrulama — <code>lib/validate.ts</code></div>
<div>4 · İş kuralları — <code>domain.ts</code>, <code>routes.ts</code></div></div></div>
<div class="arrow">⇄</div>
<div class="box"><b>Veri katmanı</b><code>store.ts</code> · <code>db/</code><br>SQLite dosyası<br>data/studiopass.db</div>
</div>
<p>Tarayıcı ile API arasında JSON taşıyan REST istekleri vardır; kimlik <code>Authorization: Bearer &lt;JWT&gt;</code> başlığıyla gönderilir. Geliştirme sunucusu (<code>apps/web/build.mjs</code>) <code>/api</code> ile başlayan istekleri API'ye yönlendirir. Swagger arayüzü <code>/docs</code> adresindedir.</p>
<h2>Depo yapısı</h2>
<pre>apps/
  api/   src/lib/{{http,auth,validate,dates,text}}.ts · src/{{store,domain,routes,app,server}}.ts
         openapi.yaml · src/db/{{schema.sql,sqlite.ts,cli.ts}} · test/*.test.ts (55 test)
  web/   src/{{components,pages,lib,styles}} · test/ (20) · e2e/ (38) · build.mjs
design/  tokens.json                 (Figma Variables ile aynı)
docs/    01-analiz · 02-urun · 03-ux-ui · 04-mimari · 05-test · 06-proje-yonetimi · 07-yapay-zeka-inceleme
.github/ workflows/ci.yml · ISSUE_TEMPLATE/ · pull_request_template.md
scripts/ contrast-check.py · build-docs-pdf.py</pre>
<h2>Güvenlik kontrolleri</h2>
<ul>
<li>Şifreler <code>scrypt</code> + rastgele tuz ile saklanır, karşılaştırma sabit zamanlıdır (<code>timingSafeEqual</code>).</li>
<li>JWT imzası sabit zamanlı doğrulanır; süre (8 saat) sunucuda kontrol edilir.</li>
<li>Hata yanıtları iç ayrıntı (stack trace) içermez.</li>
<li>İstek gövdesi 100 KB ile sınırlıdır (413).</li>
<li>CORS yalnız izinli kökenlere açıktır; <code>X-Content-Type-Options: nosniff</code>.</li>
<li>Veri sıfırlama uç noktası yalnız test ortamında (<code>NODE_ENV=test</code> veya <code>E2E=1</code>) tanımlıdır.</li>
</ul>
<h2>Mimari kararlar (ADR)</h2>
{table(["Kod", "Karar", "Sonuç"], [
        ["ADR-001", "Tek depo (npm workspaces): API + web + doküman", "Bir PR'da kod, test ve doküman birlikte incelenir"],
        ["ADR-002", "API'de dış bağımlılık yok", "Güvenlik yüzeyi küçük; OpenAPI elle güncel tutulur"],
        ["ADR-003", "React + esbuild, yönlendirici kütüphanesi yok", "Yalnız react ve react-dom bağımlılığı"],
        ["ADR-004", "v1.0 bellek içi veri", "ADR-005 ile güncellendi"],
        ["ADR-005", "SQLite ile kalıcı depolama (node:sqlite)", "Veri kalıcı ve görüntülenebilir; tek sunucu ölçeği"],
    ])}
</section>''')

    # ------------------------------------------------------------------ 5. Veritabanı
    s.append(f'''<section class="page"><h1>5. Veritabanı ve veri modeli</h1>
<div class="note ok"><b>Veritabanı: SQLite.</b> Veriler <code>apps/api/data/studiopass.db</code> dosyasında saklanır; sunucu kapansa da silinmez. Ek kurulum gerekmez: Node.js 22.13+ ile gelen <code>node:sqlite</code> modülü kullanılır (ADR-005). İlk çalıştırmada dosya demo verisiyle oluşur. Şema: <code>apps/api/src/db/schema.sql</code>. Tablolarda <b>UNIQUE, CHECK ve yabancı anahtar</b> kısıtları vardır; ayrıca iki hazır görünüm (<code>v_member_status</code>, <code>v_class_occupancy</code>) bulunur.</div>
<h2>Varlıklar ve ilişkiler</h2>
<pre>USER (eğitmen) ──1:N──▶ CLASS_SESSION ──1:N──▶ BOOKING ◀──N:1── MEMBER
                                                                 │
PLAN ──1:N──▶ MEMBERSHIP ◀──────────────────────────N:1──────────┘</pre>
<p>Bir üyenin birden çok üyelik kaydı (plan geçmişi) olabilir, ancak aynı anda yalnız biri aktiftir (BR-01). Rezervasyon, bir üyeyi bir derse bağlayan ara tablodur.</p>
<div class="grid2">
{entity("USER", "Panel kullanıcıları", [
        ("id", "string", "PK", "Sabit kimlik, ör. usr_owner"),
        ("name", "string", "", "Ad soyad"),
        ("email", "string", "UK", "Giriş e-postası"),
        ("passwordHash", "string", "", "scrypt$tuz$özet"),
        ("role", "enum", "", "owner · manager · instructor"),
    ])}
{entity("MEMBER", "Stüdyo üyeleri", [
        ("id", "uuid", "PK", ""),
        ("firstName / lastName", "string", "", "En fazla 60 karakter"),
        ("email", "string", "UK", "Küçük harfe çevrilir"),
        ("phone", "string?", "", "İsteğe bağlı"),
        ("isActive", "boolean", "", "false = pasif, silinmez"),
        ("createdAt", "datetime", "", "Liste sıralaması"),
    ])}
{entity("PLAN", "Abonelik planları", [
        ("id", "uuid", "PK", ""),
        ("name", "string", "", "ör. Aylık Sınırsız"),
        ("priceKurus", "int", "", "KDV dahil, kuruş (BR-02)"),
        ("durationDays", "int", "", "1–730 gün"),
        ("monthlyClassLimit", "int?", "", "null = sınırsız"),
        ("isOnSale", "boolean", "", "Silinmez, satıştan kalkar (BR-04)"),
    ])}
{entity("MEMBERSHIP", "Üyeye atanan plan", [
        ("id", "uuid", "PK", ""),
        ("memberId", "uuid", "FK → MEMBER", ""),
        ("planId", "uuid", "FK → PLAN", ""),
        ("startDate", "date", "", "YYYY-MM-DD"),
        ("endDate", "date", "", "= startDate + durationDays"),
    ])}
{entity("CLASS_SESSION", "Dersler", [
        ("id", "uuid", "PK", ""),
        ("title", "string", "", "ör. Reformer Pilates"),
        ("instructorId", "string", "FK → USER", "Rolü instructor olmalı"),
        ("startsAt", "datetime", "", "UTC saklanır, İstanbul saatiyle gösterilir"),
        ("durationMin", "int", "", "15–240"),
        ("capacity", "int", "", "1–50"),
    ])}
{entity("BOOKING", "Rezervasyonlar", [
        ("id", "uuid", "PK", ""),
        ("memberId", "uuid", "FK → MEMBER", ""),
        ("classId", "uuid", "FK → CLASS_SESSION", "(memberId, classId) benzersiz"),
        ("createdAt", "datetime", "", ""),
    ])}
</div>
<h2>Hesaplanan alanlar (saklanmaz)</h2>
{table(["Alan", "Kural"], [
        ["Üye durumu", "Pasifse <code>inactive</code> · üyelik yoksa <code>none</code> · bitiş ≥ bugün ise <code>active</code> · aksi halde <code>expired</code>"],
        ["Bitmek üzere", "Aktif ve bitişe 7 gün veya daha az kalmış"],
        ["Ders doluluğu", "Rezervasyon sayısı / kapasite; %90 ve üstü uyarı, %100 dolu"],
        ["Geçmiş ders", "Başlangıç saati şimdiden önce"],
    ])}
<h2>Tohum (demo) verisi</h2>
{table(["Tablo", "Kayıt", "İçerik"], [
        ["USER", "4", "1 sahip, 1 yönetici, 2 eğitmen"],
        ["MEMBER", "24", "Türkçe karakterli adlar (Şule, İlker, Işıl…), 1 pasif üye"],
        ["PLAN", "5", "Aylık Sınırsız, 8 Ders Paketi, 3 Aylık, Yıllık, Yaz Kampanyası (satışta değil)"],
        ["MEMBERSHIP", "23", "Aktif, bitmek üzere, süresi dolmuş karışık; 1 üye plansız"],
        ["CLASS_SESSION", "11", "Bu hafta 9 + gelecek hafta 2 ders; bir ders tam dolu"],
        ["BOOKING", "66", "Yalnız aktif üyelerle"],
    ])}
<p>Tarihler "bugün"e göre üretilir; böylece demo her gün anlamlı görünür. Testlerde <code>STUDIOPASS_TODAY=2026-11-04</code> ile gün sabitlenir.</p>
<h2>Veritabanını görüntüleme</h2>
<p><b>En kolay yol, panelin içinden:</b> <code>elif@studiopass.dev</code> (stüdyo sahibi) ile giriş yap → sol menüde <b>Veritabanı</b>. Her tablo ve görünüm; sütun tipleri, birincil (PK) ve yabancı anahtarlar (FK) ve satırlarıyla, doğrudan SQL ile okunarak gösterilir. Şifre özetleri gizlenir; sayfa yalnız sahip rolüne açıktır.</p>
{img(E / "12-veritabani.png", alt="Veritabanı görüntüleyici")}<p class="cap">Panel › Veritabanı — <code>members</code> tablosu</p>
<p><b>Diğer yollar:</b></p>
<ol>
<li>API'yi bir kez çalıştır: <code>npm run dev -w @studiopass/api</code> → <code>apps/api/data/studiopass.db</code> oluşur.</li>
<li><b>DB Browser for SQLite</b> (ücretsiz, sqlitebrowser.org) ile dosyayı aç → <i>Browse Data</i> sekmesinde tabloyu seç.</li>
<li>Ya da terminalden: <code>npm run db:tablolar</code> (kayıt sayıları ve örnek satırlar) · <code>npm run db:sifirla</code> (demo verisine dön).</li>
</ol>
<div class="note">API çalışırken veritabanını <b>okumak</b> için aç. DB Browser'da elle yapılan değişiklikler API'nin bir sonraki kaydında üzerine yazılır; elle düzenleme için önce API'yi durdur.</div>
{db_samples()}
<h2>Şemadan örnek (<code>apps/api/src/db/schema.sql</code>)</h2>
<pre>CREATE TABLE bookings (
  id         TEXT PRIMARY KEY,
  member_id  TEXT NOT NULL REFERENCES members(id),
  class_id   TEXT NOT NULL REFERENCES class_sessions(id),
  created_at TEXT NOT NULL,
  UNIQUE (member_id, class_id)      -- aynı üye aynı derse iki kez yazılamaz
);
CREATE TABLE plans (
  ...
  price_kurus   INTEGER NOT NULL CHECK (price_kurus &gt; 0),      -- KDV dahil, kuruş
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 730),
  is_on_sale    INTEGER NOT NULL DEFAULT 1                    -- plan silinmez, satıştan kalkar
);</pre>
<p class="cap">Kısıtlar iş kurallarını veritabanı seviyesinde de korur: uygulamada bir hata olsa bile mükerrer rezervasyon ya da mükerrer e-posta yazılamaz (testlerle doğrulandı).</p>
</section>''')

    # ------------------------------------------------------------------ 6. API
    s.append(f'''<section class="page"><h1>6. API</h1>
<p>Sözleşme: <code>apps/api/openapi.yaml</code> (OpenAPI 3.0). Swagger UI: <code>http://localhost:4000/docs</code>.</p>
{table(["Yöntem", "Yol", "Açıklama", "Yetki"], [
        ["GET", "/api/health", "Sağlık kontrolü", "Herkes"],
        ["POST", "/api/auth/login", "Giriş, JWT döner", "Herkes"],
        ["GET", "/api/auth/me", "Oturumdaki kullanıcı", "Giriş yapmış"],
        ["GET", "/api/members", "Liste · <code>search</code>, <code>status</code>, <code>page</code>", "Giriş yapmış (eğitmen kısıtlı)"],
        ["POST", "/api/members", "Üye ekle", "Sahip, Yönetici"],
        ["GET", "/api/members/:id", "Üye detayı + plan geçmişi", "Giriş yapmış"],
        ["PATCH", "/api/members/:id", "Üyeyi güncelle", "Sahip, Yönetici"],
        ["POST", "/api/members/:id/deactivate", "Pasife al", "Sahip, Yönetici"],
        ["POST", "/api/members/:id/activate", "Yeniden etkinleştir", "Sahip, Yönetici"],
        ["POST", "/api/members/:id/memberships", "Plan ata", "Sahip, Yönetici"],
        ["GET", "/api/plans", "Planlar + aktif üye sayısı", "Giriş yapmış"],
        ["POST", "/api/plans", "Plan oluştur", "Sahip"],
        ["PATCH", "/api/plans/:id", "Güncelle / satıştan kaldır", "Sahip"],
        ["GET", "/api/classes", "Haftalık dersler · <code>from</code>, <code>to</code>, <code>mine</code>", "Giriş yapmış"],
        ["POST", "/api/classes", "Ders oluştur", "Sahip, Yönetici"],
        ["GET", "/api/classes/:id", "Ders + katılımcılar", "Giriş yapmış"],
        ["POST", "/api/classes/:id/bookings", "Rezervasyon", "Sahip, Yönetici, kendi dersinde eğitmen"],
        ["DELETE", "/api/classes/:id/bookings/:bookingId", "Rezervasyon iptali", "Sahip, Yönetici"],
        ["GET", "/api/instructors", "Eğitmen listesi", "Giriş yapmış"],
        ["GET", "/api/dashboard", "Özet göstergeler", "Sahip, Yönetici"],
        ["GET", "/api/admin/database", "Veritabanı görüntüleyici: tablolar, PK/FK, satırlar", "Sahip"],
    ])}
<h2>Hata sözleşmesi</h2>
<pre>{{ "error": {{ "code": "EMAIL_TAKEN", "message": "Bu e-posta ile kayıtlı bir üye zaten var",
             "fields": {{ "email": "Bu e-posta ile kayıtlı bir üye zaten var" }} }} }}</pre>
{table(["Durum", "Kodlar", "Ne zaman"], [
        ["400", "VALIDATION_ERROR, INVALID_JSON", "Eksik/hatalı alan (alan hataları <code>fields</code> içinde)"],
        ["401", "UNAUTHENTICATED, INVALID_TOKEN, TOKEN_EXPIRED, INVALID_CREDENTIALS", "Kimlik yok veya geçersiz"],
        ["403", "FORBIDDEN", "Rolün yetkisi yok"],
        ["404", "MEMBER_NOT_FOUND, CLASS_NOT_FOUND, PLAN_NOT_FOUND, NOT_FOUND", "Kaynak yok"],
        ["405 / 413", "METHOD_NOT_ALLOWED, PAYLOAD_TOO_LARGE", "Desteklenmeyen yöntem, 100 KB üstü gövde"],
        ["409", "EMAIL_TAKEN, CLASS_FULL, ALREADY_BOOKED", "Çakışma"],
        ["422", "NO_ACTIVE_MEMBERSHIP, CLASS_IN_PAST, PLAN_NOT_ON_SALE, MEMBER_INACTIVE", "İş kuralı ihlali"],
        ["500", "INTERNAL_ERROR", "Beklenmeyen hata (ayrıntı gizlenir)"],
    ])}
</section>''')

    # ------------------------------------------------------------------ 7. İş kuralları
    s.append(f'''<section><h1>7. İş kuralları</h1>
{table(["Kod", "Kural"], [
        ["BR-01", "Bir üyenin aynı anda tek aktif planı olur; yeni plan atanınca eskisi bugün kapanır."],
        ["BR-02", "Fiyatlar KDV dahil ve kuruş cinsinden tamsayı saklanır (₺1.250,00 = 125000)."],
        ["BR-03", "Geçmiş tarihli derse rezervasyon yapılamaz."],
        ["BR-04", "Plan silinmez, satıştan kaldırılır; mevcut üyelikler etkilenmez."],
        ["BR-05", "\"Bu ay bitecek\" = bitişi bugün ile ay sonu arasında olan aktif üyelikler."],
        ["FR-07", "Bitiş tarihi bugün olan üyelik hâlâ aktiftir (sınır değer testle korunur)."],
    ])}
<h2>Rezervasyon karar tablosu</h2>
<p>Kurallar bu sırayla kontrol edilir; aynı istekte birden çok ihlal varsa ilk satırın hatası döner.</p>
{table(["#", "Ders geçmişte?", "Zaten kayıtlı?", "Üyelik aktif?", "Yer var?", "Sonuç"], [
        ["1", "Evet", "–", "–", "–", "422 CLASS_IN_PAST"],
        ["2", "Hayır", "Evet", "–", "–", "409 ALREADY_BOOKED"],
        ["3", "Hayır", "Hayır", "Hayır", "–", "422 NO_ACTIVE_MEMBERSHIP"],
        ["4", "Hayır", "Hayır", "Evet", "Hayır", "409 CLASS_FULL"],
        ["5", "Hayır", "Hayır", "Evet", "Evet", "201 Rezervasyon oluştu"],
    ])}
<h2>Türkçe duyarsız arama</h2>
<p><code>normalizeTr()</code> fonksiyonu metni <code>tr-TR</code> yereliyle küçültür, ç ğ ı ö ş ü harflerini ASCII karşılığına çevirir ve birleşik işaretleri temizler. Böylece <code>AYŞE</code>, <code>Ayşe</code>, <code>ayse</code> aynı sonucu verir; <code>İlker</code> de <code>ilker</code> ile bulunur (BUG-007 düzeltmesi).</p>
</section>''')

    # ------------------------------------------------------------------ 8. Figma
    sw = [("action/primary", "#0F5C55", "Birincil eylem"), ("action/focus", "#A84B25", "Odak halkası"),
          ("bg/canvas", "#F7F5F0", "Zemin"), ("text/primary", "#1B2320", "Ana metin"),
          ("status/active", "#1D6B37", "Aktif"), ("status/danger", "#AE2418", "Hata, dolu")]
    sws = "".join(f'<div class="sw"><i style="background:{h}"></i><div><b>{n}</b><br>{h} · {d}</div></div>' for n, h, d in sw)
    s.append(f'''<section class="page"><h1>8. Figma</h1>
<p>Figma dosyası: <a href="{FIGMA_URL}">{FIGMA_URL}</a></p>
<p>Dosyada üç sayfa var: <b>00 Kapak</b>, <b>01 Tasarım sistemi</b> (değişkenler, metin stilleri, bileşenler), <b>02 Ekranlar</b>. Bu bölüm, dosyayı açamayanlar için içeriğin görüntülerini içerir.</p>
<div style="width:60%">{img(F / "kapak.png", alt="Figma kapak")}</div><p class="cap">00 Kapak</p>
<h2>Değişkenler (Variables)</h2>
<p>Figma'daki değişkenler kodla aynı adlara ve <b>code syntax</b> değerlerine sahiptir (ör. <code>action/primary</code> → <code>var(--action-primary)</code>). Tasarımcı bir rengi değiştirdiğinde geliştirici hangi CSS değişkenini güncelleyeceğini bilir.</p>
{table(["Koleksiyon", "Değişken sayısı", "İçerik"], [
        ["Primitives", "20", "Ham renkler: teal, clay, sand, green, amber, red tonları (gizli kapsam)"],
        ["Color (Light)", "18", "Semantik renkler, primitive'lere alias: bg/*, text/*, border/*, action/*, status/*"],
        ["Spacing &amp; Radius", "11", "spacing/1…12 (4 px ölçeği), radius/sm · md · lg · pill"],
    ])}
<div class="swatches">{sws}</div>
<h3>Metin stilleri</h3>
{table(["Stil", "Font", "Boyut / satır"], [
        ["Display", "Fraunces SemiBold", "36 / 44"], ["Başlık 1", "Fraunces SemiBold", "28 / 36"],
        ["Başlık 2", "Manrope Bold", "20 / 28"], ["Gövde", "Manrope Medium", "16 / 24"],
        ["Küçük / Küçük kalın", "Manrope Medium / Bold", "14 / 20"], ["Etiket", "Manrope Bold, %4 harf aralığı", "12 / 16"],
    ])}
</section>''')
    s.append(f'''<section class="page"><h2>Bileşenler</h2>
<p>Bileşenlerin tüm renkleri değişkenlere bağlıdır; adları kodla aynıdır (<code>apps/web/src/components/ui.tsx</code>).</p>
<div class="grid4">
<div>{img(F / "bilesen-button.png", "comp", "Button")}<p class="cap"><b>Button</b> · Style (primary, secondary, ghost, danger) × State (Default, Disabled) = 8 varyant, Label metin özelliği</p></div>
<div>{img(F / "bilesen-badge.png", "comp", "Badge")}<p class="cap"><b>Badge</b> · Tone: active, warning, danger, neutral. Durum her zaman ikon + metin + renk.</p></div>
<div>{img(F / "bilesen-textfield.png", "comp", "TextField")}<p class="cap"><b>TextField</b> · State: Default, Focus, Error. Hatada 2 px kırmızı kenar ve alt mesaj.</p></div>
<div>{img(F / "bilesen-capacitybar.png", "comp", "CapacityBar")}<p class="cap"><b>CapacityBar</b> · Level: normal, high (%90+), full (kilit + "Dolu").</p></div>
</div>
<h2>Ekranlar</h2>
{img(F / "s03-uyeler.png", alt="Figma S-03")}<p class="cap">02 Ekranlar › S-03 Üyeler (1440 px) — Badge ve Button bileşen kopyalarıyla</p>
{img(F / "s07-katilimci-ekle.png", alt="Figma S-07")}<p class="cap">02 Ekranlar › S-07 Ders detayı + Katılımcı ekle paneli — süresi dolmuş üye eklenmeye çalışıldığında hata durumu</p>
<div class="note">Figma'ya henüz eklenmeyenler: StatCard, Table, Drawer, Toast, NavItem bileşenleri; tablet (1024) ve mobil (390) kareleri; prototip bağlantıları. Bunlar kodda mevcut, Figma'ya sonraki adımda aktarılacak.</div>
</section>''')

    # ------------------------------------------------------------------ 9. Test
    s.append(f'''<section class="page"><h1>9. Test ve kalite güvencesi</h1>
<div class="kpis">
<div class="kpi"><b>55</b><span>API + veritabanı testi</span></div>
<div class="kpi"><b>20</b><span>ön yüz birim testi</span></div>
<div class="kpi"><b>38</b><span>uçtan uca (Playwright)</span></div>
<div class="kpi"><b>13</b><span>kontrast çifti (WCAG AA)</span></div>
</div>
<p>Toplam <b>126</b> kontrol, GitHub Actions'ta her push'ta çalışır ve şu anda yeşildir. Her test bir kabul kriterine (<code>TC-xx</code>) bağlıdır; hangi gereksinimin hangi testle korunduğu izlenebilirlik matrisindedir.</p>
<h2>Test yaklaşımı</h2>
<ul>
<li><b>Sınır değer analizi:</b> kapasite N-1 / N / N+1, bitiş tarihi dün / bugün / yarın, kapasite 0 / 1 / 50 / 51.</li>
<li><b>Karar tablosu:</b> rezervasyon kuralları (bölüm 7).</li>
<li><b>Rol × durum denklik sınıfları:</b> 3 rol × 4 üye durumu.</li>
<li><b>Keşif testi:</b> zaman kutulu oturumlar (yavaş ağ, çevrimdışı, eşzamanlı ekleme, Swagger ile doğrudan istekler).</li>
<li><b>Erişilebilirlik:</b> klavye, odak, etiketler, hedef boyutu, tablet menü adları otomatik test edilir.</li>
</ul>
<h2>Hata kayıtları</h2>
{table(["Kod", "Hata", "Önem", "Nasıl bulundu", "Durum"], [
        ["BUG-007", "Türkçe karakterle arama sonuç vermiyor", "Yüksek", "Kullanılabilirlik bulgusu", '<span class="badge b-ok">Kapandı</span>'],
        ["BUG-010", "Kenar çubuğunda kullanıcı adı kesiliyor", "Düşük", "Görsel kontrol", '<span class="badge b-ok">Kapandı</span>'],
        ["BUG-011", "Özet'teki bağlantı farklı liste açıyor", "Orta", "Keşif testi", '<span class="badge b-ok">Kapandı</span>'],
        ["BUG-012", "\"İçeriğe geç\" bağlantısı atlanıyor", "Orta", "Otomatik e2e", '<span class="badge b-ok">Kapandı</span>'],
        ["BUG-013", "Veri sıfırlanınca oturum düşüyor; bir test yanlış yere geçiyordu", "Yüksek", "Test kodu incelemesi", '<span class="badge b-ok">Kapandı</span>'],
        ["BUG-014", "Geçmiş dersler yalnız soluk renkle ayırt ediliyor", "Düşük", "Erişilebilirlik denetimi", '<span class="badge b-warn">Açık</span>'],
        ["BUG-015", "Özet'te \"bu ay bitecek\" listesi 5 kayıtta kalıyor", "Orta", "Keşif testi", '<span class="badge b-warn">Karar bekliyor</span>'],
        ["BUG-016", "Tablet görünümünde menü bağlantılarının erişilebilir adı yok", "Yüksek", "Otomasyon betiği", '<span class="badge b-ok">Kapandı</span>'],
    ])}
<p>Her kayıt; ortam, ön koşul, adımlar, beklenen/gerçekleşen, kanıt, kök neden ve doğrulama içerir (<code>docs/05-test/hata-kayitlari/</code>).</p>
<h2>Tasarım ↔ uygulama karşılaştırması</h2>
<p>13 kontrol: 8 uyumlu, 3 düzeltildi, 2 gerekçeyle kabul, 1 açık (<code>docs/05-test/tasarim-uygulama-karsilastirma.md</code>).</p>
</section>''')

    # ------------------------------------------------------------------ 10. Yapay zekâ ve araçlar
    s.append(f'''<section class="page"><h1>10. Kullanılan yapay zekâ ve araçlar</h1>
<div class="note ok"><b>Kısa cevap:</b> Projede tek bir yapay zekâ asistanı kullanıldı: <b>Claude (Anthropic) — Claude Opus 5.5</b>, claude.ai üzerinden. Ayrı ayrı çalışan çoklu ajanlar (alt ajan / "subagent") başlatılmadı. Claude, aşağıdaki araçları kullanarak analiz, tasarım, kod, test ve dokümantasyonu aynı oturumda üretti; Yaren Doğan iş ilanına göre kapsamı ve kararları belirledi.</div>
<h2>Yapay zekânın kullandığı araçlar</h2>
{table(["Araç", "Ne için kullanıldı"], [
        ["Dosya ve kabuk (shell) araçları", "Kod ve dokümanların yazılması, testlerin ve derlemenin çalıştırılması"],
        ["Playwright + Chromium", "Ekran görüntüleri, uçtan uca testler, keşif testi betikleri (yavaş ağ, çevrimdışı, klavye akışı)"],
        ["Figma MCP bağlayıcısı", "Figma dosyasının oluşturulması: değişkenler, metin stilleri, bileşenler, ekranlar ve ekran görüntüleri"],
        ["GitHub (git + gh)", "Commit geçmişi, push, CI sonucunun kontrolü"],
        ["Python betikleri", "Kontrast kontrolü (<code>scripts/contrast-check.py</code>), bu PDF'in üretimi"],
    ])}
<h2>Rol bazında kim ne yaptı</h2>
{table(["Rol", "Yapay zekânın ürettiği", "İnsanın sorumluluğu"], [
        ["İş analisti / Ürün sahibi", "Gereksinim, hikâye, backlog taslakları", "Kapsamın iş ilanına göre seçilmesi, önceliklerin onayı"],
        ["UX/UI", "Tasarım sistemi, token'lar, Figma bileşen ve ekranları", "Görsel yönün ve ekranların değerlendirilmesi"],
        ["Yazılımcı", "API, web paneli, testler", "Kodun okunup anlaşılması, sorulara cevap verebilmek"],
        ["Test / QA", "Test planı, senaryolar, hata kayıtları, denetimler", "Bulguların doğrulanması ve önceliklendirilmesi"],
        ["Koordinasyon", "Plan, risk kaydı, rapor ve toplantı şablonları", "Gerçek projede iletişim ve takip"],
    ])}
<h2>Yapay zekâ çıktısı nasıl denetlendi?</h2>
<p>Üretilen her şey çalıştırılarak doğrulandı: testler koşturuldu, ekranlar tarayıcıda açılıp görüntülendi, iddia edilen keşif testi sonuçları betiklerle tekrar edildi. Bu süreçte yakalanan gerçek sorunlar <code>docs/07-yapay-zeka-inceleme/inceleme-notlari.md</code> dosyasında belgelendi:</p>
{table(["#", "Sorun", "Ders"], [
        ["1", "Yetki testi yanlış nedenle geçiyordu (boş listede <code>every()</code> = true)", "Yeşil test ≠ doğru test; pozitif ve negatif durum birlikte test edilir"],
        ["2", "E-posta yan kanal riski", "Kural sunucuda uygulanmalı; iki kanal da testle sabitlendi"],
        ["3", "İlk odak düzeltmesi React StrictMode'da çalışmadı", "Düzeltme, hatayı bulan testle aynı ortamda doğrulanır"],
        ["4", "Kırılgan test seçicileri", "Seçici rol + erişilebilir adla yazılır"],
        ["5", "Kod doğru, bağlantı metni yanıltıcı", "Kullanıcı gözüyle keşif testi gerekir"],
        ["6", "<code>display: none</code> menü adlarını sildi", "Görsel gizleme ≠ erişilebilir gizleme"],
    ])}
</section>''')

    # ------------------------------------------------------------------ 11-13
    s.append(f'''<section><h1>11. Kurulum ve çalıştırma</h1>
<pre>git clone {REPO_URL}
cd studiopass
npm install
npm run dev              # API → http://localhost:4000 · Web → http://localhost:5173 · Swagger → /docs

npm test                 # API + web birim testleri
npm run e2e              # Playwright (ilk sefer: npx playwright install chromium)
npm run check:contrast   # WCAG kontrast kontrolü
npm run lint             # TypeScript tip kontrolü</pre>
<p>Gereksinim: Node.js 22.13 veya üstü. Ek veritabanı kurulumu gerekmez; SQLite dosyası ilk çalıştırmada oluşur. Veritabanına bakmak için: <code>npm run db:tablolar</code> veya DB Browser for SQLite.</p>

<h1>12. Bilinen sınırlamalar ve yol haritası</h1>
{table(["Konu", "Durum", "Plan"], [
        ["Veritabanı ölçeği", "SQLite, her değişiklikte tüm tablolar yazılır (demo ölçeği)", "v1.2 satır bazlı sorgular + PostgreSQL"],
        ["Ders oluşturma arayüzü", "Yalnız API'de", "v1.1 tekrarlayan ders şablonu"],
        ["Ekran okuyucu testi", "Otomatik kontroller var, NVDA/VoiceOver yapılmadı", "v1.0.1"],
        ["Safari / Firefox", "CI yalnız Chromium", "v1.0.1 manuel tur"],
        ["Bildirimler, online ödeme", "Yok", "v1.1 hatırlatma, v1.2 iyzico"],
        ["Üye mobil uygulaması, çoklu şube", "Yok", "v2.0"],
    ])}

<h1>13. Doküman haritası</h1>
{table(["Klasör", "İçerik"], [
        ["docs/01-analiz", "İş analizi, gereksinimler (FR/NFR/BR), kullanıcı hikâyeleri"],
        ["docs/02-urun", "Vizyon, yol haritası, backlog (RICE), DoR/DoD"],
        ["docs/03-ux-ui", "UX araştırması, bilgi mimarisi, akışlar, tasarım sistemi, Figma"],
        ["docs/04-mimari", "Mimari ve ADR'ler"],
        ["docs/05-test", "Test planı, senaryolar, izlenebilirlik, hata kayıtları, denetimler, test raporu"],
        ["docs/06-proje-yonetimi", "Proje planı, RACI, risk kaydı, haftalık rapor, toplantı notları"],
        ["docs/07-yapay-zeka-inceleme", "Yapay zekâ ile üretilen kodun inceleme notları"],
        ["CHANGELOG.md", "Sürüm notları"],
    ])}
<p class="cap">Bu PDF <code>scripts/build-docs-pdf.py</code> ile depo içeriğinden üretilir.</p>
</section>''')
    return f'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>StudioPass — Proje Dokümanı</title><style>{CSS}</style></head><body>{"".join(s)}</body></html>'


if __name__ == "__main__":
    out = ROOT / "docs" / "StudioPass-Proje-Dokumani.html"
    out.write_text(build(), encoding="utf-8")
    print(out)
