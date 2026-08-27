using System.Security.Claims;
using System.Threading.Tasks;
using Cevik.Uygulama.Siparis.Arayuzler;
using Cevik.Uygulama.Siparis.Dto;
using Cevik.Alan.Kurallar;
using Microsoft.AspNetCore.Mvc;

namespace Cevik.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SepetController : ControllerBase
{
    private readonly ISepetServisi _sepetServisi;
    private readonly IDovizKuruServisi _dovizKuruServisi;

    public SepetController(ISepetServisi sepetServisi, IDovizKuruServisi dovizKuruServisi)
    {
        _sepetServisi = sepetServisi;
        _dovizKuruServisi = dovizKuruServisi;
    }

    /// <summary>
    /// Kullanıcı kimliği ve misafir oturum anahtarını BİRLİKTE döndürür.
    ///
    /// Önceki sürüm giriş yapılmışsa oturum anahtarını atıyordu (<c>(userId, null)</c>).
    /// Bu, misafirken doldurulan sepetin giriş sonrasında bulunamaması demekti:
    /// sepet birleştirme mantığı iki değere de ihtiyaç duyar.
    /// </summary>
    private (long? KullaniciId, string? OturumAnahtari) KimlikCoz()
    {
        long? kullaniciId = null;

        var idTalebi = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idTalebi is not null && long.TryParse(idTalebi.Value, out var cozulen))
            kullaniciId = cozulen;

        Request.Headers.TryGetValue("X-Session-Key", out var oturumAnahtari);
        var oturum = oturumAnahtari.ToString();

        return (kullaniciId, string.IsNullOrWhiteSpace(oturum) ? null : oturum);
    }

    [HttpGet]
    [ProducesResponseType(typeof(SepetDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SepetDto>> Get([FromQuery] string? paraBirimi)
    {
        var (userId, sessionKey) = KimlikCoz();
        var sepet = await _sepetServisi.SepetGetirAsync(userId, sessionKey);

        if (sepet is not null && !string.IsNullOrWhiteSpace(paraBirimi))
        {
            var hedefParaBirimi = ParaBirimiKodu.Coz(paraBirimi);
            var kaynakParaBirimi = ParaBirimiKodu.Coz(sepet.ParaBirimi);
            // Sepet görüntüleme de bir GÖSTERİM yolu: kur yoksa sepet
            // açılmamazlık etmemeli, fiyatlar kendi para biriminde kalır.
            var bulunanKur = kaynakParaBirimi == hedefParaBirimi
                ? null
                : await _dovizKuruServisi.KurDeneAsync(kaynakParaBirimi, hedefParaBirimi);

            if (bulunanKur is { } kur)
            {
                foreach (var kalem in sepet.Kalemler)
                {
                    kalem.ListeBirimFiyati = ParaHesabi.Donustur(kalem.ListeBirimFiyati, kur);
                    kalem.BirimFiyat = ParaHesabi.Donustur(kalem.BirimFiyat, kur);
                    kalem.IndirimTutari = ParaHesabi.Donustur(kalem.IndirimTutari, kur);
                    kalem.ToplamFiyat = ParaHesabi.Donustur(kalem.ToplamFiyat, kur);
                }

                sepet.AraToplam = ParaHesabi.Donustur(sepet.AraToplam, kur);
                sepet.IndirimTutari = ParaHesabi.Donustur(sepet.IndirimTutari, kur);
                sepet.GenelToplam = ParaHesabi.Donustur(sepet.GenelToplam, kur);
                sepet.ParaBirimi = hedefParaBirimi;
            }
        }
        
        if (sepet != null && userId == null && string.IsNullOrEmpty(sessionKey))
        {
            // İlk kez misafir geldiğinde oluşan anahtarı header'a ekle (gerçekte cookie mantıklı)
            Response.Headers.Append("X-Session-Key", sepet.OturumAnahtari);
        }

        return Ok(sepet);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SepetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<SepetDto>> Ekle(SepeteEkleDto dto)
    {
        var (userId, sessionKey) = KimlikCoz();
        var sepet = await _sepetServisi.SepeteEkleAsync(userId, sessionKey, dto);
        
        if (userId == null && !string.IsNullOrEmpty(sepet.OturumAnahtari))
        {
            Response.Headers.Append("X-Session-Key", sepet.OturumAnahtari);
        }

        return Ok(sepet);
    }

    [HttpPut]
    [ProducesResponseType(typeof(SepetDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SepetDto>> Guncelle(SepetGuncelleDto dto)
    {
        var (userId, sessionKey) = KimlikCoz();
        var sepet = await _sepetServisi.SepetGuncelleAsync(userId, sessionKey, dto);
        return Ok(sepet);
    }

    [HttpDelete("{kalemId}")]
    [ProducesResponseType(typeof(SepetDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SepetDto>> Sil(long kalemId)
    {
        var (userId, sessionKey) = KimlikCoz();
        var sepet = await _sepetServisi.SepettenCikarAsync(userId, sessionKey, kalemId);
        return Ok(sepet);
    }

    [HttpDelete("bosalt")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Bosalt()
    {
        var (userId, sessionKey) = KimlikCoz();
        await _sepetServisi.SepetiBosaltAsync(userId, sessionKey);
        return NoContent();
    }
}
