using Cevik.Alan.Icerik;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cevik.Altyapi.Veritabani.Yapilandirmalar;

public class DenetimKaydiYapilandirmasi : IEntityTypeConfiguration<DenetimKaydi>
{
    public void Configure(EntityTypeBuilder<DenetimKaydi> builder)
    {
        builder.Property(d => d.EskiDegerJson).HasColumnType("jsonb");
        builder.Property(d => d.YeniDegerJson).HasColumnType("jsonb");
    }
}
