using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Katalog;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Yonetim.Arayuzler;
using Cevik.Uygulama.Yonetim.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Cevik.Altyapi.Yonetim.Servisler;

public class KatalogYonetimServisi : IKatalogYonetimServisi
{
    private readonly CevikDbContext _context;
    private readonly IDistributedCache _cache;

    public KatalogYonetimServisi(CevikDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<UrunYonetimSayfasiDto> UrunleriListeleAsync(
        string? arama,
        int? kategoriId,
        bool silinmisleriGoster,
        int sayfaNo,
        int sayfaBoyutu)
    {
        sayfaBoyutu = Math.Clamp(sayfaBoyutu, 1, 200);
        sayfaNo = Math.Max(sayfaNo, 1);
        var sorgu = silinmisleriGoster
            ? _context.Urunler.IgnoreQueryFilters().AsQueryable()
            : _context.Urunler.AsQueryable();

        if (!string.IsNullOrWhiteSpace(arama))
        {
            var normalize = UrunKoduNormalizeleyici.Normalize(arama);
            sorgu = sorgu.Where(u => EF.Functions.ILike(u.NormalizeKod, $"%{normalize}%"));
        }

        if (kategoriId.HasValue)
            sorgu = sorgu.Where(u => u.KategoriId == kategoriId.Value);

        return new UrunYonetimSayfasiDto
        {
            SayfaNo = sayfaNo,
            SayfaBoyutu = sayfaBoyutu,
            ToplamKayit = await sorgu.CountAsync(),
            Kayitlar = await sorgu
                .OrderBy(u => u.Id)
                .Skip((sayfaNo - 1) * sayfaBoyutu)
                .Take(sayfaBoyutu)
                .AsNoTracking()
                .Select(u => new UrunYonetimOzetDto
                {
                    Id = u.Id,
                    UreticiUrunKodu = u.UreticiUrunKodu,
                    KisaAciklama = u.KisaAciklama,
                    KategoriId = u.KategoriId,
                    UreticiId = u.UreticiId,
                    UrunDurumu = (short)u.UrunDurumu,
                    Aktif = u.Aktif,
                    SilindiMi = u.SilindiMi,
                    ToplamStok = u.UrunAmbalajlari.Sum(a => (int?)a.StokMiktari) ?? 0
                })
                .ToListAsync()
        };
    }

    public Task<UrunYonetimDetayDto?> UrunGetirAsync(long id) =>
        _context.Urunler
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UrunYonetimDetayDto
            {
                Id = u.Id,
                UreticiUrunKodu = u.UreticiUrunKodu,
                KisaAciklama = u.KisaAciklama,
                DetayliAciklamaTr = u.DetayliAciklamaTr,
                AnaGorselUrl = u.AnaGorselUrl,
                KategoriId = u.KategoriId,
                UreticiId = u.UreticiId,
                UrunDurumu = (short)u.UrunDurumu,
                RohsDurumu = (short)u.RohsDurumu,
                MontajTipi = (short)u.MontajTipi,
                KampanyaliMi = u.KampanyaliMi,
                Aktif = u.Aktif,
                SilindiMi = u.SilindiMi,
                ToplamStok = u.UrunAmbalajlari.Sum(a => (int?)a.StokMiktari) ?? 0
            })
            .FirstOrDefaultAsync();

