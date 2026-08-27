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
    [ProducesResponseType(typeof(List<AdresDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> AdresleriGetir()
    {
        var adresler = await _profilServisi.AdresleriGetirAsync(GetUserId());
        return Ok(adresler);
    }

    [HttpPost("adresler")]
    [ProducesResponseType(typeof(AdresDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> AdresEkle(AdresEkleDto dto)
    {
        var sonuc = await _profilServisi.AdresEkleAsync(GetUserId(), dto);
        return Ok(sonuc);
    }

    [HttpDelete("adresler/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> AdresSil(long id)
    {
        var sonuc = await _profilServisi.AdresSilAsync(GetUserId(), id);
        if (!sonuc) return NotFound();
        return NoContent();
    }

    [HttpGet("favoriler")]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.SayfaliSonucDto<FavoriDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> FavorileriGetir([FromQuery] int sayfaNo = 1, [FromQuery] int sayfaBoyutu = 25)
    {
        var favoriler = await _profilServisi.FavorileriGetirAsync(GetUserId(), sayfaNo, sayfaBoyutu);
        return Ok(favoriler);
    }

    [HttpPost("favoriler")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> FavoriEkle(FavoriEkleDto dto)
    {
        var sonuc = await _profilServisi.FavoriEkleAsync(GetUserId(), dto);
        if (!sonuc) return BadRequest();
        return NoContent();
    }

    [HttpDelete("favoriler/{urunId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> FavoriSil(long urunId)
    {
        var sonuc = await _profilServisi.FavoriSilAsync(GetUserId(), urunId);
        if (!sonuc) return NotFound();
        return NoContent();
    }

    /// <summary>Kullanicinin bagli oldugu firma bilgisi.</summary>
    [HttpGet("firma")]
    [ProducesResponseType(typeof(FirmaBilgiDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> FirmaBilgisi()
    {
        var firma = await _profilServisi.FirmaBilgisiGetirAsync(GetUserId());
        return firma is null ? NotFound("Bagli oldugunuz bir firma yok.") : Ok(firma);
    }

    [HttpGet("musteri-urun-kodlari")]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.SayfaliSonucDto<MusteriUrunKoduDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MusteriUrunKodlariniGetir([FromQuery] int sayfaNo = 1, [FromQuery] int sayfaBoyutu = 25)
    {
        var kodlar = await _profilServisi.MusteriUrunKodlariniGetirAsync(GetUserId(), sayfaNo, sayfaBoyutu);
        return Ok(kodlar);
    }

    [HttpPost("musteri-urun-kodlari")]
    [ProducesResponseType(typeof(MusteriUrunKoduDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> MusteriUrunKoduEkle(MusteriUrunKoduEkleDto dto)
    {
        var sonuc = await _profilServisi.MusteriUrunKoduEkleAsync(GetUserId(), dto);
        return Ok(sonuc);
    }

    [HttpPut("musteri-urun-kodlari/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MusteriUrunKoduGuncelle(long id, MusteriUrunKoduGuncelleDto dto)
    {
        var sonuc = await _profilServisi.MusteriUrunKoduGuncelleAsync(GetUserId(), id, dto);
        if (!sonuc) return NotFound();
        return NoContent();
    }

    [HttpDelete("musteri-urun-kodlari/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MusteriUrunKoduSil(long id)
    {
        var sonuc = await _profilServisi.MusteriUrunKoduSilAsync(GetUserId(), id);
        if (!sonuc) return NotFound();
        return NoContent();
    }
}
