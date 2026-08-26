-- ---------------------------------------------------------------------------
-- Katalog tablolarını temizler; kullanıcı, firma ve içerik verisi korunur.
--
-- Ne zaman çalıştırılır: seed katalogu (KatalogSablonlari + ParcaKatalogu)
-- değiştiğinde. CevikDataSeeder "kategoriler tablosu boş mu?" diye baktığı için
-- (CevikDataSeeder.SeedAsync), bu script çalıştıktan sonra API yeniden
-- başlatıldığında katalog sıfırdan üretilir.
--
-- Kullanım (dört adımın hepsi gerekli):
--   docker compose up -d postgres redis
--   docker exec -i cevik-postgres psql -U cevik -d cevik < scripts/katalogu-sifirla.sql
--   docker compose up -d --build api
--   docker exec cevik-redis redis-cli FLUSHALL     # <-- atlanırsa eski ağaç servis edilir
--   docker restart cevik-frontend                  # <-- atlanırsa eski liste servis edilir
--
-- Son iki adım kolay atlanır ve sessizce yanlış sonuç verir:
--   * KatalogServisi kategori ağacını Redis'te önbelleğe alır. Temizlenmezse API,
--     silinmiş kategorileri (eski slug'larla) dönmeye devam eder ve bu "seed
--     çalışmadı" gibi görünür.
--   * Next.js sunucu tarafı fetch sonuçlarını konteyner belleğinde tutar; yeniden
--     başlatılmazsa katalog sayfası eski sayıları gösterir.
--
-- DİKKAT: sepet, sipariş kalemi ve teklif kalemi satırları eski ürün id'lerine
-- bağlıdır. Ürünler silinince bunlar da silinmek zorundadır — sipariş ve teklif
-- BAŞLIKLARI korunur, yalnızca kalem satırları düşer. Gerçek veri olan bir
-- ortamda bu scripti çalıştırmayın.
-- ---------------------------------------------------------------------------

BEGIN;

-- 1) Ürüne bağlı işlem satırları
TRUNCATE TABLE
    sepet_kalemleri,
    siparis_kalemleri,
    teklif_kalemleri,
    favoriler,
    karsilastirmalar,
    musteri_urun_kodlari,
    stok_bildirimleri,
    arama_gecmisleri
RESTART IDENTITY CASCADE;

-- 2) Fiyatlandırma ve ambalaj
TRUNCATE TABLE
    fiyat_kademeleri,
    indirimler,
    urun_ambalajlari
RESTART IDENTITY CASCADE;

-- 3) Ürün detay tabloları
TRUNCATE TABLE
    urun_ozellik_degerleri,
    urun_gorselleri,
    urun_dokumanlari,
    iliskili_urunler
RESTART IDENTITY CASCADE;

-- 4) Katalog gövdesi
TRUNCATE TABLE
    urunler,
    kategori_ozellikleri,
    ozellik_tanimlari,
    kategoriler,
    ureticiler
RESTART IDENTITY CASCADE;

COMMIT;

-- Kontrol: hepsi 0 dönmeli.
SELECT 'urunler' AS tablo, count(*) FROM urunler
UNION ALL SELECT 'kategoriler', count(*) FROM kategoriler
UNION ALL SELECT 'ureticiler', count(*) FROM ureticiler
UNION ALL SELECT 'ozellik_tanimlari', count(*) FROM ozellik_tanimlari
UNION ALL SELECT 'urun_ambalajlari', count(*) FROM urun_ambalajlari
UNION ALL SELECT 'fiyat_kademeleri', count(*) FROM fiyat_kademeleri
UNION ALL SELECT 'urun_ozellik_degerleri', count(*) FROM urun_ozellik_degerleri;
