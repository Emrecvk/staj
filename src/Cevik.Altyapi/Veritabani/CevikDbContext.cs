using System.Linq.Expressions;
using Cevik.Alan.Ortak;
using Microsoft.EntityFrameworkCore;
using Cevik.Alan.Katalog;
using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Kimlik;
using Cevik.Alan.Siparis;
using Cevik.Alan.Teklif;
using Cevik.Alan.Icerik;
using Cevik.Alan.Bom;

namespace Cevik.Altyapi.Veritabani;

public class CevikDbContext : DbContext
{
    public CevikDbContext(DbContextOptions<CevikDbContext> options) : base(options) { }

    // Katalog
    public DbSet<Urun> Urunler { get; set; } = null!;
    public DbSet<Kategori> Kategoriler { get; set; } = null!;
    public DbSet<Uretici> Ureticiler { get; set; } = null!;
    public DbSet<OzellikTanimi> OzellikTanimlari { get; set; } = null!;
    public DbSet<KategoriOzelligi> KategoriOzellikleri { get; set; } = null!;
    public DbSet<UrunOzellikDegeri> UrunOzellikDegerleri { get; set; } = null!;
    public DbSet<IliskiliUrun> IliskiliUrunler { get; set; } = null!;
    public DbSet<UrunGorseli> UrunGorselleri { get; set; } = null!;
    public DbSet<UrunDokumani> UrunDokumanlari { get; set; } = null!;

    // Fiyatlama
    public DbSet<UrunAmbalaji> UrunAmbalajlari { get; set; } = null!;
    public DbSet<FiyatKademesi> FiyatKademeleri { get; set; } = null!;
    public DbSet<Indirim> Indirimler { get; set; } = null!;
    public DbSet<DovizKuru> DovizKurlari { get; set; } = null!;
    public DbSet<StokBildirimi> StokBildirimleri { get; set; } = null!;

    // Kimlik
    public DbSet<Kullanici> Kullanicilar { get; set; } = null!;
    public DbSet<Firma> Firmalar { get; set; } = null!;
    public DbSet<MusteriGrubu> MusteriGruplari { get; set; } = null!;
    public DbSet<Adres> Adresler { get; set; } = null!;
    public DbSet<MusteriUrunKodu> MusteriUrunKodlari { get; set; } = null!;
    public DbSet<Favori> Favoriler { get; set; } = null!;
    public DbSet<Karsilastirma> Karsilastirmalar { get; set; } = null!;
    public DbSet<KullaniciRefreshToken> KullaniciRefreshTokens { get; set; } = null!;

    // Sipariş
    public DbSet<Sepet> Sepetler { get; set; } = null!;
    public DbSet<SepetKalemi> SepetKalemleri { get; set; } = null!;
    public DbSet<SiparisVarligi> Siparisler { get; set; } = null!;
    public DbSet<SiparisKalemi> SiparisKalemleri { get; set; } = null!;
    public DbSet<SiparisDurumGecmisi> SiparisDurumGecmisleri { get; set; } = null!;
    public DbSet<Odeme> Odemeler { get; set; } = null!;
    public DbSet<Kargo> Kargolar { get; set; } = null!;

    // Teklif
    public DbSet<TeklifTalebi> TeklifTalepleri { get; set; } = null!;
    public DbSet<TeklifKalemi> TeklifKalemleri { get; set; } = null!;

    // İçerik
    public DbSet<Sayfa> Sayfalar { get; set; } = null!;
    public DbSet<Sozlesme> Sozlesmeler { get; set; } = null!;
    public DbSet<SozlesmeOnayi> SozlesmeOnaylari { get; set; } = null!;
    public DbSet<Duyuru> Duyurular { get; set; } = null!;
    public DbSet<Banner> Bannerlar { get; set; } = null!;
    public DbSet<BlogYazisi> BlogYazilari { get; set; } = null!;
    public DbSet<SikSorulanSoru> SikSorulanSorular { get; set; } = null!;
    public DbSet<EBultenAbonesi> EBultenAboneleri { get; set; } = null!;
    public DbSet<AramaGecmisi> AramaGecmisleri { get; set; } = null!;
    public DbSet<DenetimKaydi> DenetimKayitlari { get; set; } = null!;