    public async Task<KimlikDto> UrunEkleAsync(UrunEkleDto dto)
    {
        if (!await _context.Kategoriler.AnyAsync(k => k.Id == dto.KategoriId))
            throw new KeyNotFoundException("Kategori bulunamadı.");
        if (!await _context.Ureticiler.AnyAsync(u => u.Id == dto.UreticiId))
            throw new KeyNotFoundException("Üretici bulunamadı.");
        if (await _context.Urunler.IgnoreQueryFilters().AnyAsync(u =>
                u.UreticiId == dto.UreticiId && u.UreticiUrunKodu == dto.UreticiUrunKodu))
            throw new IsKuraliIhlaliException("Bu üreticide aynı ürün kodu zaten kayıtlı.");

        var urun = new Urun
        {
            KategoriId = dto.KategoriId,
            UreticiId = dto.UreticiId,
            UreticiUrunKodu = dto.UreticiUrunKodu,
            NormalizeKod = UrunKoduNormalizeleyici.Normalize(dto.UreticiUrunKodu),
            KisaAciklama = dto.KisaAciklama,
            DetayliAciklamaTr = dto.DetayliAciklamaTr,
            AnaGorselUrl = dto.AnaGorselUrl,
            UrunDurumu = (UrunDurumu)dto.UrunDurumu,
            RohsDurumu = (RohsDurumu)dto.RohsDurumu,
            MontajTipi = (MontajTipi)dto.MontajTipi,
            Aktif = dto.Aktif
        };
        _context.Urunler.Add(urun);
        await _context.SaveChangesAsync();
        return new KimlikDto { Id = urun.Id };
    }

    public async Task UrunGuncelleAsync(long id, UrunGuncelleDto dto)
    {
        var urun = await _context.Urunler.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");
        urun.KisaAciklama = dto.KisaAciklama;
        urun.DetayliAciklamaTr = dto.DetayliAciklamaTr;
        urun.AnaGorselUrl = dto.AnaGorselUrl;
        urun.UrunDurumu = (UrunDurumu)dto.UrunDurumu;
        urun.RohsDurumu = (RohsDurumu)dto.RohsDurumu;
        urun.MontajTipi = (MontajTipi)dto.MontajTipi;
        urun.KampanyaliMi = dto.KampanyaliMi;
        urun.Aktif = dto.Aktif;
        await _context.SaveChangesAsync();
    }

    public async Task UrunSilAsync(long id)
    {
        var urun = await _context.Urunler.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");
        urun.SilindiMi = true;
        await _context.SaveChangesAsync();
    }

    public async Task UrunGeriAlAsync(long id)
    {
        var urun = await _context.Urunler.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");
        urun.SilindiMi = false;
        await _context.SaveChangesAsync();
    }

    public async Task StokGuncelleAsync(StokGuncelleDto dto)
    {
        if (dto.StokMiktari < 0 || dto.GelecekStokMiktari < 0)
            throw new IsKuraliIhlaliException("Stok miktarı negatif olamaz.");
        var ambalaj = await _context.UrunAmbalajlari.FirstOrDefaultAsync(a => a.Id == dto.UrunAmbalajId)
            ?? throw new KeyNotFoundException("Ürün ambalajı bulunamadı.");
        ambalaj.StokMiktari = dto.StokMiktari;
        ambalaj.GelecekStokMiktari = dto.GelecekStokMiktari;
        ambalaj.GelecekStokTarihi = dto.GelecekStokTarihi is null
            ? null
            : DateTime.SpecifyKind(dto.GelecekStokTarihi.Value, DateTimeKind.Utc);
        await _context.SaveChangesAsync();
    }

    public async Task FiyatGuncelleAsync(AmbalajFiyatGuncelleDto dto)
    {
        var ambalaj = await _context.UrunAmbalajlari
            .Include(a => a.FiyatKademeleri)
            .FirstOrDefaultAsync(a => a.Id == dto.UrunAmbalajId)
            ?? throw new KeyNotFoundException("Ürün ambalajı bulunamadı.");
        if (dto.Kademeler.Count == 0)
            throw new IsKuraliIhlaliException("En az bir fiyat kademesi gereklidir.");

        var sirali = dto.Kademeler.OrderBy(k => k.MinMiktar).ToList();
        for (var i = 1; i < sirali.Count; i++)
        {
            var oncekiUst = sirali[i - 1].MaxMiktar;
            if (oncekiUst is null || sirali[i].MinMiktar <= oncekiUst)
                throw new IsKuraliIhlaliException(
                    $"Fiyat kademeleri çakışıyor: {sirali[i - 1].MinMiktar}-{oncekiUst} ile {sirali[i].MinMiktar} başlangıçlı kademe.");
        }
        if (sirali.Any(k => k.BirimFiyat < 0))
            throw new IsKuraliIhlaliException("Birim fiyat negatif olamaz.");

        _context.FiyatKademeleri.RemoveRange(ambalaj.FiyatKademeleri);
        _context.FiyatKademeleri.AddRange(sirali.Select(k => new FiyatKademesi
        {
            UrunAmbalajId = ambalaj.Id,
            MinMiktar = k.MinMiktar,
            MaxMiktar = k.MaxMiktar,
            BirimFiyat = k.BirimFiyat,
            ParaBirimi = k.ParaBirimi,
            MusteriGrubuId = k.MusteriGrubuId
        }));
        await _context.SaveChangesAsync();
    }

