using Cevik.Alan.Fiyatlama;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cevik.Altyapi.Veritabani.Yapilandirmalar;

public class FiyatKademesiYapilandirmasi : IEntityTypeConfiguration<FiyatKademesi>
{
    public void Configure(EntityTypeBuilder<FiyatKademesi> builder)
    {
        // 18,6 Hassasiyeti kritik (örn: 0.0234 USD gibi birim fiyatlar için)
        builder.Property(f => f.BirimFiyat).HasColumnType("numeric(18,6)");
        builder.Property(f => f.ParaBirimi).HasMaxLength(3).IsFixedLength();
    }
}

public class DovizKuruYapilandirmasi : IEntityTypeConfiguration<DovizKuru>
{
    public void Configure(EntityTypeBuilder<DovizKuru> builder)
    {
        builder.HasKey(d => new { d.Tarih, d.ParaBirimi });
        builder.Property(d => d.ParaBirimi).HasMaxLength(3).IsFixedLength();
        builder.Property(d => d.Alis).HasColumnType("numeric(18,6)");
        builder.Property(d => d.Satis).HasColumnType("numeric(18,6)");
    }
}

public class IndirimYapilandirmasi : IEntityTypeConfiguration<Indirim>
{
    public void Configure(EntityTypeBuilder<Indirim> builder)
    {
        builder.Property(i => i.Deger).HasColumnType("numeric(10,4)");
    }
}
