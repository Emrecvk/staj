using System;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Fiyatlama;

public class StokBildirimi : VarlikTabaniUzun
{
    public long UrunAmbalajId { get; set; }
    public UrunAmbalaji UrunAmbalaji { get; set; } = null!;

    public long? KullaniciId { get; set; }
    
    // Alternatif olarak Eposta
    public string? Eposta { get; set; }

    public int IstenenMiktar { get; set; }
    public bool BildirildiMi { get; set; }
}
