using System.Text.Json;
using Cevik.Alan.Katalog;
using Cevik.Alan.Kurallar;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Katalog.Arayuzler;
using Cevik.Uygulama.Katalog.Dto;
using Cevik.Uygulama.Ortak;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Cevik.Altyapi.Katalog.Servisler;

public class KatalogServisi : IKatalogServisi
{
    private readonly CevikDbContext _context;
    private readonly IDistributedCache _cache;

    public KatalogServisi(CevikDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    // -----------------------------------------------------------------------
    // Kategori
    // -----------------------------------------------------------------------

    public async Task<List<KategoriAgacDto>> KategoriAgaciniGetirAsync()
    {
        // Anahtar sabiti OnbellekAnahtarlari'ndan gelir. Elle yazıldığında
        // temizleme tarafı farklı bir anahtar siliyordu ve önbellek hiç boşalmıyordu.
        var onbellektekiler = await _cache.GetStringAsync(OnbellekAnahtarlari.KategoriAgaci);
        if (!string.IsNullOrEmpty(onbellektekiler))
        {
            var cozulmus = JsonSerializer.Deserialize<List<KategoriAgacDto>>(onbellektekiler);
            if (cozulmus is not null) return cozulmus;
        }

        var tumKategoriler = await _context.Kategoriler
            .AsNoTracking()
            .Where(k => k.Aktif)
            .OrderBy(k => k.Sira)
            .ThenBy(k => k.AdTr)
            .ToListAsync();

        // Tek geçişte id -> çocuklar sözlüğü kur; her düğüm için listeyi
        // baştan taramak 300+ kategoride O(n²) oluyordu.
        var cocuklar = tumKategoriler
            .Where(k => k.UstKategoriId is not null)
            .GroupBy(k => k.UstKategoriId!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        var sonuc = tumKategoriler
            .Where(k => k.UstKategoriId is null)
            .Select(k => AgacOlustur(k, cocuklar))
            .ToList();

        await _cache.SetStringAsync(
            OnbellekAnahtarlari.KategoriAgaci,
            JsonSerializer.Serialize(sonuc),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24) });

        return sonuc;
    }

    private static KategoriAgacDto AgacOlustur(Kategori kategori, Dictionary<int, List<Kategori>> cocuklar)
    {
        var dto = new KategoriAgacDto
        {
            Id = kategori.Id,
            Ad = kategori.AdTr,
            Slug = kategori.SlugTr,
            IkonUrl = kategori.IkonUrl,
            YaprakMi = kategori.YaprakMi,
            Sira = kategori.Sira
        };

        if (cocuklar.TryGetValue(kategori.Id, out var altlar))
        {
            foreach (var alt in altlar)
                dto.AltKategoriler.Add(AgacOlustur(alt, cocuklar));
        }

        return dto;
    }

    public async Task<KategoriDetayDto?> KategoriDetayGetirAsync(string slug)
    {
        var kategori = await _context.Kategoriler
            .AsNoTracking()
            .FirstOrDefaultAsync(k => k.SlugTr == slug || k.SlugEn == slug);

        if (kategori is null) return null;

        return new KategoriDetayDto
        {
            Id = kategori.Id,
            Ad = kategori.AdTr,
            Slug = kategori.SlugTr,
            SeoBaslik = kategori.SeoBaslik,
            SeoAciklama = kategori.SeoAciklama,
            SeoIcerikHtml = kategori.SeoIcerikHtml,
            YaprakMi = kategori.YaprakMi
        };
    }

    // -----------------------------------------------------------------------
    // Ürün listeleme + faceted filtre
    // -----------------------------------------------------------------------

