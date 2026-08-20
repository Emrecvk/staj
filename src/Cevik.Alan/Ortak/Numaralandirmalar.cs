namespace Cevik.Alan.Ortak;

/// <summary>Ürünün yaşam döngüsü. Özdisan'daki ACTIVE / NRND / EOL / OBSOLETE karşılığı.</summary>
public enum UrunDurumu : short
{
    Aktif = 1,
    /// <summary>Not Recommended for New Designs — yeni tasarımda kullanma.</summary>
    YeniTasarimaOnerilmez = 2,
    /// <summary>End of Life — üretici üretimi durduruyor.</summary>
    OmruSonu = 3,
    KullanimdanKalkti = 4
}

public enum RohsDurumu : short
{
    Bilinmiyor = 0,
    Belgeli = 1,
    Belgesiz = 2
}

public enum MontajTipi : short
{
    Yok = 0,
    /// <summary>Surface Mount Technology — yüzey montaj.</summary>
    Smt = 1,
    /// <summary>Through Hole Technology — delikten geçmeli.</summary>
    Tht = 2
}

public enum AmbalajTipi : short
{
    TapeReel = 1,
    CutTape = 2,
    OzelReel = 3,
    Tube = 4,
    Tray = 5,
    Bulk = 6,
    Box = 7
}

/// <summary>Ürün detayındaki dört ilişki sekmesi.</summary>
public enum IliskiTipi : short
{
    Muadil = 1,
    Benzer = 2,
    Parametrik = 3,
    BirlikteKullanilan = 4
}

public enum OzellikVeriTipi : short
{
    Metin = 1,
    Sayi = 2,
    Aralik = 3,
    MantiksalDeger = 4,
    Secim = 5
}

public enum OzellikGosterimTipi : short
{
    OnayKutusu = 1,
    AralikKaydiraci = 2,
    AcilirListe = 3
}

public enum DokumanTipi : short
{
    Datasheet = 1,
    Sertifika = 2,
    UygulamaNotu = 3,
    UcBoyutluModel = 4,
    Video = 5
}

public enum SiparisDurumu : short
{
    Olusturuldu = 1,
    OdemeBekliyor = 2,
    Onaylandi = 3,
    Hazirlaniyor = 4,
    KargoyaVerildi = 5,
    TeslimEdildi = 6,
    IptalEdildi = 7,
    IadeEdildi = 8
}

public enum TeklifDurumu : short
{
    Yeni = 1,
    Inceleniyor = 2,
    Fiyatlandirildi = 3,
    MusteriOnayiBekliyor = 4,
    KabulEdildi = 5,
    Reddedildi = 6,
    SuresiDoldu = 7,
    SipariseDonusturuldu = 8
}

public enum FirmaOnayDurumu : short
{
    Beklemede = 1,
    Onaylandi = 2,
    Reddedildi = 3
}

public enum AdresTipi : short
{
    Fatura = 1,
    Teslimat = 2
}

public enum IndirimHedefTipi : short
{
    Urun = 1,
    Kategori = 2,
    Uretici = 3,
    MusteriGrubu = 4
}

public enum IndirimTipi : short
{
    Yuzde = 1,
    SabitTutar = 2
}

public enum BomEslesmeDurumu : short
{
    TamEslesme = 1,
    OlasiEslesme = 2,
    Bulunamadi = 3
}

/// <summary>
/// Kullanıcı rolleri (PLANLAMA.md 5.4).
/// Rol veritabanında saklanır; e-posta adresine bakarak rol vermek
/// bir arka kapıdır ve bilerek kaldırılmıştır.
/// </summary>
public enum KullaniciRolu : short
{
    Musteri = 1,
    FirmaYoneticisi = 2,
    SatisTemsilcisi = 3,
    Editor = 4,
    Admin = 5
}
