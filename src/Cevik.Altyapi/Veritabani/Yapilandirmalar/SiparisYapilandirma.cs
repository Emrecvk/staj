using Cevik.Alan.Siparis;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cevik.Altyapi.Veritabani.Yapilandirmalar;

public class SiparisVarligiYapilandirmasi : IEntityTypeConfiguration<SiparisVarligi>
{
    public void Configure(EntityTypeBuilder<SiparisVarligi> builder)
    {
        builder.HasIndex(s => s.SiparisNo).IsUnique();
        
        builder.Property(s => s.AraToplam).HasColumnType("numeric(18,4)");
        builder.Property(s => s.IndirimTutari).HasColumnType("numeric(18,4)");
        builder.Property(s => s.KdvTutari).HasColumnType("numeric(18,4)");
        builder.Property(s => s.KargoUcreti).HasColumnType("numeric(18,4)");
        builder.Property(s => s.GenelToplam).HasColumnType("numeric(18,4)");
        builder.Property(s => s.Kur).HasColumnType("numeric(18,6)");
        
        builder.Property(s => s.ParaBirimi).HasMaxLength(3).IsFixedLength();

        builder.Property(s => s.FaturaAdresiJson).HasColumnType("jsonb");
        builder.Property(s => s.TeslimatAdresiJson).HasColumnType("jsonb");
    }
}

public class SiparisKalemiYapilandirmasi : IEntityTypeConfiguration<SiparisKalemi>
{
    public void Configure(EntityTypeBuilder<SiparisKalemi> builder)
    {
        builder.Property(s => s.BirimFiyat).HasColumnType("numeric(18,6)");
        builder.Property(s => s.SatirToplami).HasColumnType("numeric(18,4)");
        builder.Property(s => s.KdvOrani).HasColumnType("numeric(5,2)");
    }
}

public class OdemeYapilandirmasi : IEntityTypeConfiguration<Odeme>
{
    public void Configure(EntityTypeBuilder<Odeme> builder)
    {
        builder.Property(o => o.Tutar).HasColumnType("numeric(18,4)");
        builder.Property(o => o.HamYanitJson).HasColumnType("jsonb");
    }
}
