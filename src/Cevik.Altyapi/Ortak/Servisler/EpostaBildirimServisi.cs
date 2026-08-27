using Cevik.Uygulama.Ortak.Arayuzler;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Ortak.Servisler;

public class EpostaBildirimServisi : IBildirimServisi
{
    private readonly ILogger<EpostaBildirimServisi> _logger;

    public EpostaBildirimServisi(ILogger<EpostaBildirimServisi> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Bu servis de e-posta GÖNDERMEZ. Log satırı önceden
    /// "E-POSTA GÖNDERİLDİ" yazıyordu; bu, log'u okuyan herkese teslim
    /// edilmiş izlenimi veren yanlış bir ifadeydi. Gövde bilerek
    /// loglanmaz — bkz. <see cref="SahteEpostaServisi"/>.
    /// </summary>
    public Task EpostaGonderAsync(string kime, string konu, string icerik)
    {
        _logger.LogWarning(
            "E-posta sağlayıcısı yapılandırılmadı, bildirim GÖNDERİLMEDİ. Kime={Kime}, Konu={Konu}",
            kime, konu);
        return Task.CompletedTask;
    }
}
