using System;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Siparis;

public class SiparisDurumGecmisi : VarlikTabaniUzun
{
    public long SiparisId { get; set; }
    public SiparisVarligi Siparis { get; set; } = null!;

    /// <summary>Siparişin ilk kaydında önceki durum yoktur — bu yüzden nullable.</summary>
    public SiparisDurumu? OncekiDurum { get; set; }
    public SiparisDurumu YeniDurum { get; set; }

    public long? DegistirenKullaniciId { get; set; }
    public Kullanici? DegistirenKullanici { get; set; }

    public string? Aciklama { get; set; }
    public DateTimeOffset Tarih { get; set; } = DateTimeOffset.UtcNow;
}
