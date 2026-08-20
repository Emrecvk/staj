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

    public static string KategoriAgaciDil(string dil) => $"kategori_agaci_{DilKodu.Coz(dil)}";

    public static readonly string[] KategoriAgaciAnahtarlari =
    [
        KategoriAgaci,
        KategoriAgaciDil(DilKodu.Turkce),
        KategoriAgaciDil(DilKodu.Ingilizce)
    ];

    /// <summary>Bir kategorinin facet tanımları.</summary>
    public static string KategoriFacetleri(int kategoriId) => $"kategori_facet_{kategoriId}";
}
