using System;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class BlogYazisi : VarlikTabaniInt
{
    public required string Baslik { get; set; }
    public required string Slug { get; set; }
    
    public required string Ozet { get; set; }
    public required string IcerikHtml { get; set; }
    
    public string? KapakGorselUrl { get; set; }
    
    public DateTimeOffset? YayinTarihi { get; set; }
    public string? Kategori { get; set; }
}
