namespace Cevik.Alan.Kurallar;

/// <summary>
/// Katalog fiyatlarının gösterilebileceği para birimleri.
/// Katalog kaynak fiyatı USD'dir; geçersiz değer USD'ye düşer.
/// </summary>
public static class ParaBirimiKodu
{
    public const string Try = "TRY";
    public const string Usd = "USD";
    public const string Eur = "EUR";
    public const string Varsayilan = Usd;

    public static readonly IReadOnlyList<string> Desteklenen = [Try, Usd, Eur];

    public static string Coz(string? deger)
    {
        if (string.IsNullOrWhiteSpace(deger))
            return Varsayilan;

        var n = deger.Trim().ToUpperInvariant();
        return n is Try or Usd or Eur ? n : Varsayilan;
    }
}
