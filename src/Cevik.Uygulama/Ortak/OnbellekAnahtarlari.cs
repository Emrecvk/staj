using Cevik.Alan.Kurallar;

namespace Cevik.Uygulama.Ortak;

/// <summary>
/// Önbellek anahtarları tek yerde.
///
/// Neden gerekli: anahtar bir yerde "kategori_agaci", başka yerde
/// "Cevik_kategori_agaci" yazılmıştı. IDistributedCache zaten InstanceName
/// ön ekini kendisi eklediği için, temizleme çağrısı çift ön ekli
/// (Cevik_Cevik_kategori_agaci) bir anahtarı siliyor ve önbellek
/// hiç boşalmıyordu. Sabitleri buradan kullanmak bu sınıf hatasını engeller.
/// </summary>
public static class OnbellekAnahtarlari
{
    /// <summary>Eski tek dilli anahtar — temizlik sırasında da silinir.</summary>
    public const string KategoriAgaci = "kategori_agaci";

    // v2: herkese açık ağaç yalnızca aktif ürünü olan dalları içeriyor.
    // Sürüm eki, Redis'te eski 24 saatlik ağacın kullanılmasını engeller.
    public static string KategoriAgaciDil(string dil) => $"kategori_agaci_v2_{DilKodu.Coz(dil)}";

    public static readonly string[] KategoriAgaciAnahtarlari =
    [
        KategoriAgaci,
        KategoriAgaciDil(DilKodu.Turkce),
        KategoriAgaciDil(DilKodu.Ingilizce)
    ];

    /// <summary>Bir kategorinin dile göre facet değerleri.</summary>
    public static string KategoriFacetleri(int kategoriId, string dil) =>
        $"kategori_facet_{kategoriId}_{DilKodu.Coz(dil)}";

    public static string[] KategoriFacetAnahtarlari(int kategoriId) =>
    [
        KategoriFacetleri(kategoriId, DilKodu.Turkce),
        KategoriFacetleri(kategoriId, DilKodu.Ingilizce)
    ];
}
