using System.Text.Json;
using Cevik.Uygulama.Odemeler.Arayuzler;
using Microsoft.Extensions.Logging;

namespace Cevik.Altyapi.Odemeler.Servisler;

/// <summary>
/// Sandbox ödeme sağlayıcısı.
///
/// Sonuç, gönderilen senaryo anahtarına göre BELIRLENIMCI olarak üretilir.
/// Önceki arayüz uygulaması tarayıcıda <c>Math.random() &lt; 0.20</c> ile
/// rastgele ret üretiyordu; bu hem test edilemez hem de sunucu tarafında
/// hiçbir iz bırakmayan bir gösterimdi. Belirlenimci senaryolar sayesinde
/// "yetersiz bakiye" ve "yeniden deneme" akışları otomatik test edilebilir.
///
/// Gerçek sağlayıcıya geçildiğinde bu sınıf <see cref="IOdemeSaglayicisi"/>
/// uygulaması olarak değiştirilir; çağıran taraf değişmez.
/// </summary>
public class SandboxOdemeSaglayicisi : IOdemeSaglayicisi
{
    public const string BasariliJeton = "sandbox-basarili";
    public const string YetersizBakiyeJeton = "sandbox-yetersiz-bakiye";
    public const string ReddedildiJeton = "sandbox-reddedildi";
    public const string SaglayiciHatasiJeton = "sandbox-saglayici-hatasi";

    private readonly ILogger<SandboxOdemeSaglayicisi> _gunlukcu;

    public SandboxOdemeSaglayicisi(ILogger<SandboxOdemeSaglayicisi> gunlukcu) => _gunlukcu = gunlukcu;

    public string Ad => "Sandbox";

    public Task<OdemeSonucu> TahsilEtAsync(OdemeTalebi talep, CancellationToken iptalJetonu = default)
    {
        _gunlukcu.LogInformation(
            "Sandbox odeme denemesi. Siparis: {SiparisNo}, Tutar: {Tutar} {ParaBirimi}",
            talep.SiparisNo, talep.Tutar, talep.ParaBirimi);

        var sonuc = talep.OdemeJetonu switch
        {
            YetersizBakiyeJeton => new OdemeSonucu(
                false, null, "YETERSIZ_BAKIYE",
                "Kartınızda yeterli bakiye bulunmuyor. Farklı bir kartla tekrar deneyebilirsiniz.",
                YenidenDenenebilir: true, HamYanit(talep, "insufficient_funds")),

            ReddedildiJeton => new OdemeSonucu(
                false, null, "REDDEDILDI",
                "Ödeme bankanız tarafından reddedildi. Lütfen bankanızla iletişime geçin.",
                YenidenDenenebilir: false, HamYanit(talep, "card_declined")),

            SaglayiciHatasiJeton => new OdemeSonucu(
                false, null, "SAGLAYICI_HATASI",
                "Ödeme sağlayıcısına ulaşılamadı. Lütfen birkaç dakika sonra tekrar deneyin.",
                YenidenDenenebilir: true, HamYanit(talep, "provider_unavailable")),

            BasariliJeton => new OdemeSonucu(
                true, $"SBX-{Guid.NewGuid():N}"[..20], null,
                "Ödeme başarıyla alındı.",
                YenidenDenenebilir: false, HamYanit(talep, "approved")),

            // Tanınmayan jeton gerçek sağlayıcıda da reddedilir.
            _ => new OdemeSonucu(
                false, null, "GECERSIZ_JETON",
                "Ödeme oturumu geçersiz veya süresi dolmuş. Lütfen yeniden deneyin.",
                YenidenDenenebilir: true, HamYanit(talep, "invalid_token")),
        };

        return Task.FromResult(sonuc);
    }

    /// <summary>
    /// Sağlayıcı yanıtını taklit eder. Jeton bilerek yazılmaz — gerçek
    /// entegrasyonda jeton hassas veridir ve loglanmamalıdır.
    /// </summary>
    private static string HamYanit(OdemeTalebi talep, string kod) =>
        JsonSerializer.Serialize(new
        {
            provider = "sandbox",
            status = kod,
            order_reference = talep.SiparisNo,
            amount = talep.Tutar,
            currency = talep.ParaBirimi,
            processed_at = DateTimeOffset.UtcNow,
        });
}
