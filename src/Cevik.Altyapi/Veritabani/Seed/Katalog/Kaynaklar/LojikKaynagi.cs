using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// 74-serisi lojik entegreler.
///
/// Bu aile kombinatoryal üretmeye ELVERİŞLİDİR, çünkü sipariş kodu tamamen
/// (aile + fonksiyon numarası + kılıf) üçlüsünden oluşur ve üç üretici de aynı
/// fonksiyon numaralarını kullanır:
///
///   Texas Instruments : SN74 | aile | fonksiyon | kılıf  -> SN74HC595D, SN74LVC245APW
///   NXP               : 74   | aile | fonksiyon | kılıf  -> 74HC595D, 74HCT244PW
///   onsemi            : MC74 | aile | fonksiyon | A+kılıf-> MC74HC595ADG
///
/// Fonksiyon listeleri aile bazında ayrı tutulur: 4051 analog multiplexer HC ailesinde
/// vardır ama LS ailesinde yoktur; hepsini her aileyle çarpmak var olmayan kod üretirdi.
/// </summary>
public static class LojikKaynagi
{
    /// <summary>Fonksiyon numarası -> (açıklama, lojik fonksiyon sınıfı, eleman sayısı).</summary>
    private static readonly Dictionary<string, (string Aciklama, string Fonksiyon, int Eleman)> Fonksiyonlar = new()
    {
        ["00"] = ("Dörtlü 2 Girişli NAND Kapı", "NAND Kapı", 4),
        ["02"] = ("Dörtlü 2 Girişli NOR Kapı", "NOR Kapı", 4),
        ["04"] = ("Altılı Evirici", "Evirici", 6),
        ["08"] = ("Dörtlü 2 Girişli AND Kapı", "AND Kapı", 4),
        ["14"] = ("Altılı Schmitt Tetikli Evirici", "Evirici (Schmitt)", 6),
        ["32"] = ("Dörtlü 2 Girişli OR Kapı", "OR Kapı", 4),
        ["74"] = ("İkili D Tipi Flip-Flop", "Flip-Flop", 2),
        ["86"] = ("Dörtlü 2 Girişli XOR Kapı", "XOR Kapı", 4),
        ["123"] = ("İkili Yeniden Tetiklenebilir Monostable", "Monostable", 2),
        ["125"] = ("Dörtlü 3-Durumlu Tampon", "Tampon / Hat Sürücü", 4),
        ["126"] = ("Dörtlü 3-Durumlu Tampon (Aktif Yüksek)", "Tampon / Hat Sürücü", 4),
        ["138"] = ("3-8 Kod Çözücü / Demultiplexer", "Kod Çözücü", 1),
        ["139"] = ("İkili 2-4 Kod Çözücü", "Kod Çözücü", 2),
        ["151"] = ("8-1 Multiplexer", "Multiplexer", 1),
        ["157"] = ("Dörtlü 2-1 Multiplexer", "Multiplexer", 4),
        ["164"] = ("8 Bit Seri Giriş / Paralel Çıkış Kaydırmalı Yazmaç", "Kaydırmalı Yazmaç", 1),
        ["165"] = ("8 Bit Paralel Giriş / Seri Çıkış Kaydırmalı Yazmaç", "Kaydırmalı Yazmaç", 1),
        ["166"] = ("8 Bit Paralel Giriş Kaydırmalı Yazmaç", "Kaydırmalı Yazmaç", 1),
        ["173"] = ("Dörtlü D Tipi Yazmaç (3-Durumlu)", "Yazmaç", 4),
        ["174"] = ("Altılı D Tipi Flip-Flop", "Flip-Flop", 6),
        ["244"] = ("Sekizli Tampon / Hat Sürücü (3-Durumlu)", "Tampon / Hat Sürücü", 8),
        ["245"] = ("Sekizli Çift Yönlü Veri Yolu Alıcı-Verici", "Alıcı-Verici", 8),
        ["273"] = ("Sekizli D Tipi Flip-Flop (Reset'li)", "Flip-Flop", 8),
        ["373"] = ("Sekizli Şeffaf Mandal (3-Durumlu)", "Mandal", 8),
        ["374"] = ("Sekizli D Tipi Flip-Flop (3-Durumlu)", "Flip-Flop", 8),
        ["393"] = ("İkili 4 Bit İkili Sayıcı", "Sayıcı", 2),
        ["595"] = ("8 Bit Kaydırmalı Yazmaç, Çıkış Mandallı", "Kaydırmalı Yazmaç", 1),
        ["4051"] = ("8 Kanallı Analog Multiplexer / Demultiplexer", "Analog Anahtar", 8),
        ["4053"] = ("Üçlü 2 Kanallı Analog Multiplexer", "Analog Anahtar", 3),
        ["4066"] = ("Dörtlü İki Yönlü Analog Anahtar", "Analog Anahtar", 4)
    };

