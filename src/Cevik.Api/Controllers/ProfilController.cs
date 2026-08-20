using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Kimlik.Arayuzler;
using Cevik.Uygulama.Kimlik.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfilController : ControllerBase
{
    private readonly IProfilServisi _profilServisi;

    public ProfilController(IProfilServisi profilServisi)
    {
        _profilServisi = profilServisi;
    }

    private long GetUserId()
    {
        return long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    [HttpGet("adresler")]
    public async Task<IActionResult> AdresleriGetir()
    {
        var adresler = await _profilServisi.AdresleriGetirAsync(GetUserId());
        return Ok(adresler);
    }

    [HttpPost("adresler")]
    public async Task<IActionResult> AdresEkle(AdresEkleDto dto)
    {
        var sonuc = await _profilServisi.AdresEkleAsync(GetUserId(), dto);
        return Ok(sonuc);
    }

    [HttpDelete("adresler/{id}")]
    public async Task<IActionResult> AdresSil(long id)
    {
        var sonuc = await _profilServisi.AdresSilAsync(GetUserId(), id);
        if (!sonuc) return NotFound();
        return Ok();
    }

    [HttpGet("favoriler")]
    public async Task<IActionResult> FavorileriGetir()
    {
        var favoriler = await _profilServisi.FavorileriGetirAsync(GetUserId());
        return Ok(favoriler);
    }

    [HttpPost("favoriler")]
    public async Task<IActionResult> FavoriEkle(FavoriEkleDto dto)
    {
        var sonuc = await _profilServisi.FavoriEkleAsync(GetUserId(), dto);
        if (!sonuc) return BadRequest();
        return Ok();
    }

    [HttpDelete("favoriler/{urunId}")]
    public async Task<IActionResult> FavoriSil(long urunId)
    {
        var sonuc = await _profilServisi.FavoriSilAsync(GetUserId(), urunId);
        if (!sonuc) return NotFound();
        return Ok();
    }
}
