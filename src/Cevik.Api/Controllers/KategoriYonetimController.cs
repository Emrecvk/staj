using Cevik.Alan.Katalog;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Ortak;
using Cevik.Uygulama.Yonetim.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/yonetim/kategori")]
[Authorize(Policy = "YonetimErisimi")]
public class KategoriYonetimController : ControllerBase
{
    private readonly CevikDbContext _context;
    private readonly IDistributedCache _cache;

    public KategoriYonetimController(CevikDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> Listele([FromQuery] bool silinmisleriGoster = false)
    {
        var sorgu = silinmisleriGoster
            ? _context.Kategoriler.IgnoreQueryFilters().AsQueryable()
            : _context.Kategoriler.AsQueryable();

        var kategoriler = await sorgu
            .OrderBy(k => k.Yol)
            .AsNoTracking()
            .Select(k => new
            {
                k.Id, k.UstKategoriId, k.AdTr, k.AdEn, k.SlugTr, k.Yol,
                k.Seviye, k.Sira, k.YaprakMi, k.Aktif, k.SilindiMi
            })
            .ToListAsync();

        return Ok(kategoriler);
    }

    [HttpPost]
    public async Task<IActionResult> Ekle(KategoriYazDto dto)
    {
        Kategori? ust = null;
        if (dto.UstKategoriId is not null)
        {
            ust = await _context.Kategoriler.FirstOrDefaultAsync(k => k.Id == dto.UstKategoriId);
            if (ust is null) return BadRequest("Üst kategori bulunamadı.");
        }

        var kategori = new Kategori
        {
            UstKategoriId = dto.UstKategoriId,
            AdTr = dto.AdTr,
            AdEn = dto.AdEn,
            SlugTr = dto.SlugTr,
            SlugEn = dto.SlugEn,
            Yol = "0", // Id atandıktan sonra hesaplanır
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

        // ltree yolu id tabanlı: kök "3", alt "3.17"
        kategori.Yol = ust is null ? kategori.Id.ToString() : $"{ust.Yol}.{kategori.Id}";
        await _context.SaveChangesAsync();

        await OnbellegiTemizleAsync();
        return CreatedAtAction(nameof(Listele), new { id = kategori.Id }, new { kategori.Id, kategori.Yol });
    }

    /// <summary>
    /// Güncelleme ucu. Önceki sürümde hiç yoktu; kategori adı veya sırası
    /// değiştirilemiyordu.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Guncelle(int id, KategoriYazDto dto)
    {
        var kategori = await _context.Kategoriler.FirstOrDefaultAsync(k => k.Id == id);
        if (kategori is null) return NotFound();

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

        // Ağaç 24 saat önbellekte duruyor; temizlemezsek değişiklik görünmez.
        await OnbellegiTemizleAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Sil(int id)
    {
        var kategori = await _context.Kategoriler.FirstOrDefaultAsync(k => k.Id == id);
        if (kategori is null) return NotFound();

        // Alt kategorisi veya ürünü olan kategori silinemez; aksi hâlde
        // ağaçta öksüz düğüm ve erişilemez ürün kalır.
        var altVar = await _context.Kategoriler.AnyAsync(k => k.UstKategoriId == id);
        if (altVar) throw new IsKuraliIhlaliException("Alt kategorisi olan kategori silinemez.");

        var urunVar = await _context.Urunler.AnyAsync(u => u.KategoriId == id);
        if (urunVar) throw new IsKuraliIhlaliException("Ürünü olan kategori silinemez.");

        kategori.SilindiMi = true;
        await _context.SaveChangesAsync();

        await OnbellegiTemizleAsync();
        return NoContent();
    }

    /// <summary>
    /// Kategoriye filtre (parametrik özellik) bağlar — facet paneli bu tablodan üretilir.
    /// </summary>
    [HttpPost("ozellik")]
    public async Task<IActionResult> OzellikBagla(KategoriOzelligiYazDto dto)
    {
        var kategoriVar = await _context.Kategoriler.AnyAsync(k => k.Id == dto.KategoriId);
        if (!kategoriVar) return BadRequest("Kategori bulunamadı.");

        var tanimVar = await _context.OzellikTanimlari.AnyAsync(o => o.Id == dto.OzellikTanimId);
        if (!tanimVar) return BadRequest("Özellik tanımı bulunamadı.");

        var mevcut = await _context.KategoriOzellikleri
            .FirstOrDefaultAsync(ko => ko.KategoriId == dto.KategoriId && ko.OzellikTanimId == dto.OzellikTanimId);

        if (mevcut is not null)
        {
            mevcut.Sira = dto.Sira;
            mevcut.ZorunluMu = dto.ZorunluMu;
        }
        else
        {
            _context.KategoriOzellikleri.Add(new KategoriOzelligi
            {
                KategoriId = dto.KategoriId,
                OzellikTanimId = dto.OzellikTanimId,
                Sira = dto.Sira,
                ZorunluMu = dto.ZorunluMu
            });
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{kategoriId:int}/ozellik/{ozellikTanimId:int}")]
    public async Task<IActionResult> OzellikKaldir(int kategoriId, int ozellikTanimId)
    {
        var kayit = await _context.KategoriOzellikleri
            .FirstOrDefaultAsync(ko => ko.KategoriId == kategoriId && ko.OzellikTanimId == ozellikTanimId);

        if (kayit is null) return NotFound();

        _context.KategoriOzellikleri.Remove(kayit);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Anahtar OnbellekAnahtarlari'ndan gelir.
    /// Daha önce "Cevik_kategori_agaci" elle yazılıyordu; IDistributedCache
    /// InstanceName ön ekini kendisi eklediği için gerçekte
    /// "Cevik_Cevik_kategori_agaci" siliniyor ve önbellek hiç boşalmıyordu.
    /// </summary>
    private async Task OnbellegiTemizleAsync()
    {
        foreach (var anahtar in OnbellekAnahtarlari.KategoriAgaciAnahtarlari)
            await _cache.RemoveAsync(anahtar);
    }
}
