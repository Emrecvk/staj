using System;
using Cevik.Alan.Katalog;

namespace Cevik.Alan.Kimlik;

public class Karsilastirma
{
    public long? KullaniciId { get; set; }
    public string? OturumAnahtari { get; set; }

    public long UrunId { get; set; }
    public Urun Urun { get; set; } = null!;

    public DateTimeOffset EklenmeTarihi { get; set; } = DateTimeOffset.UtcNow;
}
