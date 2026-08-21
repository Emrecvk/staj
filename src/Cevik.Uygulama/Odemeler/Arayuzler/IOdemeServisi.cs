using Cevik.Uygulama.Odemeler.Dto;

namespace Cevik.Uygulama.Odemeler.Arayuzler;

public interface IOdemeServisi
{
    /// <summary>
    /// Siparişin ödemesini alır. Başarılıysa sipariş Onaylandi durumuna geçer;
    /// başarısızsa OdemeBekliyor'da kalır ve kullanıcı yeniden deneyebilir.
    /// </summary>
    Task<OdemeYanitDto> OdemeYapAsync(long kullaniciId, long siparisId, OdemeIstekDto istek);

    /// <summary>Bir siparişin ödeme denemelerini döner (yeniden deneme geçmişi).</summary>
    Task<IReadOnlyList<OdemeDenemesiDto>> DenemeleriGetirAsync(long kullaniciId, long siparisId);
}
