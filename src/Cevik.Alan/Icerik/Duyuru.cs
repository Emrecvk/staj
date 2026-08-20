using System;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class Duyuru : VarlikTabaniInt
{
    public required string Baslik { get; set; }
    public required string Icerik { get; set; }
    
    public string? GorselUrl { get; set; }
    public string? LinkUrl { get; set; }

    public DateTimeOffset? BaslangicTarihi { get; set; }
    public DateTimeOffset? BitisTarihi { get; set; }

    public int Sira { get; set; }
}
