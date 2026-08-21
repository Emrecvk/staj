# Kapsamlı Frontend Kod Tabanı İnceleme ve Mimari Raporu

**Proje:** Çevik Elektronik E-Ticaret Platformu — Kapsamlı Frontend Revizyonu  
**Hedef:** Mevcut frontend kod tabanını www.ozdisan.com mimarisi, düzeni ve UX akışlarıyla karşılaştırarak revizyon için temel haritalandırmayı sunmak.  
**Tarih:** 2026-08-21  
**Durum:** Tamamlandı  

---

## 1. Proje Yapılandırması ve Bağımlılık İncelemesi

### 1.1 `package.json` ve Temel Kütüphaneler
- **Framework:** Next.js `16.3.1` (App Router mimarisi)
- **React:** `19.2.8` & `react-dom: 19.2.8` (React 19 Server Actions, `useActionState`, `useTransition`)
- **Stil & Tasarım:** Tailwind CSS `v4` (`tailwindcss: ^4`, `@tailwindcss/postcss: ^4`)
- **İkon Seti:** `lucide-react` (`^1.33.0`)
- **Animasyon:** `motion` (`^13.1.1` - eski Framer Motion)
- **Bildirimler:** `sonner` (`^2.0.8`)
- **Mobil Çekmece / Modal:** `vaul` (`^1.1.2`)
- **TypeScript:** `5.x`, **ESLint:** `9.x`

### 1.2 Yapılandırma Dosyaları
- **`tsconfig.json`:**
  - `target: "ES2017"`, `moduleResolution: "bundler"`, `strict: true`.
  - Yol takma adı (path alias): `"@/*": ["./src/*"]`.
- **`next.config.ts`:**
  - API yönlendirmesi (rewrite): `/api/:path*` -> `http://localhost:5000/api/:path*`.
- **`postcss.config.mjs`:**
  - `@tailwindcss/postcss` eklentisi aktif.
- **Tailwind Yapılandırması:**
  - Tailwind v4 kullanıldığı için ayrı bir `tailwind.config.ts/js` bulunmamaktadır; tüm `@theme`, CSS değişkenleri ve katmanlar doğrudan `src/app/globals.css` içinde yer almaktadır.

---

## 2. Tasarım Sistemi ve Token Analizi (`src/app/globals.css`)

Mevcut tasarım sistemi Çevik Elektronik kurumsal kimliğine sadık, katmanlı ve modern CSS değişkenleri ile donatılmıştır. Özdisan düzenine geçişte bu renk ve tipografi kuralları kesin olarak korunacaktır.

### 2.1 Renk Paleti ve Ölçekler
- **Marka Lacivert Ölçeği (`--color-navy-*`):**
  - `--color-navy-50`: `#f2f6fa`
  - `--color-navy-100`: `#e3ecf4`
  - `--color-navy-200`: `#c6d8e8`
  - `--color-navy-300`: `#9bbad4`
  - `--color-navy-400`: `#6893bb`
  - `--color-navy-500`: `#4573a1`
  - `--color-navy-600`: `#345b86`
  - `--color-navy-700`: `#2b4a6d`
  - `--color-navy-800` (**Ana Marka Lacivert**): `#0f2740`
  - `--color-navy-900`: `#0c1f34`
  - `--color-navy-950`: `#071523`
- **Marka Camgöbeği Ölçeği (`--color-cyan-*`):**
  - `--color-cyan-50`: `#ecfdff`
  - `--color-cyan-100`: `#cff7fe`
  - `--color-cyan-200`: `#a5eefc`
  - `--color-cyan-300`: `#67e0f9`
  - `--color-cyan-400`: `#22c9ee`
  - `--color-cyan-500` (**Ana Vurgu Camgöbeği**): `#00b4d8`
  - `--color-cyan-600` (**Yüksek Kontrast Vurgu**): `#0389b0`
  - `--color-cyan-700`: `#0a6e8f`
  - `--color-cyan-800`: `#115a74`
  - `--color-cyan-900`: `#134b62`
  - `--color-cyan-950`: `#063143`
- **Nötrler (`--color-notr-*`):**
  - Soğutulmuş gri tonları: `--color-notr-0` (`#ffffff`) ile `--color-notr-950` (`#080d18`) arası.
