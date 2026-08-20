using Cevik.Uygulama.Kimlik.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Kimlik.Validations;

public class EpostaDogrulaDtoValidator : AbstractValidator<EpostaDogrulaDto>
{
    public EpostaDogrulaDtoValidator()
    {
        RuleFor(x => x.Eposta)
            .NotEmpty().WithMessage("E-posta adresi boş olamaz.");

        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Token boş olamaz.");
    }
}
