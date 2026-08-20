using Cevik.Alan.Katalog;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Yonetim.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/yonetim/uretici")]
[Authorize(Policy = "YonetimErisimi")]
public class UreticiYonetimController : ControllerBase
{
    private readonly CevikDbContext _context;

    public UreticiYonetimController(CevikDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> Listele([FromQuery] bool silinmisleriGoster = false)
    {
        var sorgu = silinmisleriGoster
            ? _context.Ureticiler.IgnoreQueryFilters().AsQueryable()
            : _context.Ureticiler.AsQueryable();

        var ureticiler = await sorgu
            .OrderBy(u => u.Ad)
            .AsNoTracking()
            .Select(u => new
            {
                u.Id, u.Ad, u.Slug, u.LogoUrl, u.WebSitesi,
                u.YetkiliDistributorMu, u.Aktif, u.SilindiMi,
                UrunSayisi = u.Urunler.Count
            })
            .ToListAsync();

        return Ok(ureticiler);
    }

    [HttpPost]
    public async Task<IActionResult> Ekle(UreticiYazDto dto)
    {
        if (await _context.Ureticiler.IgnoreQueryFilters().AnyAsync(u => u.Slug == dto.Slug))
            return Conflict("Bu slug zaten kullanılıyor.");

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

        return CreatedAtAction(nameof(Listele), new { id = uretici.Id }, new { uretici.Id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Guncelle(int id, UreticiYazDto dto)
    {
        var uretici = await _context.Ureticiler.FirstOrDefaultAsync(u => u.Id == id);
        if (uretici is null) return NotFound();

        uretici.Ad = dto.Ad;
        uretici.Slug = dto.Slug;
        uretici.LogoUrl = dto.LogoUrl;
        uretici.WebSitesi = dto.WebSitesi;
        uretici.Aciklama = dto.Aciklama;
        uretici.YetkiliDistributorMu = dto.YetkiliDistributorMu;
        uretici.Aktif = dto.Aktif;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Sil(int id)
    {
        var uretici = await _context.Ureticiler.FirstOrDefaultAsync(u => u.Id == id);
        if (uretici is null) return NotFound();

        // Ürünü olan üretici silinirse o ürünler erişilemez hâle gelir.
        if (await _context.Urunler.AnyAsync(u => u.UreticiId == id))
            throw new IsKuraliIhlaliException("Ürünü olan üretici silinemez. Önce ürünleri taşıyın veya silin.");

        uretici.SilindiMi = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

/// <summary>
/// Parametrik özellik sözlüğünün yönetimi. Bu uç olmadan yeni bir filtre
/// (ör. "Bit Sayısı") sisteme yalnızca seed ile eklenebiliyordu.
/// </summary>
[ApiController]
[Route("api/yonetim/ozellik")]
[Authorize(Policy = "YonetimErisimi")]
public class OzellikYonetimController : ControllerBase
{
    private readonly CevikDbContext _context;

    public OzellikYonetimController(CevikDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> Listele()
    {
        var tanimlar = await _context.OzellikTanimlari
            .OrderBy(o => o.AdTr)
            .AsNoTracking()
            .Select(o => new
            {
                o.Id, o.Kod, o.AdTr, o.AdEn, o.VeriTipi, o.Birim,
                o.FiltrelenebilirMi, o.SiralanabilirMi, o.GosterimTipi,
                KullanildigiKategoriSayisi = o.KategoriOzellikleri.Count
            })
            .ToListAsync();

        return Ok(tanimlar);
    }

    [HttpPost]
    public async Task<IActionResult> Ekle(OzellikTanimiYazDto dto)
    {
        if (await _context.OzellikTanimlari.AnyAsync(o => o.Kod == dto.Kod))
            return Conflict("Bu özellik kodu zaten kayıtlı.");

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

        return CreatedAtAction(nameof(Listele), new { id = tanim.Id }, new { tanim.Id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Guncelle(int id, OzellikTanimiYazDto dto)
    {
        var tanim = await _context.OzellikTanimlari.FirstOrDefaultAsync(o => o.Id == id);
        if (tanim is null) return NotFound();

        tanim.AdTr = dto.AdTr;
        tanim.AdEn = dto.AdEn;
        tanim.VeriTipi = (OzellikVeriTipi)dto.VeriTipi;
        tanim.Birim = dto.Birim;
        tanim.FiltrelenebilirMi = dto.FiltrelenebilirMi;
        tanim.SiralanabilirMi = dto.SiralanabilirMi;
        tanim.GosterimTipi = (OzellikGosterimTipi)dto.GosterimTipi;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
