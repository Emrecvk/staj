# Çevik Elektronik — B2B E-Ticaret UX & Arayüz Spesifikasyon Raporu
**Referans Mimarisi**: `www.ozdisan.com` B2B Elektronik Komponent Platformu  
**Proje**: Kapsamlı Frontend Revizyonu (Next.js 16 App Router & Tailwind CSS v4)  
**Tasarım Sistemi**: Çevik Tasarım Sistemi (Lacivert `#0F2740`, Camgöbeği `#00B4D8`/`#0389B0`, Geist Tipografi)  
**Doküman Sürümü**: 1.0.0  
**Tarih**: 2026-08-21  

---

## Yönetici Özeti ve Amaç

Bu spesifikasyon raporu, Çevik Elektronik platformunun kullanıcı arayüzü ve deneyimini (UI/UX), Türkiye ve küresel elektronik komponent distribütörlüğü sektör standardı olan `www.ozdisan.com` mimari düzenine, B2B iş akışlarına ve bileşen hiyerarşisine yükseltmek için hazırlanmıştır.

Mevcut sistem modern bir Next.js 16 altyapısına ve sağlam bir tasarım sistemine (`globals.css`) sahip olmakla birlikte; çok seviyeli mega menü, akıllı arama önerileri, parametrik yoğun mühendislik tablosu (dense-table catalog), gelişmiş kademeli fiyat ve ambalaj matrisi, BOM yükleme/hızlı parça aracı, çift hatlı sepet/RFQ ayrımı ve yan yana ürün karşılaştırma gibi kritik B2B fonksiyonlarında yapısal eksikler barındırmaktadır.

Bu raporda 7 ana çekirdek alanın **tam DOM yerleşimi**, **React bileşen ağacı**, **kullanıcı etkileşim akışları (UX flows)**, **veri modelleri**, **Çevik tasarım sistemi token eşlemeleri** ve **uç durumlar (edge cases)** eksiksiz olarak modellenmiştir.

---

## 1. Header & Navigation (Üst Bilgi, Arama ve Mega Menü)

### 1.1. Yapısal Düzen & DOM Mimarisi

Header alanı 3 dikey hiyerarşik katmandan oluşur:

```
+---------------------------------------------------------------------------------------------------+
| 1. ÜST BİLGİ BANDI (Top Utility Bar) - bg-yuzey-gomulu / text-metin-ikincil                       |
|   [B2B Duyuru / Kurumsal Destek] | [USD/TRY Döviz Kuru: 34.20]       [BOM Yükle] [Hakkımızda] [TR·USD] |
+---------------------------------------------------------------------------------------------------+
| 2. ANA HEADER (Brand & Smart Search) - bg-yuzey-kart / border-b border-kenar                      |
|   [ÇEVİK LOGO]  |  [ [Kategori Seç ▼] [ MPN, üretici veya açıklama ara... ] [🔍 Ara] ]  | [RFQ][♥][⚖][👤][🛒] |
+---------------------------------------------------------------------------------------------------+
| 3. NAVİGASYON & MEGA MENÜ ŞERİDİ - bg-marka (Lacivert #0F2740) / text-white                        |
|   [ ☰ TÜM KATEGORİLER ▼ ]  [Yarı İletkenler] [Pasif] [Elektromekanik] [Konnektör] ... [Teklif İste] |
+---------------------------------------------------------------------------------------------------+
```

#### A. Üst Bilgi Bandı (Top Bar)
- **Sol Alan**:
  - B2B Müşteri Hizmetleri İletişim Hattı (`0850 ...` veya `Hafta içi 08:30–18:00`).
  - Canlı B2B TCMB Döviz Kuru Göstergesi (Örn: `USD/TRY: 34.25 · EUR/TRY: 37.10`).
- **Sağ Alan**:
  - `BOM Yükle / Hızlı Teklif` bağlantısı (vurgulu renk).
  - `Katalog İndir / Teknik Bülten`, `Hakkımızda`, `İletişim`.
  - Dil ve Para Birimi Seçici (`TR · USD` / `TR · TRY` / `EN · USD`).

#### B. Ana Arama & İşlem Bandı (Brand & Action Bar)
- **Marka Logosu**:
  - Vektörel Çevik Elektronik Logosu (`/logo-cevik-yatay.svg`, genişlik: ~180px).
- **Merkezi Akıllı Arama Motoru (Smart Search Combobox)**:
  - **Kategori Ön Seçici Dropdown**: Sol tarafa gömülü `<select>` veya custom popover (`Tüm Kategoriler`, `Entegreler`, `Pasifler` vb.).
  - **Arama Girdi Alanı (Input)**:
    - Debounce (250-300ms) ile çalışan MPN (Üretici Parça Kodu), Marka ve Kelime tamamlama.
    - Temizleme (X) ikonu, klavye kısayolu ipucu (`Ctrl+K` veya `/`).
  - **Akıllı Otomatik Tamamlama Açılır Paneli (Search Dropdown Overlay)**:
    - *Grup 1 - Eşleşen Ürünler (MPN & Başlık)*: Küçük görsel, MPN, Üretici, Anlık Stok Adedi, Başlangıç Fiyatı.
    - *Grup 2 - Eşleşen Kategoriler*: Kategori ağaç yolu (`Yarı İletkenler > Mikrokontrolcüler`).
    - *Grup 3 - Eşleşen Üreticiler / Markalar*: Üretici logoları ve doğrudan marka sayfasına link.
    - *Alt Kısım*: "Tüm [N] sonucu gör ➔" yönlendirme butonu.
