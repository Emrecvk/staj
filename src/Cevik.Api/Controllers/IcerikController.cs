using Cevik.Uygulama.Icerik.Arayuzler;
using Cevik.Uygulama.Icerik.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

/// <summary>
/// Herkese açık CMS uçları ve e-bülten aboneliği.
/// </summary>
[ApiController]
[AllowAnonymous]
[Route("api/icerik")]
public class IcerikController : ControllerBase
{
    private readonly IPublicIcerikServisi _icerikServisi;

    public IcerikController(IPublicIcerikServisi icerikServisi) => _icerikServisi = icerikServisi;

    [HttpGet("blog")]
    [ProducesResponseType(typeof(List<PublicBlogOzetDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PublicBlogOzetDto>>> BlogListesi()
        => Ok(await _icerikServisi.BlogYazilariniGetirAsync());

    [HttpGet("blog/{slug}")]
    [ProducesResponseType(typeof(PublicBlogDetayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PublicBlogDetayDto>> BlogDetay(string slug)
    {
        var yazi = await _icerikServisi.BlogYazisiGetirAsync(slug);
        return yazi is null ? NotFound() : Ok(yazi);
    }

    [HttpGet("duyurular")]
    [ProducesResponseType(typeof(List<PublicDuyuruDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PublicDuyuruDto>>> Duyurular()
        => Ok(await _icerikServisi.DuyurulariGetirAsync());

    [HttpGet("bannerlar")]
    [ProducesResponseType(typeof(List<PublicBannerDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PublicBannerDto>>> Bannerlar([FromQuery] string? konum)
        => Ok(await _icerikServisi.BannerlariGetirAsync(konum));

    [HttpGet("sayfalar/{slug}")]
    [ProducesResponseType(typeof(PublicSayfaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PublicSayfaDto>> Sayfa(string slug, [FromQuery] string? dil)
    {
        var sayfa = await _icerikServisi.SayfaGetirAsync(slug, dil);
        return sayfa is null ? NotFound() : Ok(sayfa);
    }

    [HttpGet("sss")]
    [ProducesResponseType(typeof(List<PublicSssDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PublicSssDto>>> Sss([FromQuery] int? kategoriId)
        => Ok(await _icerikServisi.SikSorulanSorulariGetirAsync(kategoriId));

    [HttpPost("e-bulten")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> EBulteneAboneOl([FromBody] EBultenAbonelikIstekDto istek)
    {
        await _icerikServisi.EBulteneAboneOlAsync(istek.Eposta);
        return NoContent();
    }
}
