# Backend Düzeltme Raporu — ÇEVİK Elektronik

**Tarih:** 20 Ağustos 2026
**Kapsam:** Bildirilen 13 sorunun giderilmesi + denetim sırasında ortaya çıkan ek hatalar
**Doğrulama:** 112 otomatik test (75 birim + 37 entegrasyon), tamamı geçiyor. Ayrıca canlı API üzerinde uçtan uca manuel doğrulama.

---

## 1. Özet

Bildirilen 13 maddenin tamamı kapatıldı. Ancak denetim sırasında, listede olmayan ve **frontend'e geçişi gerçekten engelleyecek iki kritik hata** daha bulundu:

1. **Gölge yabancı anahtar kolonları** — 4 tabloda ikişer FK kolonu vardı; sepete ürün eklemek her seferinde HTTP 500 veriyordu.
2. **Yapılandırmanın erken okunması** — Token üreten servis ile doğrulayan middleware farklı yapılandırma anlık görüntülerinden besleniyordu; entegrasyon testleri bunu kanıtladı (tüm kimlik doğrulama uçları 401).

Bu ikisi düzeltilmeden frontend yazılsaydı, "sepete ekle" ve "giriş yap" akışları hiç çalışmazdı.

Ayrıca listede yer almayan 11 hata daha giderildi (bkz. Bölüm 3).

---

## 2. Bildirilen 13 madde

Her madde, **düzeltmeden önceki gerçek kod durumu** ile birlikte veriliyor. Bir kısmı önceki oturumda kısmen düzeltilmişti; hangi kısmının hâlâ açık olduğu ayrıca belirtildi.

### 1. Parametrik filtreleme çalışmıyor

**Bulunan durum:** Filtreler artık sorguya uygulanıyordu, ancak iki gerçek kusur vardı:
- Facet sayaçları **konjonktif** hesaplanıyordu: bir seçenek seçilince aynı grubun diğer seçenekleri 0'a düşüyor, kullanıcı seçimini genişletemiyordu.
- Kategori filtresi `KategoriId == x` karşılaştırmasıydı; ürünler yaprak kategorilere bağlı olduğu için **üst kategoriye tıklandığında hiç ürün gelmiyordu**.

**Yapılan:** `KatalogServisi` yeniden yazıldı.
- Facet sayacı hesaplanırken **o özelliğin kendi seçimi filtreden çıkarılır**, diğer özelliklerinki dahil edilir.
- Kategori seçimi `ltree` yolu üzerinden **tüm alt ağacı** kapsar.
- Sayfa boyutu 1–100 arasına sınırlandı (`?sayfaBoyutu=100000` ile tüm katalog çekilemez).

**Doğrulama (canlı API):**