- **Kullanıcı & B2B İşlem Paneli**:
  - **RFQ / Teklif Sepeti**: İkon + Rozet (Aktif teklif listesindeki parça sayısı) ➔ `/teklif-iste`.
  - **Favoriler**: İkon + Rozet ➔ `/profil/favoriler`.
  - **Karşılaştırma Listesi**: İkon + Rozet (Karşılaştırmaya eklenen ürün sayısı, maks 4) ➔ `/karsilastir`.
  - **Hesabım (B2B Kullanıcı Portalı)**:
    - Giriş yapılmamışsa: "Giriş Yap / Kurumsal Kayıt" buton menüsü.
    - Giriş yapılmışsa: İsim/Firma adı + Bakiye/Kredi limiti özeti + Menü (Siparişlerim, Tekliflerim, Adreslerim, Yetkili Kişiler, Çıkış).
  - **Sepetim**: Alışveriş Sepeti İkonu + Adet Rozeti + Toplam Tutar (Örn: `1.450,00 $`) + Hover Mini-Sepet çekmecesi.

#### C. Çok Seviyeli Mega Menü (Multi-Level Hierarchical Mega Menu)
- **Tetikleyici (Trigger)**: "TÜM KATEGORİLER" ana butonu (bg-vurgu text-marka, sol kenarda sabit).
- **Mega Menü Panel Yerleşimi (Flyout Grid)**:
  - Genişlik: Tam container genişliği (1200px+), yükseklik: ~520px sabit/otomatik scroll.
  - **Sol Sütun (Level 1 - Ana Kategoriler)**:
    - 10-14 ana ürün ailesi (Yarı İletkenler, Pasif Komponentler, Elektromekanik, Konnektörler, Güç Kaynakları, Optoelektronik, Sensörler, RF & Kablosuz, Geliştirme Kartları, Test & Ölçüm, Lehimleme & Sarf).
    - Her satırda SVG kategori ikonu, kategori adı ve sağ ok (`ChevronRight`).
    - Hover veya klavye odağında anında (100ms hover-intent) sağ paneli güncelleme.
  - **Orta Geniş Alan (Level 2 & Level 3 - Alt Kategoriler & Yapraklar)**:
    - 3 veya 4 sütunlu hiyerarşik ızgara.
    - Her sütun altında **Alt Kategori Başlığı (Bold, Link)** ve altında sıralı **Yaprak Kategoriler (Leaf Categories)**.
    - Her yaprak kategori yanında opsiyonel ürün sayısı (`(1.240)`).
  - **Sağ Promosyon / Marka Paneli (Featured Brand & Banner Box)**:
    - İlgili ana kategorinin yetkili distribütör markaları (Örn: ST, Microchip, Vishay, Murata logoları).
    - Kategorideki öne çıkan yeni ürün serisi banner'ı ve "Tüm Alt Kategorileri Listele" butonu.

### 1.2. React Bileşen Hiyerarşisi
```
<SiteHeader>
  ├── <TopUtilityBar />
  ├── <MainHeaderBar>
  │     ├── <BrandLogo />
  │     ├── <SmartSearchCombobox>
  │     │     ├── <CategoryPrefixSelect />
  │     │     ├── <SearchInputField />
  │     │     └── <SearchAutocompleteDropdown>
  │     │           ├── <MatchingProductsList />
  │     │           ├── <MatchingCategoriesList />
  │     │           └── <MatchingBrandsList />
  │     └── <HeaderActionCenter>
  │           ├── <RfqCounterButton />
  │           ├── <FavoritesCounterButton />
  │           ├── <CompareCounterButton />
  │           ├── <UserAccountMenu />
  │           └── <MiniCartDropdown />
  └── <NavigationMenuBar>
        ├── <MegaMenuDropdown>
        │     ├── <MegaMenuTrigger />
        │     └── <MegaMenuContent>
        │           ├── <Level1CategoryList />
        │           ├── <Level2And3SubcategoryGrid />
        │           └── <MegaMenuBrandSpotlight />
        ├── <TopCategoryLinks />
        └── <QuickQuoteHeaderLink />
```

---

## 2. Homepage (Ana Sayfa Mimarisi)

### 2.1. Bölüm ve Bileşen Mimarisi

