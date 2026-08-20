using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class Sayfa : VarlikTabaniInt
{
    public required string Slug { get; set; }
    
    public required string BaslikTr { get; set; }
    public required string BaslikEn { get; set; }

    public required string IcerikHtmlTr { get; set; }
    public required string IcerikHtmlEn { get; set; }

    public string? SeoBaslik { get; set; }
    public string? SeoAciklama { get; set; }

    public bool YayindaMi { get; set; }
}
