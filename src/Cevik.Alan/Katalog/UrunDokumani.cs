using Cevik.Alan.Ortak;

namespace Cevik.Alan.Katalog;

public class UrunDokumani : VarlikTabaniUzun
{
    public long UrunId { get; set; }
    public Urun Urun { get; set; } = null!;

    public DokumanTipi Tip { get; set; }
    public required string Url { get; set; }
    public required string Baslik { get; set; }

    /// <summary>"tr" / "en"</summary>
    public string? Dil { get; set; }
    public int? DosyaBoyutuKb { get; set; }
}
