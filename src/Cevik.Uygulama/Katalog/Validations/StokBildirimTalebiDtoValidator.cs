using Cevik.Uygulama.Katalog.Dto;
using FluentValidation;

namespace Cevik.Uygulama.Katalog.Validations;

/// <summary>
/// Stok bildirim ucu anonime açıktır: bir ziyaretçi ürünü stoğa girince haber
/// almak için giriş yapmak zorunda kalmamalı. Bu, doğrulamayı daha da gerekli
/// kılıyor — uç önceden hiçbir validator'a sahip değildi ve tek kontrol
/// servisteki <c>IsNullOrWhiteSpace</c> idi. Biçimi doğrulanmamış bir adres,
/// arka plan işleyicisinin site adına gönderdiği postanın hedefidir; geçersiz
/// veya üçüncü kişilere ait adresler gönderen itibarını zedeler.
/// </summary>
public class StokBildirimTalebiDtoValidator : AbstractValidator<StokBildirimTalebiDto>
{
    public StokBildirimTalebiDtoValidator()
    {
        RuleFor(x => x.Eposta)
            .NotEmpty().WithMessage("E-posta adresi zorunludur.")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
            .MaximumLength(256).WithMessage("E-posta adresi en fazla 256 karakter olabilir.");

        // Üst sınır bilinçli: stok bildirimi bir talep formudur, sipariş değil.
        // Sınırsız bırakmak int taşmasına ve anlamsız kayıtlara açık kapı bırakır.
        RuleFor(x => x.IstenenMiktar)
            .GreaterThan(0).WithMessage("İstenen miktar 0'dan büyük olmalıdır.")
            .LessThanOrEqualTo(1_000_000).WithMessage("İstenen miktar en fazla 1.000.000 olabilir.");
    }
}
