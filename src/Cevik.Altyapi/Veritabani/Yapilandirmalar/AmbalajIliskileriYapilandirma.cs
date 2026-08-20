using Cevik.Alan.Fiyatlama;
using Cevik.Alan.Siparis;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cevik.Altyapi.Veritabani.Yapilandirmalar;

/// <summary>
/// <see cref="UrunAmbalaji"/>'ye bakan ilişkilerin AÇIK yapılandırması.
///
/// SORUN: Entity'lerde yabancı anahtar özelliği <c>UrunAmbalajId</c> adını
/// taşıyor ama navigasyon <c>UrunAmbalaji</c>. EF Core'un adlandırma
/// konvansiyonu navigasyon adı + "Id" arar, yani <c>UrunAmbalajiId</c>
/// (sondaki "i" ile). Bulamayınca AYNI ADI TAŞIMAYAN bir gölge (shadow)
/// yabancı anahtar üretiyordu.
///
/// Sonuç: her tabloda İKİ kolon oluşuyordu —
///   • <c>urun_ambalaj_id</c>  : kodun yazdığı, hiçbir ilişkiye bağlı olmayan sayı
///   • <c>urun_ambalaji_id</c> : gerçek yabancı anahtar (gölge, koddan erişilemez)
///
/// Servis kodu FK'yı id ile set ettiğinde (navigasyon yerine) gölge kolon 0
/// kalıyor ve "sepete ekle" isteği FK ihlaliyle 500 dönüyordu.
///
/// Burada ilişkiler açıkça <c>UrunAmbalajId</c> üzerine bağlanır; gölge kolonlar
/// migration ile kaldırılır.
/// </summary>
public class FiyatKademesiAmbalajIliskisi : IEntityTypeConfiguration<FiyatKademesi>
{
    public void Configure(EntityTypeBuilder<FiyatKademesi> builder) =>
        builder.HasOne(f => f.UrunAmbalaji)
               .WithMany(a => a.FiyatKademeleri)
               .HasForeignKey(f => f.UrunAmbalajId)
               .OnDelete(DeleteBehavior.Cascade);
}

public class SepetKalemiAmbalajIliskisi : IEntityTypeConfiguration<SepetKalemi>
{
    public void Configure(EntityTypeBuilder<SepetKalemi> builder) =>
        builder.HasOne(k => k.UrunAmbalaji)
               .WithMany()
               .HasForeignKey(k => k.UrunAmbalajId)
               .OnDelete(DeleteBehavior.Cascade);
}

public class SiparisKalemiAmbalajIliskisi : IEntityTypeConfiguration<SiparisKalemi>
{
    public void Configure(EntityTypeBuilder<SiparisKalemi> builder) =>
        builder.HasOne(k => k.UrunAmbalaji)
               .WithMany()
               .HasForeignKey(k => k.UrunAmbalajId)
               // Sipariş kalemi geçmiş kaydıdır: ambalaj silinse bile satır durmalı.
               .OnDelete(DeleteBehavior.Restrict);
}

public class StokBildirimiAmbalajIliskisi : IEntityTypeConfiguration<StokBildirimi>
{
    public void Configure(EntityTypeBuilder<StokBildirimi> builder) =>
        builder.HasOne(s => s.UrunAmbalaji)
               .WithMany()
               .HasForeignKey(s => s.UrunAmbalajId)
               .OnDelete(DeleteBehavior.Cascade);
}
