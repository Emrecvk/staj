namespace Cevik.Alan.Kurallar;

/// <summary>
/// Para hesapları <c>numeric(18,6)</c> hassasiyetinde tutulur.
/// 2 ondalığa yuvarlamak 0,0234 USD gibi birim fiyatlarda sipariş tutarını bozar;
/// <c>float</c>/<c>double</c> kullanılmaz.
/// </summary>
public static class ParaHesabi
{
    public const int OndalikHassasiyeti = 6;

    public static decimal Yuvarla(decimal deger) =>
        Math.Round(deger, OndalikHassasiyeti, MidpointRounding.AwayFromZero);

    /// <summary><paramref name="tutar"/> × <paramref name="kur"/>, 6 ondalık.</summary>
    public static decimal Donustur(decimal tutar, decimal kur) =>
        Yuvarla(decimal.Multiply(tutar, kur));
}
