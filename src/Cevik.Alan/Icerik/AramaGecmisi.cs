using System;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class AramaGecmisi : VarlikTabaniUzun
{
    public required string Terim { get; set; }
    public int SonucSayisi { get; set; }

    public long? KullaniciId { get; set; }
    public Kullanici? Kullanici { get; set; }

    public DateTimeOffset Tarih { get; set; } = DateTimeOffset.UtcNow;
}
