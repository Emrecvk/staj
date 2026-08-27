using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Teklif.Arayuzler;
using Cevik.Uygulama.Teklif.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[Authorize(Policy = "SatisErisimi")]
[ApiController]
[Route("api/yonetim/teklifler")]
public class TeklifYonetimController : ControllerBase
{
    private readonly ITeklifYonetimServisi _teklifYonetimServisi;

    public TeklifYonetimController(ITeklifYonetimServisi teklifYonetimServisi)
    {
        _teklifYonetimServisi = teklifYonetimServisi;
    }

    private long GetUserId()
    {
        return long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    [HttpGet]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.SayfaliSonucDto<TeklifListelemeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<Cevik.Uygulama.Ortak.SayfaliSonucDto<TeklifListelemeDto>>> TumTeklifler(
        [FromQuery] int sayfaNo = 1,
        [FromQuery] int sayfaBoyutu = 50)
    {
        return Ok(await _teklifYonetimServisi.TumTeklifleriGetirAsync(sayfaNo, sayfaBoyutu));
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(TeklifDetayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeklifDetayDto>> Detay(long id)
    {
        var teklif = await _teklifYonetimServisi.TeklifDetayGetirAsync(id);
        return teklif == null ? NotFound() : Ok(teklif);
    }

    [HttpPost("{id:long}/incele")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> IncelemeyeAl(long id)
    {
        await _teklifYonetimServisi.IncelemeyeAlAsync(id, GetUserId());
        return NoContent();
    }

    [HttpPut("{id:long}/fiyatlandir")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Fiyatlandir(long id, TeklifFiyatlandirDto dto)
    {
        await _teklifYonetimServisi.FiyatlandirAsync(id, dto);
        return NoContent();
    }

    [HttpPost("{id:long}/reddet")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Reddet(long id)
    {
        await _teklifYonetimServisi.ReddetAsync(id);
        return NoContent();
    }
}
