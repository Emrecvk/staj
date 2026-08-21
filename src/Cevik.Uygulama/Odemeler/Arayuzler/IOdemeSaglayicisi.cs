namespace Cevik.Uygulama.Odemeler.Arayuzler;

/// <summary>
/// Ödeme sağlayıcısı soyutlaması.
///
/// Gerçek sağlayıcıya (iyzico, PayTR, Stripe) geçişte yalnızca bu arayüzün
/// uygulaması değişir; sipariş akışı ve testler aynı kalır.
///
/// KART VERISI BU ARAYUZDEN GECMEZ. Gerçek entegrasyonda kart bilgisi
/// tarayıcıdan doğrudan sağlayıcıya gider ve geriye yalnızca tek kullanımlık
/// bir jeton döner; API o jetonu alır. Sandbox uygulamasında da kart numarası
/// istenmez — senaryo seçilir. Bu sayede sistem hiçbir noktada PAN saklamaz
/// veya loglamaz.
/// </summary>
public interface IOdemeSaglayicisi
{
    /// <summary>Sağlayıcının adı — Odeme kaydına yazılır.</summary>
    string Ad { get; }

    Task<OdemeSonucu> TahsilEtAsync(OdemeTalebi talep, CancellationToken iptalJetonu = default);
}

/// <param name="SiparisNo">Sağlayıcıya gönderilen sipariş referansı.</param>
/// <param name="Tutar">Tahsil edilecek tutar.</param>
/// <param name="ParaBirimi">ISO kodu (TRY/USD/EUR).</param>
/// <param name="OdemeJetonu">
/// Sağlayıcıdan alınan tek kullanımlık jeton. Sandbox'ta senaryo anahtarı
/// olarak kullanılır (bkz. <c>SandboxOdemeSaglayicisi</c>).
/// </param>
public record OdemeTalebi(string SiparisNo, decimal Tutar, string ParaBirimi, string OdemeJetonu);

/// <param name="Basarili">Tahsilat gerçekleşti mi.</param>
/// <param name="Referans">Sağlayıcı işlem referansı — mutabakat için saklanır.</param>
/// <param name="HataKodu">Başarısızsa makine tarafından okunabilir kod.</param>
/// <param name="Mesaj">Kullanıcıya gösterilebilir açıklama.</param>
/// <param name="YenidenDenenebilir">
/// Kullanıcının tekrar denemesi anlamlı mı. Yetersiz bakiyede evet,
/// kalıcı rette hayır — arayüz butonu buna göre gösterir.
/// </param>
/// <param name="HamYanitJson">Sağlayıcı yanıtı; hata ayıklama için saklanır.</param>
public record OdemeSonucu(
    bool Basarili,
    string? Referans,
    string? HataKodu,
    string Mesaj,
    bool YenidenDenenebilir,
    string? HamYanitJson);
