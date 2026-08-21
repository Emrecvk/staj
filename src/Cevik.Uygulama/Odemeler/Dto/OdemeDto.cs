namespace Cevik.Uygulama.Odemeler.Dto;

/// <summary>
/// Ödeme isteği.
///
/// Kart numarası, son kullanma tarihi veya CVC ALANI YOKTUR ve eklenmemelidir.
/// Gerçek entegrasyonda tarayıcı kartı doğrudan sağlayıcıya gönderip jeton
/// alır; API yalnızca o jetonu görür. Sandbox'ta jeton, denenmek istenen
/// senaryonun anahtarıdır.
/// </summary>
public class OdemeIstekDto
{
    /// <summary>Sağlayıcıdan alınan tek kullanımlık jeton / sandbox senaryo anahtarı.</summary>
    public required string OdemeJetonu { get; set; }

    /// <summary>Kart sahibinin adı gibi hassas olmayan görüntüleme bilgisi (opsiyonel).</summary>
    public string? KartSahibi { get; set; }
}

public class OdemeYanitDto
{
    public bool Basarili { get; set; }
    public required string Mesaj { get; set; }
    public string? HataKodu { get; set; }
    public bool YenidenDenenebilir { get; set; }
    public string? SiparisNo { get; set; }
    /// <summary>Sipariş bu istekten sonra hangi durumda.</summary>
    public short SiparisDurumu { get; set; }
}

public class OdemeDenemesiDto
{
    public long Id { get; set; }
    public required string Durum { get; set; }
    public required string Saglayici { get; set; }
    public string? SaglayiciReferans { get; set; }
    public decimal Tutar { get; set; }
    public DateTimeOffset Tarih { get; set; }
}