    public async Task<UrunAramaSonucDto> UrunleriListeleAsync(UrunAramaFiltreDto filtre)
    {
        // Sayfa boyutunu sınırla: ?sayfaBoyutu=100000 ile tüm katalog çekilemesin.
        var sayfaBoyutu = Math.Clamp(filtre.SayfaBoyutu, 1, 100);
        var sayfaNo = Math.Max(filtre.SayfaNo, 1);

        var kategoriIdleri = await KapsananKategoriIdleriniGetirAsync(filtre.KategoriId);

        // Parametrik filtreler hariç TÜM filtreleri uygulayan temel sorgu.
        // Facet sayaçlarını doğru hesaplamak için bu ayrımı yapmak zorundayız.
        var temelSorgu = TemelSorguKur(filtre, kategoriIdleri);

        // Ürün listesi: parametrik filtreler de dahil.
        var listeSorgusu = ParametrikFiltreleriUygula(temelSorgu, filtre.ParametrikFiltreler);

        var toplamKayit = await listeSorgusu.CountAsync();

        var sirali = SiralamaUygula(listeSorgusu, filtre.Siralama);

        var urunler = await sirali
            .Skip((sayfaNo - 1) * sayfaBoyutu)
            .Take(sayfaBoyutu)
            .Select(u => new
            {
                u.Id,
                u.UreticiUrunKodu,
                UreticiAd = u.Uretici.Ad,
                u.KisaAciklama,
                u.AnaGorselUrl,
                u.GorselTemsiliMi,
                u.KampanyaliMi,
                ToplamStok = u.UrunAmbalajlari.Sum(a => (int?)a.StokMiktari) ?? 0,
                // En düşük kademe fiyatı = "başlangıç fiyatı" (kart üzerinde gösterilen).
                EnDusukFiyat = u.UrunAmbalajlari
                    .SelectMany(a => a.FiyatKademeleri)
                    .OrderBy(f => f.BirimFiyat)
                    .Select(f => (decimal?)f.BirimFiyat)
                    .FirstOrDefault(),
                ParaBirimi = u.UrunAmbalajlari
                    .SelectMany(a => a.FiyatKademeleri)
                    .OrderBy(f => f.BirimFiyat)
                    .Select(f => f.ParaBirimi)
                    .FirstOrDefault()
            })
            .ToListAsync();

        var sonuc = new UrunAramaSonucDto
        {
            Urunler = new PagedResultDto<UrunOzetDto>
            {
                SayfaNo = sayfaNo,
                SayfaBoyutu = sayfaBoyutu,
                ToplamKayit = toplamKayit,
                Kayitlar = urunler.Select(u => new UrunOzetDto
                {
                    Id = u.Id,
                    UreticiUrunKodu = u.UreticiUrunKodu,
                    UreticiAd = u.UreticiAd,
                    KisaAciklama = u.KisaAciklama,
                    AnaGorselUrl = u.AnaGorselUrl,
                    GorselTemsiliMi = u.GorselTemsiliMi,
                    KampanyaliMi = u.KampanyaliMi,
                    ToplamStok = u.ToplamStok,
                    BaslangicFiyati = u.EnDusukFiyat ?? 0m,
                    ParaBirimi = u.ParaBirimi ?? "USD"
                }).ToList()
            }
        };

        if (filtre.KategoriId.HasValue)
            sonuc.Filtreler = await FacetleriHesaplaAsync(temelSorgu, filtre, kategoriIdleri);

        return sonuc;
    }

    /// <summary>
    /// Seçilen kategori ve TÜM alt kategorilerinin id'leri.
    /// Önceki sürüm yalnızca <c>KategoriId == x</c> karşılaştırması yapıyordu;
    /// bu yüzden "Yarı İletkenler" gibi bir üst kategoriye tıklandığında
    /// hiç ürün gelmiyordu — ürünler yaprak kategorilere bağlı.
    /// </summary>
    private async Task<List<int>?> KapsananKategoriIdleriniGetirAsync(int? kategoriId)
    {
        if (kategoriId is null) return null;

        var kategori = await _context.Kategoriler
            .AsNoTracking()
            .FirstOrDefaultAsync(k => k.Id == kategoriId.Value);

        if (kategori is null) return [kategoriId.Value];

        // ltree yolu "1.9.52" ise alt ağaç "1.9.52" ve "1.9.52.%" olanlardır.
        var yolOnEki = kategori.Yol + ".";

        return await _context.Kategoriler
            .AsNoTracking()
            .Where(k => k.Yol == kategori.Yol || k.Yol.StartsWith(yolOnEki))
            .Select(k => k.Id)
            .ToListAsync();
    }

    private IQueryable<Urun> TemelSorguKur(UrunAramaFiltreDto filtre, List<int>? kategoriIdleri)
    {
        var sorgu = _context.Urunler.AsNoTracking().Where(u => u.Aktif);

        if (kategoriIdleri is not null)
            sorgu = sorgu.Where(u => kategoriIdleri.Contains(u.KategoriId));

        if (!string.IsNullOrWhiteSpace(filtre.AramaMetni))
        {
            // Kullanıcı "stm32 f1" veya "STM32-F1" yazabilir; normalize edip
            // trigram index'inin kullanabileceği tek bir kalıba indiriyoruz.
            var normalize = UrunKoduNormalizeleyici.Normalize(filtre.AramaMetni);
            var serbestMetin = filtre.AramaMetni.Trim();

            sorgu = sorgu.Where(u =>
                EF.Functions.ILike(u.NormalizeKod, $"%{normalize}%") ||
                EF.Functions.ILike(u.KisaAciklama, $"%{serbestMetin}%"));
        }

        if (filtre.UreticiIdleri.Count > 0)
            sorgu = sorgu.Where(u => filtre.UreticiIdleri.Contains(u.UreticiId));

        if (filtre.SadeceStoktakiler)
            sorgu = sorgu.Where(u => u.UrunAmbalajlari.Any(a => a.StokMiktari > 0));

        return sorgu;
    }

