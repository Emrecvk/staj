using System;
using Cevik.Alan.Katalog;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Kimlik;

public class Favori
{
    public long KullaniciId { get; set; }
    public Kullanici Kullanici { get; set; } = null!;

    public long UrunId { get; set; }
    public Urun Urun { get; set; } = null!;

    public DateTimeOffset OlusturmaTarihi { get; set; } = DateTimeOffset.UtcNow;
}
