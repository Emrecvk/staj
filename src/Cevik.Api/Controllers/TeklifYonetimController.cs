using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Teklif.Arayuzler;
using Cevik.Uygulama.Teklif.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[Authorize(Roles = "Admin,SatisTemsilcisi")]
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
    public async Task<IActionResult> TumTeklifler()
    {
        return Ok(await _teklifYonetimServisi.TumTeklifleriGetirAsync());
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> Detay(long id)
    {
        var teklif = await _teklifYonetimServisi.TeklifDetayGetirAsync(id);
        return teklif == null ? NotFound() : Ok(teklif);
    }

    [HttpPost("{id:long}/incele")]
    public async Task<IActionResult> IncelemeyeAl(long id)
    {
        await _teklifYonetimServisi.IncelemeyeAlAsync(id, GetUserId());
        return Ok();
    }

    [HttpPut("{id:long}/fiyatlandir")]
    public async Task<IActionResult> Fiyatlandir(long id, TeklifFiyatlandirDto dto)
    {
        await _teklifYonetimServisi.FiyatlandirAsync(id, dto);
        return Ok();
    }

    [HttpPost("{id:long}/reddet")]
    public async Task<IActionResult> Reddet(long id)
    {
        await _teklifYonetimServisi.ReddetAsync(id);
        return Ok();
    }
}
