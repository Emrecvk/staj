using Cevik.Uygulama.Kimlik.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Kimlik.Validations;

public class KullaniciKayitDtoValidator : AbstractValidator<KullaniciKayitDto>
{
    public KullaniciKayitDtoValidator()
    {
        RuleFor(x => x.Ad).NotEmpty().WithMessage("Ad boş olamaz.").MaximumLength(100);
        RuleFor(x => x.Soyad).NotEmpty().WithMessage("Soyad boş olamaz.").MaximumLength(100);
        RuleFor(x => x.Eposta).NotEmpty().EmailAddress().WithMessage("Geçerli bir e-posta giriniz.");
        RuleFor(x => x.Telefon).NotEmpty().WithMessage("Telefon boş olamaz.");
        RuleFor(x => x.Sifre).NotEmpty().MinimumLength(8).WithMessage("Şifre en az 8 karakter olmalıdır.")
            .Matches(@"[A-Z]").WithMessage("Şifre en az bir büyük harf içermelidir.")
            .Matches(@"[0-9]").WithMessage("Şifre en az bir rakam içermelidir.");
    }
}