```
+---------------------------------------------------------------------------------------------------+
| 1. B2B HERO SECTION: Hero Banner Slider (Sol %65) + Hızlı BOM / Parça Arama Kutusu (Sağ %35)        |
+---------------------------------------------------------------------------------------------------+
| 2. KULLANICI / HIZLI ERİŞİM İKON IZGARASI: 8-12 Temel Komponent Kategorisi (Görsel & Ürün Adedi)    |
+---------------------------------------------------------------------------------------------------+
| 3. CANLI ENVANTER ŞERİDİ (B2B Metrics): Toplam Ürün | Stoktan Teslim | Marka Sayısı | Aynı Gün Kargo |
+---------------------------------------------------------------------------------------------------+
| 4. ÇOKLU VİTRİN SEKMELERİ (Tabbed Showcase): [Yeni Eklenenler] [Çok Satanlar] [Stok Fırsatları]    |
+---------------------------------------------------------------------------------------------------+
| 5. YETKİLİ DİSTRİBÜTÖR MARKALAR CAROUSEL: Marka Logoları, Orijinallik Garantisi & Line-Card       |
+---------------------------------------------------------------------------------------------------+
| 6. B2B DEĞER ÖNERİLERİ & KURUMSAL ÇÖZÜMLER (Vadeli Ödeme, API/EDI Entegrasyonu, Proje Desteği)    |
+---------------------------------------------------------------------------------------------------+
| 7. MÜHENDİSLİK KAYNAKLARI & TEKNİK BÜLTENLER: Uygulama Notları, Seçim Rehberleri                  |
+---------------------------------------------------------------------------------------------------+
```

### 2.2. Detaylı UX Özellikleri
1. **BOM & Hızlı Parça Arama Widget'ı (Hero Sağ Alanı)**:
   - **Tab 1: Excel/CSV BOM Yükle**: Sürükle-bırak dosya yükleme alanı, anında sütun eşleme ve `/bom` sayfasına tek tıkla geçiş.
   - **Tab 2: Çoklu Parça Yapıştır (Quick Paste)**: `MPN Miktar` formatında metin alanı (Örn: `STM32F407VGT6 100`, `LM358 500`), "Listeyi Ayrıştır ve Sepete At" butonu.
2. **Kategori İkon Kartları**:
   - Asimetrik veya simetrik 6x2 grid.
   - Her kartta özel endüstriyel SVG ikon, kategori adı ve anlık aktif ürün sayısı (`18.450 ürün`).
3. **Ürün Vitrin Kartları (B2B Product Card)**:
   - Marka rozeti, üretici parça kodu (MPN - Monospace), kısa teknik açıklama, kılıf/paket bilgisi.
   - Gerçek zamanlı stok göstergesi (Yeşil nokta + `25.400 Adet Stokta`).
   - Kademeli başlangıç fiyatı (Örn: `1+ : 2.45 $ · 100+ : 1.85 $`).
   - Hızlı adet artırma/azaltma girdisi (MOQ ve paket katı kontrollü) + "Sepete Ekle" butonu.
   - Karşılaştır ve Favori ikon butonları.

---

## 3. Product Catalog & Listing Page (Katalog ve Listeleme)

### 3.1. Yapısal Düzen & 3 Görünüm Modu

Katalog sayfası, mühendislerin ve B2B satın almacıların binlerce parametre arasından nokta atışı parça bulmasını sağlayan çok modlu bir arama platformudur.

```
+---------------------------------------------------------------------------------------------------+
| Breadcrumb: Ana Sayfa > Pasif Komponentler > Kondansatörler > Seramik Kondansatörler (1.420 Ürün) |
+---------------------------------------------------------------------------------------------------+
| [Aktif Filtre Çipleri: Marka: Murata (x) | Kapasitans: 100nF (x) | Gerilim: 50V (x)] [Tümünü Sil] |
+---------------------------------------------------------------------------------------------------+
| SOL: PARAMETRİK FİLTRE PANELİ (%25)   | SAĞ: KATALOG LİSTELEME ALANI (%75)                        |
|                                       | Üst Kontrol Barı:                                         |
| [✓] Sadece Stoktakiler                |  [Sıralama: Önerilen ▼] [Sayfa Başına: 50 ▼]               |
| [✓] Orijinal / Yeni Tasarım           |  [Görünüm Seçici: ⊞ Izgara | ☰ Liste | ☷ Yoğun Tablo]    |
| ──────────────────────────────        | ───────────────────────────────────────────────────────── |
| ▾ Marka / Üretici (Arama Kutulu)      | [Ürün Listesi / Tablosu Render Alanı]                     |
| ▾ Paket / Kılıf (0402, 0603, 0805...) |                                                           |
| ▾ Kapasitans (pF, nF, uF slider/list) |                                                           |
| ▾ Voltaj Değeri (6.3V, 16V, 50V...)   | ───────────────────────────────────────────────────────── |
| ▾ Tolerans (±%1, ±%5, ±%10...)        | B2B Sayfalama: [<< İlk] [< Önceki] [1] [2] [3] ... [> Son] |
| ▾ Fiyat Aralığı Slider                | [Sayfaya Git: [  ] Git]                                   |
+---------------------------------------------------------------------------------------------------+
```

### 3.2. Üç Farklı Katalog Görünüm Modu

#### 1. Izgara Görünümü (Grid View - 3/4 Sütun)
- Genel tarama ve görsel inceleme için.
- Ürün görseli, MPN, Marka, Stok Rozeti, Kademeli Fiyat Özeti, Hızlı Sepete Ekleme.

