using Cevik.Uygulama.Yonetim.Arayuzler;
using Cevik.Uygulama.Yonetim.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/yonetim/uretici")]
[Authorize(Policy = "YonetimErisimi")]
public class UreticiYonetimController : ControllerBase
{
    private readonly IKatalogYonetimServisi _servis;
    public UreticiYonetimController(IKatalogYonetimServisi servis) => _servis = servis;

    [HttpGet]
    [ProducesResponseType(typeof(List<UreticiYonetimDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UreticiYonetimDto>>> Listele([FromQuery] bool silinmisleriGoster = false) =>
        Ok(await _servis.UreticileriListeleAsync(silinmisleriGoster));

    [HttpPost]
    [ProducesResponseType(typeof(KimlikDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<KimlikDto>> Ekle(UreticiYazDto dto)
    {
        var sonuc = await _servis.UreticiEkleAsync(dto);
        return CreatedAtAction(nameof(Listele), new { id = sonuc.Id }, sonuc);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Guncelle(int id, UreticiYazDto dto)
    {
        await _servis.UreticiGuncelleAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Sil(int id)
    {
        await _servis.UreticiSilAsync(id);
        return NoContent();
    }
}

[ApiController]
[Route("api/yonetim/ozellik")]
[Authorize(Policy = "YonetimErisimi")]
public class OzellikYonetimController : ControllerBase
{
    private readonly IKatalogYonetimServisi _servis;
    public OzellikYonetimController(IKatalogYonetimServisi servis) => _servis = servis;

    [HttpGet]
    [ProducesResponseType(typeof(List<OzellikYonetimDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<OzellikYonetimDto>>> Listele() =>
        Ok(await _servis.OzellikleriListeleAsync());

    [HttpPost]
    [ProducesResponseType(typeof(KimlikDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<KimlikDto>> Ekle(OzellikTanimiYazDto dto)
    {
        var sonuc = await _servis.OzellikEkleAsync(dto);
        return CreatedAtAction(nameof(Listele), new { id = sonuc.Id }, sonuc);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Guncelle(int id, OzellikTanimiYazDto dto)
    {
        await _servis.OzellikGuncelleAsync(id, dto);
        return NoContent();
    }
}
