namespace Cevik.Uygulama.Ortak;

/// <summary>Tüm liste uçlarının ortak sayfalama zarfı.</summary>
public class SayfaliSonucDto<T>
{
    public int SayfaNo { get; set; }
    public int SayfaBoyutu { get; set; }
    public int ToplamKayit { get; set; }
    public int ToplamSayfa => ToplamKayit == 0 ? 0 : (ToplamKayit + SayfaBoyutu - 1) / SayfaBoyutu;
    public List<T> Kayitlar { get; set; } = [];
}
