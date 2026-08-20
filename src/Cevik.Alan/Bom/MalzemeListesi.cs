using System;
using System.Collections.Generic;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Bom;

public class MalzemeListesi : VarlikTabaniUzun
{
    public long? KullaniciId { get; set; }
    public Kullanici? Kullanici { get; set; }

    public int? FirmaId { get; set; }
    public Firma? Firma { get; set; }

    public required string Ad { get; set; }
    public string? Aciklama { get; set; }

    public ICollection<MalzemeListesiKalemi> Kalemler { get; set; } = [];
}
