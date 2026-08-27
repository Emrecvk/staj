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
    [ProducesResponseType(typeof(List<KategoriAgacDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<KategoriAgacDto>>> KategoriAgaciniGetir([FromQuery] string? dil)
    {
        var sonuc = await _katalogServisi.KategoriAgaciniGetirAsync(dil);
        return Ok(sonuc);
    }

    [HttpGet("kategoriler/urun-sayilari")]
    [ProducesResponseType(typeof(Dictionary<int, int>), StatusCodes.Status200OK)]
    public async Task<ActionResult<Dictionary<int, int>>> KategoriUrunSayilariniGetir([FromQuery] List<int> kategoriIdleri)
    {
        var sonuc = await _katalogServisi.KategoriUrunSayilariniGetirAsync(kategoriIdleri);
        return Ok(sonuc);
    }

    [HttpGet("kategoriler/{slug}")]
    [ProducesResponseType(typeof(KategoriDetayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<KategoriDetayDto>> KategoriDetay(string slug, [FromQuery] string? dil)
    {
        var sonuc = await _katalogServisi.KategoriDetayGetirAsync(slug, dil);
        if (sonuc == null) return NotFound();
        return Ok(sonuc);
    }

    [HttpGet("urunler")]
    [ProducesResponseType(typeof(UrunAramaSonucDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UrunAramaSonucDto>> UrunleriListele([FromQuery] UrunAramaFiltreDto filtre)
    {
        var sonuc = await _katalogServisi.UrunleriListeleAsync(filtre);
        return Ok(sonuc);
    }

    [HttpGet("ureticiler")]
    [ProducesResponseType(typeof(List<UreticiOzetDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UreticiOzetDto>>> UreticileriListele([FromQuery] int? kategoriId)
    {
        var sonuc = await _katalogServisi.UreticileriGetirAsync(kategoriId);
        return Ok(sonuc);
    }

    [HttpGet("ureticiler/sayilari")]
    [ProducesResponseType(typeof(Dictionary<int, int>), StatusCodes.Status200OK)]
    public async Task<ActionResult<Dictionary<int, int>>> KategoriUreticiSayilariniGetir([FromQuery] List<int> kategoriIdleri)
    {
        var sonuc = await _katalogServisi.KategoriUreticiSayilariniGetirAsync(kategoriIdleri);
        return Ok(sonuc);
    }

    [HttpGet("urunler/{id}")]
    [ProducesResponseType(typeof(UrunDetayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UrunDetayDto>> UrunDetay(long id, [FromQuery] string? dil, [FromQuery] string? paraBirimi)
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
    [ProducesResponseType(typeof(KarsilastirmaSonucDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<KarsilastirmaSonucDto>> KarsilastirmaListesiGetir()
    {
        var (kullaniciId, oturumAnahtari) = KimlikCoz();
        var sonuc = await _katalogServisi.KarsilastirmaListesiGetirAsync(kullaniciId, oturumAnahtari);
        return Ok(sonuc);
    }

    [HttpPost("karsilastirma/{urunId:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> KarsilastirmayaEkle(long urunId)
    {
        var (kullaniciId, oturumAnahtari) = KimlikCoz();
        await _katalogServisi.KarsilastirmayaEkleAsync(kullaniciId, oturumAnahtari, urunId);
        return NoContent();
    }

    [HttpDelete("karsilastirma/{urunId:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> KarsilastirmadanCikar(long urunId)
    {
        var (kullaniciId, oturumAnahtari) = KimlikCoz();
        await _katalogServisi.KarsilastirmadanCikarAsync(kullaniciId, oturumAnahtari, urunId);
        return NoContent();
    }
}
