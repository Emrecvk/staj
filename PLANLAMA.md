# Elektronik Komponent E-Ticaret Platformu — Planlama Dokümanı

> **Durum:** Faz 0 — Analiz ve tasarım. Bu dokümanda kod yok, sadece karar ve tasarım var.
> **Referans site:** ozdisan.com (analiz edildi: ana sayfa, ürün detay, parametrik arama)
> **Tarih:** Ağustos 2026

---

## 1. Bu Site Aslında Ne?

Özdisan'a "online mağaza" demek eksik kalır. Analiz sonucu ortaya çıkan gerçek yapı:

**Bu bir B2B ağırlıklı, B2C'ye de açık, parametrik katalog + tedarik platformu.**

Sıradan bir e-ticaretten ayıran 6 şey:

| Özellik | Sıradan e-ticaret | Bu site |
|---|---|---|
| Ürün sayısı | Binler | 1M+ (kategori başına 7.900 ürün gördüm) |
| Ürün seçimi | Göz kararı, görselle | **Parametrik filtre** (bit sayısı, frekans, kılıf, besleme voltajı...) |
| Fiyat | Tek fiyat | **Miktar kademeli** + ambalaj tipine göre değişen + müşteriye özel |
| Stok | Var/Yok | Anlık adet + **"gelecek stok"** + üretici teslim süresi |
| Satın alma | Sepet → öde | Sepet **veya** "Fiyat ve Stok Talep Et" (**teklif akışı**) |
| Kimlik | Bireysel üye | Bireysel + **firma hesabı**, satış temsilcisi, müşteri özel ürün kodu |

Bu farkları kaçırırsak elimizde Özdisan değil, jenerik bir Trendyol klonu kalır. Planın omurgası bu 6 madde.

### 1.1 Ürün detay sayfasından çıkardığım veri alanları

STM32F103C8T6 sayfasında gördüklerim (birebir):

- **Kimlik:** Üretici Firma (STM), Üretici Ürün Kodu (MPN), Ürün Açıklaması, Detaylı Açıklama
- **Tedarik:** Üretici Standart Teslim Süresi (5-6 hafta), Gelecek Stok (Yok), Stok (2.366)
- **Sipariş kuralları:** MPQ: 1.500 | MOQ: 1 | Multiple: 1
- **Ambalaj tablosu:** Ambalaj / Miktar / Birim Fiyat / Toplam Fiyat → yani **aynı ürünün ambalaj varyantları var** (Tape&Reel, Cut&Tape, Özdisan Reel, Tube, Tray, Bulk, Box)
- **Belgeler:** Datasheet, görsel ("temsili görsel" uyarısı var)
- **Kullanıcıya özel:** Müşteri Numarası (firmanın kendi stok kodu!), Favorilere Ekle, Karşılaştır
- **İlişkili ürünler — 4 ayrı tip:** Muadil / Benzer / Parametrik / Birlikte Kullanılan
- **Parametrik özellikler:** Kategoriye göre değişen 15+ alan (Montaj Tipi, Kılıf, İşlemci Çekirdek, Bit Sayısı, Bellek Türü, Program Bellek, RAM, EEPROM, Besleme Voltajı, I/O Sayısı, Frekans, Hız, Çalışma Sıcaklığı, Özellikler, RoHS, Ürün Durumu, Paket Tipi)

### 1.2 Liste/filtre sayfasından çıkardıklarım