    private IQueryable<Urun> ParametrikFiltreleriUygula(
        IQueryable<Urun> sorgu,
        Dictionary<string, List<string>> parametrikFiltreler)
    {
        // Farklı özellikler VE ile, aynı özelliğin değerleri VEYA ile birleşir:
        // (bit=32 VEYA bit=16) VE (kilif=LQFP48)
        foreach (var (ozellikKodu, degerler) in parametrikFiltreler)
        {
            if (degerler is null || degerler.Count == 0) continue;

            var kod = ozellikKodu;
            var secilenler = degerler;

            sorgu = sorgu.Where(u => _context.UrunOzellikDegerleri
                .Any(d => d.UrunId == u.Id
                       && d.OzellikTanim.Kod == kod
                       && d.DegerMetin != null
                       && secilenler.Contains(d.DegerMetin)));
        }

        return sorgu;
    }

    private static IQueryable<Urun> SiralamaUygula(IQueryable<Urun> sorgu, string? siralama) => siralama switch
    {
        "fiyat_artan" => sorgu.OrderBy(u => u.UrunAmbalajlari
            .SelectMany(a => a.FiyatKademeleri)
            .Min(f => (decimal?)f.BirimFiyat) ?? decimal.MaxValue),

        "fiyat_azalan" => sorgu.OrderByDescending(u => u.UrunAmbalajlari
            .SelectMany(a => a.FiyatKademeleri)
            .Min(f => (decimal?)f.BirimFiyat) ?? 0m),

        "yeni" => sorgu.OrderByDescending(u => u.OlusturmaTarihi),
        "populer" => sorgu.OrderByDescending(u => u.GoruntulenmeSayisi),
        "stok" => sorgu.OrderByDescending(u => u.UrunAmbalajlari.Sum(a => (int?)a.StokMiktari) ?? 0),
        _ => sorgu.OrderBy(u => u.Id)
    };

    /// <summary>
    /// Facet sayaçları.
    ///
    /// Kritik ayrıntı: bir özelliğin sayaçları hesaplanırken O ÖZELLİĞİN KENDİ
    /// seçimi filtreye dahil EDİLMEZ. Aksi hâlde "32 Bit" seçildiği anda aynı
    /// grubun diğer seçenekleri 0'a düşer ve kullanıcı seçimini genişletemez.
    /// Diğer özelliklerin seçimleri ise sayaca dahildir.
    /// </summary>
    private async Task<List<FacetGrupDto>> FacetleriHesaplaAsync(
        IQueryable<Urun> temelSorgu,
        UrunAramaFiltreDto filtre,
        List<int>? kategoriIdleri)
    {
        // Bu kategoride hangi filtreler gösterilecek? Doğrudan KategoriOzellikleri'nden.
        var tanimlar = await _context.KategoriOzellikleri
            .AsNoTracking()
            .Where(ko => kategoriIdleri!.Contains(ko.KategoriId) && ko.OzellikTanim.FiltrelenebilirMi)
            .OrderBy(ko => ko.Sira)
            .Select(ko => new
            {
                ko.OzellikTanimId,
                ko.OzellikTanim.Kod,
                ko.OzellikTanim.AdTr,
                ko.OzellikTanim.Birim,
                ko.OzellikTanim.GosterimTipi,
                ko.Sira
            })
            .Distinct()
            .ToListAsync();

        var gruplar = new List<FacetGrupDto>();

        foreach (var tanim in tanimlar.OrderBy(t => t.Sira).ThenBy(t => t.AdTr))
        {
            // Kendi seçimi hariç, diğer parametrik filtreler uygulanmış sorgu.
            var digerFiltreler = filtre.ParametrikFiltreler
                .Where(p => p.Key != tanim.Kod)
                .ToDictionary(p => p.Key, p => p.Value);

            var sayimSorgusu = ParametrikFiltreleriUygula(temelSorgu, digerFiltreler);

            var secenekler = await _context.UrunOzellikDegerleri
                .AsNoTracking()
                .Where(d => d.OzellikTanimId == tanim.OzellikTanimId && d.DegerMetin != null)
                .Where(d => sayimSorgusu.Any(u => u.Id == d.UrunId))
                .GroupBy(d => d.DegerMetin!)
                .Select(g => new { Deger = g.Key, Sayi = g.Count() })
                .OrderByDescending(x => x.Sayi)
                .ThenBy(x => x.Deger)
                .Take(50) // Uzun listelerde panel şişmesin
                .ToListAsync();

            if (secenekler.Count == 0) continue;

            gruplar.Add(new FacetGrupDto
            {
                Kod = tanim.Kod,
                Ad = tanim.AdTr,
                Birim = tanim.Birim,
                GosterimTipi = (short)tanim.GosterimTipi,
                Secenekler = secenekler.Select(s => new FacetSecenekDto
                {
                    Deger = s.Deger,
                    HamDeger = s.Deger,
                    UrunSayisi = s.Sayi
                }).ToList()
            });
        }

        return gruplar;
    }

