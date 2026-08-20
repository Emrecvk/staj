using Cevik.Uygulama.Icerik.Arayuzler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

/// <summary>
/// Herkese açık CMS uçları. Yazma işlemleri <c>/api/yonetim</c> altındadır.
/// </summary>
[ApiController]
[AllowAnonymous]
[Route("api/icerik")]
public class IcerikController : ControllerBase
{
    private readonly IPublicIcerikServisi _icerikServisi;

    public IcerikController(IPublicIcerikServisi icerikServisi) => _icerikServisi = icerikServisi;

    [HttpGet("blog")]
    public async Task<IActionResult> BlogListesi()
        => Ok(await _icerikServisi.BlogYazilariniGetirAsync());

    [HttpGet("blog/{slug}")]
    public async Task<IActionResult> BlogDetay(string slug)
    {
        var yazi = await _icerikServisi.BlogYazisiGetirAsync(slug);
        return yazi is null ? NotFound() : Ok(yazi);
    }

    [HttpGet("duyurular")]
    public async Task<IActionResult> Duyurular()
        => Ok(await _icerikServisi.DuyurulariGetirAsync());

    [HttpGet("bannerlar")]
    public async Task<IActionResult> Bannerlar([FromQuery] string? konum)
        => Ok(await _icerikServisi.BannerlariGetirAsync(konum));

    [HttpGet("sayfalar/{slug}")]
    public async Task<IActionResult> Sayfa(string slug, [FromQuery] string? dil)
    {
        var sayfa = await _icerikServisi.SayfaGetirAsync(slug, dil);
        return sayfa is null ? NotFound() : Ok(sayfa);
    }

    [HttpGet("sss")]
    public async Task<IActionResult> Sss([FromQuery] int? kategoriId)
        => Ok(await _icerikServisi.SikSorulanSorulariGetirAsync(kategoriId));
}
