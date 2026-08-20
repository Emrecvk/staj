using Cevik.Alan.Ortak;

namespace Cevik.Alan.Siparis;

public class Odeme : VarlikTabaniUzun
{
    public long SiparisId { get; set; }
    public SiparisVarligi Siparis { get; set; } = null!;

    public required string Yontem { get; set; }
    public required string Saglayici { get; set; }
    public string? SaglayiciReferans { get; set; }

    public decimal Tutar { get; set; }
    public required string Durum { get; set; }

    /// <summary>Ödeme sağlayıcısından dönen JSON yanıt (Hata ayıklama ve loglama için)</summary>
    public string? HamYanitJson { get; set; }
}