    public async Task<List<KategoriYonetimDto>> KategorileriListeleAsync(bool silinmisleriGoster)
    {
        var sorgu = silinmisleriGoster
            ? _context.Kategoriler.IgnoreQueryFilters().AsQueryable()
            : _context.Kategoriler.AsQueryable();
        return await sorgu.OrderBy(k => k.Yol).AsNoTracking().Select(k => new KategoriYonetimDto
        {
            Id = k.Id,
            UstKategoriId = k.UstKategoriId,
            AdTr = k.AdTr,
            AdEn = k.AdEn,
            SlugTr = k.SlugTr,
            Yol = k.Yol,
            Seviye = k.Seviye,
            Sira = k.Sira,
            YaprakMi = k.YaprakMi,
            Aktif = k.Aktif,
            SilindiMi = k.SilindiMi
        }).ToListAsync();
    }

    public async Task<KategoriOlusturmaSonucuDto> KategoriEkleAsync(KategoriYazDto dto)
    {
        Kategori? ust = null;
        if (dto.UstKategoriId is not null)
            ust = await _context.Kategoriler.FirstOrDefaultAsync(k => k.Id == dto.UstKategoriId)
                ?? throw new KeyNotFoundException("Üst kategori bulunamadı.");

        var kategori = new Kategori
        {
            UstKategoriId = dto.UstKategoriId,
            AdTr = dto.AdTr,
            AdEn = dto.AdEn,
            SlugTr = dto.SlugTr,
            SlugEn = dto.SlugEn,
            Yol = "0",
            Seviye = (short)(ust is null ? 0 : ust.Seviye + 1),
            Sira = dto.Sira,
            YaprakMi = dto.YaprakMi,
            IkonUrl = dto.IkonUrl,
            SeoBaslik = dto.SeoBaslik,
            SeoAciklama = dto.SeoAciklama,
            SeoIcerikHtml = dto.SeoIcerikHtml,
            Aktif = dto.Aktif
        };
        _context.Kategoriler.Add(kategori);
        await _context.SaveChangesAsync();
        kategori.Yol = ust is null ? kategori.Id.ToString() : $"{ust.Yol}.{kategori.Id}";
        await _context.SaveChangesAsync();
        await KategoriOnbelleginiTemizleAsync();
        return new KategoriOlusturmaSonucuDto { Id = kategori.Id, Yol = kategori.Yol };
    }

    public async Task KategoriGuncelleAsync(int id, KategoriYazDto dto)
    {
        var kategori = await _context.Kategoriler.FirstOrDefaultAsync(k => k.Id == id)
            ?? throw new KeyNotFoundException("Kategori bulunamadı.");
        kategori.AdTr = dto.AdTr;
        kategori.AdEn = dto.AdEn;
        kategori.SlugTr = dto.SlugTr;
        kategori.SlugEn = dto.SlugEn;
        kategori.Sira = dto.Sira;
        kategori.YaprakMi = dto.YaprakMi;
        kategori.IkonUrl = dto.IkonUrl;
        kategori.SeoBaslik = dto.SeoBaslik;
        kategori.SeoAciklama = dto.SeoAciklama;
        kategori.SeoIcerikHtml = dto.SeoIcerikHtml;
        kategori.Aktif = dto.Aktif;
        await _context.SaveChangesAsync();
        await KategoriOnbelleginiTemizleAsync();
    }

