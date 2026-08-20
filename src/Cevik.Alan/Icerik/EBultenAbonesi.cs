using System;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class EBultenAbonesi : VarlikTabaniUzun
{
    public required string Eposta { get; set; }
    
    public bool OnaylandiMi { get; set; }
    
    public DateTimeOffset AbonelikTarihi { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? IptalTarihi { get; set; }
}
