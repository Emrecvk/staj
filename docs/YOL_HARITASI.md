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
| A1 | Stok bildirimi — "gelince haber ver" | Backend hazır | 3–4 sa |
| A2 | Müşteri ürün kodları | Backend hazır | 4–5 sa |
| A3 | Duyuru şeridi ve banner'lar | Backend hazır | 2 sa |
| B1 | Listeleme DTO'sunu zenginleştir | Backend değişikliği | 4–6 sa |
| C1 | Aramaya üretici adını kat | Backend değişikliği | 15 dk |
| C2 | Marka facet'ini görünür kıl | Backend değişikliği | 2 sa |
| C3 | `/markalar` line-card sayfası | Backend hazır | 3 sa |
| D1 | BOM ve RFQ'yu ana menüye taşı | Sadece frontend | 30 dk |
| E1 | Çözüm alt sayfaları | İçerik + frontend | 4 sa |
| E2 | PDP'de datasheet'i öne çıkar | Sadece frontend | 1 sa |

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

### D1 · BOM ve RFQ'yu ana menüye taşı

**Durum:** Sadece frontend · **Kaba tahmin:** 30 dk

Ana navigasyonda bugün yalnızca **Ürünler**, **Çözümler**, **Kurumsal** ve
**İletişim** var. `/bom`, `/teklif-iste`, `/araclar` ve `/blog` sadece footer'dan
erişilebiliyor.

BOM eşleştirme ve teklif talebi bu işin ayırt edici özellikleri; footer'da
saklanmaları ölçülebilir bir kayıp. Menüye çıkarmak yarım saatlik iş.

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

### E2 · PDP'de datasheet'i öne çıkar

**Durum:** Sadece frontend · **Kaba tahmin:** 1 sa

`UrunDetayDto` `Dokumanlar` alanını zaten taşıyor. Ürün detayında teknik dokümanı
belirgin, ikonlu ve dosya boyutlu bir blok hâline getirmek — mühendis için sayfadaki
en önemli bağlantı çoğu zaman budur.

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
