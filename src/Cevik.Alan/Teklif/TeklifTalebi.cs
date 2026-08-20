using System;
using System.Collections.Generic;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Teklif;

public class TeklifTalebi : VarlikTabaniUzun
{
    public required string TalepNo { get; set; }

    public long? KullaniciId { get; set; }
    public Kullanici? Kullanici { get; set; }

    public int? FirmaId { get; set; }
    public Firma? Firma { get; set; }

    public TeklifDurumu Durum { get; set; } = TeklifDurumu.Yeni;

    public long? SatisTemsilcisiId { get; set; }
    public Kullanici? SatisTemsilcisi { get; set; }

    public DateTimeOffset? GecerlilikTarihi { get; set; }

    public string? MusteriNotu { get; set; }
    public string? TemsilciNotu { get; set; }

    public ICollection<TeklifKalemi> Kalemler { get; set; } = [];
}
