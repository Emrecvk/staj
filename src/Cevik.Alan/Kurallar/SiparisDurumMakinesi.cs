using Cevik.Alan.Ortak;

namespace Cevik.Alan.Kurallar;

/// <summary>
/// Sipariş durum geçişleri (PLANLAMA.md 5.5).
///
/// Geçerli geçişler tabloda tutulur; bilerek "if yığını" yapılmamıştır —
/// yeni bir durum eklendiğinde tek yerden düzenlenir.
/// </summary>
public static class SiparisDurumMakinesi
{
    private static readonly Dictionary<SiparisDurumu, SiparisDurumu[]> GecerliGecisler = new()
    {
        [SiparisDurumu.Olusturuldu]    = [SiparisDurumu.OdemeBekliyor, SiparisDurumu.Onaylandi, SiparisDurumu.IptalEdildi],
        [SiparisDurumu.OdemeBekliyor]  = [SiparisDurumu.Onaylandi, SiparisDurumu.IptalEdildi],
        [SiparisDurumu.Onaylandi]      = [SiparisDurumu.Hazirlaniyor, SiparisDurumu.IptalEdildi],
        [SiparisDurumu.Hazirlaniyor]   = [SiparisDurumu.KargoyaVerildi],
        [SiparisDurumu.KargoyaVerildi] = [SiparisDurumu.TeslimEdildi],
        [SiparisDurumu.TeslimEdildi]   = [SiparisDurumu.IadeEdildi],
        // Uç durumlar: buradan çıkış yok.
        [SiparisDurumu.IptalEdildi]    = [],
        [SiparisDurumu.IadeEdildi]     = []
    };

    public static bool GecisGecerliMi(SiparisDurumu mevcut, SiparisDurumu hedef)
        => GecerliGecisler.TryGetValue(mevcut, out var izinliler) && izinliler.Contains(hedef);

    public static IReadOnlyList<SiparisDurumu> IzinliGecisler(SiparisDurumu mevcut)
        => GecerliGecisler.TryGetValue(mevcut, out var izinliler) ? izinliler : [];

    /// <summary>İptal yalnızca sipariş onaylanmadan önce mümkündür.</summary>
    public static bool IptalEdilebilirMi(SiparisDurumu mevcut)
        => GecisGecerliMi(mevcut, SiparisDurumu.IptalEdildi);
}
