using System.Collections.Generic;

namespace Cevik.Uygulama.Katalog.Dto;

public class UrunAramaFiltreDto
{
    public int? KategoriId { get; set; }
    
    /// <summary>Kullanıcının text araması (Örn: STM32F1)</summary>
    public string? AramaMetni { get; set; }
    
    public List<int> UreticiIdleri { get; set; } = new();
    
    /// <summary>Anahtar: ozellik kodu (Örn: "frekans"), Değer: Seçilen değerler ("48","72")</summary>
    public Dictionary<string, List<string>> ParametrikFiltreler { get; set; } = new();
    
    public bool SadeceStoktakiler { get; set; }
    
    public int SayfaNo { get; set; } = 1;
    public int SayfaBoyutu { get; set; } = 25;
    
    /// <summary>Örn: "fiyat_artan", "fiyat_azalan", "yeni"</summary>
    public string Siralama { get; set; } = "varsayilan";
}
