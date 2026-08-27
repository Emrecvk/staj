namespace Cevik.Uygulama.Bom.Dto;

public class BomSatiriDto
{
    public int SatirNo { get; set; }
    public required string ArananKod { get; set; }
    public string? Referanslar { get; set; }
    public int Miktar { get; set; }
}

public class MalzemeListesiYukleDto
{
    public required string Ad { get; set; }
    public string? Aciklama { get; set; }
    public List<BomSatiriDto> Kalemler { get; set; } = [];
}

public class BomAdayDto
{
    public long UrunId { get; set; }
    public required string UreticiUrunKodu { get; set; }
    public required string UreticiAd { get; set; }
    public required string KisaAciklama { get; set; }
    public long AmbalajId { get; set; }
    public required string AmbalajAdi { get; set; }
    public int Mpq { get; set; }
    public int Moq { get; set; }
    public int KatlamaMiktari { get; set; }
    public int StokMiktari { get; set; }
    public int GecerliMiktar { get; set; }
    public bool StokYeterliMi { get; set; }
    public decimal? BirimFiyat { get; set; }
    public string? ParaBirimi { get; set; }
    public int EslesmeSkoru { get; set; }
}

public class BomKalemSonucDto : BomSatiriDto
{
    public long KalemId { get; set; }
    public short EslesmeDurumu { get; set; }
    public BomAdayDto? Secilen { get; set; }
    public List<BomAdayDto> Adaylar { get; set; } = [];
}

public class MalzemeListesiSonucDto
{
    public long Id { get; set; }
    public required string Ad { get; set; }
    public List<BomKalemSonucDto> Kalemler { get; set; } = [];
}

public class BomAdaySecDto
{
    public long UrunId { get; set; }
}
