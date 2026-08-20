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

    public Task EpostaGonderAsync(string kime, string konu, string icerik)
    {
        _logger.LogInformation("E-POSTA GÖNDERİLDİ: Kime={Kime}, Konu={Konu}", kime, konu);
        return Task.CompletedTask;
    }
}
