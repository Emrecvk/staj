using Cevik.Uygulama.Siparis.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Siparis.Validations;

public class SepetGuncelleDtoValidator : AbstractValidator<SepetGuncelleDto>
{
    public SepetGuncelleDtoValidator()
    {
        RuleFor(x => x.KalemId).GreaterThan(0).WithMessage("Geçersiz sepet kalemi.");

        // Negatif miktar reddedilir; 0 "kalemi sil" anlamına geldiği için serbesttir.
        RuleFor(x => x.YeniMiktar)
            .GreaterThanOrEqualTo(0).WithMessage("Miktar negatif olamaz.")
            .LessThanOrEqualTo(1_000_000).WithMessage("Tek kalemde en fazla 1.000.000 adet sipariş edilebilir.");
    }
}
