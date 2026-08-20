using Cevik.Uygulama.Kimlik.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Kimlik.Validations;

public class SifreSifirlamaTalebiDtoValidator : AbstractValidator<SifreSifirlamaTalebiDto>
{
    public SifreSifirlamaTalebiDtoValidator()
    {
        RuleFor(x => x.Eposta)
            .NotEmpty().WithMessage("E-posta adresi boş olamaz.")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");
    }
}
