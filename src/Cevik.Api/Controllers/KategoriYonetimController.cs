using Cevik.Uygulama.Yonetim.Arayuzler;
using Cevik.Uygulama.Yonetim.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/yonetim/kategori")]
[Authorize(Policy = "YonetimErisimi")]
public class KategoriYonetimController : ControllerBase
{
    private readonly IKatalogYonetimServisi _servis;
    public KategoriYonetimController(IKatalogYonetimServisi servis) => _servis = servis;

    [HttpGet]
    [ProducesResponseType(typeof(List<KategoriYonetimDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<KategoriYonetimDto>>> Listele([FromQuery] bool silinmisleriGoster = false) =>
        Ok(await _servis.KategorileriListeleAsync(silinmisleriGoster));

    [HttpPost]
    [ProducesResponseType(typeof(KategoriOlusturmaSonucuDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<KategoriOlusturmaSonucuDto>> Ekle(KategoriYazDto dto)
    {
        var sonuc = await _servis.KategoriEkleAsync(dto);
        return CreatedAtAction(nameof(Listele), new { id = sonuc.Id }, sonuc);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Guncelle(int id, KategoriYazDto dto)
    {
        await _servis.KategoriGuncelleAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Sil(int id)
    {
        await _servis.KategoriSilAsync(id);
        return NoContent();
    }

    [HttpPost("ozellik")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> OzellikBagla(KategoriOzelligiYazDto dto)
    {
        await _servis.KategoriOzelligiBaglaAsync(dto);
        return NoContent();
    }

    [HttpDelete("{kategoriId:int}/ozellik/{ozellikTanimId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> OzellikKaldir(int kategoriId, int ozellikTanimId)
    {
        await _servis.KategoriOzelligiKaldirAsync(kategoriId, ozellikTanimId);
        return NoContent();
    }
}
