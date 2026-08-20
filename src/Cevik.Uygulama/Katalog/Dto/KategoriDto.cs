using System.Collections.Generic;

namespace Cevik.Uygulama.Katalog.Dto;

public class KategoriAgacDto
{
    public int Id { get; set; }
    public required string Ad { get; set; }
    public required string Slug { get; set; }
    public string? IkonUrl { get; set; }
    public bool YaprakMi { get; set; }
    public int Sira { get; set; }
    public List<KategoriAgacDto> AltKategoriler { get; set; } = new();
}

public class KategoriDetayDto
{
    public int Id { get; set; }
    public required string Ad { get; set; }
    public required string Slug { get; set; }
    public string? SeoBaslik { get; set; }
    public string? SeoAciklama { get; set; }
    public string? SeoIcerikHtml { get; set; }
    public bool YaprakMi { get; set; }
}
