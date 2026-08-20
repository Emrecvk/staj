namespace Cevik.Alan.Kurallar;

/// <summary>
/// API dil tercihi. Desteklenmeyen değerlerde TR'ye düşülür;
/// vitrin <c>?dil=de</c> gibi bir değerle 400 dönmesin diye.
/// </summary>
public static class DilKodu
{
    public const string Turkce = "tr";
    public const string Ingilizce = "en";
    public const string Varsayilan = Turkce;

    public static string Coz(string? deger)
    {
        if (string.IsNullOrWhiteSpace(deger))
            return Varsayilan;

        var n = deger.Trim().ToLowerInvariant();
        return n is Turkce or Ingilizce ? n : Varsayilan;
    }

    public static bool IngilizceMi(string? deger) => Coz(deger) == Ingilizce;
}
