namespace Cevik.Uygulama.Kimlik.Dto;

public class AdresEkleDto
{
    public required string Baslik { get; set; }
    public required string Sehir { get; set; } // Il
    public required string Ilce { get; set; }
    public required string PostaKodu { get; set; }
    public required string AcikAdres { get; set; }
    public bool FaturaAdresiMi { get; set; } // Tip = AdresTipi.Fatura
}

public class AdresDto : AdresEkleDto
{
    public long Id { get; set; }
}

public class FavoriEkleDto
{
    public long UrunId { get; set; }
}

public class FavoriDto
{
    public long UrunId { get; set; }
    public required string UrunKodu { get; set; }
    public required string KisaAciklama { get; set; }
    public decimal? Fiyat { get; set; }
}
