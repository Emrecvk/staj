using Cevik.Uygulama.Teklif.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Teklif.Validations;

public class TeklifOlusturDtoValidator : AbstractValidator<TeklifOlusturDto>
{
    public TeklifOlusturDtoValidator()
    {
        RuleFor(x => x.MusteriNotu)
            .MaximumLength(2000).WithMessage("Not en fazla 2000 karakter olabilir.");
    }
}
