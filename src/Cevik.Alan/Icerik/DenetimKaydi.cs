using System;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class DenetimKaydi : VarlikTabaniUzun
{
    public required string TabloAdi { get; set; }
    public required string KayitId { get; set; }
    
    public required string Islem { get; set; }

    /// <summary>JSONB</summary>
    public string? EskiDegerJson { get; set; }
    
    /// <summary>JSONB</summary>
    public string? YeniDegerJson { get; set; }

    public long? KullaniciId { get; set; }
    public Kullanici? Kullanici { get; set; }

    public DateTimeOffset Tarih { get; set; } = DateTimeOffset.UtcNow;
}
