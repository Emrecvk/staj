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
    ///
    /// MPQ bilerek BU KURALIN PARÇASI DEĞİLDİR. PLANLAMA.md 5.3 domain
    /// kuralını tek cümleyle tanımlıyor: "miktar >= moq VE
    /// miktar % katlama_miktari == 0". <c>mpq</c> aynı bölümde ambalajın
    /// paket büyüklüğünü TARİF eden bir alandır ("Minimum paket miktarı
    /// (1.500)"), sipariş doğrulama kısıtı değil.
    ///
    /// Bir ara MPQ <c>Math.Max(moq, mpq)</c> ile alt sınıra dahil edildi;
    /// katalogdaki 12.000 ambalajın 10.775'inde MPQ (3000, 1000, 500...)
    /// MOQ'dan büyük olduğu için MOQ'su 1 olan üründen 10 adet almak bile
    /// 422 dönmeye başladı ve beş entegrasyon testi kırıldı. Paket katı
    /// kısıtı gerekiyorsa doğru alan <c>KatlamaMiktari</c>'dır.
    /// </summary>
    public static MiktarKontrolSonucu Dogrula(int miktar, int moq, int katlamaMiktari)
    {
        // Bozuk/eksik veri: katlama 0 veya negatifse 1 kabul et, yoksa modulo patlar.
        var katlama = katlamaMiktari > 0 ? katlamaMiktari : 1;
        var enAzMiktar = moq > 0 ? moq : 1;

        // Önerilen miktar her zaman KATLAMAYA UYMALI; aksi halde kullanıcı
        // önerilen değeri aynen girip yeniden 422 alır.
        if (miktar <= 0)
            return MiktarKontrolSonucu.Basarisiz(
                "Miktar sıfırdan büyük olmalıdır.",
                YukariYuvarla(enAzMiktar, katlama));

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
