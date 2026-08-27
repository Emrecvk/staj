using Cevik.Alan.Fiyatlama;
using Cevik.Altyapi.Veritabani;
using Cevik.Uygulama.Katalog.Arayuzler;
using Cevik.Uygulama.Katalog.Dto;
using Cevik.Uygulama.Ortak;
using Microsoft.EntityFrameworkCore;

namespace Cevik.Altyapi.Katalog.Servisler;

public class StokBildirimServisi : IStokBildirimServisi
{
    private readonly CevikDbContext _context;
    public StokBildirimServisi(CevikDbContext context) => _context = context;

    public async Task OlusturAsync(long ambalajId, long? kullaniciId, StokBildirimTalebiDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Eposta))
            throw new IsKuraliIhlaliException("E-posta adresi zorunludur.");
        if (dto.IstenenMiktar <= 0)
            throw new IsKuraliIhlaliException("İstenen miktar sıfırdan büyük olmalıdır.");
        if (!await _context.UrunAmbalajlari.AnyAsync(a => a.Id == ambalajId))
            throw new KeyNotFoundException("Ambalaj bulunamadı.");
        if (await _context.StokBildirimleri.AnyAsync(sb =>
                sb.UrunAmbalajId == ambalajId && sb.Eposta == dto.Eposta && !sb.BildirildiMi))
            throw new IsKuraliIhlaliException("Bu ürün için zaten bekleyen bir stok bildirim talebiniz bulunmaktadır.");

        _context.StokBildirimleri.Add(new StokBildirimi
        {
            UrunAmbalajId = ambalajId,
            Eposta = dto.Eposta.Trim(),
            KullaniciId = kullaniciId,
            IstenenMiktar = dto.IstenenMiktar,
            BildirildiMi = false
        });
        await _context.SaveChangesAsync();
    }
}
