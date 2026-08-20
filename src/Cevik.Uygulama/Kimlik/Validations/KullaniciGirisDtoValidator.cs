using Cevik.Uygulama.Kimlik.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Kimlik.Validations;

public class KullaniciGirisDtoValidator : AbstractValidator<KullaniciGirisDto>
{
    public KullaniciGirisDtoValidator()
    {
        RuleFor(x => x.Eposta)
            .NotEmpty().WithMessage("E-posta adresi boş olamaz.")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");

        RuleFor(x => x.Sifre)
            .NotEmpty().WithMessage("Şifre boş olamaz.")
            .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.");
    }
}
