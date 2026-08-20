using Cevik.Alan.Katalog;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Teklif;

public class TeklifKalemi : VarlikTabaniUzun
{
    public long TeklifTalepId { get; set; }
    public TeklifTalebi TeklifTalebi { get; set; } = null!;

    public long? UrunId { get; set; }
    public Urun? Urun { get; set; }

    /// <summary>Katalogda olmayan ürün de talep edilebilir, o durumda müşterinin yazdığı kod</summary>
    public string? SerbestUrunKodu { get; set; }

    public int Miktar { get; set; }

    public decimal? HedefBirimFiyat { get; set; }
    public decimal? TeklifEdilenBirimFiyat { get; set; }
    
    public int? TeklifEdilenTeslimSuresiGun { get; set; }
}