| Sorgu | Sonuç |
|---|---|
| Mikrodenetleyiciler (filtresiz) | 416 ürün, 9 facet grubu |
| `cekirdek = ARM Cortex-M3` | **65** ürün — facet sayacıyla birebir aynı |
| `cekirdek` + `bit_sayisi = 32 Bit` | 16 ürün |
| Seçim sonrası aynı grubun seçenekleri | **7 seçenek korunuyor** (0'a düşmüyor) |
| Üst kategori "Yarı İletkenler" | 1.664 ürün (4 alt kategorinin toplamı) |

---

### 2. Facet verisi yok

**Bulunan durum:** `urun_ozellik_degerleri` boş değildi (3.343 satır), ama katalog gösterilebilir durumda değildi: yalnızca **2 özellik tanımı** vardı, ikisi de sayısal; "Dirençler" kategorisinin hiç parametresi yoktu.

**Yapılan:** Tohum verisi baştan yazıldı.

| | Önce | Sonra |
|---|---|---|
| Özellik tanımı | 2 | **18** |
| Kategori–özellik eşleşmesi | 2 | **49** |
| Ürün özellik değeri | 3.343 | **17.941** |
| Kategori | 3 (düz) | **16** (4 kök + 12 yaprak, `ltree`) |

---

### 3. JWT ile giriş bozuk

**Bulunan durum:** `Issuer`/`Audience` artık token'a yazılıyordu, ama iki ayrı sorun vardı:

- Yedek varsayılanlar uyuşmuyordu: üretici tarafta `CevikAPI`/`CevikApp`, doğrulayıcı tarafta `CevikApi`/`CevikUI`. Yapılandırma dosyası olmadığı an tüm girişler bozulurdu.
- **Daha ciddisi:** `Program.cs` yapılandırmayı en üst seviyede *doğrudan* okuyordu. Bu, sonradan eklenen yapılandırma kaynaklarını kaçırıyor; token'ı üreten servis `IOptions`'tan güncel değeri alırken doğrulayan middleware eski değerde kalıyordu. Entegrasyon testleri bunu kanıtladı: kimlik doğrulama gerektiren **tüm uçlar 401** dönüyordu.

**Yapılan:**
- `JwtAyarlari` tek kaynak; `AddOptions().Bind().ValidateOnStart()` ile açılışta doğrulanıyor (32 karakterden kısa anahtarda uygulama hiç başlamıyor).
- `JwtBearerOptions`, token üreten servisle **aynı `IOptions` örneğinden** besleniyor.
- Veritabanı bağlantı dizesi de `IServiceProvider` üzerinden, yani nihai yapılandırmadan okunuyor.

---

### 4. Admin açığı — `admin@cevik.com` ile kaydolan Admin oluyor

**Bulunan durum:** Kayıt bu adresle engellenmişti, **ama rol hâlâ e-posta karşılaştırmasıyla veriliyordu**:

```csharp
if (user.Eposta == "admin@cevik.com")
    claims.Add(new Claim(ClaimTypes.Role, "Admin"));
```

Veritabanında rol alanı yoktu. Bu bir arka kapıydı: e-posta adresi başka bir yolla (seed, e-posta değişikliği, veri aktarımı) sisteme girse yetki otomatik açılırdı.

**Yapılan:**
- `KullaniciRolu` enum'u (`Musteri`, `FirmaYoneticisi`, `SatisTemsilcisi`, `Editor`, `Admin`) ve `kullanicilar.rol` kolonu eklendi.
- Rol talebi **veritabanından** üretiliyor.
- Kayıt akışı her zaman `Musteri` verir; yükseltme yalnızca `PUT /api/yonetim/kullanici-rol` ile yapılır.
- **Son yönetici koruması:** Sistemdeki tek Admin'in rolü düşürülemez.
- Yönetici hesabı yapılandırmadan (`Yonetici:Eposta` / `Yonetici:Parola`) tek seferlik seed edilir; parola verilmezse hesap oluşturulmaz ve uyarı loglanır.

---

### 5. Parolalar güvenli saklanmıyor

**Bulunan durum:** Zaten `PasswordHasher<Kullanici>` (PBKDF2, tuzlu) kullanılıyordu — bu madde önceki oturumda kapatılmış.

**Ek olarak yapılan:**
- **Zamanlama saldırısı önlemi:** Kullanıcı bulunamadığında da sahte bir hash doğrulanıyor; aksi hâlde yanıt süresi "bu e-posta kayıtlı mı" sorusunu ele veriyordu.
- **Otomatik yeniden hash:** Algoritma güncellenirse giriş anında parola sessizce yeni formata taşınıyor.
- Test: aynı parolayla kaydolan iki kullanıcının **farklı hash** aldığı (tuz kanıtı) ve hash uzunluğunun tuzsuz SHA-256'yı (64 hex) aştığı doğrulanıyor.

---

### 6. Docker yapılandırması

**Bulunan durum:** Ortam değişkeni adları düzeltilmişti. **Ancak `Dockerfile` hiç derlenmiyordu:** `Directory.Build.props` ve `Directory.Packages.props` restore'dan önce kopyalanmıyordu. Merkezî paket yönetiminde `PackageReference`'lar versiyonsuz olduğu için `dotnet restore` NU1604 ile hata verirdi.

Derlemeyi denerken **iki hata daha** çıktı:

- **`.dockerignore` yoktu.** `COPY src/ src/` adımı host'un `obj/` klasörlerini de imaja taşıyordu. İçlerindeki `project.assets.json` Windows yollarına göre üretildiği için container'daki restore sonucunu eziyor ve publish `NETSDK1064: Package Microsoft.CodeAnalysis.Analyzers ... was not found` ile düşüyordu.
- **`aspnet` imajında `wget` yok.** Healthcheck komutu `/bin/sh: wget: not found` veriyor, container sonsuza kadar `unhealthy` kalıyordu — uygulama sorunsuz çalışsa bile `depends_on: service_healthy` bekleyen her şey takılırdı.

**Yapılan:**
- CPM dosyaları restore'dan önce kopyalanıyor; ayrı restore katmanı önbelleği koruyor.
- `.dockerignore` eklendi (`bin/`, `obj/`, `.git/`, `.env`, `tests/`, dokümanlar).
- Final imaja `curl` kuruldu; healthcheck `curl -fsS .../saglik` kullanıyor.
- Container **root olarak çalışmıyor** (uid 1001).
- Tüm ticari ayarlar (`Ticari__*`), CORS ve yönetici bilgileri compose üzerinden veriliyor.

**Doğrulama:** `docker compose up -d` ile dört servis de ayakta; `cevik-api` **healthy**. Container üzerinden (`:5000`) katalog 416 ürün + 9 facet grubu, admin girişi ve yetki denetimi çalışıyor.

---

### 7. Migration otomatik uygulanmıyor

**Bulunan durum:** `await context.Database.MigrateAsync();` satırı aktifti — önceki oturumda düzeltilmiş.

**Ek olarak yapılan:** `Baslangic:MigrationAtla` anahtarı eklendi; testlerin ve özel senaryoların migration'ı atlayabilmesi için.

---

### 8. Testler boş

**Bulunan durum:** Birim testleri 15 gerçek doğrulayıcı testine dönüşmüştü; **entegrasyon testi hâlâ boş şablondu** (`public void Test1() { }`).

**Yapılan:**

| Paket | Test | Kapsam |
|---|---|---|
| `Cevik.BirimTestleri` | **75** | MOQ/MPQ/katlama, kademeli fiyat seçimi, sipariş durum makinesi, kod normalizasyonu, 19 doğrulayıcı |
| `Cevik.EntegrasyonTestleri` | **37** | Katalog + facet (13), güvenlik/yetki (10), sepet + sipariş (8) — **gerçek PostgreSQL** üzerinde |

Entegrasyon testleri **Testcontainers** ile izole bir PostgreSQL 17 konteyneri kaldırır. InMemory sağlayıcı bilerek kullanılmadı: bu projede test edilmesi gereken şeylerin çoğu Postgres'e özgü (`ILIKE` + trigram, `ltree`, `jsonb`, `xmin`). InMemory bunları çalıştırmaz ve yeşil test yanlış güven verir. Redis ise bellek içi önbellekle değiştirilir.

---

### 9. FluentValidation eksik

**Bulunan durum:** 5 doğrulayıcı vardı (giriş, kayıt, firma başvurusu, sepete ekle, sipariş oluştur).

**Yapılan:** **19 doğrulayıcıya** çıkarıldı. Eklenenler: adres, sepet güncelleme, teklif, ürün ekleme/güncelleme, stok, fiyat kademesi, kategori, üretici, özellik tanımı, firma onayı, sipariş durumu, kullanıcı rolü, blog.

Örnek yakalanan hatalar: ters fiyat kademesi (`MaxMiktar < MinMiktar`), geçmiş tarihli "gelecek stok", büyük harf içeren slug, ürün kodunda enjeksiyon karakteri, tanımsız rol değeri.

---

### 10. Admin silme işlemi fiziksel siliyor

**Bulunan durum:** Soft delete'e geçilmişti — **ama hiçbir global sorgu filtresi yoktu.** Yani "silinen" ürün `silindi_mi = true` işaretleniyor, katalogda görünmeye devam ediyordu. Düzeltme etkisizdi.

**Yapılan:**
- `VarlikTabani`'ndan türeyen **her varlığa** otomatik `silindi_mi = false` filtresi.
- Kendi `SilindiMi` alanı olmayan 5 bağlı tabloya (`IliskiliUrun`, `KategoriOzelligi`, `UrunOzellikDegeri`, `Favori`, `Karsilastirma`) ebeveynin filtresini devralan açık filtreler — bu aynı zamanda EF'in "required end of a relationship" uyarılarını da temizledi.
- Admin `?silinmisleriGoster=true` ile silinmişleri görebiliyor; `POST /api/yonetim/urun/{id}/geri-al` ile geri alabiliyor.
- Kategori/üretici silme, bağlı ürün veya alt kategori varsa engelleniyor (öksüz kayıt oluşmasın).

**Doğrulama (canlı):** 416 ürün → sil → **415** → DB'de satır duruyor (`silindi_mi = t`) → detay ucu **404** → geri al → **416**.

---

### 11. Firma başvurusunda erken yetki

**Bulunan durum:** `FirmaYetkilisiMi = false` yazılıyordu — önceki oturumda düzeltilmiş.

**Ek olarak yapılan:**
- Onay/ret, firmaya bağlı **tüm kullanıcıların** yetkisini ve rolünü günceller (`Musteri` ↔ `FirmaYoneticisi`). Admin veya satış temsilcisi rolleri korunur.
- Her onay işlemi `denetim_kayitlari` tablosuna yazılır.
- Aynı kullanıcı ikinci kez başvuramaz.
- `GET /api/yonetim/firmalar/bekleyen` eklendi.

---

### 12. Redis önbelleği temizlenmiyor

**Bulunan durum:** **Hâlâ bozuktu.** `IDistributedCache`, `InstanceName = "Cevik_"` ön ekini otomatik ekler. Servis `"kategori_agaci"` anahtarıyla yazıyordu (gerçek anahtar: `Cevik_kategori_agaci`), controller ise `"Cevik_kategori_agaci"` anahtarını silmeye çalışıyordu — yani **`Cevik_Cevik_kategori_agaci`**. Önbellek hiç boşalmıyordu; kategori değişikliği 24 saat görünmüyordu.

**Yapılan:**
- Anahtarlar `OnbellekAnahtarlari` sabit sınıfında toplandı; iki taraf aynı sabiti kullanıyor.
- Eksik olan `PUT /api/yonetim/kategori/{id}` ucu eklendi (kategori adı/sırası hiç güncellenemiyordu).
- Ekleme, güncelleme ve silme sonrası önbellek temizleniyor.

**Doğrulama (canlı):** Redis'te tek anahtar `Cevik_kategori_agaci` → kategori güncellendi → anahtar **silindi** → ağaç yeni adı **anında** gösterdi.

---

### 13. `walkthrough.md` bulunmuyor

**Bulunan durum:** Doğru, çalışma alanında yoktu.

**Yapılan:** Bu doküman (`docs/RAPOR.md`) onun yerini alıyor.

---

## 3. Listede olmayan, denetimde bulunan hatalar

### A. Gölge yabancı anahtar kolonları — kritik

Entity'lerde FK özelliği `UrunAmbalajId`, navigasyon `UrunAmbalaji` adını taşıyordu. EF Core'un konvansiyonu navigasyon adı + `Id` arar, yani `UrunAmbalajiId` (sondaki **i** ile). Bulamayınca **gölge bir yabancı anahtar** üretti.

Sonuç: dört tabloda ikişer kolon oluştu.

| Tablo | Kodun yazdığı kolon | Gerçek FK (gölge) |
|---|---|---|
| `fiyat_kademeleri` | `urun_ambalaj_id` | `urun_ambalaji_id` |
| `sepet_kalemleri` | `urun_ambalaj_id` | `urun_ambalaji_id` |
| `siparis_kalemleri` | `urun_ambalaj_id` | `urun_ambalaji_id` |
| `stok_bildirimleri` | `urun_ambalaj_id` | `urun_ambalaji_id` |

Servis kodu FK'yı **id ile** set ettiğinde (navigasyon nesnesiyle değil) gölge kolon 0 kalıyor ve istek FK ihlaliyle **HTTP 500** dönüyordu. Sepete ürün eklemek hiç çalışmıyordu.

Eski tohumlayıcı FK'ları navigasyon nesnesiyle set ettiği için tabloda veri doğru görünüyordu — hata yalnızca API üzerinden yazarken ortaya çıkıyordu.

**Yapılan:** İlişkiler `HasForeignKey(x => x.UrunAmbalajId)` ile açıkça yapılandırıldı. Migration, gölge kolonları düşürmeden **önce** değerleri kalıcı kolona kopyalar — aksi hâlde mevcut sepet/sipariş/fiyat satırları yetim kalırdı.

### B. Yapılandırmanın erken okunması — kritik

Bkz. madde 3. Bu hatanın yan etkisi entegrasyon testlerinde ortaya çıktı: testler Testcontainers yerine **yerel geliştirme veritabanına** bağlanıyordu.

### C. Sepette hiçbir iş kuralı denetlenmiyordu

- MOQ, katlama (multiple) ve **stok kontrolü yoktu**. MOQ'su 3.000 olan bir ürüne 5 adet eklenebiliyor, hata ancak sipariş anında çıkıyordu.
- **Misafir sepeti birleştirme yoktu.** Planlama dokümanının özellikle uyardığı senaryo: kullanıcı giriş yapınca sepeti kayboluyordu.
- **Kademe seçimi hatalıydı:** yalnızca `MinMiktar <= miktar` olan *sonuncu* kademe alınıyordu; `MaxMiktar`, müşteri grubu ve geçerlilik tarihleri hiç okunmuyordu.

**Yapılan:** Kurallar `Cevik.Alan/Kurallar` altına, domain katmanına taşındı (`SiparisMiktarKurali`, `FiyatKademesiSecici`, `SiparisDurumMakinesi`). Sepet, sipariş ve teklif aynı kuralı kullanıyor.

### D. `SepetController` oturum anahtarını atıyordu

Giriş yapılmışsa `(userId, null)` dönüyordu. Misafirken doldurulan sepetin anahtarı kaybolduğu için birleştirme teknik olarak imkânsızdı.

### E. Para birimi ve vergi hataları

| Sorun | Önce | Sonra |
|---|---|---|
| Döviz kuru | `Kur = 1` sabit | `doviz_kurlari` tablosundan; sipariş anında sabitlenir |
| Kargo eşiği | USD tutarı doğrudan 1000 **TL** eşiğiyle karşılaştırılıyordu | Ana para birimine çevrilerek karşılaştırılıyor |
| KDV | Kodda `0.20m` gömülü | `Ticari:KdvOrani` ayarından |
| Kargo ücreti | Kodda `50` gömülü | `Ticari:KargoUcreti`, sipariş para birimine çevrilir |

Kargo hatası pratikte şu anlama geliyordu: 855 USD'lik bir sipariş (≈ 35.400 TL) "1000 TL altı" sayılıp kargo ücreti alıyordu.

### F. Sipariş numarası çakışabiliyordu

`"SP-" + DateTime.Now.ToString("yyyyMMddHHmmss")` — aynı saniyede iki sipariş aynı numarayı alırdı. Ayrıca yerel saat kullanılıyordu. Artık yıl içinde artan `SIP-2026-000001` biçiminde.

### G. İptal edilen siparişte stok geri gelmiyordu

Sipariş oluşturulurken stok düşülüyor, iptal/iade edildiğinde geri eklenmiyordu. Her iptal stoğu kalıcı olarak eksiltiyordu.

**Doğrulama:** 15.900 → iptal → **15.920** (20 adet geri döndü).

### H. Sipariş durum makinesi yoktu

Her geçişe izin veriliyordu; teslim edilmiş bir sipariş "ödeme bekliyor"a geri alınabiliyordu. Artık geçişler tablodan doğrulanıyor.

**Doğrulama:** `Olusturuldu → TeslimEdildi` isteği:
```
HTTP 422 — 'Olusturuldu' durumundan 'TeslimEdildi' durumuna geçilemez.
İzinli geçişler: OdemeBekliyor, Onaylandi, IptalEdildi.
```

### I. `DateOnly.ToDateTime()` Npgsql'i çökertiyordu

`Kind=Unspecified` üretir; Npgsql `timestamp with time zone` kolonuna yalnızca UTC kabul eder. Döviz kuru sorgusu `ArgumentException` ile patlıyor, sipariş oluşturma 500 dönüyordu.

### J. Yönetim uçları ham entity bağlıyordu

`Ekle(Urun urun)` — istemci `SilindiMi`, `Id`, `GoruntulenmeSayisi` ve ilişkili koleksiyonları POST gövdesinden set edebiliyordu (over-posting). Ayrıca `NormalizeKod` set edilmediği için elle eklenen ürün **aramada hiç bulunamıyordu**. Artık DTO kullanılıyor ve `NormalizeKod` her zaman türetiliyor.

### K. Her iş kuralı ihlali HTTP 500 dönüyordu

Servisler düz `throw new Exception(...)` kullanıyordu. Artık `IsKuraliIhlaliException` → **422**, `KeyNotFoundException` → 404, `UnauthorizedAccessException` → 403, `DbUpdateConcurrencyException` → 409. 500 yanıtlarında iç detay sızdırılmıyor.

### L. Tohum verisi projenin ayırt edici özelliklerini gösteremiyordu

| Alan | Önce | Sonra |
|---|---|---|
| Ürün kodu | EAN13 barkodu (`7351826194738`) | Üreticiye bağlı MPN deseni (`STM32F766W5T`, `RC0805FR071KL`) |
| Ürün adı | Mobilya isimleri (`Ergonomic Wooden Chair`) | `RES SMD 10 kΩ ±5% 1/4 W 1210` |
| Üretici | Rastgele şirket adları | 37 gerçek marka; **kod ön eki üreticiyle tutarlı** |
| Ambalaj / ürün | 1 (sabit) | 1–3 varyant (ort. 1,85) |
| Stok | `1..40 × katlama` — Cut Tape'te en fazla 40 adet | 250–40.000 adet, katlamaya yuvarlanmış |
| Belge | yok | 3.757 datasheet kaydı |
| Döviz kuru | yok | USD/EUR başlangıç kurları |

Ayrıca ürün kodu ön eki kategoriden, üretici ayrı seçildiği için **"Texas Instruments üretimi STM32F766"** gibi tutarsız kayıtlar oluşuyordu; `OzelliklerJson` anahtarları görünen ad (`"Frekans"`) iken filtre API'si kodla (`frekans`) çalışıyordu — iki taraf birbirini tutmuyordu. İkisi de düzeltildi.

### M. `Cevik.Api.http` hâlâ `/weatherforecast/` çağırıyordu

Gerçek uç örnekleriyle değiştirildi.

### N. Docker imajı hiç derlenmiyordu

Bkz. madde 6 — `.dockerignore` eksikliği ve healthcheck'te olmayan `wget`.

---

## 4. Doğrulama

### Test sonuçları

```
Cevik.BirimTestleri        75 test  —  0 hata
Cevik.EntegrasyonTestleri  37 test  —  0 hata
```

Entegrasyon testleri gerçek PostgreSQL 17 konteyneri üzerinde çalışır. Öne çıkan testler:

- Filtre uygulandığında sonuç sayısının **facet sayacıyla birebir eşleşmesi**
- Seçim yapılan facet grubunun diğer seçeneklerinin **kaybolmaması**
- Üst kategori seçiminin alt ağacı kapsaması
- Tokensiz erişimde 401, müşteri tokeniyle 403, admin tokeniyle 200
- Aynı parolanın iki kullanıcıda **farklı hash** üretmesi
- Misafir sepetinin giriş sonrası **birleşmesi**
- Siparişin stoğu düşürmesi ve sepeti boşaltması
- Başkasının adresiyle sipariş denemesinin 403 dönmesi

### Canlı uçtan uca akış

```
MOQ ihlali (5 adet, MOQ 3000)
  → HTTP 422: "Minimum sipariş miktarı (MOQ) 3000 adettir. Önerilen miktar: 3000."

Sipariş
  Sipariş No : SIP-2026-000001
  Ara toplam : 855,0025 USD
  KDV (%20)  : 171,0005
  Kargo      : 0 (855 USD ≈ 35.439 TL > 1.000 TL eşiği)
  Genel      : 1.026,0030
  Stok       : 15.920 → 15.900
  Kur        : 41,450000  (artık 1 değil)
```

### Veritabanı durumu

| Tablo | Kayıt |
|---|---|
| Kategoriler | 16 (4 kök + 12 yaprak) |
| Üreticiler | 37 |
| Ürünler | 4.992 |
| Ürün ambalajları | 9.246 (%72'si stokta) |
| Fiyat kademeleri | 36.984 |
| Özellik tanımları | 18 |
| Kategori–özellik eşleşmesi | 49 |
| Ürün özellik değerleri | 17.941 |
| Ürün dokümanları | 3.757 |
| Gölge FK kolonu | **0** |

---

## 5. Hâlâ açık olanlar

Bunlar bilerek kapsam dışı bırakıldı; frontend'e geçişi engellemiyorlar ama tamamlanmadıkları açıkça belirtilmelidir.

**Faz 7–8 (sıradaki iş)**
- Frontend (Next.js) henüz başlamadı; `frontend/` klasörü boş
- Frontend `docker-compose.yml`'a eklenmedi (API eklendi)
- CI hattı (GitHub Actions) yok

**Planda "SHOULD" olarak işaretlenenler**
- İlişkili ürünler (muadil / benzer / parametrik / birlikte kullanılan) — tablo var, API ucu yok
- Müşteri özel ürün kodu eşleştirme — tablo var, uç yok
- TR/EN çoklu dil ve USD/TRY para birimi anahtarı — veri modeli hazır, API tek dilde dönüyor
- TCMB kur çekme arka plan servisi — arayüz ve tablo hazır, seed ile sabit kur yazılıyor

**Kimlik tarafında eksikler**
- Refresh token ve şifre sıfırlama uçları yok
- E-posta doğrulama akışı yok (alan var)
- Hız sınırlama (rate limiting) yok

**Faz 9 (opsiyonel)**
- BOM (malzeme listesi) yükleme — entity'ler var, uç yok
- Ödeme entegrasyonu (sandbox)
- Meilisearch / Elasticsearch geçişi

**Teklif (RFQ) modülü** çalışıyor ancak yüzeysel: sepetten teklife dönüşüm var, satış temsilcisinin fiyat girip teklifi siparişe çevirmesi akışı yok.

---

## 6. Çalıştırma

### Önce: gizli değerler

Parolalar ve JWT anahtarı sürüm kontrolüne **girmez**. İlk kurulumda iki şablon
dosyasını kopyalayıp doldurun:

```bash
cp .env.example .env
cp src/Cevik.Api/appsettings.Development.example.json src/Cevik.Api/appsettings.Development.json
```

Her iki kopya da `.gitignore` kapsamındadır. `JWT_KEY` en az 32 karakter olmalıdır;
kısa anahtarda uygulama açılışta durur. Rastgele üretmek için:

```bash
openssl rand -base64 48
```

Yönetici hesabı, `.env` içindeki `YONETICI_EPOSTA` / `YONETICI_PAROLA` değerleriyle
seed edilir. Parola boş bırakılırsa hesap oluşturulmaz, uygulama yine çalışır.

### Sonra: yığını başlat

Tüm yığın (API dahil) tek komutla:

```bash
docker compose up -d
```

| Servis | Adres |
|---|---|
| API (container) | `http://localhost:5000/swagger` |
| Sağlık ucu | `http://localhost:5000/saglik` |
| pgAdmin | `http://localhost:5050` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

Yalnızca bağımlılıkları container'da tutup API'yi yerelde çalıştırmak için:

```bash
docker compose up -d postgres redis
dotnet run --project src/Cevik.Api
```

Bu durumda API `http://localhost:5109/swagger` adresinde açılır.

Yönetici hesabının e-postası ve parolası `.env` dosyasından okunur; depoda
yalnızca `__PLACEHOLDER__` değerleri bulunur.

Testler:

```bash
dotnet test Cevik.slnx
```

Entegrasyon testleri Docker gerektirir (Testcontainers kendi PostgreSQL konteynerini kaldırır).
