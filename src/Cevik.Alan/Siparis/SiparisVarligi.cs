using System.Collections.Generic;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Siparis;

public class SiparisVarligi : VarlikTabaniUzun // İsim çakışmasını önlemek için SiparisVarligi diyorum ama Siparis de denebilir. 
{
    public required string SiparisNo { get; set; }

    public long? KullaniciId { get; set; }
    public Kullanici? Kullanici { get; set; }

    public int? FirmaId { get; set; }
    public Firma? Firma { get; set; }

    public SiparisDurumu Durum { get; set; } = SiparisDurumu.Olusturuldu;

    public decimal AraToplam { get; set; }
    public decimal IndirimTutari { get; set; }
    public decimal KdvTutari { get; set; }
    public decimal KargoUcreti { get; set; }
    public decimal GenelToplam { get; set; }

    public required string ParaBirimi { get; set; }
    public decimal Kur { get; set; }

    /// <summary>JSONB olarak saklanacak adres snapshot'ı</summary>
    public required string FaturaAdresiJson { get; set; }
    
    /// <summary>JSONB olarak saklanacak adres snapshot'ı</summary>
    public required string TeslimatAdresiJson { get; set; }

    public string? MusteriNotu { get; set; }

    public long? KaynakTeklifId { get; set; }

    public ICollection<SiparisKalemi> Kalemler { get; set; } = [];
    public ICollection<SiparisDurumGecmisi> DurumGecmisi { get; set; } = [];
}
