# Yol Haritası — Eklenmesi Gerekenler

> Özdisan karşılaştırması ve mevcut kod taraması sonucu çıkan iş listesi.
> Her kayıt, kodda doğrulanmış bir boşluğa dayanıyor — varsayıma değil.

| | |
|---|---|
| Tarih | 25 Ağustos 2026 |
| Dal | `duzeltme/tema-marka-kontrast` |
| Son commit | `ea8a63f` |
| Kapsam | 10 kayıt · 5 grup |

## Özet

| Kayıt | İş | Durum | Kaba tahmin |
|---|---|---|---|
| A1 | Stok bildirimi — "gelince haber ver" | Tamamlandı | 3–4 sa |
| A2 | Müşteri ürün kodları | Tamamlandı | 4–5 sa |
| A3 | Duyuru şeridi ve banner'lar | Tamamlandı | 2 sa |
| B1 | Listeleme DTO'sunu zenginleştir | Tamamlandı | 4–6 sa |
| C1 | Aramaya üretici adını kat | Tamamlandı | 15 dk |
| C2 | Marka facet'ini görünür kıl | Tamamlandı | 2 sa |
| C3 | `/markalar` line-card sayfası | Tamamlandı | 3 sa |
| D1 | Üreticiler'i ana navigasyona, BOM'u ana sayfaya taşı | Tamamlandı | 1–2 sa |
| E1 | Çözüm alt sayfaları | Tamamlandı | 4 sa |
| E2 | PDP'de datasheet'i öne çıkar | Tamamlandı | 1 sa |

---

## Grup A — Backend tamamen hazır, frontend hiç yok

Bu üçünün API'si, servisi ve arka plan işleyicisi yazılmış ve çalışıyor; ekranda
hiçbir karşılığı yok. En yüksek getirili iş burada — yazılacak tek şey arayüz.

### A1 · Stok bildirimi — "gelince haber ver"

**Durum:** Backend hazır · **Kaba tahmin:** 3–4 sa

`StokBildirimController.cs:21` ucu (`POST /urunler/ambalajlar/{ambalajId}/stok-bildirimi`)
ve onu işleyen `StokBildirimIsleyiciBackgroundService` mevcut ve mükerrer kaydı da
engelliyor. Frontend tarafında tek bir çağrı yok — arama boş döndü.

Stokta olmayan üründe ürün kartına ve PDP'ye "Gelince haber ver" butonu eklenecek;
e-posta alınıp uca gönderilecek. Bu, Özdisan'ın "Fiyat & Stok Sorgula" davranışının
bizdeki karşılığı ve stoksuz ürünün ölü bir sayfa olmasını engelliyor.

### A2 · Müşteri ürün kodları

**Durum:** Backend hazır · **Kaba tahmin:** 4–5 sa

`ProfilController.cs:80–105` altında tam CRUD var (listele / ekle / güncelle / sil),
`MusteriUrunKodu` varlığı ve `ProfilServisi` tarafı da yazılmış. Frontend'de hiç
kullanılmıyor.

`/profil/urun-kodlarim` sayfası: müşteri kendi stok kodunu katalog ürününe eşler.
B2B'de gerçek bir bağlanma noktası — satın almacı kendi ERP kodunu görmeye alışkın,
ve bu eşleme sonradan BOM yüklemeyi de besler.

### A3 · Duyuru şeridi ve konumlu banner'lar

**Durum:** Backend hazır · **Kaba tahmin:** 2 sa

`IcerikController.cs:30` ve `:34` — `/icerik/duyurular` ve `/icerik/bannerlar?konum=`
uçları hazır, `Sira` alanıyla sıralı geliyor. Frontend bu ikisini hiç çağırmıyor.

Header altına ince bir duyuru şeridi, anasayfaya konum bazlı banner alanı. Yönetim
panelinden içerik girilebildiği için pazarlama tarafı koda dokunmadan kampanya
duyurabilir hâle gelir.

---

