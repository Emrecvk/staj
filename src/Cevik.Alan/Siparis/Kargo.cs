using System;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Siparis;

public class Kargo : VarlikTabaniUzun
{
    public long SiparisId { get; set; }
    public SiparisVarligi Siparis { get; set; } = null!;

    public required string KargoFirmasi { get; set; }
    public string? TakipNo { get; set; }

    public DateTimeOffset? GonderimTarihi { get; set; }
    public DateTimeOffset? TeslimTarihi { get; set; }
}
