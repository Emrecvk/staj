namespace Cevik.Uygulama.Ortak;

/// <summary>
/// KDV, kargo ve para birimi kuralları — appsettings "Ticari" bölümünden gelir.
/// Bu değerler koda gömülüydü; muhasebe kuralı değiştiğinde yeniden derleme
/// gerektiriyordu ve kargo eşiği para biriminden bağımsız karşılaştırılıyordu.
/// </summary>
public class TicariAyarlar
{
    public const string BolumAdi = "Ticari";

    /// <summary>Yüzde olarak KDV oranı. Türkiye'de genel oran 20.</summary>
    public decimal KdvOrani { get; set; } = 20m;

    /// <summary>Sistemin ana para birimi — eşikler bu para biriminde tanımlıdır.</summary>
    public string AnaParaBirimi { get; set; } = "TRY";

    /// <summary>Ücretsiz kargo eşiği (<see cref="AnaParaBirimi"/> cinsinden).</summary>
    public decimal UcretsizKargoEsigi { get; set; } = 1000m;

    /// <summary>Eşik altındaki siparişler için kargo ücreti (<see cref="AnaParaBirimi"/> cinsinden).</summary>
    public decimal KargoUcreti { get; set; } = 50m;
}
