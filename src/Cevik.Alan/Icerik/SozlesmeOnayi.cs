using System;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class SozlesmeOnayi : VarlikTabaniUzun
{
    public long KullaniciId { get; set; }
    public Kullanici Kullanici { get; set; } = null!;

    public int SozlesmeId { get; set; }
    public Sozlesme Sozlesme { get; set; } = null!;

    public DateTimeOffset OnayTarihi { get; set; } = DateTimeOffset.UtcNow;
    public required string IpAdresi { get; set; }
}