#### 2. Geniş Liste Görünümü (List View)
- Orta seviye detay için yatay geniş kartlar.
- Sol görsel, orta blokta teknik parametre özetleri (Kılıf, Sıcaklık, Voltaj, RoHS), sağ blokta anlık stok breakdown'ı (Merkez/Şube) ve kademeli fiyat tablosu + adetli satın alma formu.

#### 3. Yoğun Parametrik Mühendislik Tablosu (Dense Engineering Table - DigiKey / Özdisan Stili)
- Satın almacı ve donanım tasarımcılarının en çok tercih ettiği mod.
- **Sütun Yapısı**:
  1. `Seç / Karşılaştır`: Checkbox.
  2. `Görsel`: Küçük thumbnail + tıklandığında popover zoom.
  3. `Parça Kodu (MPN)`: Monospace, kopyalama butonu, ürün detay linki.
  4. `Üretici`: Marka adı ve logosu.
  5. `Açıklama`: Kısa fonksiyonel tanım.
  6. `Datasheet`: PDF ikonu (tek tıkla yeni sekmede açılır).
  7. `Stok`: Anlık adet (Örn: `12.500`) + Gelecek stok ikonu/tooltip.
  8. `Fiyat Kademeleri`: `1+: $0.45`, `100+: $0.32`, `1K+: $0.21` tek hücrede kompakt gösterim.
  9. `Ambalaj & MOQ`: Makara (2500) / Şerit (1).
  10. `Temel Parametreler (Dinamik)`: Kategoriye göre değişen 4-6 ana teknik parametre sütunu (Kapasitans, Voltaj, Tolerans, Sıcaklık vb.).
  11. `İşlem`: Miktar Girdisi + Sepete Ekle İkon Butonu.

### 3.3. Filtreleme & URL Senkronizasyonu
- Tüm filtre seçimleri URL query parametrelerine (`?kategoriId=12&marka=murata&kapasitans=100nf&siralama=stok`) senkronize edilir.
- Next.js `useTransition` ile sayfa yenilenmeden arka planda optimize sorgu çalıştırılır.
- Her filtre başlığında iç arama kutusu (Örn: 100 farklı üretici içinde hızlı filtreleme).

---

## 4. Product Detail Page (PDP - Ürün Detay Sayfası)

### 4.1. Yapısal Düzen & DOM Mimarisi

```
+---------------------------------------------------------------------------------------------------+
| BREADCRUMB: Ana Sayfa > Entegre Devreler > MCU > STMicroelectronics > STM32F407VGT6              |
+---------------------------------------------------------------------------------------------------+
| SOL ALAN (%45): GÖRSEL & DOKÜMANLAR     | SAĞ ALAN (%55): B2B SATIN ALMA & FİYAT MATRİSİ          |
|                                         | ─────────────────────────────────────────────────────── |
| [Büyük Ürün Görseli / Büyüteç Zoom]    | Üretici: STMicroelectronics [Marka Ürünleri]            |
| [Temsili Görsel Uyarısı (varsa)]        | Başlık: STM32F407VGT6 [📋 Kopyala]                       |
|                                         | Açıklama: ARM Cortex-M4 MCU 1MB Flash 168MHz LQFP-100   |
| Küçük Resim Galerisi (Thumbnails):      | Rozetler: [Aktif / Üretimde] [RoHS Uyumlu] [REACH]      |
| [Resim 1] [Resim 2] [Kılıf Çizimi] [3D] |                                                         |
|                                         | ── STOK & DEPO DAĞILIMI ─────────────────────────────── |
| HIZLI DOKÜMAN & CAD LİNKLERİ:           |  • Merkez Depo (İstanbul): 4.850 Adet (Aynı Gün Kargo)  |
| [📄 Datasheet İndir (PDF - 3.8 MB)]     |  • Şube / Dış Depo: 2.000 Adet (2-3 İş Günü)           |
| [📐 CAD / EDA Sembol & Footprint]       |  • Gelecek Stok: 10.000 Adet (Tahmini: 15.10.2026)      |
| [📜 RoHS / REACH Uygunluk Belgesi]      |                                                         |
|                                         | ── KADEMELİ FİYATLANDIRMA TABLOSU ───────────────────── |
|                                         |  Miktar       Birim Fiyat    Toplam Tutar               |
|                                         |  1 - 9        $ 12.50        $ 12.50                    |
|                                         |  10 - 99      $ 11.20        $ 112.00                   |
|                                         |  100 - 499    $  9.80        $ 980.00                   |
|                                         |  500 - 999    $  8.90        $ 4,450.00                 |
|                                         |  1.000+       $  7.95        $ 7,950.00                 |
|                                         |  5.000+       Özel Fiyat     [Teklif İste]              |
|                                         |                                                         |
|                                         | ── AMBALAJ & SATIN ALMA KUTUSU ──────────────────────── |
|                                         |  Ambalaj Tipi: [ (•) Tepsi (Tray: 90 Adet) ] [ ( ) Şerit ] |
|                                         |  Miktar: [-] [ 180 ] [+]  (Min: 90, Katlar: 90)         |
|                                         |  Hesaplanan Tutar: $ 2,016.00 + KDV                     |
|                                         |  [ 🛒 SEPETE EKLE ]   [ 📄 RESMİ TEKLİF İSTE (RFQ) ]    |
|                                         |  [♥ Favorilere Ekle]  [⚖ Karşılaştır] [🔔 Stok Alarmı]   |
+---------------------------------------------------------------------------------------------------+
| ALT SEKMELER (Tab Navigation):                                                                    |
| [1. Teknik Özellikler]  [2. Dokümanlar & CAD]  [3. Muadiller & Alternatifler]  [4. Birlikte Alınan]|
|                                                                                                   |
| SEKME 1: Kapsamlı Parametrik Özellik Tablosu (Çekirdek, Flash, RAM, Voltaj, Sıcaklık, Pin...)     |
| SEKME 2: Datasheet PDF Önizleme + KiCad/Altium EDA Footprint İndirme Dosyaları                   |
| SEKME 3: Birebir Pin-to-Pin Muadiller & Benzer Aile Ürünleri Karşılaştırma Matrisi                |
| SEKME 4: Önerilen Kristal Osilatörler, Dekuplaj Kondansatörleri, Programlayıcılar                 |
+---------------------------------------------------------------------------------------------------+
```

