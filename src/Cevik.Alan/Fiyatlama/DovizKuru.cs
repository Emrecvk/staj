using System;

namespace Cevik.Alan.Fiyatlama;

public class DovizKuru
{
    public DateTime Tarih { get; set; }
    public required string ParaBirimi { get; set; }

    public decimal Alis { get; set; }
    public decimal Satis { get; set; }
}