- **Durum Renkleri:**
  - **Başarı (`--color-basari-*`):** `--color-basari-50` (`#ecfdf3`), `--color-basari-500` (`#12a150`), `--color-basari-600` (`#0d8a43`).
  - **Uyarı (`--color-uyari-*`):** `--color-uyari-50` (`#fffaeb`), `--color-uyari-500` (`#d97b06`), `--color-uyari-600` (`#b45f05`).
  - **Hata/Tehlike (`--color-hata-*`):** `--color-hata-50` (`#fef3f2`), `--color-hata-500` (`#d92d20`), `--color-hata-600` (`#b42318`).

### 2.2 Semantik Tokenlar (Açık / Koyu Tema Desteği)
- **Yüzeyler:**
  - `bg-yuzey`: Açık `#f8fafc` / Koyu `#071523`
  - `bg-yuzey-kart`: Açık `#ffffff` / Koyu `#0c1f34`
  - `bg-yuzey-gomulu`: Açık `#f1f5f9` / Koyu `#0a1a2b`
  - `bg-yuzey-ters`: Açık `#0f2740` / Koyu `#f1f5f9`
- **Kenarlıklar (Border):**
  - `border-kenar`: Açık `#e2e8f0` / Koyu `#1c344c`
  - `border-kenar-guclu`: Açık `#cbd5e1` / Koyu `#27496b`
- **Metinler:**
  - `text-metin`: Açık `#0f172a` / Koyu `#f1f5f9`
  - `text-metin-ikincil`: Açık `#475569` / Koyu `#94a3b8`
  - `text-metin-ucuncul`: Açık `#64748b` / Koyu `#64748b`
  - `text-metin-ters`: Açık `#ffffff` / Koyu `#071523`
- **Vurgu ve Marka:**
  - `bg-vurgu` / `text-vurgu`: `#0389b0` (Koyu temada `#22c9ee`)
  - `bg-vurgu-guclu`: `#0a6e8f`
  - `bg-vurgu-zemin`: `#ecfdff`
  - `bg-marka`: `#0f2740`
  - `bg-marka-hover`: `#2b4a6d`

### 2.3 Tipografi ve Rakam Hizalama
- **Font Ailesi:** `next/font/google` üzerinden **Geist Sans** (`--font-sans`) ve **Geist Mono** (`--font-mono`).
- **Tabular Rakamlar:** Parça numaraları (MPN), fiyatlar ve stok miktarları için `font-variant-numeric: tabular-nums` (`.sayisal`, `th`, `td`).

### 2.4 Geometri (Border Radius), Gölgeler ve Hareket
- **Yarıçap Sistemi:**
  - `--radius-girdi`: `0.375rem` (6px) — Butonlar, inputlar
  - `--radius-kart`: `0.5rem` (8px) — Kartlar
  - `--radius-panel`: `0.75rem` (12px) — Modallar, çekmeceler
  - Rozetler: `rounded-full` (tam kapsül)
- **Gölgeler:** Lacivert alt tonlu `--shadow-hafif`, `--shadow-kart`, `--shadow-yukselti`, `--shadow-katman`.
- **Zamanlama ve Easing:**
  - `--sure-basma: 160ms`, `--sure-ipucu: 140ms`, `--sure-acilir: 200ms`, `--sure-dialog: 250ms`, `--sure-cekmece: 400ms`.
  - `--ease-cikis: cubic-bezier(0.23, 1, 0.32, 1)`.

---

## 3. Rota Haritası (`src/app/`)

