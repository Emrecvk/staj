using System;
using Cevik.Alan.Ortak;

namespace Cevik.Alan.Icerik;

public class Sozlesme : VarlikTabaniInt
{
    public required string Tip { get; set; }
    public required string Versiyon { get; set; }
    
    public required string Icerik { get; set; }
    
    public DateTimeOffset YururlukTarihi { get; set; }
}
