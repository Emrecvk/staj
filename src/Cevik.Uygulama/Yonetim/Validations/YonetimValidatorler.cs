using Cevik.Uygulama.Yonetim.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Yonetim.Validations;

/// <summary>
/// Yönetim uçlarının doğrulayıcıları.
/// Admin de olsa girdi doğrulanır: hatalı veri veritabanı kısıtına çarpıp
/// 500 dönmek yerine anlaşılır bir 400 ile geri çevrilmelidir.
/// </summary>
public class UrunEkleDtoValidator : AbstractValidator<UrunEkleDto>
{
    public UrunEkleDtoValidator()
    {
        RuleFor(x => x.KategoriId).GreaterThan(0).WithMessage("Kategori seçilmelidir.");
        RuleFor(x => x.UreticiId).GreaterThan(0).WithMessage("Üretici seçilmelidir.");

        RuleFor(x => x.UreticiUrunKodu)
            .NotEmpty().WithMessage("Üretici ürün kodu (MPN) boş olamaz.")
            .MaximumLength(120)
            .Matches(@"^[A-Za-z0-9\-_.\/]+$")
            .WithMessage("Ürün kodu yalnızca harf, rakam ve - _ . / karakterlerini içerebilir.");

        RuleFor(x => x.KisaAciklama)
            .NotEmpty().WithMessage("Kısa açıklama boş olamaz.")
            .MaximumLength(400);

        RuleFor(x => x.UrunDurumu).InclusiveBetween((short)1, (short)4)
            .WithMessage("Geçersiz ürün durumu.");
    }
}

public class UrunGuncelleDtoValidator : AbstractValidator<UrunGuncelleDto>
{
    public UrunGuncelleDtoValidator()
    {
        RuleFor(x => x.KisaAciklama).NotEmpty().MaximumLength(400);
        RuleFor(x => x.UrunDurumu).InclusiveBetween((short)1, (short)4);
    }
}

public class StokGuncelleDtoValidator : AbstractValidator<StokGuncelleDto>
{
    public StokGuncelleDtoValidator()
    {
        RuleFor(x => x.UrunAmbalajId).GreaterThan(0);
        RuleFor(x => x.StokMiktari).GreaterThanOrEqualTo(0).WithMessage("Stok negatif olamaz.");
        RuleFor(x => x.GelecekStokMiktari).GreaterThanOrEqualTo(0);

        RuleFor(x => x.GelecekStokTarihi)
            .Must(t => t is null || t > DateTime.UtcNow.Date)
            .WithMessage("Gelecek stok tarihi bugünden sonra olmalıdır.");
    }
}

public class AmbalajFiyatGuncelleDtoValidator : AbstractValidator<AmbalajFiyatGuncelleDto>
{
    public AmbalajFiyatGuncelleDtoValidator()
    {
        RuleFor(x => x.UrunAmbalajId).GreaterThan(0);
        RuleFor(x => x.Kademeler).NotEmpty().WithMessage("En az bir fiyat kademesi gereklidir.");

        RuleForEach(x => x.Kademeler).ChildRules(k =>
        {
            k.RuleFor(x => x.MinMiktar).GreaterThan(0).WithMessage("Kademe başlangıç miktarı 0'dan büyük olmalıdır.");
            k.RuleFor(x => x.BirimFiyat).GreaterThanOrEqualTo(0).WithMessage("Birim fiyat negatif olamaz.");
            k.RuleFor(x => x.ParaBirimi).NotEmpty().Length(3).WithMessage("Para birimi 3 harfli ISO kodu olmalıdır.");
            k.RuleFor(x => x.MaxMiktar)
                .Must((kademe, max) => max is null || max >= kademe.MinMiktar)
                .WithMessage("Kademe üst sınırı alt sınırdan küçük olamaz.");
        });
    }
}

public class KategoriYazDtoValidator : AbstractValidator<KategoriYazDto>
{
    public KategoriYazDtoValidator()
    {
        RuleFor(x => x.AdTr).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AdEn).NotEmpty().MaximumLength(200);

