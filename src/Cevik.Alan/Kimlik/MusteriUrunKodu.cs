using Cevik.Alan.Katalog;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Kimlik;

public class MusteriUrunKodu : VarlikTabaniUzun
{
    public int FirmaId { get; set; }
    public Firma Firma { get; set; } = null!;

    public long UrunId { get; set; }
    public Urun Urun { get; set; } = null!;

    public required string MusteriKodu { get; set; }
    public string? Aciklama { get; set; }
}