### 4.2. Kademeli Fiyat & Ambalaj Mantığı (B2B Pricing Engine)
- Girdi kutusuna girilen miktar anlık olarak doğrulanır:
  - Eğer girilen miktar MOQ'dan küçükse otomatik MOQ'ya yuvarlanır veya uyarı verilir.
  - Eğer ambalaj katlama kuralına (MPQ/multiple) uymuyorsa, en yakın geçerli paket katına tamamlama önerisi çıkar.
  - Fiyat tablosunda kullanıcının girdiği miktara denk gelen kademe **vurgulu renk (bg-vurgu-zemin / border-vurgu)** ile aydınlatılır.

---

## 5. Cart & RFQ System (Sepet & Teklif Sistemi)

### 5.1. B2B Sepet ve Hızlı Sipariş Akışı

```
+---------------------------------------------------------------------------------------------------+
| 1. HIZLI PARÇA EKLEME BARI (Quick Add Line):                                                       |
|   [ MPN / Parça Kodu ] [ Miktar ] [ Ambalaj Seçimi ▼ ] [ + Sepete Hızlı Ekle ]                     |
+---------------------------------------------------------------------------------------------------+
| 2. SEPET KALEMLERİ TABLOSU (%70)                    | 3. SİPARİŞ & TEKLİF ÖZETİ (%30)             |
|                                                     |                                             |
| Ürün & MPN      Ambalaj   Birim Fiyat  Miktar Toplam | Ara Toplam (USD):         $ 4,850.00        |
| ─────────────────────────────────────────────────── | KDV (%20):                $   970.00        |
| [IMG] STM32F...  Tepsi    $ 9.80 (100+) [ 180 ] $1,764| Kargo Bedeli:             ÜCRETSİZ          |
|   ↳ Stok: 4.850 | Min: 90 | Kat: 90 | [Teklife Taşı]| TOPLAM TUTAR:             $ 5,820.00        |
|                                                     | TCMB Karşılığı (TRY):     199.335,00 TL     |
| [IMG] LM358DR    Makara   $ 0.12 (2.5K) [2500 ] $ 300| ─────────────────────────────────────────── |
|   ↳ Stok: 50.000| Min: 2.5K | [Sil] [Favoriye Al]   | Proje / Sipariş No: [ PO-2026-X89         ] |
|                                                     | Müşteri Notu:       [ ACİL ÜRETİM BANDI   ] |
| Toplu İşlemler: [Tümünü Seç] [Excel Olarak İndir]   | ─────────────────────────────────────────── |
|                 [BOM Olarak Dışa Aktar]             | [ 🛍 SİPARİŞİ TAMAMLA / SATIN AL (KREDİ/HAVALE) ]|
|                                                     | [ 📄 BU SEPET İÇİN RESMİ TEKLİF OLUŞTUR (RFQ) ] |
+---------------------------------------------------------------------------------------------------+
```

### 5.2. İkili Satın Alma & Teklif (RFQ) Dönüşüm Mekanizması
1. **Doğrudan Sipariş Akışı**:
   - Yeterli stok bulunan ürünler anında kredi kartı, kurumsal cari limit veya banka havalesi ile ödeme adımına (`/odeme`) yönlendirilir.
2. **Resmi Teklif İsteme (RFQ Flow - `/teklif-iste`)**:
   - Stok yetersizliği olan, yüksek adetli veya özel iskonto talep edilen ürünler tek tıkla RFQ listesine dönüştürülür.
   - Kullanıcı hedef birim fiyatını ve talep edilen termin tarihini girebilir.
   - Sistem anında PDF formatında "Teklif Talep Formu" üretir ve Çevik satış mühendisi paneline bildirim düşer.

---

## 6. Product Comparison System (Ürün Karşılaştırma)

