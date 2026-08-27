using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Teklif.Arayuzler;
using Cevik.Uygulama.Teklif.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TeklifController : ControllerBase
{
    private readonly ITeklifServisi _teklifServisi;

    public TeklifController(ITeklifServisi teklifServisi)
    {
        _teklifServisi = teklifServisi;
    }

    private long GetUserId()
    {
        return long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    private string? GetSessionKey()
    {
        Request.Headers.TryGetValue("X-Session-Key", out var sessionKey);
        return sessionKey.ToString();
    }

    [HttpGet]
    [ProducesResponseType(typeof(Cevik.Uygulama.Ortak.SayfaliSonucDto<TeklifListelemeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<Cevik.Uygulama.Ortak.SayfaliSonucDto<TeklifListelemeDto>>> TeklifleriGetir(
        [FromQuery] int sayfaNo = 1,
        [FromQuery] int sayfaBoyutu = 25)
    {
        var teklifler = await _teklifServisi.TeklifleriGetirAsync(GetUserId(), sayfaNo, sayfaBoyutu);
        return Ok(teklifler);
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(TeklifDetayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeklifDetayDto>> Detay(long id)
    {
        var teklif = await _teklifServisi.TeklifDetayGetirAsync(GetUserId(), id);
        return teklif == null ? NotFound() : Ok(teklif);
    }

    /// <summary>
    /// Yetki kontrolü bilerek burada DEĞİL, serviste yapılır.
    ///
    /// Önceki sürüm JWT'deki "FirmaYetkilisi" talebini <c>!= "True"</c> ile
    /// karşılaştırıyordu; talep <see cref="Cevik.Altyapi.Kimlik.Servisler.KimlikServisi"/>
    /// tarafından küçük harfle ("true") yazıldığı için koşul HER ZAMAN doğruydu.
    /// Üstelik <c>Forbid(string)</c> aşırı yüklemesi metni kimlik doğrulama
    /// ŞEMA ADI sayar, mesaj değil — kayıtlı tek şema "Bearer" olduğu için
    /// ForbidResult çalışırken InvalidOperationException fırlatıyor ve uç
    /// 403 yerine 500 dönüyordu. Yani teklif oluşturma hiç çalışmıyordu.
    ///
    /// Talep zaten güvenilir bir kaynak değil: firma onayı token verildikten
    /// sonra geldiğinde talep bayatlar. Yetkinin tek doğru yeri veritabanıdır.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TeklifListelemeDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TeklifListelemeDto>> TeklifOlustur(TeklifOlusturDto dto)
    {
        var sonuc = await _teklifServisi.TeklifTalebiOlusturAsync(GetUserId(), GetSessionKey(), dto);
        return Ok(sonuc);
    }

    [HttpPost("{id:long}/kabul")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> KabulEt(long id)
    {
        await _teklifServisi.DurumDegistirMusteriAsync(GetUserId(), id, kabul: true);
        return NoContent();
    }

    [HttpPost("{id:long}/red")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Reddet(long id)
    {
        await _teklifServisi.DurumDegistirMusteriAsync(GetUserId(), id, kabul: false);
        return NoContent();
    }

    [HttpPost("{id:long}/siparis")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SipariseDonustur(long id)
    {
        await _teklifServisi.SipariseDonusturAsync(GetUserId(), id);
        return NoContent();
    }
}
