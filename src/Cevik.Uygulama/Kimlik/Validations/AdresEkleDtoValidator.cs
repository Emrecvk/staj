using Cevik.Uygulama.Kimlik.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Kimlik.Validations;

public class AdresEkleDtoValidator : AbstractValidator<AdresEkleDto>
{
    public AdresEkleDtoValidator()
    {
        RuleFor(x => x.Baslik)
            .NotEmpty().WithMessage("Adres başlığı boş olamaz.")
            .MaximumLength(100);

        RuleFor(x => x.Sehir)
            .NotEmpty().WithMessage("İl boş olamaz.")
            .MaximumLength(60);

        RuleFor(x => x.Ilce)
            .NotEmpty().WithMessage("İlçe boş olamaz.")
            .MaximumLength(60);

        RuleFor(x => x.AcikAdres)
            .NotEmpty().WithMessage("Açık adres boş olamaz.")
            .MinimumLength(10).WithMessage("Açık adres en az 10 karakter olmalıdır.")
            .MaximumLength(500);

        // Türkiye posta kodu 5 hanelidir; kargo entegrasyonu bunu bekler.
        RuleFor(x => x.PostaKodu)
            .NotEmpty().WithMessage("Posta kodu boş olamaz.")
            .Matches(@"^\d{5}$").WithMessage("Posta kodu 5 haneli olmalıdır.");
    }
}
