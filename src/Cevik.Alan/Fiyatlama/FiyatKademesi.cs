using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Fiyatlama;

public class FiyatKademesi : VarlikTabaniUzun
{
    public long UrunAmbalajId { get; set; }
    public UrunAmbalaji UrunAmbalaji { get; set; } = null!;

    public int MinMiktar { get; set; }
    public int? MaxMiktar { get; set; }

    public decimal BirimFiyat { get; set; }
    
    public required string ParaBirimi { get; set; }

    public int? MusteriGrubuId { get; set; }
    public MusteriGrubu? MusteriGrubu { get; set; }

    public DateTimeOffset? GecerlilikBaslangic { get; set; }
    public DateTimeOffset? GecerlilikBitis { get; set; }
}
