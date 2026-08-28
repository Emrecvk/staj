namespace Cevik.Uygulama.Icerik.Dto;

public class EBultenAbonelikIstekDto
{
    public required string Eposta { get; set; }
}

public class PublicBlogOzetDto
{
    public int Id { get; set; }
    public required string Baslik { get; set; }
    public required string Slug { get; set; }
    public required string Ozet { get; set; }
    public string? KapakGorselUrl { get; set; }
    public DateTimeOffset? YayinTarihi { get; set; }
    public string? Kategori { get; set; }
}

public class PublicBlogDetayDto : PublicBlogOzetDto
{
    public required string IcerikHtml { get; set; }
}

public class PublicDuyuruDto
{
    public int Id { get; set; }
    public required string Baslik { get; set; }
    public required string Icerik { get; set; }
    public string? GorselUrl { get; set; }
    public string? LinkUrl { get; set; }
    public int Sira { get; set; }
}

public class PublicBannerDto
{
    public int Id { get; set; }
    public required string Konum { get; set; }
    public required string GorselUrl { get; set; }
    public string? LinkUrl { get; set; }
    public int Sira { get; set; }
}

public class PublicSayfaDto
{
    public required string Slug { get; set; }
    public required string Baslik { get; set; }
    public required string IcerikHtml { get; set; }
    public string? SeoBaslik { get; set; }
    public string? SeoAciklama { get; set; }
}

public class PublicSssDto
{
    public int Id { get; set; }
    public int? KategoriId { get; set; }
    public required string Soru { get; set; }
    public required string Cevap { get; set; }
    public int Sira { get; set; }
}
