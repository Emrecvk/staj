using System.Security.Claims;
using Cevik.Uygulama.Bom.Arayuzler;
using Cevik.Uygulama.Bom.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MalzemeListeleriController : ControllerBase
{
    private readonly IMalzemeListesiServisi _malzemeListesiServisi;

    public MalzemeListeleriController(IMalzemeListesiServisi malzemeListesiServisi) =>
        _malzemeListesiServisi = malzemeListesiServisi;

    [HttpPost("yukle")]
    [ProducesResponseType(typeof(MalzemeListesiSonucDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<MalzemeListesiSonucDto>> Yukle(MalzemeListesiYukleDto dto)
    {
        var kullaniciId = KullaniciIdGetir();
        var firmaId = int.TryParse(User.FindFirst("firma_id")?.Value, out var id) ? id : (int?)null;
        var sonuc = await _malzemeListesiServisi.YukleVeEslestirAsync(dto, kullaniciId, firmaId);
        return CreatedAtAction(nameof(Yukle), new { id = sonuc.Id }, sonuc);
    }

    [HttpPut("{listeId:long}/kalemler/{kalemId:long}/eslesme")]
    [ProducesResponseType(typeof(BomAdayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BomAdayDto>> AdaySec(
        long listeId,
        long kalemId,
        BomAdaySecDto dto)
    {
        return Ok(await _malzemeListesiServisi.AdaySecAsync(
            listeId,
            kalemId,
            dto.UrunId,
            KullaniciIdGetir()));
    }

    private long? KullaniciIdGetir() =>
        long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;
}
