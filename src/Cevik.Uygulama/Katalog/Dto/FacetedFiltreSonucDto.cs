using System.Collections.Generic;

namespace Cevik.Uygulama.Katalog.Dto;

public class FacetGrupDto
{
    public required string Kod { get; set; }
    public required string Ad { get; set; }
    public short GosterimTipi { get; set; } // enum karşılığı
    public string? Birim { get; set; }
    
    public List<FacetSecenekDto> Secenekler { get; set; } = new();
}

public class FacetSecenekDto
{
    public required string Deger { get; set; }
    public required string HamDeger { get; set; }
    public int UrunSayisi { get; set; }
}
