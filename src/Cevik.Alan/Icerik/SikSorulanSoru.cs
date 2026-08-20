using Cevik.Alan.Katalog;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class SikSorulanSoru : VarlikTabaniInt
{
    public int? KategoriId { get; set; }
    public Kategori? Kategori { get; set; }

    public required string Soru { get; set; }
    public required string Cevap { get; set; }

    public int Sira { get; set; }
}
