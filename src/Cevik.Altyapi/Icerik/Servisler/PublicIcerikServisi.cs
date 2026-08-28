using Cevik.Alan.Kurallar;
using Cevik.Alan.Icerik;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Icerik.Arayuzler;
using Cevik.Uygulama.Icerik.Dto;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Altyapi.Icerik.Servisler;

/// <summary>
/// Herkese açık CMS içeriği ve e-bülten aboneliği.
/// Yönetim uçları <c>/api/yonetim/...</c> altındadır; burası yayınlanmış içeriği gösterir.
/// </summary>
public class PublicIcerikServisi : IPublicIcerikServisi
{
    private readonly CevikDbContext _context;

    public PublicIcerikServisi(CevikDbContext context) => _context = context;

    public async Task<List<PublicBlogOzetDto>> BlogYazilariniGetirAsync()
    {
        var simdi = DateTimeOffset.UtcNow;
        return await _context.BlogYazilari
            .AsNoTracking()
            .Where(b => b.YayinTarihi != null && b.YayinTarihi <= simdi)
            .OrderByDescending(b => b.YayinTarihi)
            .Select(b => new PublicBlogOzetDto
            {
                Id = b.Id,
                Baslik = b.Baslik,
                Slug = b.Slug,
                Ozet = b.Ozet,
                KapakGorselUrl = b.KapakGorselUrl,
                YayinTarihi = b.YayinTarihi,
                Kategori = b.Kategori
            })
            .ToListAsync();
    }

    public async Task<PublicBlogDetayDto?> BlogYazisiGetirAsync(string slug)
    {
        var simdi = DateTimeOffset.UtcNow;
        return await _context.BlogYazilari
            .AsNoTracking()
            .Where(b => b.Slug == slug && b.YayinTarihi != null && b.YayinTarihi <= simdi)
            .Select(b => new PublicBlogDetayDto
            {
                Id = b.Id,
                Baslik = b.Baslik,
                Slug = b.Slug,
                Ozet = b.Ozet,
                IcerikHtml = b.IcerikHtml,
                KapakGorselUrl = b.KapakGorselUrl,
                YayinTarihi = b.YayinTarihi,
                Kategori = b.Kategori
            })
            .FirstOrDefaultAsync();
    }

    public async Task<List<PublicDuyuruDto>> DuyurulariGetirAsync()
    {
        var simdi = DateTimeOffset.UtcNow;
        return await _context.Duyurular
            .AsNoTracking()
            .Where(d => (d.BaslangicTarihi == null || d.BaslangicTarihi <= simdi)
                     && (d.BitisTarihi == null || d.BitisTarihi >= simdi))
            .OrderBy(d => d.Sira)
            .ThenByDescending(d => d.Id)
            .Select(d => new PublicDuyuruDto
            {
                Id = d.Id,
                Baslik = d.Baslik,
                Icerik = d.Icerik,
                GorselUrl = d.GorselUrl,
                LinkUrl = d.LinkUrl,
                Sira = d.Sira
            })
            .ToListAsync();
    }

    public async Task<List<PublicBannerDto>> BannerlariGetirAsync(string? konum = null)
    {
        var sorgu = _context.Bannerlar.AsNoTracking().Where(b => b.Aktif);

        if (!string.IsNullOrWhiteSpace(konum))
            sorgu = sorgu.Where(b => b.Konum == konum);

        return await sorgu
            .OrderBy(b => b.Sira)
            .Select(b => new PublicBannerDto
            {
                Id = b.Id,
                Konum = b.Konum,
                GorselUrl = b.GorselUrl,
                LinkUrl = b.LinkUrl,
                Sira = b.Sira
            })
            .ToListAsync();
    }

    public async Task<PublicSayfaDto?> SayfaGetirAsync(string slug, string? dil = null)
    {
        var sayfa = await _context.Sayfalar
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Slug == slug && s.YayindaMi);

        if (sayfa is null) return null;

        var ingilizce = DilKodu.IngilizceMi(dil);
        return new PublicSayfaDto
        {
            Slug = sayfa.Slug,
            Baslik = ingilizce ? sayfa.BaslikEn : sayfa.BaslikTr,
            IcerikHtml = ingilizce ? sayfa.IcerikHtmlEn : sayfa.IcerikHtmlTr,
            SeoBaslik = sayfa.SeoBaslik,
            SeoAciklama = sayfa.SeoAciklama
        };
    }

    public async Task<List<PublicSssDto>> SikSorulanSorulariGetirAsync(int? kategoriId = null)
    {
        var sorgu = _context.SikSorulanSorular.AsNoTracking();

        if (kategoriId.HasValue)
            sorgu = sorgu.Where(s => s.KategoriId == kategoriId || s.KategoriId == null);
        else
            sorgu = sorgu.Where(s => s.KategoriId == null);

        return await sorgu
            .OrderBy(s => s.Sira)
            .Select(s => new PublicSssDto
            {
                Id = s.Id,
                KategoriId = s.KategoriId,
                Soru = s.Soru,
                Cevap = s.Cevap,
                Sira = s.Sira
            })
            .ToListAsync();
    }

    public async Task EBulteneAboneOlAsync(string eposta)
    {
        var normalizeEposta = eposta.Trim().ToLowerInvariant();
        var simdi = DateTimeOffset.UtcNow;

        // Silinmiş kayıt da aranır: aynı adres yeniden abone olduğunda yeni ve
        // mükerrer bir satır açmak yerine eski kayıt güvenle etkinleştirilir.
        var mevcutAbone = await _context.EBultenAboneleri
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.Eposta == normalizeEposta);

        if (mevcutAbone is null)
        {
            _context.EBultenAboneleri.Add(new EBultenAbonesi
            {
                Eposta = normalizeEposta,
                OnaylandiMi = true,
                AbonelikTarihi = simdi
            });
        }
        else if (mevcutAbone.SilindiMi || mevcutAbone.IptalTarihi.HasValue || !mevcutAbone.OnaylandiMi)
        {
            mevcutAbone.SilindiMi = false;
            mevcutAbone.OnaylandiMi = true;
            mevcutAbone.IptalTarihi = null;
            mevcutAbone.AbonelikTarihi = simdi;
        }

        await _context.SaveChangesAsync();
    }
}
