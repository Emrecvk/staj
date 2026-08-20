using Cevik.Alan.Ortak;

namespace Cevik.Alan.Katalog;

public class UrunGorseli : VarlikTabaniUzun
{
    public long UrunId { get; set; }
    public Urun Urun { get; set; } = null!;

    public required string Url { get; set; }
    public int Sira { get; set; }
    public string? AltMetin { get; set; }
}
