using Cevik.Alan.Ortak;

namespace Cevik.Alan.Kimlik;

public class Adres : VarlikTabaniUzun
{
    public long? KullaniciId { get; set; }
    public Kullanici? Kullanici { get; set; }

    public int? FirmaId { get; set; }
    public Firma? Firma { get; set; }

    public AdresTipi Tip { get; set; }
    
    public required string Baslik { get; set; }
    public required string AdSoyad { get; set; }
    public string? Telefon { get; set; }
    
    public required string Il { get; set; }
    public required string Ilce { get; set; }
    public required string AcikAdres { get; set; }
    public string? PostaKodu { get; set; }
    
    public bool VarsayilanMi { get; set; }
}