| Rota Yolu | Dosya Konumu | Açıklama & UX Rolü |
|---|---|---|
| `/` | `src/app/page.tsx` | Ana sayfa (Hero arama, envanter şeridi, kategoriler, stoktan ürünler, kurumsal CTA) |
| `/urunler` | `src/app/urunler/page.tsx`, `client.tsx`, `filtre-paneli.tsx` | Parametrik ürün kataloğu (Izgara/Liste görünümü, filtre paneli, sayfalama, sıralama) |
| `/urunler/[id]` | `src/app/urunler/[id]/page.tsx`, `loading.tsx`, `not-found.tsx` | Ürün detay sayfası (Teknik özellikler, ambalaj seçici, kademeli fiyat, dokümanlar, muadil/benzer parçalar) |
| `/sepet` | `src/app/sepet/page.tsx`, `cart-items.tsx` | Sepet sayfası (Miktar artış/azalış, kademe kontrolü, sepeti boşaltma, sipariş özeti) |
| `/odeme` | `src/app/odeme/page.tsx`, `checkout-form.tsx` | Güvenli ödeme ve adres seçim adımı |
| `/siparis-basarili` | `src/app/siparis-basarili/page.tsx` | Başarılı sipariş onay ekranı |
| `/teklif-iste` | `src/app/teklif-iste/page.tsx`, `quote-form.tsx` | B2B teklif talep formu |
| `/bom` | `src/app/bom/page.tsx` | BOM (Bill of Materials) CSV yükleme ve akıllı komponent eşleştirme |
| `/giris` | `src/app/giris/page.tsx` | Kullanıcı giriş ekranı |
| `/kayit` | `src/app/kayit/page.tsx` | Bireysel kullanıcı kayıt ekranı |
| `/kayit/kurumsal` | `src/app/kayit/kurumsal/page.tsx` | Kurumsal firma kayıt/başvuru ekranı |
| `/sifre-sifirlama` | `src/app/sifre-sifirlama/page.tsx` | Şifre sıfırlama talebi ekranı |
| `/eposta-dogrulama` | `src/app/eposta-dogrulama/page.tsx` | E-posta aktivasyon ve doğrulama ekranı |
| `/profil` | `src/app/profil/layout.tsx`, `page.tsx` | Müşteri paneli ana göstergesi (özet sayaçlar, son siparişler, açık teklifler) |
| `/profil/siparisler` | `src/app/profil/siparisler/page.tsx` | Kullanıcı sipariş geçmişi ve durum takibi |
| `/profil/teklifler` | `src/app/profil/teklifler/page.tsx`, `[id]/page.tsx` | Kullanıcı teklifleri ve teklif onay/siparişe dönüştürme |
| `/profil/adresler` | `src/app/profil/adresler/page.tsx`, `adres-yonetimi.tsx` | Kayıtlı teslimat ve fatura adresleri yönetimi |
| `/profil/favoriler` | `src/app/profil/favoriler/page.tsx` | Kullanıcının favori ürün listesi |
| `/profil/firma` | `src/app/profil/firma/page.tsx` | B2B kurumsal firma ve kredi/vade bilgileri |
| `/yonetim/*` | `src/app/yonetim/layout.tsx`, `page.tsx`, alt modüller | Yönetim paneli (Ürün, kategori, üretici, sipariş, teklif, firma onayı, içerik yönetimi) |

---

## 4. Bileşen Mimarisi ve Durum Yönetimi Analizi

### 4.1 Mevcut Bileşenler (`src/components/`)
1. **Temel UI Kiti (`src/components/ui/`):**
   - `buton.tsx`: Çevik token uyumlu, scale animasyonlu, loading durumlu buton ve buton link bileşeni.
   - `yuzey.tsx`: `Kart`, `BolumBasligi`, `Iskelet`, `UrunKartiIskeleti`, `BosDurum`, `HataDurumu`, `Kapsayici`.
   - `rozet.tsx`: `Rozet`, `StokRozeti`, `YasamDongusuRozeti`.
   - `ipucu.tsx`: `Ipucu` (Tooltip) ve `Kisaltma` (MOQ, MPQ, RoHS, NRND vb. kısaltmalar için zengin terim açıklaması).
   - `form.tsx`: `Girdi`, `Secim`, `MetinAlani`, `OnayKutusu`.
   - `dialog.tsx`: Motion destekli erişilebilir modal/dialog.
   - `cekmece.tsx`: Vaul tabanlı mobil filtre çekmecesi.
   - `bildirim.tsx`: Sonner tabanlı toast yönetim katmanı.
2. **Katalog ve Ürün Bileşenleri:**
   - `product-card.tsx`: Izgara görünümü için ürün kartı (MPN kod odaklı, fırsat rozeti, stok durumu, başlangıç fiyatı).
   - `product-list-card.tsx`: Liste/karşılaştırma görünümü için yatay ürün kartı.
   - `ambalaj-secici.tsx`: Ambalaj seçimi, MOQ/MPQ/katlama kontrolü, kademeli fiyat tablosu ve sepete ekleme.
   - `favori-karsilastirma-butonlari.tsx`: Favoriye ekleme/çıkarma ve karşılaştırma listesi butonları.