    public async Task KategoriSilAsync(int id)
    {
        var kategori = await _context.Kategoriler.FirstOrDefaultAsync(k => k.Id == id)
            ?? throw new KeyNotFoundException("Kategori bulunamadı.");
        if (await _context.Kategoriler.AnyAsync(k => k.UstKategoriId == id))
            throw new IsKuraliIhlaliException("Alt kategorisi olan kategori silinemez.");
        if (await _context.Urunler.AnyAsync(u => u.KategoriId == id))
            throw new IsKuraliIhlaliException("Ürünü olan kategori silinemez.");
        kategori.SilindiMi = true;
        await _context.SaveChangesAsync();
        await KategoriOnbelleginiTemizleAsync();
    }

    public async Task KategoriOzelligiBaglaAsync(KategoriOzelligiYazDto dto)
    {
        if (!await _context.Kategoriler.AnyAsync(k => k.Id == dto.KategoriId))
            throw new KeyNotFoundException("Kategori bulunamadı.");
        if (!await _context.OzellikTanimlari.AnyAsync(o => o.Id == dto.OzellikTanimId))
            throw new KeyNotFoundException("Özellik tanımı bulunamadı.");
        var mevcut = await _context.KategoriOzellikleri.FirstOrDefaultAsync(ko =>
            ko.KategoriId == dto.KategoriId && ko.OzellikTanimId == dto.OzellikTanimId);
        if (mevcut is null)
            _context.KategoriOzellikleri.Add(new KategoriOzelligi
            {
                KategoriId = dto.KategoriId,
                OzellikTanimId = dto.OzellikTanimId,
                Sira = dto.Sira,
                ZorunluMu = dto.ZorunluMu
            });
        else
        {
            mevcut.Sira = dto.Sira;
            mevcut.ZorunluMu = dto.ZorunluMu;
        }
        await _context.SaveChangesAsync();
        foreach (var anahtar in OnbellekAnahtarlari.KategoriFacetAnahtarlari(dto.KategoriId))
            await _cache.RemoveAsync(anahtar);
    }

    public async Task KategoriOzelligiKaldirAsync(int kategoriId, int ozellikTanimId)
    {
        var kayit = await _context.KategoriOzellikleri.FirstOrDefaultAsync(ko =>
            ko.KategoriId == kategoriId && ko.OzellikTanimId == ozellikTanimId)
            ?? throw new KeyNotFoundException("Kategori özelliği bulunamadı.");
        _context.KategoriOzellikleri.Remove(kayit);
        await _context.SaveChangesAsync();
        foreach (var anahtar in OnbellekAnahtarlari.KategoriFacetAnahtarlari(kategoriId))
            await _cache.RemoveAsync(anahtar);
    }

    public async Task<List<UreticiYonetimDto>> UreticileriListeleAsync(bool silinmisleriGoster)
    {
        var sorgu = silinmisleriGoster
            ? _context.Ureticiler.IgnoreQueryFilters().AsQueryable()
            : _context.Ureticiler.AsQueryable();
        return await sorgu.OrderBy(u => u.Ad).AsNoTracking().Select(u => new UreticiYonetimDto
        {
            Id = u.Id,
            Ad = u.Ad,
            Slug = u.Slug,
            LogoUrl = u.LogoUrl,
            WebSitesi = u.WebSitesi,
            YetkiliDistributorMu = u.YetkiliDistributorMu,
            Aktif = u.Aktif,
            SilindiMi = u.SilindiMi,
            UrunSayisi = u.Urunler.Count
        }).ToListAsync();
    }

    public async Task<KimlikDto> UreticiEkleAsync(UreticiYazDto dto)
    {
        if (await _context.Ureticiler.IgnoreQueryFilters().AnyAsync(u => u.Slug == dto.Slug))
            throw new IsKuraliIhlaliException("Bu slug zaten kullanılıyor.");
        var uretici = new Uretici
        {
            Ad = dto.Ad,
            Slug = dto.Slug,
            LogoUrl = dto.LogoUrl,
            WebSitesi = dto.WebSitesi,
            Aciklama = dto.Aciklama,
            YetkiliDistributorMu = dto.YetkiliDistributorMu,
            Aktif = dto.Aktif
        };
        _context.Ureticiler.Add(uretici);
        await _context.SaveChangesAsync();
        return new KimlikDto { Id = uretici.Id };
    }