    /// <summary>Aile -> (besleme aralığı, o ailede fiilen bulunan fonksiyonlar).</summary>
    private static readonly Dictionary<string, (string Besleme, string[] Fonksiyonlar)> Aileler = new()
    {
        ["HC"] = ("2.0 - 6.0 V",
            ["00", "02", "04", "08", "14", "32", "74", "86", "123", "125", "126", "138", "139", "151",
             "157", "164", "165", "166", "173", "174", "244", "245", "273", "373", "374", "393", "595",
             "4051", "4053", "4066"]),

        ["HCT"] = ("4.5 - 5.5 V",
            ["00", "04", "08", "14", "32", "74", "125", "138", "139", "244", "245", "273", "373", "374", "595"]),

        ["LS"] = ("4.75 - 5.25 V",
            ["00", "02", "04", "08", "14", "32", "74", "86", "138", "139", "151", "157", "164", "165",
             "244", "245", "273", "373", "374", "393"]),

        ["LVC"] = ("1.65 - 5.5 V",
            ["00", "04", "08", "14", "32", "74", "86", "125", "138", "157", "244", "245", "373", "374", "595"]),

        ["AHC"] = ("2.0 - 5.5 V",
            ["00", "04", "08", "14", "32", "74", "86", "125", "138", "244", "245", "373", "374", "595"])
    };