3. **Navigasyon ve Yerleşim Bileşenleri:**
   - `site-header.tsx`: Üst bilgi çubuğu, logo, arama çubuğu, hesap ve sepet butonları, kategori linkleri.
   - `site-footer.tsx`: Alt bilgi ve kurumsal bağlantılar.
4. **Admin Bileşenleri (`src/components/admin/`):**
   - `durum-bildirimi.tsx`: Hata, başarı, durum rozetleri.
   - `onay-penceresi.tsx`: Silme ve onay pencereleri.

### 4.2 Durum Yönetimi (State Management) Mimarisi
- **Mevcut Yapı:**
  - React 19 Server Actions (`"use server"`) ve `revalidatePath`.
  - Next.js Server Components doğrudan API çağrıları (`fetch(..., { cache: 'no-store' })`).
  - İstemci durumları için React kancaları (`useState`, `useTransition`, `useCallback`, `useActionState`).
  - Filtreleme ve gezinme için URL State (`useSearchParams`, `useRouter`).
  - Kimlik ve sepet takibi için Cookie yönetimi (`accessToken`, `guestCartId`, `user`).
- **Eksiklik / İyileştirme Alanı:**
  - İstemci tarafında global bir Context veya Zustand store bulunmadığından `SiteHeader` içerisindeki sepet sayacı statik olarak `0` basmaktadır.
  - Canlı sepet rozeti ve mini-sepet flyout'u için hafif bir reaktif state köprüsü (Zustand veya React Context / Event Emitter) kurulmalıdır.

---

## 5. Veri Modelleri ve API Entegrasyonu (`src/lib/`)

- **`api.ts`:**
  - `Category`: Hiyerarşik kategori ağacı (`id, ad, slug, altKategoriler, yaprakMi`).
  - `ProductSummary`, `ProductDetail`: MPN, üretici, kısa/detaylı açıklama, teknik özellikler tablosu, ambalajlar, kademeli fiyatlar, ilişkili ürün grupları (`muadiller`, `benzerUrunler`, `parametrikUrunler`, `birlikteKullanilanlar`).
  - `FacetGroup`, `FacetOption`: Parametrik filtreleme meta verisi.
  - `getKatalogOzeti()`: Canlı envanter ve kategori sayıları.
- **`cart-actions.ts` & `sepet-tipler.ts`:**
  - Sepet kalemleri (`SepetKalemi`), misafir sepeti (`X-Guest-Cart-Id`), kademeli toplam hesabı, `addToCart`, `updateCartItem`, `removeCartItem`, `clearCart`, `createOrder`, `createQuote`.
- **`miktar-kurali.ts`:**
  - B2B elektronik distribütör kural seti: MOQ (Minimum Order Quantity), MPQ (Package Quantity), Katlama adımı ve Kademeli Fiyat Eşleme (`kademeSec`, `miktariDogrulaAmbalaj`, `kademeUlasilabilirMi`).
- **`bom-actions.ts` & `bom-tipler.ts`:**
  - BOM CSV/TSV parser (tırnak korumalı), MPN eşleştirici, aday ürün seçimi, ambalaj zenginleştirme ve toplu sepete aktarım.
- **`auth.ts`:**
  - Bireysel & Kurumsal kayıt, giriş, şifre sıfırlama, çıkış işlemleri.
- **`profil-api.ts` & `profil-tipler.ts`:**
  - Adresler, siparişler, teklifler (teklif kabul, teklif reddet, teklifi siparişe çevir), firma kredisi/vadesi.
- **`admin-api.ts` & `admin-tipler.ts`:**
  - Yönetim paneli CRUD operasyonları.

---

## 6. Özdisan Karşılaştırması ve Revizyon / Refactoring Yol Haritası

