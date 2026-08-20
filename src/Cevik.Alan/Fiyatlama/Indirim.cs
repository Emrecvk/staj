using Cevik.Alan.Ortak;

namespace Cevik.Alan.Fiyatlama;

public class Indirim : VarlikTabaniUzun
{
    public required string Ad { get; set; }
    
    public IndirimHedefTipi HedefTipi { get; set; }
    public long HedefId { get; set; }

    public IndirimTipi IndirimTipi { get; set; }
    
    /// <summary>Yüzde ise 0-100 arası, değilse tutar</summary>
    public decimal Deger { get; set; }

    public DateTimeOffset BaslangicTarihi { get; set; }
    public DateTimeOffset BitisTarihi { get; set; }
    
    public bool Aktif { get; set; }
}
