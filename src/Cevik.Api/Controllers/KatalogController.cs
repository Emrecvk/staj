using System.Threading.Tasks;
using Cevik.Uygulama.Katalog.Arayuzler;
using Cevik.Uygulama.Katalog.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KatalogController : ControllerBase
{
    private readonly IKatalogServisi _katalogServisi;

    public KatalogController(IKatalogServisi katalogServisi)
    {
        _katalogServisi = katalogServisi;
    }

    [HttpGet("kategoriler/agac")]
    public async Task<IActionResult> KategoriAgaciniGetir([FromQuery] string? dil)
    {
        var sonuc = await _katalogServisi.KategoriAgaciniGetirAsync(dil);
        return Ok(sonuc);
    }

    [HttpGet("kategoriler/{slug}")]
    public async Task<IActionResult> KategoriDetay(string slug, [FromQuery] string? dil)
    {
        var sonuc = await _katalogServisi.KategoriDetayGetirAsync(slug, dil);
        if (sonuc == null) return NotFound();
        return Ok(sonuc);
    }

    [HttpGet("urunler")]
    public async Task<IActionResult> UrunleriListele([FromQuery] UrunAramaFiltreDto filtre)
    {
        var sonuc = await _katalogServisi.UrunleriListeleAsync(filtre);
        return Ok(sonuc);
    }

    [HttpGet("ureticiler")]
    public async Task<IActionResult> UreticileriListele()
    {
        var sonuc = await _katalogServisi.UreticileriGetirAsync();
        return Ok(sonuc);
    }

    [HttpGet("urunler/{id}")]
    public async Task<IActionResult> UrunDetay(long id, [FromQuery] string? dil, [FromQuery] string? paraBirimi)
    {
        var sonuc = await _katalogServisi.UrunDetayGetirAsync(id, dil, paraBirimi);
        if (sonuc == null) return NotFound();
        return Ok(sonuc);
    }

    private (long? KullaniciId, string? OturumAnahtari) KimlikCoz()
    {
        long? kullaniciId = null;

        var idTalebi = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (idTalebi is not null && long.TryParse(idTalebi.Value, out var cozulen))
            kullaniciId = cozulen;

        Request.Headers.TryGetValue("X-Session-Key", out var oturumAnahtari);
        var oturum = oturumAnahtari.ToString();

        return (kullaniciId, string.IsNullOrWhiteSpace(oturum) ? null : oturum);
    }

    [HttpGet("karsilastirma")]
    public async Task<IActionResult> KarsilastirmaListesiGetir()
    {
        var (kullaniciId, oturumAnahtari) = KimlikCoz();
        var sonuc = await _katalogServisi.KarsilastirmaListesiGetirAsync(kullaniciId, oturumAnahtari);
        return Ok(sonuc);
    }

    [HttpPost("karsilastirma/{urunId:long}")]
    public async Task<IActionResult> KarsilastirmayaEkle(long urunId)
    {
        var (kullaniciId, oturumAnahtari) = KimlikCoz();
        await _katalogServisi.KarsilastirmayaEkleAsync(kullaniciId, oturumAnahtari, urunId);
        return Ok();
    }

    [HttpDelete("karsilastirma/{urunId:long}")]
    public async Task<IActionResult> KarsilastirmadanCikar(long urunId)
    {
        var (kullaniciId, oturumAnahtari) = KimlikCoz();
        await _katalogServisi.KarsilastirmadanCikarAsync(kullaniciId, oturumAnahtari, urunId);
        return Ok();
    }
}
