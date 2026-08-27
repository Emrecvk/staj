using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Katalog;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Teklif;

public class TeklifKalemi : VarlikTabaniUzun
{
    public long TeklifTalepId { get; set; }
    public TeklifTalebi TeklifTalebi { get; set; } = null!;

    public long? UrunId { get; set; }
    public Urun? Urun { get; set; }

    /// <summary>
    /// Teklif edilen ambalaj. MOQ, katlama miktarı ve stok ambalaj başına
    /// tanımlı olduğu için siparişe dönüşte bu bilgi şart; sepette seçilen
    /// ambalaj burada korunmazsa dönüşüm rastgele bir ambalaj seçmek
    /// zorunda kalır ve miktar kuralları yanlış ambalaja karşı doğrulanır.
    /// Serbest metinli kalemlerde null'dır.
    /// </summary>
    public long? UrunAmbalajId { get; set; }
    public UrunAmbalaji? UrunAmbalaji { get; set; }

    /// <summary>Katalogda olmayan ürün de talep edilebilir, o durumda müşterinin yazdığı kod</summary>
    public string? SerbestUrunKodu { get; set; }

    public int Miktar { get; set; }
    public int? TeklifEdilenMiktar { get; set; }

    public decimal? HedefBirimFiyat { get; set; }
    public decimal? TeklifEdilenBirimFiyat { get; set; }
    public string? ParaBirimi { get; set; }
    
    public int? TeklifEdilenTeslimSuresiGun { get; set; }
    public string? SatisTemsilcisiNotu { get; set; }
}
