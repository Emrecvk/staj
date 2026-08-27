using System.Threading.Tasks;
using Cevik.Uygulama.Ortak.Arayuzler;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Ortak.Servisler;

/// <summary>
/// Gerçek bir e-posta sağlayıcısı yapılandırılana kadar kullanılan yer tutucu.
///
/// İKİ KURAL:
///
/// 1. GÖVDE ASLA LOGLANMAZ. Önceki sürüm <c>İçerik: {Icerik}</c> ile e-postanın
///    tamamını basıyordu; şifre sıfırlama ve e-posta doğrulama gövdeleri ham
///    token taşıdığı için token'lar düz metin olarak uygulama log'una düşüyordu.
///    Token'ın veritabanında SHA-256 ile saklanması bu durumda hiçbir koruma
///    sağlamıyordu: <c>docker logs</c> çıktısını okuyabilen herkes herhangi bir
///    hesabın — yöneticinin dahil — parolasını sıfırlayabiliyordu.
///
/// 2. TESLİM EDİLMEME SESSİZ KALMAZ. Bu sınıf e-postayı GÖNDERMEZ. Geliştirmede
///    bu beklenen davranış, ama üretimde şifre sıfırlama akışının sessizce
///    çalışmaması demektir: kullanıcı token'ı hiç alamaz. Bu yüzden Development
///    dışında her çağrı hata seviyesinde loglanır ki durum gözden kaçmasın.
/// </summary>
public class SahteEpostaServisi : IEpostaServisi
{
    private readonly ILogger<SahteEpostaServisi> _logger;
    private readonly IHostEnvironment _ortam;

    public SahteEpostaServisi(ILogger<SahteEpostaServisi> logger, IHostEnvironment ortam)
    {
        _logger = logger;
        _ortam = ortam;
    }

    public Task EpostaGonderAsync(string kime, string konu, string icerik)
    {
        if (_ortam.IsDevelopment())
        {
            _logger.LogInformation(
                "E-posta sağlayıcısı yapılandırılmadı, gönderilmedi. Kime={Kime}, Konu={Konu}",
                kime, konu);
        }
        else
        {
            _logger.LogError(
                "E-POSTA GÖNDERİLEMEDİ: gerçek bir e-posta sağlayıcısı yapılandırılmamış. " +
                "Kime={Kime}, Konu={Konu}. Şifre sıfırlama ve doğrulama akışları çalışmayacak.",
                kime, konu);
        }

        return Task.CompletedTask;
    }
}