### 6.1. Karşılaştırma Çubuğu (Global Sticky Dock)
- Ekranın alt kısmında sabit (fixed bottom dock), kullanıcı katalog veya detay sayfalarında ürün seçtiğinde açılır.
- 1 ila 4 ürünün küçük resmi, MPN'i ve kaldır butonu yer alır.
- Buton: "Karşılaştır (3/4) ➔" (`/karsilastir` sayfasına yönlendirir).

### 6.2. Yan Yana Parametrik Karşılaştırma Matrisi (`/karsilastir`)

```
+---------------------------------------------------------------------------------------------------+
| ÜRÜN KARŞILAŞTIRMA (3 Ürün)                                                                        |
| Kontroller: [✓ Sadece Farklılıkları Göster]   [🖨 Yazdır / PDF İndir]   [📥 Excel Olarak İndir]     |
+---------------------------------------------------------------------------------------------------+
| PARAMETRE ADI         | ÜRÜN 1 (Sabitle 📌)       | ÜRÜN 2 (X Kaldır)        | ÜRÜN 3 (X Kaldır)        |
| ───────────────────── | ───────────────────────── | ──────────────────────── | ──────────────────────── |
| Görsel & Başlık       | [IMG] STM32F407VGT6       | [IMG] STM32F429ZIT6      | [IMG] GD32F407VGT6       |
| Üretici               | STMicroelectronics        | STMicroelectronics       | GigaDevice               |
| Fiyat (100+ Adet)     | $ 9.80                    | $ 14.50                  | $ 6.40                   |
| Anlık Stok            | 4.850 Adet (Stokta)       | 120 Adet (Kritik)        | 15.000 Adet (Stokta)     |
| Satın Alma            | [ Sepete Ekle ]           | [ Teklif İste ]          | [ Sepete Ekle ]          |
| ── ELEKTRİKSEL ────── | ───────────────────────── | ──────────────────────── | ──────────────────────── |
| Çekirdek              | ARM Cortex-M4             | ARM Cortex-M4            | ARM Cortex-M4            |
| Saat Frekansı (Fark!) | 168 MHz (Sarı Vurgu)      | 180 MHz (Sarı Vurgu)     | 168 MHz                  |
| Flash Bellek (Fark!)  | 1024 KB                   | 2048 KB                  | 1024 KB                  |
| RAM Kapasitesi        | 192 KB                    | 260 KB                   | 192 KB                   |
| Çalışma Gerilimi      | 1.8V ~ 3.6V               | 1.8V ~ 3.6V              | 2.6V ~ 3.6V              |
| ── FİZİKSEL ───────── | ───────────────────────── | ──────────────────────── | ──────────────────────── |
| Kılıf / Paket         | LQFP-100                  | LQFP-144                 | LQFP-100                 |
| RoHS Uyumu            | Evet                      | Evet                     | Evet                     |
| Datasheet             | [📄 PDF İndir]            | [📄 PDF İndir]           | [📄 PDF İndir]           |
+---------------------------------------------------------------------------------------------------+
```

---

## 7. Mobile & Responsive Layouts (Mobil ve Duyarlı Tasarım)

### 7.1. Mobil Kırılım Noktaları (Breakpoints)
- `sm`: 640px (Geniş telefonlar)
- `md`: 768px (Tablet dikey)
- `lg`: 1024px (Tablet yatay / Küçük laptop)
- `xl`: 1280px (Standart B2B masaüstü ekranı)
- `2xl`: 1536px (Geniş mühendislik monitörleri)

### 7.2. Mobil Arayüz Bileşenleri
1. **Mobil Header & Off-Canvas Mega Menü (Drawer)**:
   - Sabit üst bar: Hamburger ikonu + Çevik Logosu + Arama Butonu + Sepet (rozetli).
   - Sol çekmece menü (`vaul` tabanlı): Dokunmatik kademeli kategori geçişi (Geri butonu ile hiyerarşik gezinti).
2. **Mobil Filtre Çekmecesi (Bottom Sheet Filter)**:
   - Katalog sayfasında ekranın altında sabit kayan filtreleme butonu: `[ ⚡ Filtrele & Sırala (4 aktif) ]`.
   - Açıldığında tam ekran alt çekmece: Akordeon filtreler, anlık sonuç sayacı ve altta sabit `[ 1.420 Ürünü Göster ]` onay butonu.
3. **Mobil PDP Sabit Satın Alma Barı (Sticky Purchase Action Bar)**:
   - Ürün detay sayfasında kullanıcı teknik detayları incelerken ekranın altında yapışık (sticky bottom) bar:
   - `[ STM32F407... | $ 9.80 ]  [-] [ 10 ] [+]  [ 🛒 Sepete Ekle ]`.
4. **Sabit Alt Hızlı Gezinme Barı (App-Like Bottom Navigation)**:
   - Mobil ekranlarda en altta 5 ikonluk sabit menü:
     - `[ Ana Sayfa ]  [ Kategoriler ]  [ Arama ]  [ BOM ]  [ Sepet/Profil ]`.

---

## 8. Çevik Tasarım Sistemi Token Eşleme Tablosu

Özdisan'ın yapısal düzeni ve UX akışları sisteme entegre edilirken, Çevik'in özgün kurumsal marka kimliği ve `globals.css` içinde tanımlanmış token'lar kesinlikle korunmalıdır.

