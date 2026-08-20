using Cevik.Alan.Katalog;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Bom;

public class MalzemeListesiKalemi : VarlikTabaniUzun
{
    public long MalzemeListesiId { get; set; }
    public MalzemeListesi MalzemeListesi { get; set; } = null!;

    public int SatirNo { get; set; }
    
    public required string ArananKod { get; set; }
    public string? Referanslar { get; set; }
    
    public int Miktar { get; set; }

    public long? EslesenUrunId { get; set; }
    public Urun? EslesenUrun { get; set; }

    public BomEslesmeDurumu EslesmeDurumu { get; set; }
    
    public int EslesmeSkoru { get; set; }
}
