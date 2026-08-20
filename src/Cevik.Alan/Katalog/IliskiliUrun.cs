using Cevik.Alan.Ortak;

namespace Cevik.Alan.Katalog;

/// <summary>
/// Ürün detayındaki dört ilişki sekmesi tek tabloda tutulur.
/// Bileşik anahtar: (UrunId, IliskiliUrunId, IliskiTipi).
///
/// DİKKAT: Muadil ilişkisi çift yönlüdür — A muadili B ise B de A'nın muadilidir.
/// Bu simetriyi veritabanı garanti etmez, servis katmanı iki satır da yazmalıdır.
/// </summary>
public class IliskiliUrun
{
    public long UrunId { get; set; }
    public Urun Urun { get; set; } = null!;

    public long IliskiliUrunId { get; set; }
    public Urun Iliskili { get; set; } = null!;

    public IliskiTipi IliskiTipi { get; set; }
    public int Sira { get; set; }
}
