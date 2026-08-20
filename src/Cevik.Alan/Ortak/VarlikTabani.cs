namespace Cevik.Alan.Ortak;

/// <summary>
/// Tüm tabloların ortak alanları (PLANLAMA.md 5.0).
/// Ürün asla hard-delete edilmez; sipariş geçmişi bozulmasın diye soft delete kullanılır.
/// </summary>
public abstract class VarlikTabani
{
    public DateTimeOffset OlusturmaTarihi { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? GuncellemeTarihi { get; set; }
    public bool SilindiMi { get; set; }
}

/// <summary>Büyük tablolar için bigint anahtarlı taban.</summary>
public abstract class VarlikTabaniUzun : VarlikTabani
{
    public long Id { get; set; }
}

/// <summary>Lookup tabloları için int anahtarlı taban.</summary>
public abstract class VarlikTabaniInt : VarlikTabani
{
    public int Id { get; set; }
}
