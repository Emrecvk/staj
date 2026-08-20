using System;
using System.Collections.Generic;
using Cevik.Alan.Ortak;

namespace Cevik.Uygulama.Teklif.Dto;

public class TeklifOlusturDto
{
    public string? MusteriNotu { get; set; }
}

public class TeklifListelemeDto
{
    public long Id { get; set; }
    public required string TalepNo { get; set; }
    public TeklifDurumu Durum { get; set; }
    public DateTimeOffset? GecerlilikTarihi { get; set; }
}
