namespace Cevik.Uygulama.Kimlik.Dto;

public class MusteriUrunKoduDto
{
    public long Id { get; set; }
    public long UrunId { get; set; }
    public string UreticiUrunKodu { get; set; } = string.Empty;
    public string MusteriKodu { get; set; } = string.Empty;
    public string? Aciklama { get; set; }
}

public class MusteriUrunKoduEkleDto
{
    public long UrunId { get; set; }
    public required string MusteriKodu { get; set; }
    public string? Aciklama { get; set; }
}

public class MusteriUrunKoduGuncelleDto
{
    public required string MusteriKodu { get; set; }
    public string? Aciklama { get; set; }
}
