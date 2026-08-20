using Cevik.Uygulama.Siparis.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Siparis.Validations;

public class SiparisOlusturDtoValidator : AbstractValidator<SiparisOlusturDto>
{
    public SiparisOlusturDtoValidator()
    {
        RuleFor(x => x.FaturaAdresiId).GreaterThan(0).WithMessage("Fatura adresi seçiniz.");
        RuleFor(x => x.TeslimatAdresiId).GreaterThan(0).WithMessage("Teslimat adresi seçiniz.");
    }
}
