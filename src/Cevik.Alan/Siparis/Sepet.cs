using System;
using System.Collections.Generic;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Siparis;

public class Sepet : VarlikTabaniUzun
{
    public long? KullaniciId { get; set; }
    public Kullanici? Kullanici { get; set; }

    public string? OturumAnahtari { get; set; }

    public required string ParaBirimi { get; set; }
    public DateTimeOffset SonIslemTarihi { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<SepetKalemi> Kalemler { get; set; } = [];
}
