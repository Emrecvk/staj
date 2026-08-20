using Cevik.Alan.Ortak;

namespace Cevik.Alan.Katalog;

/// <summary>
/// Tüm parametrelerin sözlüğü. "Bit Sayısı", "Çalışma Sıcaklığı", "Tolerans"...
/// Kategoriden bağımsız tanımlanır, <see cref="KategoriOzelligi"/> ile kategoriye bağlanır.
/// </summary>
public class OzellikTanimi : VarlikTabaniInt
{
    /// <summary>URL query'sinde kullanılır: ?ozellik.bit_sayisi=32+Bit</summary>
    public required string Kod { get; set; }

    public required string AdTr { get; set; }
    public required string AdEn { get; set; }

    public OzellikVeriTipi VeriTipi { get; set; }

    /// <summary>MHz, kB, V, °C — değerden ayrı tutulur ki sayısal filtre çalışsın.</summary>
    public string? Birim { get; set; }

    public bool FiltrelenebilirMi { get; set; } = true;
    public bool SiralanabilirMi { get; set; }

    public OzellikGosterimTipi GosterimTipi { get; set; } = OzellikGosterimTipi.OnayKutusu;

    public ICollection<KategoriOzelligi> KategoriOzellikleri { get; set; } = [];
}