## Grup B — Tek DTO değişikliği, beş özelliği birden açıyor

Listedeki en yüksek kaldıraçlı iş. Katalogdaki kart bugün eksik görünüyorsa sebebi
tasarım değil, veri.

### B1 · Listeleme DTO'sunu zenginleştir

**Durum:** Backend değişikliği · **Kaba tahmin:** 4–6 sa

`UrunOzetDto` (`UrunListelemeDto.cs:5–17`) bugün yalnızca on alan taşıyor: kimlik,
üretici adı, açıklama, görsel, toplam stok, başlangıç fiyatı, para birimi, kampanya
bayrağı. Eksik olanlar:

- `UreticiId`
- `Dokumanlar` (datasheet)
- varsayılan ambalaj (`ambalajId` + `MOQ` + `MPQ`)
- `FiyatKademeleri`
- `UrunDurumu`
- `RohsDurumu`
- `Kilif`

**Bu tek değişiklik şunları açar:**

- Karttan **gerçek** sepete ekleme — bugün ambalaj bilgisi olmadığı için PDP'ye
  yönlendiriyoruz.
- Kartta datasheet ikonu (Özdisan'ın imza öğelerinden).
- Kartta kademeli fiyat — "1: ₺x / 100: ₺y".
- NRND / EOL rozeti: `YasamDongusuRozeti` bileşeni `rozet.tsx:73`'te **yazılı ama
  kullanılamıyor**, çünkü liste ucu `UrunDurumu` göndermiyor.
- RoHS rozeti ve kılıf bilgisi — tablo görünümünü de zenginleştirir.

> **Dikkat:** Projeksiyona `SelectMany` ile kademe ve doküman eklemek sorguyu
> şişirebilir. Ambalajı `.Take(1)`, kademeleri ilk ikiyle sınırlayın ve değişiklik
> sonrası sayfa başına sorgu sayısını ölçün.

---

## Grup C — Arama ve filtre boşlukları

Marka vitrinini gerçek veriye bağladık, ama markadan gezinme hâlâ yarım: kullanıcı
bir markayı arayamıyor ve sol panelden seçemiyor.

### C1 · Aramaya üretici adını kat

**Durum:** Backend değişikliği · **Kaba tahmin:** 15 dk

`KatalogServisi.cs:240–242`'de arama yalnızca `NormalizeKod` ve `KisaAciklama`
üzerinde `ILike` yapıyor. Sonuç: kullanıcı arama kutusuna **"Omron"** yazdığında
hiçbir şey bulamıyor — oysa katalogda 208 Omron ürünü var.

Sorguya `|| EF.Functions.ILike(u.Uretici.Ad, …)` eklemek yeterli. Listedeki en ucuz
düzeltme, en görünür kazanç.

### C2 · Marka facet'ini görünür kıl

**Durum:** Backend değişikliği · **Kaba tahmin:** 2 sa

`KatalogServisi.cs:194`: facet'ler yalnızca `KategoriId` doluyken hesaplanıyor.
Pratik sonucu şu — **sol filtre panelinde marka seçeneği hiç yok.** Kullanıcı markaya
ancak anasayfadaki vitrin linkiyle ulaşabiliyor, oradan da filtreyi daraltamıyor.

Üretici facet'i kategoriden bağımsız hesaplanmalı; parametrik facet'ler (kılıf,
tolerans) kategoriye bağlı kalabilir çünkü onlar gerçekten kategoriye özel.

### C3 · `/markalar` line-card sayfası

**Durum:** Backend hazır · **Kaba tahmin:** 3 sa

`GET /api/Katalog/ureticiler` ucunu ekledik; gerçek ürün sayılarıyla ve yetkili
distribütör bayrağıyla dönüyor. Şu an yalnızca anasayfadaki beşli vitrinde
kullanılıyor.

Tüm markaların A–Z listelendiği, harf navigasyonlu, yetkili rozetli bir sayfa —
Özdisan'ın line-card karşılığı ve SEO açısından değerli bir giriş noktası.

---

## Grup D — Keşfedilebilirlik

Sitenin en değerli iki B2B aracı, ana menüde yok.

### D1 · Üreticiler'i ana navigasyona, BOM'u ana sayfaya taşı

**Durum:** Sadece frontend · **Kaba tahmin:** 30 dk

Ana navigasyona **Üreticiler** bağlantısı eklenecek ve üretici line-card sayfasına
gidecek. BOM ve RFQ ana navigasyona alınmayacak; BOM, ana sayfada görünür bir
"BOM Yükle ve Eşleştir" çağrısıyla sunulacak. RFQ mevcut ürün, sepet ve çözüm
akışlarından erişilebilir kalacak.

BOM eşleştirme bu işin ayırt edici özelliklerinden biri olduğu için ana sayfada
ayrı bir aksiyon olarak görünür olmalı; üreticiler ise `/markalar` line-card
sayfasından keşfedilmeli.

---

## Grup E — İçerik ve kurumsal derinlik

Özdisan'ın güven inşa ettiği alan. Teknik borç değil, tamamlayıcı katman.

### E1 · Çözüm alt sayfaları

**Durum:** İçerik + frontend · **Kaba tahmin:** 4 sa

FAE / Ar-Ge desteği, PCB tedarik ve montaj, otomasyon — bunlar bugün yalnızca
anasayfadaki `B2BDegerOnerisi` bloğunda birer satır. Her biri kendi sayfasını hak
ediyor.

İçerik yönetimi `/icerik/sayfalar/{slug}` ucuyla zaten mümkün; `/hakkimizda` sayfası
bu deseni kullanıyor, aynısı çoğaltılabilir.

### E2 · Ürün detay sayfasını Özdisan tarzına redesign et

**Durum:** Sadece frontend · **Kaba tahmin:** 4–5 sa

PDP layout'u Özdisan karşılaştırmasından sonra tamamen yeniden tasarlanmalı. Bugün
2 kolon (sol-sağ) yapıda, hedef 3 bölgeli asimetrik layout. Bu madde yalnızca
datasheet bloku değil, **tüm sayfa yeniden yapılandırılması**.

#### Temel farklar (Çevik → Özdisan)

| Öğe | Çevik | Özdisan | Değişim |
|---|---|---|---|
| **Görsel** | Placeholder, küçük | Galeri, büyük (50% üst kısım) | Ürün görseli 3x büyütül |
| **Grid** | 2 kolon (sol-sağ) | 3 bölge (sol-orta-sağ) | Grid yapısını yeniden kur |
| **Bilgi sırası** | Ambalaj → MOQ → Fiyat → Alım | Üretici → Kod → Stok → Kademeli Fiyat → Alım | Satın alma akışını türet |
| **Stok gösterimi** | Depo listeleri | Net sayı + renk (yeşil/turuncu/kırmızı) | Stok UI sadeleştir |
| **Datasheet** | Ayrı blok (üst) | İçgili bilgi (orta bölgede ikon) | Satır içi, daha kompakt |
| **Sekmeler (alt)** | Teknik Özellikleri, Dokümanlar, vb. | Tablo görünümü satırları | Okunabilirlik iyileştir |

#### Yapılacak işler (sırasıyla)

1. **Layout Grid'i Yeniden Kur** (`.tsx` dosyası)
   - `frontend/src/app/urunler/[id]/client.tsx` ana grid yapısı
   - Satır 99: `lg:grid-cols-12` → asimetrik 3 bölge (1.5:1:1 oranı)
   - Sol: Ürün görseli + depo stokları
   - Orta: Ürün bilgileri (üretici, kod, açıklama, datasheet ikonu)
   - Sağ: Ambalaj seçimi, kademeli fiyat, alım kontrolleri

2. **Bileşen Sırası Değiştir**
   - Ambalaj seçeneğini sağa taşı (orta bilgiden sonra)
   - MOQ/MPQ/Katlama gösterimini sağ bölgede organize et
   - Fiyat tablosunu altında göster
   - Sepete Ekle / Teklif İste'yi en altta (tam genişlik)

3. **Ürün Görseli Büyüt**
   - Galeri container'ı ürün detayında daha belirgin hâle getir
   - Placeholder yerine gerçek ürün görseli yükle
   - Responsive: mobilde fullwidth, desktop'te 45% sol

4. **Stok Gösterimini Sadeleştir**
   - "Stok & Depo Dağılımı" bloğu: depo isimlerini çıkar, net sayı göster
   - Renk kodu ekle: > 100 adet (yeşil), 1–100 (turuncu), 0 (kırmızı)
   - Gelecek stok tarihi alt satırda ince yazı

5. **Datasheet Bloku İçgileştir**
   - Çevik'te üst köşede ayrı blok, Özdisan'da orta bilginin altında ikon
   - `frontend/src/app/urunler/[id]/pdp-bilesenleri.tsx` bileşenini güncellemeliyebilir
   - İndirme butonu sağda kalabilir ama daha kompakt

6. **Teknik Özellikler Tablosu Okunabilirlik**
   - Bugün parametrik tablo alt sekmede; bu kalabilir ama satır renklerini iyileştir
   - Alternatif: İlk 5 kritik özelliği üst kısımda card'lar hâlinde göster

#### Dosyalar değişecek

- `frontend/src/app/urunler/[id]/client.tsx` — ana layout (satır 68–170+)
- `frontend/src/app/urunler/[id]/pdp-bilesenleri.tsx` — bileşen yapısı (tüm bileşenler)
- `frontend/src/app/urunler/[id]/page.css` veya Tailwind sınıfları — responsive breakpoint'ler

#### Dikkat noktaları

- **Datasheet boyutu**: `UrunDetayDto.Dokumanlar` zaten `boyutByte` taşıyorsa sorun yok;
  yoksa backend'e bu eklenmeli.
- **Görsel swap**: Ana görsel placeholder yerine `anaGorselUrl` çekme (zaten yapılıyor ama
  galeri container'ı büyütülmeli).
- **Responsive**: Mobilde 2 kolon (görsel üst, bilgi alt), tabletde 1.5:1.5, desktop'te 1.5:1:1.
- **Performans**: Ambalaj / fiyat listesi uzunsa lazy load düşün; ama MVP için viewport
  içi render yeterli.

#### Neden 4–5 saat

- Layout yeniden kuru: 1–1.5 sa
- Bileşenleri organize et ve prop'ları düzenle: 1–1.5 sa
- Responsive breakpoint'ler (mobil / tablet / desktop): 1 sa
- Test ve pixel-perfect hizala: 1 sa
- Buffer (beklenmedik sorun): 0.5 sa

---

## Önerilen sıra

1. **C1 — aramaya üretici adı.** On beş dakika, anında görünür. Markayı aratıp sonuç
   alamamak bugün gerçek bir kayıp.
2. **D1 — BOM ve RFQ menüye.** Yarım saat, sıfır risk.
3. **B1 — listeleme DTO'su.** Asıl kaldıraç. Tamamlandığında kart, tablo ve
   karşılaştırma birlikte zenginleşir; sepete ekleme gerçekten çalışır.
4. **A1 — stok bildirimi.** B1'den sonra, çünkü stoksuz ürün akışı kartla birlikte
   tasarlanmalı.
5. **C2 + C3 — marka filtresi ve line-card.** Marka gezinme hikâyesini kapatır.
6. **A2, A3, E1, E2.** Bağımsız; sıra esnek.

---

Süre tahminleri kabadır ve ölçülmemiştir; kapsam netleştikçe değişir. Kayıtlardaki
dosya ve satır referansları 25 Ağustos 2026 itibarıyla `duzeltme/tema-marka-kontrast`
dalında doğrulanmıştır — kod değiştikçe satır numaraları kayabilir.