    public async Task UreticiGuncelleAsync(int id, UreticiYazDto dto)
    {
        var uretici = await _context.Ureticiler.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Üretici bulunamadı.");
        if (await _context.Ureticiler.IgnoreQueryFilters().AnyAsync(u => u.Id != id && u.Slug == dto.Slug))
            throw new IsKuraliIhlaliException("Bu slug zaten kullanılıyor.");
        uretici.Ad = dto.Ad;
        uretici.Slug = dto.Slug;
        uretici.LogoUrl = dto.LogoUrl;
        uretici.WebSitesi = dto.WebSitesi;
        uretici.Aciklama = dto.Aciklama;
        uretici.YetkiliDistributorMu = dto.YetkiliDistributorMu;
        uretici.Aktif = dto.Aktif;
        await _context.SaveChangesAsync();
    }

    public async Task UreticiSilAsync(int id)
    {
        var uretici = await _context.Ureticiler.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Üretici bulunamadı.");
        if (await _context.Urunler.AnyAsync(u => u.UreticiId == id))
            throw new IsKuraliIhlaliException("Ürünü olan üretici silinemez. Önce ürünleri taşıyın veya silin.");
        uretici.SilindiMi = true;
        await _context.SaveChangesAsync();
    }

    public Task<List<OzellikYonetimDto>> OzellikleriListeleAsync() =>
        _context.OzellikTanimlari.OrderBy(o => o.AdTr).AsNoTracking().Select(o => new OzellikYonetimDto
        {
            Id = o.Id,
            Kod = o.Kod,
            AdTr = o.AdTr,
            AdEn = o.AdEn,
            VeriTipi = (short)o.VeriTipi,
            Birim = o.Birim,
            FiltrelenebilirMi = o.FiltrelenebilirMi,
            SiralanabilirMi = o.SiralanabilirMi,
            GosterimTipi = (short)o.GosterimTipi,
            KullanildigiKategoriSayisi = o.KategoriOzellikleri.Count
        }).ToListAsync();

    public async Task<KimlikDto> OzellikEkleAsync(OzellikTanimiYazDto dto)
    {
        if (await _context.OzellikTanimlari.AnyAsync(o => o.Kod == dto.Kod))
            throw new IsKuraliIhlaliException("Bu özellik kodu zaten kayıtlı.");
        var tanim = new OzellikTanimi
        {
            Kod = dto.Kod,
            AdTr = dto.AdTr,
            AdEn = dto.AdEn,
            VeriTipi = (OzellikVeriTipi)dto.VeriTipi,
            Birim = dto.Birim,
            FiltrelenebilirMi = dto.FiltrelenebilirMi,
            SiralanabilirMi = dto.SiralanabilirMi,
            GosterimTipi = (OzellikGosterimTipi)dto.GosterimTipi
        };
        _context.OzellikTanimlari.Add(tanim);
        await _context.SaveChangesAsync();
        return new KimlikDto { Id = tanim.Id };
    }

    public async Task OzellikGuncelleAsync(int id, OzellikTanimiYazDto dto)
    {
        var tanim = await _context.OzellikTanimlari.FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new KeyNotFoundException("Özellik tanımı bulunamadı.");
        tanim.AdTr = dto.AdTr;
        tanim.AdEn = dto.AdEn;
        tanim.VeriTipi = (OzellikVeriTipi)dto.VeriTipi;
        tanim.Birim = dto.Birim;
        tanim.FiltrelenebilirMi = dto.FiltrelenebilirMi;
        tanim.SiralanabilirMi = dto.SiralanabilirMi;
        tanim.GosterimTipi = (OzellikGosterimTipi)dto.GosterimTipi;
        await _context.SaveChangesAsync();
    }

    private async Task KategoriOnbelleginiTemizleAsync()
    {
        foreach (var anahtar in OnbellekAnahtarlari.KategoriAgaciAnahtarlari)
            await _cache.RemoveAsync(anahtar);
    }
}