    private const string Sicaklik = "-40 ~ +85 °C";

    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in TexasInstruments()) yield return p;
        foreach (var p in Nxp()) yield return p;
        foreach (var p in Onsemi()) yield return p;
        foreach (var p in TekKapiLojik()) yield return p;
    }

    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> TexasInstruments()
    {
        // Kılıf soneki -> görünen kılıf adı. LS ailesi TSSOP'ta üretilmez.
        (string Sonek, string Kilif)[] genelKiliflar = [("N", "PDIP"), ("D", "SOIC"), ("PW", "TSSOP")];
        (string Sonek, string Kilif)[] modernKiliflar = [("D", "SOIC"), ("PW", "TSSOP")];
        (string Sonek, string Kilif)[] lsKiliflar = [("N", "PDIP"), ("D", "SOIC")];

        foreach (var (aile, (besleme, fonksiyonlar)) in Aileler)
        {
            var kiliflar = aile switch
            {
                "LS" => lsKiliflar,
                "LVC" or "AHC" => modernKiliflar,
                _ => genelKiliflar
            };

            // LVC ailesinde TI'ın standart sürüm harfi "A"dır: SN74LVC245APW.
            var surum = aile == "LVC" ? "A" : string.Empty;

            foreach (var fonksiyon in fonksiyonlar)
            foreach (var (sonek, kilif) in kiliflar)
            {
                yield return LojikParca("Texas Instruments",
                    $"SN74{aile}{fonksiyon}{surum}{sonek}", aile, fonksiyon, kilif, besleme);
            }
        }
    }

    private static IEnumerable<HamParca> Nxp()
    {
        (string Sonek, string Kilif)[] kiliflar = [("N", "PDIP"), ("D", "SOIC"), ("PW", "TSSOP")];

        foreach (var aile in new[] { "HC", "HCT" })
        {
            var (besleme, fonksiyonlar) = Aileler[aile];

            foreach (var fonksiyon in fonksiyonlar)
            foreach (var (sonek, kilif) in kiliflar)
            {
                yield return LojikParca("NXP Semiconductors",
                    $"74{aile}{fonksiyon}{sonek}", aile, fonksiyon, kilif, besleme);
            }
        }
    }

    private static IEnumerable<HamParca> Onsemi()
    {
        // onsemi kodlarında sürüm harfi "A", sonda da kurşunsuzluk harfi "G" vardır.
        (string Sonek, string Kilif)[] kiliflar = [("NG", "PDIP"), ("DG", "SOIC"), ("DTR2G", "TSSOP")];

        var (besleme, fonksiyonlar) = Aileler["HC"];

        foreach (var fonksiyon in fonksiyonlar)
        foreach (var (sonek, kilif) in kiliflar)
        {
            yield return LojikParca("onsemi",
                $"MC74HC{fonksiyon}A{sonek}", "HC", fonksiyon, kilif, besleme);
        }
    }

    /// <summary>
    /// Tek kapılı lojik (1G ailesi) — SOT-23-5 ve SC-70-5 kılıflarda.
    /// Bu parçalar yalnızca makarada satılır, sipariş kodu da makara sonekiyle biter.
    /// </summary>
    private static IEnumerable<HamParca> TekKapiLojik()
    {
        (string Kod, string Aciklama, string Fonksiyon)[] tekKapi =
        [
            ("00", "Tek 2 Girişli NAND Kapı", "NAND Kapı"),
            ("02", "Tek 2 Girişli NOR Kapı", "NOR Kapı"),
            ("04", "Tek Evirici", "Evirici"),
            ("08", "Tek 2 Girişli AND Kapı", "AND Kapı"),
            ("14", "Tek Schmitt Tetikli Evirici", "Evirici (Schmitt)"),
            ("32", "Tek 2 Girişli OR Kapı", "OR Kapı"),
            ("86", "Tek 2 Girişli XOR Kapı", "XOR Kapı"),
            ("125", "Tek 3-Durumlu Tampon", "Tampon / Hat Sürücü"),
            ("126", "Tek 3-Durumlu Tampon (Aktif Yüksek)", "Tampon / Hat Sürücü"),
            ("157", "Tek 2-1 Multiplexer", "Multiplexer")
        ];

        (string Aile, string Besleme)[] aileler = [("LVC", "1.65 - 5.5 V"), ("AHC", "2.0 - 5.5 V")];
        (string Sonek, string Kilif)[] kiliflar = [("DBVR", "SOT-23-5"), ("DCKR", "SC-70-5")];

        foreach (var (aile, besleme) in aileler)
        foreach (var (kod, aciklama, fonksiyon) in tekKapi)
        foreach (var (sonek, kilif) in kiliflar)
        {
            yield return new HamParca(
                "lojik-entegreler",
                "Texas Instruments",
                $"SN74{aile}1G{kod}{sonek}",
                $"IC LOJIK {aciklama} {aile} {kilif}",
                MontajTipi.Smt,
                [
                    new("lojik_ailesi", $"74{aile}"),
                    new("lojik_fonksiyonu", fonksiyon),
                    new("kapi_sayisi", "1", 1m),
                    new("besleme_voltaji", besleme),
                    new("kilif", kilif),
                    new("calisma_sicakligi", Sicaklik)
                ]);
        }

        // NXP'nin tek kapılı karşılıkları — TSSOP-5 (GW) kılıfta.
        foreach (var (kod, aciklama, fonksiyon) in tekKapi)
        {
            yield return new HamParca(
                "lojik-entegreler",
                "NXP Semiconductors",
                $"74LVC1G{kod}GW",
                $"IC LOJIK {aciklama} LVC TSSOP-5",
                MontajTipi.Smt,
                [
                    new("lojik_ailesi", "74LVC"),
                    new("lojik_fonksiyonu", fonksiyon),
                    new("kapi_sayisi", "1", 1m),
                    new("besleme_voltaji", "1.65 - 5.5 V"),
                    new("kilif", "TSSOP-5"),
                    new("calisma_sicakligi", Sicaklik)
                ]);
        }
    }

    private static HamParca LojikParca(
        string uretici, string mpn, string aile, string fonksiyon, string kilif, string besleme)
    {
        var (aciklama, fonksiyonAdi, eleman) = Fonksiyonlar[fonksiyon];

        return new HamParca(
            "lojik-entegreler",
            uretici,
            mpn,
            $"IC LOJIK {aciklama} 74{aile}{fonksiyon} {kilif}",
            kilif == "PDIP" ? MontajTipi.Tht : MontajTipi.Smt,
            [
                new("lojik_ailesi", $"74{aile}"),
                new("lojik_fonksiyonu", fonksiyonAdi),
                new("kapi_sayisi", eleman.ToString(), eleman),
                new("besleme_voltaji", besleme),
                new("kilif", kilif),
                new("calisma_sicakligi", Sicaklik)
            ]);
    }
}
