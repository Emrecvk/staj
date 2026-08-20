using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Katalog;
using Cevik.Alan.Kurallar;
using Cevik.Alan.Ortak;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Yonetim.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Api.Controllers;

/// <summary>
/// Ürün, stok ve fiyat yönetimi. Planlamada istenen admin CRUD'unun katalog ayağı.
/// </summary>
[ApiController]
[Route("api/yonetim/urun")]
[Authorize(Policy = "YonetimErisimi")]
public class UrunYonetimController : ControllerBase
{
    private readonly CevikDbContext _context;

    public UrunYonetimController(CevikDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> Listele(
        [FromQuery] string? arama,
        [FromQuery] int? kategoriId,
        [FromQuery] bool silinmisleriGoster = false,
        [FromQuery] int sayfa = 1,
        [FromQuery] int boyut = 50)
    {
        boyut = Math.Clamp(boyut, 1, 200);
        sayfa = Math.Max(sayfa, 1);

        // Admin, soft-delete edilmiş kayıtları da görebilmeli.
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

        var toplam = await sorgu.CountAsync();

        var kayitlar = await sorgu
            .OrderBy(u => u.Id)
            .Skip((sayfa - 1) * boyut)
            .Take(boyut)
            .AsNoTracking()
            .Select(u => new
            {
                u.Id,
                u.UreticiUrunKodu,
                u.KisaAciklama,
                u.KategoriId,
                u.UreticiId,
                u.UrunDurumu,
                u.Aktif,
                u.SilindiMi,
                ToplamStok = u.UrunAmbalajlari.Sum(a => (int?)a.StokMiktari) ?? 0
            })
            .ToListAsync();

        return Ok(new { toplam, sayfa, boyut, kayitlar });
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> Getir(long id)
    {
        var urun = await _context.Urunler
            .IgnoreQueryFilters()
            .Include(u => u.UrunAmbalajlari).ThenInclude(a => a.FiyatKademeleri)
            .Include(u => u.OzellikDegerleri)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        return urun is null ? NotFound() : Ok(urun);
    }

    [HttpPost]
    public async Task<IActionResult> Ekle(UrunEkleDto dto)
    {
        var kategoriVar = await _context.Kategoriler.AnyAsync(k => k.Id == dto.KategoriId);
        if (!kategoriVar) return BadRequest("Kategori bulunamadı.");

        var ureticiVar = await _context.Ureticiler.AnyAsync(u => u.Id == dto.UreticiId);
        if (!ureticiVar) return BadRequest("Üretici bulunamadı.");

        // (uretici_id, uretici_urun_kodu) UNIQUE — çakışmayı 500 yerine 409 ile bildir.
        var kodCakisiyor = await _context.Urunler
            .IgnoreQueryFilters()
            .AnyAsync(u => u.UreticiId == dto.UreticiId && u.UreticiUrunKodu == dto.UreticiUrunKodu);

        if (kodCakisiyor)
            return Conflict("Bu üreticide aynı ürün kodu zaten kayıtlı.");

        var urun = new Urun
        {
            KategoriId = dto.KategoriId,
            UreticiId = dto.UreticiId,
            UreticiUrunKodu = dto.UreticiUrunKodu,
            // Arama bu alana bağlı; elle set edilmesine izin verilmez, hep türetilir.
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

        return CreatedAtAction(nameof(Getir), new { id = urun.Id }, new { urun.Id, urun.UreticiUrunKodu });
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Guncelle(long id, UrunGuncelleDto dto)
    {
        var urun = await _context.Urunler.FirstOrDefaultAsync(u => u.Id == id);
        if (urun is null) return NotFound();

        urun.KisaAciklama = dto.KisaAciklama;
        urun.DetayliAciklamaTr = dto.DetayliAciklamaTr;
        urun.AnaGorselUrl = dto.AnaGorselUrl;
        urun.UrunDurumu = (UrunDurumu)dto.UrunDurumu;
        urun.RohsDurumu = (RohsDurumu)dto.RohsDurumu;
        urun.MontajTipi = (MontajTipi)dto.MontajTipi;
        urun.KampanyaliMi = dto.KampanyaliMi;
        urun.Aktif = dto.Aktif;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Soft delete — sipariş geçmişi bozulmasın diye satır silinmez.</summary>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Sil(long id)
    {
        var urun = await _context.Urunler.FirstOrDefaultAsync(u => u.Id == id);
        if (urun is null) return NotFound();

        urun.SilindiMi = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Yanlışlıkla silinen ürünü geri alır.</summary>
    [HttpPost("{id:long}/geri-al")]
    public async Task<IActionResult> GeriAl(long id)
    {
        var urun = await _context.Urunler.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id);
        if (urun is null) return NotFound();

        urun.SilindiMi = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // -----------------------------------------------------------------------
    // Stok ve fiyat
    // -----------------------------------------------------------------------

    [HttpPut("stok")]
    public async Task<IActionResult> StokGuncelle(StokGuncelleDto dto)
    {
        if (dto.StokMiktari < 0 || dto.GelecekStokMiktari < 0)
            throw new IsKuraliIhlaliException("Stok miktarı negatif olamaz.");

        var ambalaj = await _context.UrunAmbalajlari.FirstOrDefaultAsync(a => a.Id == dto.UrunAmbalajId);
        if (ambalaj is null) return NotFound("Ürün ambalajı bulunamadı.");

        ambalaj.StokMiktari = dto.StokMiktari;
        ambalaj.GelecekStokMiktari = dto.GelecekStokMiktari;

        // JSON'dan gelen tarih Kind=Unspecified olur; Npgsql timestamptz kolonuna
        // yalnızca UTC kabul eder, aksi hâlde kayıt ArgumentException ile patlar.
        ambalaj.GelecekStokTarihi = dto.GelecekStokTarihi is null
            ? null
            : DateTime.SpecifyKind(dto.GelecekStokTarihi.Value, DateTimeKind.Utc);

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("fiyat")]
    public async Task<IActionResult> FiyatGuncelle(AmbalajFiyatGuncelleDto dto)
    {
        var ambalaj = await _context.UrunAmbalajlari
            .Include(a => a.FiyatKademeleri)
            .FirstOrDefaultAsync(a => a.Id == dto.UrunAmbalajId);

        if (ambalaj is null) return NotFound("Ürün ambalajı bulunamadı.");

        if (dto.Kademeler.Count == 0)
            throw new IsKuraliIhlaliException("En az bir fiyat kademesi gereklidir.");

        // Kademe aralıkları çakışmamalı; çakışırsa hangi fiyatın geçerli olduğu belirsizleşir.
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

        foreach (var kademe in sirali)
        {
            _context.FiyatKademeleri.Add(new FiyatKademesi
            {
                UrunAmbalajId = ambalaj.Id,
                MinMiktar = kademe.MinMiktar,
                MaxMiktar = kademe.MaxMiktar,
                BirimFiyat = kademe.BirimFiyat,
                ParaBirimi = kademe.ParaBirimi,
                MusteriGrubuId = kademe.MusteriGrubuId
            });
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // -----------------------------------------------------------------------
    // İlişkili Ürünler
    // -----------------------------------------------------------------------

    [HttpPost("{id:long}/iliskili")]
    public async Task<IActionResult> IliskiliUrunEkle(long id, [FromBody] IliskiliUrunEkleDto dto, [FromServices] Cevik.Uygulama.Katalog.Arayuzler.IKatalogServisi katalogServisi)
    {
        await katalogServisi.IliskiliUrunEkleAsync(id, dto.IliskiliUrunId, dto.Tip, dto.Sira);
        return NoContent();
    }

    [HttpDelete("{id:long}/iliskili/{iliskiliId:long}/{tip}")]
    public async Task<IActionResult> IliskiliUrunSil(long id, long iliskiliId, short tip, [FromServices] Cevik.Uygulama.Katalog.Arayuzler.IKatalogServisi katalogServisi)
    {
        await katalogServisi.IliskiliUrunSilAsync(id, iliskiliId, tip);
        return NoContent();
    }
}
