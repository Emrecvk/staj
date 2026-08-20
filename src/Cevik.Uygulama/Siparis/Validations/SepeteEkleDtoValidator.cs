using Cevik.Uygulama.Siparis.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Siparis.Validations;

public class SepeteEkleDtoValidator : AbstractValidator<SepeteEkleDto>
{
    public SepeteEkleDtoValidator()
    {
        RuleFor(x => x.UrunAmbalajId).GreaterThan(0).WithMessage("Geçerli bir ambalaj seçiniz.");
        RuleFor(x => x.Miktar).GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalıdır.");
    }
}
