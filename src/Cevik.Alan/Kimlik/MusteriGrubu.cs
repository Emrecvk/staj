using Cevik.Alan.Ortak;

namespace Cevik.Alan.Kimlik;

public class MusteriGrubu : VarlikTabaniInt
{
    public required string Ad { get; set; }
    
    public decimal VarsayilanIskontoYuzdesi { get; set; }
}
