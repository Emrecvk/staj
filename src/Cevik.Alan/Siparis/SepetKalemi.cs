using System;
using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Siparis;

public class SepetKalemi : VarlikTabaniUzun
{
    public long SepetId { get; set; }
    public Sepet Sepet { get; set; } = null!;

    public long UrunAmbalajId { get; set; }
    public UrunAmbalaji UrunAmbalaji { get; set; } = null!;

    public int Miktar { get; set; }
    
    public DateTimeOffset EklenmeTarihi { get; set; } = DateTimeOffset.UtcNow;
}