    // -----------------------------------------------------------------------
    // Ürün detay
    // -----------------------------------------------------------------------

    public async Task<UrunDetayDto?> UrunDetayGetirAsync(long id)
    {
        var urun = await _context.Urunler
            .Include(u => u.Uretici)
            .Include(u => u.Dokumanlar)
            .Include(u => u.Gorseller)
            .Include(u => u.UrunAmbalajlari).ThenInclude(a => a.FiyatKademeleri)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (urun is null) return null;

        var dto = new UrunDetayDto
        {
            Id = urun.Id,
            UreticiUrunKodu = urun.UreticiUrunKodu,
            UreticiAd = urun.Uretici.Ad,
            KisaAciklama = urun.KisaAciklama,
            DetayliAciklama = urun.DetayliAciklamaTr,
            GorselUrlleri = urun.Gorseller.OrderBy(g => g.Sira).Select(g => g.Url).ToList(),
            GorselTemsiliMi = urun.GorselTemsiliMi,
            UrunDurumu = urun.UrunDurumu.ToString(),
            RohsDurumu = urun.RohsDurumu.ToString(),
            MontajTipi = urun.MontajTipi.ToString(),
            UreticiTeslimSuresi = urun.UreticiTeslimSuresiHaftaMin is null
                ? null
                : $"{urun.UreticiTeslimSuresiHaftaMin}-{urun.UreticiTeslimSuresiHaftaMax} Hafta"
        };

        if (!string.IsNullOrEmpty(urun.AnaGorselUrl) && !dto.GorselUrlleri.Contains(urun.AnaGorselUrl))
            dto.GorselUrlleri.Insert(0, urun.AnaGorselUrl);

        // Özellikler JSONB'den tek satırda okunur — 20 özellik için JOIN atmıyoruz.
        if (!string.IsNullOrWhiteSpace(urun.OzelliklerJson))
        {
            try
            {
                dto.Ozellikler = JsonSerializer.Deserialize<Dictionary<string, string>>(urun.OzelliklerJson) ?? [];
            }
            catch (JsonException)
            {
                // Bozuk JSON ürün detayını komple çökertmesin; özellik bloğu boş görünür.
                dto.Ozellikler = [];
            }
        }

        foreach (var dokuman in urun.Dokumanlar)
            dto.Dokumanlar.Add(new DokumanDto { Baslik = dokuman.Baslik, Url = dokuman.Url, Tip = (short)dokuman.Tip });

        foreach (var ambalaj in urun.UrunAmbalajlari.OrderByDescending(a => a.VarsayilanMi).ThenBy(a => a.Ad))
        {
            var ambalajDto = new AmbalajFiyatDto
            {
                AmbalajId = ambalaj.Id,
                Ad = ambalaj.Ad,
                Moq = ambalaj.Moq,
                Mpq = ambalaj.Mpq,
                KatlamaMiktari = ambalaj.KatlamaMiktari,
                StokMiktari = ambalaj.StokMiktari,
                GelecekStokMiktari = ambalaj.GelecekStokMiktari,
                GelecekStokTarihi = ambalaj.GelecekStokTarihi?.ToString("yyyy-MM-dd")
            };

            foreach (var kademe in ambalaj.FiyatKademeleri.OrderBy(x => x.MinMiktar))
            {
                ambalajDto.Fiyatlar.Add(new FiyatKademesiDto
                {
                    MinMiktar = kademe.MinMiktar,
                    MaxMiktar = kademe.MaxMiktar,
                    BirimFiyat = kademe.BirimFiyat,
                    ParaBirimi = kademe.ParaBirimi
                });
            }

            dto.AmbalajlarVeFiyatlar.Add(ambalajDto);
        }

        return dto;
    }
}
