using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Kurallar;

public readonly record struct IndirimSonucu(
    decimal ListeBirimFiyati,
    decimal BirimFiyat,
    decimal SatirIndirimTutari,
    long? IndirimId);

/// <summary>
/// Etkin kampanyalar ile müşteri grubunun varsayılan iskontosundan müşteriye
/// en avantajlı TEK indirimi seçer. İndirimler üst üste bindirilmez.
/// </summary>
public static class IndirimHesabi
{
    public static IndirimSonucu Uygula(
        decimal listeBirimFiyati,
        int miktar,
        decimal varsayilanIskontoYuzdesi,
        IEnumerable<Indirim> indirimler)
    {
        var enIyiBirimIndirim = YuzdeIndirim(listeBirimFiyati, varsayilanIskontoYuzdesi);
        long? secilenIndirimId = null;

        foreach (var indirim in indirimler)
        {
            var aday = indirim.IndirimTipi switch
            {
                IndirimTipi.Yuzde => YuzdeIndirim(listeBirimFiyati, indirim.Deger),
                IndirimTipi.SabitTutar => Math.Clamp(indirim.Deger, 0m, listeBirimFiyati),
                _ => 0m
            };

            if (aday > enIyiBirimIndirim)
            {
                enIyiBirimIndirim = aday;
                secilenIndirimId = indirim.Id;
            }
        }

        var birimFiyat = ParaHesabi.Yuvarla(Math.Max(0m, listeBirimFiyati - enIyiBirimIndirim));
        return new IndirimSonucu(
            listeBirimFiyati,
            birimFiyat,
            ParaHesabi.Yuvarla(enIyiBirimIndirim * Math.Max(miktar, 0)),
            secilenIndirimId);
    }

    private static decimal YuzdeIndirim(decimal fiyat, decimal yuzde) =>
        ParaHesabi.Yuvarla(fiyat * Math.Clamp(yuzde, 0m, 100m) / 100m);
}
