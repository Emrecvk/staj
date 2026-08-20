using Cevik.Alan.Fiyatlama;

namespace Cevik.Alan.Kurallar;

/// <summary>Miktar doğrulamasının sonucu. Hata varsa <see cref="Gecerli"/> false döner.</summary>
public readonly record struct MiktarKontrolSonucu(bool Gecerli, string? Hata, int OnerilenMiktar)
{
    public static MiktarKontrolSonucu Basarili(int miktar) => new(true, null, miktar);
    public static MiktarKontrolSonucu Basarisiz(string hata, int onerilen) => new(false, hata, onerilen);
}

/// <summary>
/// MOQ / MPQ / Multiple kuralları (PLANLAMA.md 5.3).
///
/// Bu kural bilerek Domain katmanındadır: sepete ekleme, sipariş oluşturma ve
/// teklif dönüşümü aynı kuralı kullanmak zorunda. Controller'a veya servise
/// kopyalanırsa üç yerde üç farklı davranış oluşur.
/// </summary>
public static class SiparisMiktarKurali
{
    /// <summary>
    /// Miktarın MOQ ve katlama (multiple) kurallarına uyup uymadığını denetler.
    /// Uymuyorsa geçerli en yakın ÜST miktarı önerir — aşağı yuvarlamak
    /// müşterinin istediğinden az göndermek demektir, bu yüzden hep yukarı.
    /// </summary>
    public static MiktarKontrolSonucu Dogrula(int miktar, int moq, int katlamaMiktari)
    {
        if (miktar <= 0)
            return MiktarKontrolSonucu.Basarisiz("Miktar sıfırdan büyük olmalıdır.", Math.Max(moq, 1));

        // Bozuk/eksik veri: katlama 0 veya negatifse 1 kabul et, yoksa modulo patlar.
        var katlama = katlamaMiktari > 0 ? katlamaMiktari : 1;
        var enAzMiktar = moq > 0 ? moq : 1;

        if (miktar < enAzMiktar)
            return MiktarKontrolSonucu.Basarisiz(
                $"Minimum sipariş miktarı (MOQ) {enAzMiktar} adettir.",
                YukariYuvarla(enAzMiktar, katlama));

        if (miktar % katlama != 0)
            return MiktarKontrolSonucu.Basarisiz(
                $"Sipariş miktarı {katlama} adedin katı olmalıdır.",
                YukariYuvarla(miktar, katlama));

        return MiktarKontrolSonucu.Basarili(miktar);
    }

    /// <summary>Ambalaj üzerinden doğrulama — çağıranın alan adlarını bilmesi gerekmesin.</summary>
    public static MiktarKontrolSonucu Dogrula(int miktar, UrunAmbalaji ambalaj)
        => Dogrula(miktar, ambalaj.Moq, ambalaj.KatlamaMiktari);

    /// <summary><paramref name="deger"/>'i <paramref name="katlama"/>'nın bir üst katına yuvarlar.</summary>
    public static int YukariYuvarla(int deger, int katlama)
    {
        if (katlama <= 1) return deger;
        var kalan = deger % katlama;
        return kalan == 0 ? deger : deger + (katlama - kalan);
    }
}