    // Bom
    public DbSet<MalzemeListesi> MalzemeListeleri { get; set; } = null!;
    public DbSet<MalzemeListesiKalemi> MalzemeListesiKalemleri { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Postgres eklentileri
        modelBuilder.HasPostgresExtension("ltree");
        modelBuilder.HasPostgresExtension("pg_trgm");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CevikDbContext).Assembly);

        modelBuilder.Entity<UrunAmbalaji>()
            .Property(u => u.Version)
            .IsRowVersion();

        SoftDeleteFiltreleriniUygula(modelBuilder);
        BagimliVarlikFiltreleriniUygula(modelBuilder);
    }

    /// <summary>
    /// Kendi <c>SilindiMi</c> alanı olmayan bağlantı tabloları, bağlı oldukları
    /// varlığın filtresini devralır.
    ///
    /// Bu olmadan EF "required end of a relationship" uyarısı verir ve daha
    /// önemlisi: silinmiş bir ürünün özellik değerleri / favorileri /
    /// ilişkileri sorgularda görünmeye devam eder.
    /// </summary>
    private static void BagimliVarlikFiltreleriniUygula(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<IliskiliUrun>()
            .HasQueryFilter(i => !i.Urun.SilindiMi && !i.Iliskili.SilindiMi);

        modelBuilder.Entity<KategoriOzelligi>()
            .HasQueryFilter(ko => !ko.Kategori.SilindiMi && !ko.OzellikTanim.SilindiMi);

        modelBuilder.Entity<UrunOzellikDegeri>()
            .HasQueryFilter(d => !d.Urun.SilindiMi && !d.OzellikTanim.SilindiMi);

        modelBuilder.Entity<Favori>()
            .HasQueryFilter(f => !f.Kullanici.SilindiMi && !f.Urun.SilindiMi);

        modelBuilder.Entity<Karsilastirma>()
            .HasQueryFilter(k => !k.Urun.SilindiMi);
    }

    /// <summary>
    /// VarlikTabani'ndan türeyen her varlığa "silindi_mi = false" global sorgu filtresi ekler.
    ///
    /// Bu olmadan soft delete işe yaramaz: admin ürünü "sildiğinde" satır
    /// SilindiMi=true olarak işaretlenir ama katalog sorguları onu görmeye
    /// devam eder. Silinmiş kaydı bilerek okumak gerekirse
    /// <c>IgnoreQueryFilters()</c> kullanılır.
    /// </summary>
    private static void SoftDeleteFiltreleriniUygula(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(VarlikTabani).IsAssignableFrom(entityType.ClrType))
                continue;

            // Sahipli (owned) tipler kendi filtresini alamaz, sahibininkini kullanır.
            if (entityType.IsOwned())
                continue;

            var parametre = Expression.Parameter(entityType.ClrType, "e");
            var ozellik = Expression.Property(parametre, nameof(VarlikTabani.SilindiMi));
            var filtre = Expression.Lambda(Expression.Not(ozellik), parametre);

            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filtre);
        }
    }

    /// <summary>
    /// Kaydetme sırasında zaman damgalarını otomatik yönetir; her serviste
    /// elle GuncellemeTarihi atamayı unutma riskini ortadan kaldırır.
    /// </summary>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var girdi in ChangeTracker.Entries<VarlikTabani>())
        {
            if (girdi.State == EntityState.Added)
                girdi.Entity.OlusturmaTarihi = DateTimeOffset.UtcNow;
            else if (girdi.State == EntityState.Modified)
                girdi.Entity.GuncellemeTarihi = DateTimeOffset.UtcNow;
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
