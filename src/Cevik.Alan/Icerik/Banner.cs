using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class Banner : VarlikTabaniInt
{
    public required string Konum { get; set; }
    
    public required string GorselUrl { get; set; }
    public string? LinkUrl { get; set; }

    public int Sira { get; set; }
    public bool Aktif { get; set; }
}
