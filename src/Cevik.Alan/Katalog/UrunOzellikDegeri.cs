namespace Cevik.Alan.Katalog;

/// <summary>
/// Filtrelemenin gerçekten çalıştığı yer (EAV tarafı).
/// Bileşik anahtar: (UrunId, OzellikTanimId).
///
/// Değer üç ayrı kolona yazılır çünkü filtre tipi buna bağlıdır:
///   • <see cref="DegerMetin"/>  → "ARM Cortex-M3"  (onay kutusu filtresi + facet sayacı)
///   • <see cref="DegerSayi"/>   → 72               (aralık filtresi, sıralama)
///   • <see cref="DegerMin"/>/<see cref="DegerMax"/> → "2 to 3.6 V" (aralık değerli parametreler)
///
/// <see cref="HamDeger"/> ekranda gösterilen orijinal metindir; hesaba girmez.
/// Aynı veri <see cref="Urun.OzelliklerJson"/> içinde de tutulur (okuma kopyası).
/// İki kopyanın tutarlılığını servis katmanı sağlar.
/// </summary>
public class UrunOzellikDegeri
{
    public long UrunId { get; set; }
    public Urun Urun { get; set; } = null!;

    public int OzellikTanimId { get; set; }
    public OzellikTanimi OzellikTanim { get; set; } = null!;

    public string? DegerMetin { get; set; }
    public decimal? DegerSayi { get; set; }
    public decimal? DegerMin { get; set; }
    public decimal? DegerMax { get; set; }

    /// <summary>Ekranda gösterilecek orijinal metin: "2 to 3.6 V"</summary>
    public required string HamDeger { get; set; }
}
