using Cevik.Alan.Kimlik;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cevik.Altyapi.Veritabani.Yapilandirmalar;

public class FirmaYapilandirmasi : IEntityTypeConfiguration<Firma>
{
    public void Configure(EntityTypeBuilder<Firma> builder)
    {
        builder.Property(f => f.KrediLimiti).HasColumnType("numeric(18,2)");
        
        // Firma SatisTemsilcisi referansı (Kullanici)
        builder.HasOne(f => f.SatisTemsilcisi)
               .WithMany()
               .HasForeignKey(f => f.SatisTemsilcisiId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class KullaniciYapilandirmasi : IEntityTypeConfiguration<Kullanici>
{
    public void Configure(EntityTypeBuilder<Kullanici> builder)
    {
        // Kullanıcı Firma referansı
        builder.HasOne(k => k.Firma)
               .WithMany()
               .HasForeignKey(k => k.FirmaId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class MusteriUrunKoduYapilandirmasi : IEntityTypeConfiguration<MusteriUrunKodu>
{
    public void Configure(EntityTypeBuilder<MusteriUrunKodu> builder)
    {
        builder.HasIndex(m => new { m.FirmaId, m.UrunId }).IsUnique();
    }
}

public class KarsilastirmaYapilandirmasi : IEntityTypeConfiguration<Karsilastirma>
{
    public void Configure(EntityTypeBuilder<Karsilastirma> builder)
    {
        // Anahtarı (KullaniciId/OturumAnahtari ve UrunId)
        builder.HasKey(k => new { k.UrunId, k.EklenmeTarihi }); // Geçici key
    }
}

public class FavoriYapilandirmasi : IEntityTypeConfiguration<Favori>
{
    public void Configure(EntityTypeBuilder<Favori> builder)
    {
        builder.HasKey(f => new { f.KullaniciId, f.UrunId });
    }
}