| Bileşen / Bölüm | Mevcut Durum | Özdisan Benchmarkı | Revizyon İhtiyacı |
|---|---|---|---|
| **Header (Üst Navigasyon)** | Basit linkler, ilk 5 kategori düz listelenmiş, açılır menü yok, sepet rozeti statik `0`. | Çok seviyeli Mega Menü (kategoriler, alt kategoriler, popüler markalar), gelişmiş arama (kategori filtreli arama + anlık öneri), canlı sepet çekmecesi/önizlemesi, hızlı BOM ve teklif butonları. | **Yeniden Tasarım (Major):** Mega Menü bileşeni (`MegaMenuFlyout`), arama öneri çubuğu ve dinamik sepet/kullanıcı menüsü eklenmeli. |
| **Ana Sayfa (Home Page)** | Minimalist: Hero arama + Envanter şeridi + 5 kategori + Stok listesi. | Geniş B2B Vitrini: Kampanya & Duyuru slider'ı, Hızlı Erişim Kutuları (BOM Yükle, Hızlı Sipariş, Parametrik Arama), Öne Çıkan Üreticiler (Marka logoları), Çoklu Sekmeli Ürün Blokları (Yeni Eklenenler, Fırsat Ürünleri, Stoktakiler), B2B Avantaj Kartları. | **Genişletme (Major):** Özdisan benzeri zengin ana sayfa blokları ve marka vitrini entegre edilmeli. |
| **Katalog / Ürün Listeleme** | Yalnızca Izgara (Grid) ve Basit Liste görünümü. | Mühendislik Komponent Tablosu: Sütun bazlı parametrik veri (MPN, Üretici, Kılıf/Paket, Temel Özellikler, Stok, Kademe Fiyatları, Doğrudan Miktar Girişi ve Sepete Ekleme, Karşılaştırma Seçimi). | **Yeni Görünüm (Major):** "Katalog Tablo Görünümü" (`ProductTableView`) eklenerek B2B satın almacılara tek ekranda hızlı işlem sunulmalı. |
| **Ürün Detay Sayfası (PDP)** | Dikey akış, özellikler tablosu, dokümanlar, ambalaj seçici. | Zengin B2B PDP: Sekmeli teknik özellikler (Parametreler, Dokümanlar/Datasheet, Ambalaj/Fiyat Tablosu, Alternatifler), üretici yetki rozetleri, teknik çizim/3D model alanı, detaylı stok lokasyon/teslimat bilgisi. | **Refactoring (Medium):** Sekmeli yapı, hızlı datasheet indirme ve gelişmiş karşılaştırma entegrasyonu. |
| **Karşılaştırma Modülü** | Backend eylemleri (`katalog-actions.ts`) mevcut ancak özel karşılaştırma sayfası (`/karsilastirma`) yok. | Yan yana 4+ ürünü tüm teknik parametrelerine ve farklarına göre kıyaslayan interaktif tablo. | **Yeni Sayfa (Major):** `/karsilastirma` rotası ve matris tablosu oluşturulmalı. |
| **Footer (Alt Bölüm)** | Temel grid, raw gray renkler kullanılmış. | Kapsamlı kurumsal harita, sertifikalar (ISO vb.), ödeme logoları, e-bülten kaydı, Çevik semantik tokenları ile tam uyum. | **Refactoring (Minor):** Semantik token temizliği ve B2B link haritası zenginleştirmesi. |

---

## 7. Sonuç ve Mimari Öneriler

1. **Marka Bütünlüğü:** Tüm yeni eklenecek bileşenlerde Çevik'in Lacivert (`#0F2740`) ve Camgöbeği (`#00B4D8` / `#0389B0`) renk sistemi, Geist tipografisi ve `globals.css` semantik tokenları kullanılmalıdır. Özdisan'ın kırmızı/siyah renkleri kesinlikle koda girmemelidir.
2. **Mimari Uyumluluk:** Next.js 16 App Router ve Tailwind v4 `@theme` yapısına tam uyum sağlanmalı, gereksiz harici kütüphane eklenmeden mevcut stack (`motion`, `lucide-react`, `sonner`, `vaul`) maksimum verimle kullanılmalıdır.
3. **B2B UX Odaklılığı:** Özdisan'ın en güçlü olduğu alanlar olan **Mega Menü**, **Tablo Görünümlü Komponent Listesi**, **Parametrik Karşılaştırma** ve **Zengin Ana Sayfa Modülleri** öncelikli olarak sisteme kazandırılmalıdır.
