using Cevik.Alan.Teklif;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cevik.Altyapi.Veritabani.Yapilandirmalar;

public class TeklifTalebiYapilandirmasi : IEntityTypeConfiguration<TeklifTalebi>
{
    public void Configure(EntityTypeBuilder<TeklifTalebi> builder)
    {
        builder.HasIndex(t => t.TalepNo).IsUnique();
        
        builder.HasOne(t => t.SatisTemsilcisi)
               .WithMany()
               .HasForeignKey(t => t.SatisTemsilcisiId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class TeklifKalemiYapilandirmasi : IEntityTypeConfiguration<TeklifKalemi>
{
    public void Configure(EntityTypeBuilder<TeklifKalemi> builder)
    {
        builder.Property(t => t.HedefBirimFiyat).HasColumnType("numeric(18,6)");
        builder.Property(t => t.TeklifEdilenBirimFiyat).HasColumnType("numeric(18,6)");

        // Ambalaj silinse bile teklif geçmişi bozulmamalı: Restrict.
        builder.HasOne(t => t.UrunAmbalaji)
               .WithMany()
               .HasForeignKey(t => t.UrunAmbalajId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