- Filtre grupları: Belgeler & Medya (Datasheet/Fotoğraf/Video), RoHS, Stok Durumu (Stokta Var / Gelecek Stok Var), Ek Seçenekler (Kampanyalı), Üretici, Ürün Durumu (ACTIVE / NRND / EOL / OBSOLETE), Paket Tipi + **kategoriye özel tüm parametrik alanlar**
- Liste görünümü / Kart görünümü, 25'lik sayfalama, çoklu seçim → toplu karşılaştır / favorile / satın al
- Ürüne özel indirim rozeti (%34 İNDİRİM)
- Kategori altında **SEO içeriği + SSS bloğu** (CMS'ten yönetilen uzun metin)
- Dil (TR/EN) ve para birimi (USD/TRY) anahtarı — URL slug'ı bile dile göre değişiyor (`/ps/mikroislemciler-218` ↔ `/ps/Microcontrollers-218`)

---

## 2. Kapsam Kararı

"Her şeyiyle yapalım" dedin ama 1M ürünlü, 7 çözüm hattı olan bir kurumsal platformun tamamı staj süresine sığmaz. Bu yüzden kapsamı üçe böldüm. **Faz sonunda çalışan bir şey olsun** mantığıyla.

### MUST — bunlar olmazsa proje "Özdisan benzeri" olmaz
1. Çok seviyeli kategori ağacı
2. Ürün kataloğu + üretici + belge/datasheet
3. **Parametrik özellik sistemi ve faceted (yüzeysel sayaçlı) filtreleme**
4. **Ambalaj varyantı + miktar kademeli fiyat + MOQ/MPQ/Multiple kuralları**
5. Stok + gelecek stok
6. Arama (ürün kodu parça eşleşmesi kritik: "STM32F1" yazınca bulmalı)
7. Üyelik / giriş (bireysel + firma)
8. Sepet → sipariş
9. **Teklif talebi (RFQ) akışı** — fiyatı görünmeyen ürünler için
10. Admin paneli (ürün, kategori, özellik, stok, sipariş yönetimi)

### SHOULD — vakit kalırsa, projeyi ciddiye alınır yapar
11. Favoriler + karşılaştırma
12. İlişkili ürünler (muadil/benzer/birlikte kullanılan)
13. Müşteri grubuna / firmaya özel fiyat
14. Müşteri özel ürün kodu eşleştirme
15. TR/EN çoklu dil + USD/TRY çoklu para birimi (TCMB kuru)
16. CMS: statik sayfalar, duyurular, banner, kategori SEO metinleri
17. Stoğa girince haber ver

### COULD — sunumda "vay be" dedirtir
18. **BOM (malzeme listesi) yükleme ve eşleştirme** — CSV/Excel yükle, ürünleri otomatik eşleştir, hepsini sepete at
19. Ödeme entegrasyonu (İyzico/PayTR **sandbox**)
20. Birim çeviriciler / hesaplayıcılar (kapasitans, direnç renk kodu)

### WON'T — bilerek kapsam dışı, dokümana yazıyoruz ki savunabilelim
- Gerçek ERP/stok entegrasyonu
- Gerçek para ile ödeme
- 1M gerçek ürün verisi (aşağıda "veri" bölümüne bak)
- PCB-A üretimi, soğutucu üretimi gibi hizmet iş akışları (sadece tanıtım sayfası)

---

## 3. Teknoloji Yığını

### Backend — kesin
| Katman | Seçim | Neden |
|---|---|---|
| Runtime | .NET 10 / ASP.NET Core Web API | Zaten IlkApi'de bu yığınla çalışıyorsun, sıfırdan öğrenme maliyeti yok |
| ORM | EF Core + Npgsql | Migration disiplini, LINQ ile karmaşık filtre kurgusu |
| Veritabanı | **PostgreSQL 16+** | JSONB, GIN index, `pg_trgm`, full-text search, `ltree` — bu projenin ihtiyacı olan her şey içinde |
| Kimlik | ASP.NET Core Identity + JWT | IlkApi'deki JWT deneyimi doğrudan taşınıyor |
| Doğrulama | FluentValidation | Aynı sebeple |
| Cache | Redis | Kategori ağacı, facet sayaçları, döviz kuru |
| Container | Docker Compose (api + postgres + redis + frontend) | DevOps hedefinle birebir örtüşüyor |
| Test | xUnit + WebApplicationFactory + Testcontainers | IlkApi'de zaten sıradaki adımdı — burada gerçek bir kullanım alanı var |

### Frontend — karar vermen gereken tek büyük şey

| Seçenek | Artı | Eksi |
|---|---|---|
| **ASP.NET Core MVC + Razor** | Tek dil (C#), SSR/SEO bedava, en hızlı ilerleme | Modern filtre UI'ı biraz hantal, CV'de daha az ilgi çeker |
| **Next.js + TypeScript** | Orijinal site zaten Next.js (`/_next/` yolları bunu ele veriyor), SEO mükemmel, CV değeri yüksek | Yeni dil + yeni ekosistem, tek başına yaparsan zaman yer |
| Blazor SSR | C# kalırsın, komponent modeli modern | Ekosistem e-ticaret için zayıf, üçüncü parti UI az |

**Önerim:** Staj tek kişilikse ve süre kısaysa **MVC + Razor + biraz htmx/Alpine.js**. Eğer hoca "modern frontend" bekliyorsa veya süre 3+ ay ise **Next.js**. Bu projede zor kısım frontend değil, arama/filtre motoru — enerjiyi oraya saklamak mantıklı.

### Veri nereden gelecek? (Bunu erken çözmemiz lazım)

Özdisan'ın canlı verisini kazımak (scraping) **yapma** — hem site şartlarına aykırı, hem stajda savunulamaz. Alternatifler:

1. **Sentetik veri üretici** (önerilen): Bogus/Faker ile gerçekçi MPN, üretici, parametre dağılımı üret. 50.000–100.000 ürün yeter, performans sorunlarını görmek için fazlasıyla yeterli.
2. Açık kaynaklı komponent veri setleri (KiCad kütüphaneleri, Octopart benzeri açık API'ler) — lisansına bakarak.
3. Elle hazırlanmış 200–300 gerçek ürünlük "vitrin" seti + gerisi sentetik.

> **Ayrıca:** Fonksiyonel olarak benzer bir site yapmak sorunsuz; ama logo, görsel ve birebir marka kimliğini kopyalama. Kendi isim/renk paletinizi kullanın. Hoca da bunu sorar.

---

## 4. Mimari

```
┌──────────────────────────────────────────────────┐
│  Frontend (MVC/Razor veya Next.js)               │
└───────────────────────┬──────────────────────────┘
                        │ REST / JSON
┌───────────────────────▼──────────────────────────┐
│  API Katmanı  (Controllers, Middleware, Auth)    │
├──────────────────────────────────────────────────┤
│  Uygulama Katmanı                                │
│  KatalogServisi · FiyatlandirmaServisi           │
│  SepetServisi · SiparisServisi · TeklifServisi   │
│  AramaServisi · StokServisi                      │
├──────────────────────────────────────────────────┤
│  Domain Katmanı (Entity + Kural)                 │
│  MOQ/MPQ/Multiple kuralları, fiyat kademesi      │
│  seçimi, sipariş durum makinesi                  │
├──────────────────────────────────────────────────┤
│  Altyapı  (EF Core, Redis, Dosya Depolama)       │
└───────────────────────┬──────────────────────────┘
                        │
        ┌───────────────┴─────────────┐
        │                             │
   ┌────▼─────┐                 ┌─────▼────┐
   │PostgreSQL│                 │  Redis   │
   └──────────┘                 └──────────┘
```

**Proje yapısı** (IlkApi'deki `src/` + `tests/` düzenini koruyoruz):

```
src/
  Katalog.Api/            → Controllers, DI, middleware
  Katalog.Uygulama/       → Servisler, DTO'lar, validator'lar
  Katalog.Alan/           → Entity'ler, enum'lar, domain kuralları
  Katalog.Altyapi/        → DbContext, konfigürasyonlar, migration
tests/
  Katalog.BirimTestleri/
  Katalog.EntegrasyonTestleri/   → WebApplicationFactory + Testcontainers
Directory.Packages.props         → Central Package Management (versiyon çakışması yaşamamak için)
docker-compose.yml
```

**Konvansiyon:** Entity ve property adları Türkçe (PascalCase), PostgreSQL kolonları snake_case (EF naming convention ile otomatik dönüşüm). Enum'lar Türkçe, veritabanında `smallint` olarak saklanır.

---

## 5. Veritabanı Tasarımı

Bu bölüm dokümanın kalbi. Alanları modül modül veriyorum.

### 5.0 Her tabloda ortak olan alanlar

| Alan | Tip | Not |
|---|---|---|
| `id` | `bigint` (identity) | Ürün gibi büyük tablolarda `bigint`, lookup tablolarında `int` |
| `olusturma_tarihi` | `timestamptz` | UTC saklanır, sunumda TR saatine çevrilir |
| `guncelleme_tarihi` | `timestamptz null` | |
| `silindi_mi` | `boolean` | **Soft delete** — sipariş geçmişi bozulmasın diye ürün asla hard-delete edilmez |
| `satir_versiyonu` | `xmin` (concurrency token) | Aynı anda iki admin stok güncellerse çakışmayı yakalar |

---

### 5.1 Katalog

**`Kategoriler`** — kendine referans veren ağaç
| Alan | Tip | Açıklama |
|---|---|---|
| id | int | |
| ust_kategori_id | int null | FK → Kategoriler.id |
| ad_tr / ad_en | varchar(200) | |
| slug_tr / slug_en | varchar(220) | URL: `/c/elektronik-komponentler-1` |
| yol | `ltree` veya varchar | `1.9.52.218` — alt ağaç sorgusunu tek index'le çözer |
| seviye | smallint | 0=kök |
| sira | int | Menüde gösterim sırası |
| ikon_url, gorsel_url | varchar | |
| yaprak_mi | boolean | Yaprak kategorilerde parametrik filtre açılır |
| seo_baslik, seo_aciklama | varchar | |
| seo_icerik_html | text | Kategori altındaki uzun anlatım metni |
| aktif | boolean | |

> **Neden `ltree`?** "Elektronik Komponentler altındaki tüm ürünler" sorgusu recursive CTE ile her seferinde ağacı gezmek zorunda kalır. `ltree` ile `yol <@ '1.9'` şeklinde tek GiST index taraması olur. Alternatif: materialized path (varchar + `LIKE '1.9.%'`).

**`Ureticiler`**
| Alan | Tip |
|---|---|
| id, ad, slug | int / varchar(150) / varchar(160) |
| logo_url, web_sitesi, aciklama | varchar / text |
| yetkili_distributor_mu | boolean |
| aktif | boolean |

**`Urunler`** — ana tablo
| Alan | Tip | Açıklama |
|---|---|---|
| id | bigint | |
| uretici_id | int | FK |
| kategori_id | int | FK (yaprak kategori) |
| uretici_urun_kodu | varchar(120) | MPN — `STM32F103C8T6` |
| normalize_kod | varchar(120) | Aramada kullanılacak: boşluk/tire/nokta temizlenmiş, büyük harf |
| kisa_aciklama | varchar(400) | "IC-32F103C MCU 32BIT 64KB FLASH 48LQFP" |
| detayli_aciklama_tr / _en | text | |
| ana_gorsel_url | varchar | |
| gorsel_temsili_mi | boolean | Sitedeki "*Bu ürün görseli temsilidir" notu |
| urun_durumu | smallint | enum: Aktif / NRND / OmruSonu / Kullanimdan Kalkti |
| rohs_durumu | smallint | enum: Belgeli / Belgesiz / Bilinmiyor |
| montaj_tipi | smallint | enum: SMT / THT / Yok |
| uretici_teslim_suresi_hafta_min/max | smallint | "5-6 Hafta" |
| kampanyali_mi | boolean | Filtre için denormalize |
| ozellikler | `jsonb` | Parametrik değerlerin denormalize kopyası (aşağıda açıklıyorum) |
| arama_vektoru | `tsvector` | Full-text için generated column |
| goruntulenme_sayisi | int | Popüler ürünler için |
| aktif | boolean | |

**Index'ler:**
- `UNIQUE (uretici_id, uretici_urun_kodu)` — aynı üreticide aynı MPN iki kez olamaz
- `GIN (normalize_kod gin_trgm_ops)` — "STM32F1" yazınca bulunması için (LIKE '%...%' ancak böyle hızlı olur)
- `GIN (arama_vektoru)` — açıklama içinde arama
- `GIN (ozellikler jsonb_path_ops)` — parametrik filtre
- `BTREE (kategori_id, aktif) INCLUDE (uretici_id)`

**`UrunGorselleri`** — id, urun_id, url, sira, alt_metin
**`UrunDokumanlari`** — id, urun_id, tip (enum: Datasheet/Sertifika/UygulamaNotu/3DModel/Video), url, dil, dosya_boyutu_kb, baslik

**`IliskiliUrunler`** — dört ilişki tipini tek tabloda tutuyoruz
| Alan | Tip |
|---|---|
| urun_id, iliskili_urun_id | bigint |
| iliski_tipi | smallint — enum: Muadil / Benzer / Parametrik / BirlikteKullanilan |
| sira | int |

`PK (urun_id, iliskili_urun_id, iliski_tipi)`. Muadil ilişkisi **çift yönlü** yazılmalı (A muadili B ise B de A'nın muadilidir) — bunu servis katmanında garanti et.

---

### 5.2 Parametrik Özellik Sistemi ⭐ (projenin en kritik tasarım kararı)

Problem: Mikroişlemcinin "Bit Sayısı" alanı var, direncin yok; direncin "Tolerans" alanı var, mikroişlemcinin yok. Kategori başına 15-20 dinamik alan.

Üç yaklaşım var, ben **hibrit** öneriyorum:

| Yaklaşım | Artı | Eksi |
|---|---|---|
| Her kategoriye ayrı tablo | En hızlı, tip güvenli | 300 kategori = 300 tablo. Sürdürülemez. |
| Saf EAV | Esnek, filtre doğru çalışır | Ürün detayı için 20 satır JOIN, yavaş okuma |
| Saf JSONB | Okuma çok hızlı, tek satır | Facet sayacı ve sayısal aralık filtresi zorlaşır |
| **Hibrit (EAV + JSONB kopya)** | Filtre EAV'dan, okuma JSONB'den | Çift yazma — tutarlılığı serviste sağlamak gerek |

**`OzellikTanimlari`** — tüm parametrelerin sözlüğü
| Alan | Tip | Açıklama |
|---|---|---|
| id | int | |
| kod | varchar(80) | `bit_sayisi`, `calisma_sicakligi` — URL query'de kullanılır |
| ad_tr / ad_en | varchar(150) | "Bit Sayısı" / "Bit Count" |
| veri_tipi | smallint | enum: Metin / Sayi / Aralik / MantiksalDeger / Secim |
| birim | varchar(20) null | `MHz`, `kB`, `V`, `°C` |
| filtrelenebilir_mi | boolean | |
| siralanabilir_mi | boolean | |
| gosterim_tipi | smallint | enum: OnayKutusu / AralikKaydiraci / AcilirListe |

**`KategoriOzellikleri`** — hangi kategoride hangi filtreler görünür
| Alan | Tip |
|---|---|
| kategori_id, ozellik_tanim_id | int |
| sira | int |
| zorunlu_mu | boolean |

`PK (kategori_id, ozellik_tanim_id)`. **Bir kategori sayfasının facet listesi doğrudan bu tablodan üretilir.**

**`UrunOzellikDegerleri`** — filtrelemenin çalıştığı yer
| Alan | Tip | Açıklama |
|---|---|---|
| urun_id | bigint | |
| ozellik_tanim_id | int | |
| deger_metin | varchar(300) null | "ARM Cortex-M3" |
| deger_sayi | `numeric(20,6)` null | 72 (MHz) — sayısal filtre/sıralama buradan |
| deger_min / deger_max | numeric null | "2 to 3.6 V" → min=2, max=3.6 |
| ham_deger | varchar(300) | Ekranda gösterilecek orijinal metin |

`PK (urun_id, ozellik_tanim_id)`, ek index: `(ozellik_tanim_id, deger_metin)` ve `(ozellik_tanim_id, deger_sayi)`.

Ve `Urunler.ozellikler` JSONB'de aynı verinin okuma kopyası:
`{"bit_sayisi": "32 Bit", "frekans": 72, "kilif": "LQFP48 (7x7mm)"}`

> **Neden ikisi birden?** Ürün detay sayfası tek satır okuyup 20 özelliği JSONB'den basar — JOIN yok. Filtre sayfası ise `UrunOzellikDegerleri` üzerinden çalışır çünkü orada "Frekans ≥ 48 MHz" gibi tipli sorgular ve **facet sayacı** ("ARM Cortex-M3 (1.204)") lazım. JSONB'de bunu yapmak mümkün ama okunabilirliği ve performansı kötü.

**Ölçek uyarısı:** ~100.000 ürüne kadar PostgreSQL bu işi tek başına yapar. Milyon mertebesinde ve 15 eşzamanlı facet sayacında PostgreSQL yorulur — o noktada **Meilisearch veya Elasticsearch** devreye girer. Planda bunu "Faz 8 opsiyonel" olarak tutuyoruz, ama tasarımı şimdiden buna uygun yapıyoruz (arama servisini interface arkasına al, sonra implementasyonu değiştir).

---

### 5.3 Fiyat, Stok ve Ambalaj

**`UrunAmbalajlari`** — aynı ürünün satış varyantları
| Alan | Tip | Açıklama |
|---|---|---|
| id | bigint | |
| urun_id | bigint | FK |
| ambalaj_tipi | smallint | enum: TapeReel / CutTape / OzelReel / Tube / Tray / Bulk / Box |
| ad | varchar(80) | "Tape & Reel (TR)" |
| mpq | int | Minimum paket miktarı (1.500) |
| moq | int | Minimum sipariş miktarı (1) |
| katlama_miktari | int | "Multiple" — sipariş bunun katı olmalı |
| stok_miktari | int | |
| gelecek_stok_miktari | int | |
| gelecek_stok_tarihi | date null | |
| varsayilan_mi | boolean | |

> **Domain kuralı (sepete eklerken kontrol edilecek):**
> `miktar >= moq` **VE** `miktar % katlama_miktari == 0`. Kullanıcı 7 girerse ve multiple 5 ise → ya reddet ya 10'a yuvarla. Bu kuralı **Domain katmanında** tut, controller'da değil.

**`FiyatKademeleri`** — miktar arttıkça birim fiyat düşer
| Alan | Tip | Açıklama |
|---|---|---|
| id | bigint | |
| urun_ambalaj_id | bigint | FK |
| min_miktar | int | 1 / 10 / 100 / 1000 |
| max_miktar | int null | null = üst sınırsız |
| birim_fiyat | **`numeric(18,6)`** | ⚠️ Aşağıdaki nota bak |
| para_birimi | char(3) | USD / TRY / EUR |
| musteri_grubu_id | int null | null = herkese açık liste fiyatı |
| gecerlilik_baslangic / _bitis | timestamptz null | |

> ⚠️ **`numeric(18,6)` — 2 ondalık değil!** Pasif komponentlerde birim fiyat 0,0234 USD gibi olabilir. `decimal(18,2)` kullanırsan 10.000 adetlik siparişte yüzlerce lira hata yaparsın. Ve **asla `float`/`double` kullanma** — para her zaman `numeric`/`decimal`.

**`Indirimler`**
| Alan | Tip |
|---|---|
| id, ad | |
| hedef_tipi | smallint — enum: Urun / Kategori / Uretici / MusteriGrubu |
| hedef_id | bigint |
| indirim_tipi | smallint — enum: Yuzde / SabitTutar |
| deger | numeric(10,4) |
| baslangic_tarihi / bitis_tarihi | timestamptz |
| aktif | boolean |

**`DovizKurlari`** — TCMB'den günlük çekilir (basit bir background service)
| Alan | Tip |
|---|---|
| tarih | date |
| para_birimi | char(3) |
| alis / satis | numeric(18,6) |

`PK (tarih, para_birimi)`.

**`StokBildirimleri`** — "gelince haber ver"
urun_ambalaj_id, kullanici_id (veya eposta), istenen_miktar, bildirildi_mi, olusturma_tarihi

---

### 5.4 Kullanıcı, Firma ve B2B

**`Kullanicilar`** — ASP.NET Identity `AspNetUsers` genişletilmiş hali
ad, soyad, telefon, firma_id (null → bireysel), varsayilan_para_birimi, tercih_edilen_dil, eposta_dogrulandi_mi, son_giris_tarihi

**`Firmalar`**
| Alan | Tip |
|---|---|
| id, unvan | |
| vergi_dairesi, vergi_no | varchar |
| musteri_grubu_id | int FK |
| satis_temsilcisi_id | bigint FK → Kullanicilar |
| kredi_limiti | numeric(18,2) |
| odeme_vadesi_gun | int |
| onay_durumu | smallint — enum: Beklemede / Onaylandi / Reddedildi |

> **Neden onay durumu?** Firma hesabı açan herkese vadeli alım ve özel fiyat veremezsin. Kayıt → admin onayı → B2B fiyat görünür. Gerçek hayattaki akış bu.

**`MusteriGruplari`** — id, ad, varsayilan_iskonto_yuzdesi
Fiyat kademeleri bu gruba bağlanarak müşteriye özel fiyat kurulur.

**`Adresler`** — kullanici_id / firma_id, tip (Fatura/Teslimat), baslik, ad_soyad, telefon, il, ilce, acik_adres, posta_kodu, varsayilan_mi

**`MusteriUrunKodlari`** — ürün sayfasındaki "Müşteri Numarası" alanının karşılığı
firma_id, urun_id, musteri_kodu, aciklama · `UNIQUE (firma_id, urun_id)`
> Firma kendi stok kodunu ("R-0042") sisteme tanıtır, sipariş çıktısında kendi kodunu görür. B2B'de çok istenen bir özellik, ucuz da geliyor.

**`Favoriler`** — kullanici_id, urun_id, olusturma_tarihi
**`KarsilastirmaListeleri`** — kullanici_id/oturum_id, urun_id (max 4-5 ürün sınırı serviste)

**Roller:** `Musteri`, `FirmaYoneticisi`, `SatisTemsilcisi`, `Editor`, `Admin`

---

### 5.5 Sepet ve Sipariş

**`Sepetler`** — id, kullanici_id null, oturum_anahtari (misafir için çerez), para_birimi, son_islem_tarihi
> Giriş yapınca misafir sepeti kullanıcı sepetiyle **birleştirilmeli** (aynı ürün varsa miktarları topla). Bu detayı atlarsan sepet kaybolur, en sık yaşanan bug.

**`SepetKalemleri`** — sepet_id, urun_ambalaj_id, miktar, eklenme_tarihi

**`Siparisler`**
| Alan | Tip | Açıklama |
|---|---|---|
| id, siparis_no | bigint / varchar(20) — `SIP-2026-000123` |
| kullanici_id, firma_id | |
| durum | smallint — enum aşağıda |
| ara_toplam, indirim_tutari, kdv_tutari, kargo_ucreti, genel_toplam | numeric(18,4) |
| para_birimi | char(3) |
| kur | numeric(18,6) — **sipariş anındaki kur** |
| fatura_adresi | `jsonb` — **snapshot** |
| teslimat_adresi | `jsonb` — snapshot |
| musteri_notu | text |
| olusturma_tarihi | timestamptz |

**`SiparisKalemleri`**
urun_id, urun_ambalaj_id, **urun_kodu_snapshot**, **urun_adi_snapshot**, **ambalaj_adi_snapshot**, miktar, birim_fiyat, satir_toplami, kdv_orani

> ⚠️ **Snapshot kuralı — bunu atlamayın:** Sipariş kalemine ürünün adını, kodunu ve fiyatını **kopyalayarak** yaz. Ürün 6 ay sonra yeniden adlandırılır veya zamlanırsa eski fatura bozulmasın. Adres için de aynısı geçerli, o yüzden JSONB snapshot.

**Sipariş durum makinesi:**
```
Olusturuldu → OdemeBekliyor → Onaylandi → Hazirlaniyor
   → KargoyaVerildi → TeslimEdildi
   ↘ IptalEdildi (Onaylandi öncesine kadar)
   ↘ IadeEdildi (TeslimEdildi sonrası)
```
Geçerli geçişleri Domain katmanında tabloya yaz, `if` yığını yapma.

**`SiparisDurumGecmisi`** — siparis_id, onceki_durum, yeni_durum, degistiren_kullanici_id, aciklama, tarih
**`Odemeler`** — siparis_id, yontem (Havale/KrediKarti/Vadeli), saglayici, saglayici_referans, tutar, durum, ham_yanit `jsonb`
**`Kargolar`** — siparis_id, kargo_firmasi, takip_no, gonderim_tarihi, teslim_tarihi

---

### 5.6 Teklif (RFQ) — B2B'nin kalbi

Ürün sayfasında gördüğüm "Bu ürünün fiyat ve stok bilgisi talebiniz sonrasında müşteri temsilcilerimizden biri tarafından paylaşılacaktır" cümlesi bu modülü zorunlu kılıyor.

**`TeklifTalepleri`**
| Alan | Tip |
|---|---|
| id, talep_no | `TKL-2026-000045` |
| kullanici_id, firma_id | |
| durum | smallint — enum: Yeni / Inceleniyor / TeklifVerildi / Kabul / Red / SuresiDoldu |
| satis_temsilcisi_id | bigint null |
| gecerlilik_tarihi | date null |
| musteri_notu, temsilci_notu | text |

**`TeklifKalemleri`**
| Alan | Tip | Açıklama |
|---|---|---|
| teklif_talep_id | bigint | |
| urun_id | bigint **null** | Katalogda olmayan ürün de talep edilebilir |
| serbest_urun_kodu | varchar(120) null | O durumda müşterinin yazdığı kod |
| miktar | int | |
| hedef_birim_fiyat | numeric(18,6) null | Müşterinin beklentisi |
| teklif_edilen_birim_fiyat | numeric(18,6) null | Temsilcinin cevabı |
| teklif_edilen_teslim_suresi_gun | int null | |

> Teklif kabul edilince **siparişe dönüşür** — `Siparisler.kaynak_teklif_id` alanı ekleyerek izini koru.

---

### 5.7 BOM (Malzeme Listesi) — opsiyonel ama etkileyici

**`MalzemeListeleri`** — id, kullanici_id/firma_id, ad, aciklama, olusturma_tarihi
**`MalzemeListesiKalemleri`**
satir_no, aranan_kod, referanslar ("R1,R2,R5"), miktar, eslesen_urun_id null, eslesme_durumu (enum: TamEslesme / OlasiEslesme / Bulunamadi), eslesme_skoru

Akış: CSV/Excel yükle → her satır için `normalize_kod` üzerinden trigram benzerlik araması → eşleşenleri göster, belirsizleri kullanıcıya sordur → hepsini sepete ekle veya toplu teklif talebi oluştur.

---

### 5.8 İçerik (CMS) ve Sistem

| Tablo | Alanlar |
|---|---|
| `Sayfalar` | slug, baslik_tr/en, icerik_html_tr/en, seo alanları, yayinda_mi |
| `Sozlesmeler` | tip (KVKK/Gizlilik/MesafeliSatis/Uyelik), **versiyon**, icerik, yururluk_tarihi |
| `SozlesmeOnaylari` | kullanici_id, sozlesme_id, onay_tarihi, ip_adresi ← **KVKK için gerekli** |
| `Duyurular` | baslik, icerik, gorsel, link, baslangic/bitis, sira |
| `Bannerlar` | konum (enum), gorsel_url, link, sira, aktif |
| `BlogYazilari` | baslik, slug, ozet, icerik, kapak_gorsel, yayin_tarihi, kategori |
| `SSS` | kategori_id null, soru, cevap, sira |
| `EBultenAboneleri` | eposta, onaylandi_mi, abonelik_tarihi, iptal_tarihi |
| `AramaGecmisi` | terim, sonuc_sayisi, kullanici_id null, tarih ← otomatik tamamlama ve "aradı bulamadı" raporu için |
| `DenetimKayitlari` | tablo_adi, kayit_id, islem, eski_deger jsonb, yeni_deger jsonb, kullanici_id, tarih |

> **Sözleşme versiyonlama** küçük bir detay gibi görünür ama KVKK açısından "kullanıcı hangi metnin hangi versiyonunu ne zaman onayladı" sorusunun cevabı olmak zorunda. Stajda sorulursa artı puan.

---

## 6. API Yüzeyi (taslak)

```
# Katalog
GET  /api/kategoriler/agac
GET  /api/kategoriler/{slug}
GET  /api/kategoriler/{id}/filtreler         → facet tanımları + sayaçlar
GET  /api/urunler                            → filtre + sayfalama + sıralama
GET  /api/urunler/{id}
GET  /api/urunler/{id}/iliskili?tip=muadil
GET  /api/urunler/{id}/fiyatlar              → tüm ambalaj + kademe matrisi
GET  /api/ureticiler
GET  /api/arama/oneri?q=stm32                → otomatik tamamlama

# Hesap
POST /api/hesap/kayit · /giris · /token-yenile · /sifre-sifirla
GET  /api/hesap/profil · /adresler · /favoriler
POST /api/firmalar/basvuru

# Sepet & Sipariş
GET|POST|PUT|DELETE /api/sepet/kalemler
POST /api/siparisler                         → sepetten sipariş oluştur
GET  /api/siparisler · /api/siparisler/{no}

# Teklif
POST /api/teklifler
GET  /api/teklifler · /api/teklifler/{no}
POST /api/teklifler/{no}/kabul

# BOM
POST /api/malzeme-listeleri/yukle
POST /api/malzeme-listeleri/{id}/sepete-aktar

# Admin (rol korumalı)
/api/admin/urunler · /kategoriler · /ozellikler · /stok · /siparisler · /teklifler · /icerik
```

**Ürün listeleme query örneği:**
`/api/urunler?kategori=218&uretici=STM,TEXAS&ozellik.bit_sayisi=32+Bit&ozellik.frekans_min=48&stokta=true&sirala=fiyat_artan&sayfa=2&boyut=25`

---

## 7. Yol Haritası

| Faz | İçerik | Tahmini süre | Çıktı |
|---|---|---|---|
| **0** | Analiz + bu doküman + ERD çizimi | 3-5 gün | Onaylı tasarım |
| **1** | Proje iskeleti, EF Core entity'leri, migration, seed veri üretici | 1 hafta | `docker compose up` ile ayağa kalkan, 50k ürünlü DB |
| **2** | Katalog API: kategori ağacı, ürün detay, listeleme, **faceted filtre**, arama | 2 hafta | Postman'de çalışan katalog |
| **3** | Kimlik: Identity + JWT, kayıt/giriş, firma başvurusu, adres, favori | 1 hafta | |
| **4** | Fiyatlandırma + sepet: kademeli fiyat, MOQ/MPQ kuralları, misafir sepeti birleştirme | 1 hafta | |
| **5** | Sipariş akışı + durum makinesi + teklif (RFQ) modülü | 1,5 hafta | Uçtan uca satın alma |
| **6** | Admin paneli (CRUD + stok + sipariş/teklif yönetimi) | 2 hafta | |
| **7** | Frontend (fazlarla paralel ilerlemeli, Faz 2'den sonra başla) | 3-4 hafta | |
| **8** | Docker Compose finali, CI (GitHub Actions), entegrasyon testleri, seed/migrate otomasyonu | 1 hafta | **DevOps hedefin için en değerli faz** |
| **9** | Opsiyonel: BOM, i18n, Meilisearch, ödeme sandbox | — | |

**Kritik sıralama notu:** Faz 2 bitmeden frontend'e başlama. Filtre API'sinin şekli frontend'in tamamını belirliyor; sonradan değişirse iki kere yazarsın.

---

## 8. Riskler ve Erken Kararlar

| # | Risk | Etki | Önlem |
|---|---|---|---|
| 1 | **Faceted filtre performansı** — 15 filtre + sayaç, 50k+ ürün | Yüksek | Faz 1'de gerçekçi hacimde seed veri üret ve Faz 2'de `EXPLAIN ANALYZE` ile ölç. Sonra değil, o an. |
| 2 | Parametrik model yanlış seçilirse | Yüksek | Hibrit modeli Faz 1'de küçük ölçekte doğrula, geri dönmek pahalı |
| 3 | Veri kaynağı belirsizliği | Orta | Faz 1'de sentetik üreticiyi bitir, sonra takılma |
| 4 | Kapsam şişmesi (7 çözüm hattı, dergi, hesaplayıcılar...) | Yüksek | MUST listesi dışına çıkma; SHOULD/COULD sadece Faz 8 sonrası |
| 5 | Frontend seçimi geciktirilirse | Orta | Bu hafta karar ver |
| 6 | Ondalık/para tipi hatası | Orta | `numeric(18,6)`, asla float. Faz 1'de sabitle. |
| 7 | Tek kişilik ekipte 12+ haftalık plan | Orta | Faz 5 sonunda "gösterilebilir ürün" olacak şekilde kurgulandı; süre yetmezse Faz 6-7 kısılır |

---

## 9. Sıradaki Adım

Faz 0'ı kapatmak için gereken üç şey:

1. **Frontend kararı** (MVC+Razor mı, Next.js mi?)
2. **Kapsam onayı** — MUST listesini staj hocasına göster, eklemek/çıkarmak istediği var mı?
3. **ERD çizimi** — bu dokümandaki tabloların görsel şeması (dbdiagram.io veya Mermaid)

Bunlar netleşince Faz 1'e geçip entity'leri ve migration'ları yazmaya başlayabiliriz.