        // Slug URL'de kullanılıyor: yalnızca küçük harf, rakam ve tire.
        RuleFor(x => x.SlugTr).NotEmpty().MaximumLength(220)
            .Matches(@"^[a-z0-9\-]+$").WithMessage("Slug yalnızca küçük harf, rakam ve tire içerebilir.");
        RuleFor(x => x.SlugEn).NotEmpty().MaximumLength(220)
            .Matches(@"^[a-z0-9\-]+$").WithMessage("Slug yalnızca küçük harf, rakam ve tire içerebilir.");

        RuleFor(x => x.Sira).GreaterThanOrEqualTo(0);
    }
}

public class UreticiYazDtoValidator : AbstractValidator<UreticiYazDto>
{
    public UreticiYazDtoValidator()
    {
        RuleFor(x => x.Ad).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(160)
            .Matches(@"^[a-z0-9\-]+$").WithMessage("Slug yalnızca küçük harf, rakam ve tire içerebilir.");
        RuleFor(x => x.WebSitesi)
            .Must(u => string.IsNullOrWhiteSpace(u) || Uri.TryCreate(u, UriKind.Absolute, out _))
            .WithMessage("Web sitesi geçerli bir URL olmalıdır.");
    }
}

public class OzellikTanimiYazDtoValidator : AbstractValidator<OzellikTanimiYazDto>
{
    public OzellikTanimiYazDtoValidator()
    {
        // Kod, filtre query string'inde kullanılır: ?ozellik.bit_sayisi=32+Bit
        RuleFor(x => x.Kod).NotEmpty().MaximumLength(80)
            .Matches(@"^[a-z0-9_]+$")
            .WithMessage("Özellik kodu yalnızca küçük harf, rakam ve alt çizgi içerebilir.");

        RuleFor(x => x.AdTr).NotEmpty().MaximumLength(150);
        RuleFor(x => x.AdEn).NotEmpty().MaximumLength(150);
        RuleFor(x => x.VeriTipi).InclusiveBetween((short)1, (short)5).WithMessage("Geçersiz veri tipi.");
        RuleFor(x => x.GosterimTipi).InclusiveBetween((short)1, (short)3).WithMessage("Geçersiz gösterim tipi.");
        RuleFor(x => x.Birim).MaximumLength(20);
    }
}

public class FirmaOnayDtoValidator : AbstractValidator<FirmaOnayDto>
{
    public FirmaOnayDtoValidator()
    {
        RuleFor(x => x.FirmaId).GreaterThan(0);
        RuleFor(x => x.Durum).IsInEnum().WithMessage("Geçersiz onay durumu.");
    }
}

public class SiparisDurumGuncelleDtoValidator : AbstractValidator<SiparisDurumGuncelleDto>
{
    public SiparisDurumGuncelleDtoValidator()
    {
        RuleFor(x => x.SiparisId).GreaterThan(0);
        // Geçişin KURALA uygunluğu servis katmanında durum makinesiyle denetlenir;
        // burada yalnızca değerin tanımlı bir enum olup olmadığına bakılır.
        RuleFor(x => x.YeniDurum).IsInEnum().WithMessage("Geçersiz sipariş durumu.");
    }
}

public class KullaniciRolGuncelleDtoValidator : AbstractValidator<KullaniciRolGuncelleDto>
{
    public KullaniciRolGuncelleDtoValidator()
    {
        RuleFor(x => x.KullaniciId).GreaterThan(0);
        RuleFor(x => x.Rol).InclusiveBetween((short)1, (short)5).WithMessage("Geçersiz rol.");
    }
}

public class BlogYazisiEkleDtoValidator : AbstractValidator<BlogYazisiEkleDto>
{
    public BlogYazisiEkleDtoValidator()
    {
        RuleFor(x => x.Baslik).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(220)
            .Matches(@"^[a-z0-9\-]+$").WithMessage("Slug yalnızca küçük harf, rakam ve tire içerebilir.");
        RuleFor(x => x.Ozet).NotEmpty().MaximumLength(500);
        RuleFor(x => x.IcerikHtml).NotEmpty();
    }
}
