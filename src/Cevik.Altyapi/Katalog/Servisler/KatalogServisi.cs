using System.Text.Json;
using Cevik.Alan.Katalog;
using Cevik.Alan.Kurallar;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Katalog.Arayuzler;
using Cevik.Uygulama.Katalog.Dto;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Alan.Ortak;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Cevik.Altyapi.Katalog.Servisler;

public class KatalogServisi : IKatalogServisi
{
    private readonly CevikDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly IDovizKuruServisi _dovizKuruServisi;

    public KatalogServisi(CevikDbContext context, IDistributedCache cache, IDovizKuruServisi dovizKuruServisi)
    {
        _context = context;
        _cache = cache;
        _dovizKuruServisi = dovizKuruServisi;
    }

    // -----------------------------------------------------------------------
    // Kategori
    // -----------------------------------------------------------------------

    public async Task<List<KategoriAgacDto>> KategoriAgaciniGetirAsync(string? dil = null)
    {
        var dilKodu = DilKodu.Coz(dil);
        var anahtar = OnbellekAnahtarlari.KategoriAgaciDil(dilKodu);

        var onbellektekiler = await _cache.GetStringAsync(anahtar);
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

        var cocuklar = tumKategoriler
            .Where(k => k.UstKategoriId is not null)
            .GroupBy(k => k.UstKategoriId!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        var sonuc = tumKategoriler
            .Where(k => k.UstKategoriId is null)
            .Select(k => AgacOlustur(k, cocuklar, dilKodu))
            .ToList();

        await _cache.SetStringAsync(
            anahtar,
            JsonSerializer.Serialize(sonuc),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24) });

