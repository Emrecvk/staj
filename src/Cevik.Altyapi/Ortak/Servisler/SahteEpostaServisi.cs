using System.Threading.Tasks;
using Cevik.Uygulama.Ortak.Arayuzler;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Ortak.Servisler;

public class SahteEpostaServisi : IEpostaServisi
{
    private readonly ILogger<SahteEpostaServisi> _logger;

    public SahteEpostaServisi(ILogger<SahteEpostaServisi> logger)
    {
        _logger = logger;
    }

    public Task EpostaGonderAsync(string kime, string konu, string icerik)
    {
        _logger.LogInformation("E-Posta gönderiliyor...\nKime: {Kime}\nKonu: {Konu}\nİçerik: {Icerik}", kime, konu, icerik);
        return Task.CompletedTask;
    }
}
