using Cevik.Uygulama.Icerik.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Icerik.Validations;

public class EBultenAbonelikIstekDtoValidator : AbstractValidator<EBultenAbonelikIstekDto>
{
    public EBultenAbonelikIstekDtoValidator()
    {
        RuleFor(x => x.Eposta)
            .NotEmpty().WithMessage("E-posta adresi zorunludur.")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
            .MaximumLength(256).WithMessage("E-posta adresi en fazla 256 karakter olabilir.");
    }
}