| Arayüz Bölümü / Öğesi | Özdisan Referans Özelliği | Çevik Tasarım Sistemi Token Karşılığı | CSS Değeri / Kuralı |
|---|---|---|---|
| **Ana Header / Nav Bar** | Kırmızı / Siyah Bar | `bg-marka` / `text-metin-ters` | Lacivert `#0F2740` |
| **Vurgu & Aksiyon Butonları** | Kırmızı Butonlar (`#cc0000`) | `bg-vurgu` / `hover:bg-vurgu-guclu` | Camgöbeği `#00B4D8` / `#0389B0` |
| **Mega Menü Vurguları** | Kırmızı hover çerçeve | `hover:text-vurgu` / `border-vurgu` | `#0389B0` / `bg-vurgu-zemin` (`#ECFDFF`) |
| **Yüzey / Arka Plan** | Açık Gri Zemin | `bg-yuzey` / `bg-yuzey-kart` | `#F8FAFC` (Zemin) / `#FFFFFF` (Kart) |
| **Kenarlıklar** | Standart Gri Kenar | `border-kenar` / `border-kenar-guclu` | `#E2E8F0` / `#CBD5E1` |
| **MPN & Parça Kodları** | Düz Metin | `font-mono` / `.sayisal` (Tabular nums) | `var(--font-geist-mono)` |
| **Başlık & Metin Tipografisi** | Standart Sans | `font-sans` | `var(--font-geist-sans)` |
| **Köşe Yuvarlama (Radius)** | Karışık yuvarlaklıklar | `var(--radius-girdi)` (6px) / `var(--radius-kart)` (8px) | Kesin sistem standardı |
| **Stokta Var Rozeti** | Yeşil Rozet | `bg-basari-50` / `text-basari-600` | `#ECFDF3` / `#0D8A43` |
| **NRND / Kritik Stok Rozeti** | Turuncu Rozet | `bg-uyari-50` / `text-uyari-600` | `#FFFAEB` / `#B45F05` |
| **EOL / Tükendi Rozeti** | Kırmızı Rozet | `bg-hata-50` / `text-hata-600` | `#FEF3F2` / `#B42318` |

---

## 9. Keşfedilen Özellikler ve B2B Fonksiyonel Açık Matrisi

| # | Kategori | Özellik | Açıklama | Girdiler | Çıktılar | Hata / Boş Durum Davranışı | Keşif Kaynağı |
|---|---|---|---|---|---|---|---|
| 1 | Header | Akıllı Çoklu Arama & Kategori Ön Filtresi | Arama kutusu yanında kategori seçimi, debounced MPN autocomplete. | Arama metni, Kategori ID | Ürünler, Kategoriler, Markalar listesi | "Sonuç bulunamadı" önerili mesajı | Özdisan Header |
| 2 | Header | Çok Seviyeli Mega Menü | 3 kademeli hiyerarşik kategori ve marka vitrini içeren mega menü. | Hover / Click / Focus | Açılır 3 sütunlu yaprak kategori ızgarası | Kategori ağacı boşsa hata durumu | Özdisan Mega Menu |
| 3 | Homepage | Hızlı BOM / Parça Ayrıştırıcı | Ana sayfadan direkt CSV/Excel veya metin yapıştırarak BOM çözme. | Dosya / Metin | Eşleşen parça tablosu & Sepete aktarım | Hatalı MPN'ler için "Eşleşmedi" uyarısı | Özdisan Quick Order |
| 4 | Catalog | Yoğun Mühendislik Tablosu | DigiKey/Özdisan stili yüksek yoğunluklu parametrik katalog tablosu. | Filtreler, Sıralama | Kompakt çok sütunlu veri tablosu | Sonuç yoksa "Filtreleri Sıfırla" butonu | Özdisan Catalog Table |
| 5 | Catalog | Çoklu Görünüm Switcher | Izgara (Grid), Liste (List) ve Yoğun Tablo (Dense) arasında geçiş. | Görünüm tipi seçimi | Seçilen modda ürün listesi render'ı | Varsayılan: Dense/Grid | B2B Standardı |
| 6 | PDP | Kademeli Fiyat Matrisi | 1+, 10+, 100+, 1000+ adet bazlı dinamik fiyat tablosu ve aktif kademe ışığı. | Sipariş Miktarı | Seçili kademe vurgusu, toplam tutar | MOQ altı girişte otomatik düzeltme | Özdisan PDP Matrix |
| 7 | PDP | Depo Bazlı Stok Dağılımı | Merkez, Şube ve Gelecek Stok termin tarihlerinin ayrıntılı gösterimi. | Ürün ID | Depo stokları ve termin tarihleri | Stok yoksa "Teklif İste" / "Stok Bildirimi" | Özdisan PDP Stock |
| 8 | PDP | CAD/EDA & Doküman Hub | Datasheet PDF görüntüleyici, Altium/KiCad sembol ve footprint indirme. | Ürün ID | PDF modalı, EDA dosya indirme linki | Doküman yoksa pasif buton | Özdisan Docs Tab |
| 9 | Cart/RFQ | Çift Hatlı Sipariş & RFQ | Sepetteki ürünleri tek tıkla resmi teklif talebine (RFQ) dönüştürme. | Sepet kalemleri, Hedef Fiyat | PDF Teklif Formu & Teklif Talebi Kaydı | Minimum sipariş tutarı uyarısı | Özdisan Cart/Quote |
| 10 | Compare | Yan Yana Parametrik Karşılaştırıcı | 2-4 ürünün tüm teknik özelliklerini karşılaştırıp farkları vurgulama. | Ürün ID listesi | Karşılaştırma matrisi, Excel/PDF export | Maksimum 4 ürün sınırı uyarısı | Özdisan Compare |
| 11 | Mobile | Sabit Satın Alma & Filtre Çekmecesi | Mobilde kolay tek elle kullanım için sticky bottom action bar ve filtre drawer. | Dokunmatik etkileşim | Bottom sheet çekmecesi, sticky bar | Küçük ekranlarda taşma engelleme | Modern B2B Mobile UX |

