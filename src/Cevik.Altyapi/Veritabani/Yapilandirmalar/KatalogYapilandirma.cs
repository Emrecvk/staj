using Cevik.Alan.Katalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cevik.Altyapi.Veritabani.Yapilandirmalar;

public class KategoriYapilandirmasi : IEntityTypeConfiguration<Kategori>
{
    public void Configure(EntityTypeBuilder<Kategori> builder)
    {
        builder.HasIndex(k => k.Yol); // ltree için EF core provider bunu text gibi alır ancak raw SQL'de ltree yapabiliriz. Şimdilik temel index.
    }
}

public class UrunYapilandirmasi : IEntityTypeConfiguration<Urun>
{
    public void Configure(EntityTypeBuilder<Urun> builder)
    {
        builder.HasIndex(u => new { u.UreticiId, u.UreticiUrunKodu }).IsUnique();
        
        // GIN (normalize_kod gin_trgm_ops)
        builder.HasIndex(u => u.NormalizeKod)
               .HasMethod("GIN")
               .HasOperators("gin_trgm_ops");
               
        // JSONB index
        builder.HasIndex(u => u.OzelliklerJson)
               .HasMethod("GIN")
               .HasOperators("jsonb_path_ops");
               
        builder.Property(u => u.OzelliklerJson).HasColumnType("jsonb");
    }
}

public class IliskiliUrunYapilandirmasi : IEntityTypeConfiguration<IliskiliUrun>
{
    public void Configure(EntityTypeBuilder<IliskiliUrun> builder)
    {
        builder.HasKey(i => new { i.UrunId, i.IliskiliUrunId, i.IliskiTipi });

        builder.HasOne(i => i.Urun)
               .WithMany()
               .HasForeignKey(i => i.UrunId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Iliskili)
               .WithMany()
               .HasForeignKey(i => i.IliskiliUrunId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class KategoriOzelligiYapilandirmasi : IEntityTypeConfiguration<KategoriOzelligi>
{
    public void Configure(EntityTypeBuilder<KategoriOzelligi> builder)
    {
        builder.HasKey(k => new { k.KategoriId, k.OzellikTanimId });
    }
}

public class UrunOzellikDegeriYapilandirmasi : IEntityTypeConfiguration<UrunOzellikDegeri>
{
    public void Configure(EntityTypeBuilder<UrunOzellikDegeri> builder)
    {
        builder.HasKey(u => new { u.UrunId, u.OzellikTanimId });
        builder.HasIndex(u => new { u.OzellikTanimId, u.DegerMetin });
        builder.HasIndex(u => new { u.OzellikTanimId, u.DegerSayi });
        
        builder.Property(u => u.DegerSayi).HasColumnType("numeric(20,6)");
        builder.Property(u => u.DegerMin).HasColumnType("numeric(20,6)");
        builder.Property(u => u.DegerMax).HasColumnType("numeric(20,6)");
    }
}
