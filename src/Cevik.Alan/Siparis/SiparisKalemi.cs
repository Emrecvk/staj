using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Katalog;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Siparis;

public class SiparisKalemi : VarlikTabaniUzun
{
    public long SiparisId { get; set; }
    public SiparisVarligi Siparis { get; set; } = null!;

    public long UrunId { get; set; }
    public Urun Urun { get; set; } = null!;

    public long UrunAmbalajId { get; set; }
    public UrunAmbalaji UrunAmbalaji { get; set; } = null!;

    // Snapshot alanları
    public required string UrunKoduSnapshot { get; set; }
    public required string UrunAdiSnapshot { get; set; }
    public required string AmbalajAdiSnapshot { get; set; }

    public int Miktar { get; set; }
    public decimal BirimFiyat { get; set; }
    public decimal SatirToplami { get; set; }
    public decimal KdvOrani { get; set; }
}