---

## 10. Uç Durumlar ve Hata Yönetimi Matrisi

| # | Özellik | Girdi / Durum | Gözlemlenen & Beklenen Davranış |
|---|---|---|---|
| 1 | Mega Menü | API bağlantısı kesildi veya kategori ağacı boş döndü | Arayüz çökmez; "Kategoriler yüklenemiyor, lütfen sayfayı yenileyin" mesajı ve fallback statik ana kategoriler gösterilir. |
| 2 | Akıllı Arama | Özel karakterler içeren veya anlamsız MPN girişi (`STM32///$$$`) | Sanitize edilir, regex patlaması engellenir; "Sonuç bulunamadı. Popüler aramaları deneyin:" önerileri listelenir. |
| 3 | Parametrik Filtre | Birbiriyle çelişen 5 farklı filtre seçildi (0 sonuç) | Filtre panelinde 0 sonuç veren seçenekler disabled yapılır; ana alanda "Seçtiğiniz kriterlerde ürün bulunamadı. Son seçilen filtreyi kaldırın" butonu çıkar. |
| 4 | Kademeli Fiyat | Kullanıcı MOQ: 100 olan ürüne miktar olarak "15" yazdı | Input sınırlandırılır, blur anında "100" değerine yuvarlanır ve kullanıcıya toast bildirimi ("Minimum sipariş miktarı 100 adettir") gösterilir. |
| 5 | Ambalaj Seçimi | Makara (2.500 adet) seçili iken miktar "3.000" yazıldı | Paket katlama uyarısı verilir; "Makara ambalajı 2.500 adetlik paketler halinde satılmaktadır. Miktar 5.000 olarak güncellensin mi?" aksiyonu sunulur. |
| 6 | Karşılaştırma | Kullanıcı 5. bir ürünü karşılaştırmaya eklemeye çalıştı | "En fazla 4 ürün karşılaştırabilirsiniz. Lütfen listeden bir ürünü çıkarın." uyarısı modal veya toast olarak gösterilir. |
| 7 | Datasheet & CAD | Ürünün datasheet PDF URL'i boş veya 404 | Datasheet butonu `disabled` yapılır, yanında "Teknik doküman talep et" formu açılır. |
| 8 | Mobil Ekran | Dar ekranda (360px) geniş parametrik tablo açıldı | Tablo yatay kaydırılabilir (horizontal scroll) konteyner içine alınır; MPN ve Fiyat sütunu sola sabitlenir (sticky column). |

---

## 11. Mühendislik ve Uygulama Yol Haritası (Implementation Blueprint)

1. **Faz 1: Navigasyon ve Mega Menü Entegrasyonu**:
   - `site-header.tsx` bileşenini çok seviyeli Mega Menü (`mega-menu.tsx`), Akıllı Arama Combobox (`smart-search.tsx`) ve B2B sayaçları ile yeniden yapılandırma.
2. **Faz 2: Katalog ve Yoğun Mühendislik Tablosu**:
   - `frontend/src/app/urunler/client.tsx` içine `DenseTableView` bileşenini ekleme, sütun bazlı parametrik filtreleme ve görünüm değiştiriciyi (`LayoutGrid`, `List`, `Table2`) entegre etme.
3. **Faz 3: Ürün Detay Sayfası (PDP) Zenginleştirmesi**:
   - `frontend/src/app/urunler/[id]/page.tsx` sayfasına Kademeli Fiyat Tablosu, Depo Dağılım Kartı, Gelişmiş Ambalaj Seçici, CAD/EDA Sekmesi ve Karşılaştırma aksiyonlarını ekleme.
4. **Faz 4: Karşılaştırma ve RFQ Modülü**:
   - `/karsilastir` rotası ve sticky `comparison-dock.tsx` bileşenini oluşturma; Sepet sayfasındaki RFQ dönüşüm akışını geliştirme.
5. **Faz 5: Mobil ve Erişilebilirlik Optimizasyonu**:
   - `vaul` tabanlı mobil filtre çekmecesi, sticky mobil satın alma barı ve klavye navigasyonunu (WCAG AA) test edip tamamlama.
