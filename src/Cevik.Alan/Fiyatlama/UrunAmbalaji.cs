using Cevik.Alan.Katalog;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Fiyatlama;

public class UrunAmbalaji : VarlikTabaniUzun
{
    public long UrunId { get; set; }
    public Urun Urun { get; set; } = null!;

    public AmbalajTipi AmbalajTipi { get; set; }
    public required string Ad { get; set; }

    /// <summary>Minimum paket miktarı</summary>
    public int Mpq { get; set; }
    
    /// <summary>Minimum sipariş miktarı</summary>
    public int Moq { get; set; }
    
    /// <summary>Sipariş miktarı bunun katı olmalı</summary>
    public int KatlamaMiktari { get; set; }

    public int StokMiktari { get; set; }
    public int GelecekStokMiktari { get; set; }
    public DateTime? GelecekStokTarihi { get; set; }

    public bool VarsayilanMi { get; set; }

    public uint Version { get; set; } // xmin for PostgreSQL

    public ICollection<FiyatKademesi> FiyatKademeleri { get; set; } = [];
}