        return sonuc;
    }

    private static KategoriAgacDto AgacOlustur(Kategori kategori, Dictionary<int, List<Kategori>> cocuklar, string dil)
    {
        var dto = new KategoriAgacDto
        {
            Id = kategori.Id,
            Ad = KategoriAdi(kategori, dil),
            Slug = KategoriSlug(kategori, dil),
            IkonUrl = kategori.IkonUrl,
            YaprakMi = kategori.YaprakMi,
            Sira = kategori.Sira
        };

        if (cocuklar.TryGetValue(kategori.Id, out var altlar))
        {
            foreach (var alt in altlar)
                dto.AltKategoriler.Add(AgacOlustur(alt, cocuklar, dil));
        }

        return dto;
    }

    public async Task<KategoriDetayDto?> KategoriDetayGetirAsync(string slug, string? dil = null)
    {
        var dilKodu = DilKodu.Coz(dil);
        var kategori = await _context.Kategoriler
            .AsNoTracking()
            .FirstOrDefaultAsync(k => k.SlugTr == slug || k.SlugEn == slug);

        if (kategori is null) return null;

        return new KategoriDetayDto
        {
            Id = kategori.Id,
            Ad = KategoriAdi(kategori, dilKodu),
            Slug = KategoriSlug(kategori, dilKodu),
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

        var hedefPara = ParaBirimiKodu.Coz(filtre.ParaBirimi);
        var dilKodu = DilKodu.Coz(filtre.Dil);

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

        var kurOnbellegi = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
        var kayitlar = new List<UrunOzetDto>(urunler.Count);
        foreach (var u in urunler)
        {
            var kaynak = u.ParaBirimi ?? ParaBirimiKodu.Usd;
            kayitlar.Add(new UrunOzetDto
            {
                Id = u.Id,
                UreticiUrunKodu = u.UreticiUrunKodu,
                UreticiAd = u.UreticiAd,
                KisaAciklama = u.KisaAciklama,
                AnaGorselUrl = u.AnaGorselUrl,
                GorselTemsiliMi = u.GorselTemsiliMi,
                KampanyaliMi = u.KampanyaliMi,
                ToplamStok = u.ToplamStok,
                BaslangicFiyati = await FiyatiDonusturAsync(u.EnDusukFiyat ?? 0m, kaynak, hedefPara, kurOnbellegi),
                ParaBirimi = hedefPara
            });
        }

        var sonuc = new UrunAramaSonucDto
        {
            Urunler = new PagedResultDto<UrunOzetDto>
            {
                SayfaNo = sayfaNo,
                SayfaBoyutu = sayfaBoyutu,
                ToplamKayit = toplamKayit,
                Kayitlar = kayitlar
            }
        };

        if (filtre.KategoriId.HasValue)
            sonuc.Filtreler = await FacetleriHesaplaAsync(temelSorgu, filtre, kategoriIdleri, dilKodu);

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
        List<int>? kategoriIdleri,
        string dil)
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
                ko.OzellikTanim.AdEn,
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
                Ad = DilKodu.IngilizceMi(dil)
                    ? (string.IsNullOrWhiteSpace(tanim.AdEn) ? tanim.AdTr : tanim.AdEn)
                    : tanim.AdTr,
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

    public async Task<UrunDetayDto?> UrunDetayGetirAsync(long id, string? dil = null, string? paraBirimi = null)
    {
        var dilKodu = DilKodu.Coz(dil);
        var hedefPara = ParaBirimiKodu.Coz(paraBirimi);

        var urun = await _context.Urunler
            .Include(u => u.Uretici)
            .Include(u => u.Dokumanlar)
            .Include(u => u.Gorseller)
            .Include(u => u.UrunAmbalajlari).ThenInclude(a => a.FiyatKademeleri)
            .Include(u => u.IliskiliUrunler).ThenInclude(i => i.Iliskili)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (urun is null) return null;

        var dto = new UrunDetayDto
        {
            Id = urun.Id,
            UreticiUrunKodu = urun.UreticiUrunKodu,
            UreticiAd = urun.Uretici.Ad,
            KisaAciklama = urun.KisaAciklama,
            DetayliAciklama = DilKodu.IngilizceMi(dilKodu)
                ? (urun.DetayliAciklamaEn ?? urun.DetayliAciklamaTr)
                : urun.DetayliAciklamaTr,
            GorselUrlleri = urun.Gorseller.OrderBy(g => g.Sira).Select(g => g.Url).ToList(),
            GorselTemsiliMi = urun.GorselTemsiliMi,
            UrunDurumu = urun.UrunDurumu.ToString(),
            RohsDurumu = urun.RohsDurumu.ToString(),
            MontajTipi = urun.MontajTipi.ToString(),
            UreticiTeslimSuresi = urun.UreticiTeslimSuresiHaftaMin is null
                ? null
                : DilKodu.IngilizceMi(dilKodu)
                    ? $"{urun.UreticiTeslimSuresiHaftaMin}-{urun.UreticiTeslimSuresiHaftaMax} weeks"
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

        var kurOnbellegi = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);

        foreach (var ambalaj in urun.UrunAmbalajlari.OrderByDescending(a => a.VarsayilanMi).ThenBy(a => a.Ad))
        {
            var ambalajDto = new AmbalajFiyatDto
            {
                AmbalajId = ambalaj.Id,
                Ad = ambalaj.Ad,
                Moq = ambalaj.Moq,
                Mpq = ambalaj.Mpq,
                KatlamaMiktari = ambalaj.KatlamaMiktari,
                StokMiktari = (int)ambalaj.StokMiktari,
                GelecekStokMiktari = (int)ambalaj.GelecekStokMiktari,
                GelecekStokTarihi = ambalaj.GelecekStokTarihi?.ToString("yyyy-MM-dd")
            };

            foreach (var kademe in ambalaj.FiyatKademeleri.OrderBy(x => x.MinMiktar))
            {
                ambalajDto.Fiyatlar.Add(new FiyatKademesiDto
                {
                    MinMiktar = kademe.MinMiktar,
                    MaxMiktar = kademe.MaxMiktar,
                    BirimFiyat = await FiyatiDonusturAsync(kademe.BirimFiyat, kademe.ParaBirimi, hedefPara, kurOnbellegi),
                    ParaBirimi = hedefPara
                });
            }

            dto.AmbalajlarVeFiyatlar.Add(ambalajDto);
        }

        // Iliskili urunleri DTO'ya map et
        foreach (var iliski in urun.IliskiliUrunler.OrderBy(i => i.Sira))
        {
            var ozet = new IliskiliUrunOzetDto
            {
                Id = iliski.Iliskili.Id,
                UreticiUrunKodu = iliski.Iliskili.UreticiUrunKodu,
                KisaAciklama = iliski.Iliskili.KisaAciklama,
                AnaGorselUrl = iliski.Iliskili.AnaGorselUrl
            };

            switch (iliski.IliskiTipi)
            {
                case IliskiTipi.Muadil: dto.Muadiller.Add(ozet); break;
                case IliskiTipi.Benzer: dto.BenzerUrunler.Add(ozet); break;
                case IliskiTipi.Parametrik: dto.ParametrikUrunler.Add(ozet); break;
                case IliskiTipi.BirlikteKullanilan: dto.BirlikteKullanilanlar.Add(ozet); break;
            }
        }

        return dto;
    }

    public async Task<List<UreticiOzetDto>> UreticileriGetirAsync()
    {
        // Yalnızca aktif ve en az bir ürünü olan üreticiler. UrunSayisi global
        // soft-delete filtresini otomatik uygular; sayı gerçektir, uydurma değil.
        return await _context.Ureticiler
            .Where(u => u.Aktif && u.Urunler.Any())
            .OrderByDescending(u => u.YetkiliDistributorMu)
            .ThenByDescending(u => u.Urunler.Count)
            .ThenBy(u => u.Ad)
            .AsNoTracking()
            .Select(u => new UreticiOzetDto
            {
                Id = u.Id,
                Ad = u.Ad,
                Slug = u.Slug,
                LogoUrl = u.LogoUrl,
                WebSitesi = u.WebSitesi,
                YetkiliDistributorMu = u.YetkiliDistributorMu,
                UrunSayisi = u.Urunler.Count
            })
            .ToListAsync();
    }

    public async Task IliskiliUrunEkleAsync(long urunId, long iliskiliUrunId, short tip, int sira = 0)
    {
        if (urunId == iliskiliUrunId)
            throw new IsKuraliIhlaliException("Urun kendisine iliskilendirilemez.");

        var iliskiTipi = (IliskiTipi)tip;

        var mevcut = await _context.IliskiliUrunler
            .AnyAsync(i => i.UrunId == urunId && i.IliskiliUrunId == iliskiliUrunId && i.IliskiTipi == iliskiTipi);

        if (!mevcut)
        {
            _context.IliskiliUrunler.Add(new IliskiliUrun
            {
                UrunId = urunId,
                IliskiliUrunId = iliskiliUrunId,
                IliskiTipi = iliskiTipi,
                Sira = sira
            });
        }

        if (iliskiTipi == IliskiTipi.Muadil)
        {
            var ciftYonlu = await _context.IliskiliUrunler
                .AnyAsync(i => i.UrunId == iliskiliUrunId && i.IliskiliUrunId == urunId && i.IliskiTipi == iliskiTipi);

            if (!ciftYonlu)
            {
                _context.IliskiliUrunler.Add(new IliskiliUrun
                {
                    UrunId = iliskiliUrunId,
                    IliskiliUrunId = urunId,
                    IliskiTipi = iliskiTipi,
                    Sira = sira
                });
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task IliskiliUrunSilAsync(long urunId, long iliskiliUrunId, short tip)
    {
        var iliskiTipi = (IliskiTipi)tip;

        var iliski = await _context.IliskiliUrunler
            .FirstOrDefaultAsync(i => i.UrunId == urunId && i.IliskiliUrunId == iliskiliUrunId && i.IliskiTipi == iliskiTipi);

        if (iliski != null)
            _context.IliskiliUrunler.Remove(iliski);

        if (iliskiTipi == IliskiTipi.Muadil)
        {
            var ters = await _context.IliskiliUrunler
                .FirstOrDefaultAsync(i => i.UrunId == iliskiliUrunId && i.IliskiliUrunId == urunId && i.IliskiTipi == iliskiTipi);

            if (ters != null)
                _context.IliskiliUrunler.Remove(ters);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<KarsilastirmaSonucDto> KarsilastirmaListesiGetirAsync(long? kullaniciId, string? oturumAnahtari)
    {
        var sorgu = _context.Karsilastirmalar
            .Include(k => k.Urun).ThenInclude(u => u.Uretici)
            .Include(k => k.Urun).ThenInclude(u => u.OzellikDegerleri).ThenInclude(o => o.OzellikTanim)
            .Include(k => k.Urun).ThenInclude(u => u.UrunAmbalajlari).ThenInclude(a => a.FiyatKademeleri)
            .AsNoTracking();

        if (kullaniciId.HasValue)
            sorgu = sorgu.Where(k => k.KullaniciId == kullaniciId.Value);
        else if (!string.IsNullOrWhiteSpace(oturumAnahtari))
            sorgu = sorgu.Where(k => k.OturumAnahtari == oturumAnahtari);
        else
            return new KarsilastirmaSonucDto(); // İkisi de yoksa boş dön.

        var kayitlar = await sorgu.OrderBy(k => k.EklenmeTarihi).ToListAsync();

        var sonuc = new KarsilastirmaSonucDto();
        
        // Ortak özellikleri topla (sadece her üründe bulunan veya bazı ürünlerde olanları birleştir)
        var butunOzellikler = new Dictionary<string, KarsilastirmaOzellikDto>();

        foreach (var k in kayitlar)
        {
            var urun = k.Urun;
            var enUcuzFiyat = urun.UrunAmbalajlari
                .SelectMany(a => a.FiyatKademeleri)
                .Where(f => f.MusteriGrubuId == null) // Sadece genel fiyatları dikkate al (örnek)
                .Select(f => (decimal?)f.BirimFiyat)
                .Min();

            sonuc.Urunler.Add(new KarsilastirmaUrunDto
            {
                UrunId = urun.Id,
                UreticiUrunKodu = urun.UreticiUrunKodu,
                UreticiAd = urun.Uretici.Ad,
                AnaGorselUrl = urun.AnaGorselUrl,
                EnUcuzFiyat = enUcuzFiyat
            });

            foreach (var ozellik in urun.OzellikDegerleri)
            {
                var kod = ozellik.OzellikTanim.Kod;
                if (!butunOzellikler.TryGetValue(kod, out var ozellikDto))
                {
                    ozellikDto = new KarsilastirmaOzellikDto
                    {
                        OzellikKodu = kod,
                        OzellikAd = ozellik.OzellikTanim.AdTr
                    };
                    butunOzellikler[kod] = ozellikDto;
                }
                
                ozellikDto.Degerler[urun.Id] = ozellik.DegerMetin ?? string.Empty;
            }
        }

        sonuc.OrtakOzellikler = butunOzellikler.Values.OrderBy(o => o.OzellikAd).ToList();

        return sonuc;
    }

    public async Task KarsilastirmayaEkleAsync(long? kullaniciId, string? oturumAnahtari, long urunId)
    {
        if (kullaniciId is null && string.IsNullOrWhiteSpace(oturumAnahtari))
            throw new IsKuraliIhlaliException("Kullanici veya oturum anahtari gereklidir.");

        var mevcutMu = await _context.Karsilastirmalar
            .AnyAsync(k => k.UrunId == urunId && 
                          (kullaniciId != null ? k.KullaniciId == kullaniciId : k.OturumAnahtari == oturumAnahtari));

        if (!mevcutMu)
        {
            var sinir = await _context.Karsilastirmalar
                .CountAsync(k => (kullaniciId != null ? k.KullaniciId == kullaniciId : k.OturumAnahtari == oturumAnahtari));

            if (sinir >= 10)
                throw new IsKuraliIhlaliException("Karşılaştırma listesine en fazla 10 ürün eklenebilir.");

            _context.Karsilastirmalar.Add(new Cevik.Alan.Kimlik.Karsilastirma
            {
                UrunId = urunId,
                KullaniciId = kullaniciId,
                OturumAnahtari = kullaniciId == null ? oturumAnahtari : null
            });

            await _context.SaveChangesAsync();
        }
    }

    public async Task KarsilastirmadanCikarAsync(long? kullaniciId, string? oturumAnahtari, long urunId)
    {
        var kayit = await _context.Karsilastirmalar
            .FirstOrDefaultAsync(k => k.UrunId == urunId && 
                                     (kullaniciId != null ? k.KullaniciId == kullaniciId : k.OturumAnahtari == oturumAnahtari));

        if (kayit != null)
        {
            _context.Karsilastirmalar.Remove(kayit);
            await _context.SaveChangesAsync();
        }
    }

    private static string KategoriAdi(Kategori kategori, string dil) =>
        DilKodu.IngilizceMi(dil)
            ? (string.IsNullOrWhiteSpace(kategori.AdEn) ? kategori.AdTr : kategori.AdEn)
            : kategori.AdTr;

    private static string KategoriSlug(Kategori kategori, string dil) =>
        DilKodu.IngilizceMi(dil)
            ? (string.IsNullOrWhiteSpace(kategori.SlugEn) ? kategori.SlugTr : kategori.SlugEn)
            : kategori.SlugTr;

    private async Task<decimal> FiyatiDonusturAsync(
        decimal tutar,
        string kaynakParaBirimi,
        string hedefParaBirimi,
        Dictionary<string, decimal> kurOnbellegi)
    {
        var kaynak = string.IsNullOrWhiteSpace(kaynakParaBirimi)
            ? ParaBirimiKodu.Usd
            : kaynakParaBirimi.ToUpperInvariant();

        if (kaynak == hedefParaBirimi)
            return ParaHesabi.Yuvarla(tutar);

        if (!kurOnbellegi.TryGetValue(kaynak, out var kur))
        {
            kur = await _dovizKuruServisi.KurGetirAsync(kaynak, hedefParaBirimi);
            kurOnbellegi[kaynak] = kur;
        }

        return ParaHesabi.Donustur(tutar, kur);
    }
}
