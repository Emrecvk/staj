using Cevik.Alan.Ortak;
using System;

namespace Cevik.Alan.Kimlik;

public class Firma : VarlikTabaniInt
{
    public required string Unvan { get; set; }
    public required string VergiDairesi { get; set; }
    public required string VergiNo { get; set; }
    public string? KepAdresi { get; set; }

    public int? MusteriGrubuId { get; set; }
    public MusteriGrubu? MusteriGrubu { get; set; }

    public long? SatisTemsilcisiId { get; set; }
    public Kullanici? SatisTemsilcisi { get; set; }

    public decimal KrediLimiti { get; set; }
    public int OdemeVadesiGun { get; set; }

    public FirmaOnayDurumu OnayDurumu { get; set; } = FirmaOnayDurumu.Beklemede;
}
