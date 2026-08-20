using Cevik.Uygulama.Kimlik.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Kimlik.Validations;

public class FirmaBasvuruDtoValidator : AbstractValidator<FirmaBasvuruDto>
{
    public FirmaBasvuruDtoValidator()
    {
        RuleFor(x => x.FirmaAdi).NotEmpty().WithMessage("Firma adı boş olamaz.").MaximumLength(200);
        RuleFor(x => x.VergiDairesi).NotEmpty().WithMessage("Vergi dairesi boş olamaz.");
        RuleFor(x => x.VergiNo).NotEmpty().WithMessage("Vergi numarası boş olamaz.")
            .Length(10, 11).WithMessage("Vergi numarası 10 veya 11 haneli olmalıdır.")
            .Matches(@"^\d+$").WithMessage("Vergi numarası sadece rakam içermelidir.");
    }
}
