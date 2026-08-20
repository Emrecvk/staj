using System.Collections.Generic;

namespace Cevik.Uygulama.Siparis.Dto;

public class SepeteEkleDto
{
    public long UrunAmbalajId { get; set; }
    public int Miktar { get; set; }
}

public class SepetGuncelleDto
{
    public long KalemId { get; set; }
    public int YeniMiktar { get; set; }
}

public class SepetKalemDto
{
    public long KalemId { get; set; }
    public long UrunId { get; set; }
    public required string UrunKodu { get; set; }
    public required string KisaAciklama { get; set; }
    public long UrunAmbalajId { get; set; }
    public int SatistakiKatsayi { get; set; }
    public int Miktar { get; set; }
    public decimal BirimFiyat { get; set; }
    public decimal ToplamFiyat { get; set; }
}

public class SepetDto
{
    public long SepetId { get; set; }
    public string? OturumAnahtari { get; set; }
    public List<SepetKalemDto> Kalemler { get; set; } = [];
    public decimal GenelToplam { get; set; }
    public required string ParaBirimi { get; set; }
}
