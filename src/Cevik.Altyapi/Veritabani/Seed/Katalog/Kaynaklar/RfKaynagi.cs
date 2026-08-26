using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Kablosuz ve RF — Wi-Fi/Bluetooth, LoRa, GNSS ve hücresel modüller ile antenler.
/// Modül parça numaraları küratörlüdür; bellek/anten seçenekleri sipariş kodunun
/// sonundaki soneklerle belirtilir (ESP32-WROOM-32E-<b>N8</b> = 8 MB flash).
/// </summary>
public static class RfKaynagi
{
    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in WifiBluetooth()) yield return p;
        foreach (var p in LoraSubGhz()) yield return p;
        foreach (var p in Gnss()) yield return p;
        foreach (var p in Hucresel()) yield return p;
        foreach (var p in Antenler()) yield return p;
    }

    private static IEnumerable<HamParca> WifiBluetooth()
    {
        (string Uretici, string Mpn, string Protokol, string Band, decimal Dbm, string Arayuz, string Besleme, string Anten, string Boyut)[] liste =
        [
            ("Espressif Systems", "ESP32-WROOM-32E-N4", "Wi-Fi 802.11 b/g/n + Bluetooth 4.2", "2.4 GHz", 20m, "UART / SPI / I2C", "3.0 - 3.6 V", "PCB Kart Anteni", "18.0 x 25.5 x 3.1 mm"),
            ("Espressif Systems", "ESP32-WROOM-32E-N8", "Wi-Fi 802.11 b/g/n + Bluetooth 4.2", "2.4 GHz", 20m, "UART / SPI / I2C", "3.0 - 3.6 V", "PCB Kart Anteni", "18.0 x 25.5 x 3.1 mm"),
            ("Espressif Systems", "ESP32-WROOM-32E-N16", "Wi-Fi 802.11 b/g/n + Bluetooth 4.2", "2.4 GHz", 20m, "UART / SPI / I2C", "3.0 - 3.6 V", "PCB Kart Anteni", "18.0 x 25.5 x 3.1 mm"),
            ("Espressif Systems", "ESP32-WROOM-32UE-N8", "Wi-Fi 802.11 b/g/n + Bluetooth 4.2", "2.4 GHz", 20m, "UART / SPI / I2C", "3.0 - 3.6 V", "U.FL Harici Anten", "18.0 x 19.2 x 3.2 mm"),
            ("Espressif Systems", "ESP32-WROVER-E-N16R8", "Wi-Fi 802.11 b/g/n + Bluetooth 4.2", "2.4 GHz", 20m, "UART / SPI / I2C", "3.0 - 3.6 V", "PCB Kart Anteni", "18.0 x 31.4 x 3.3 mm"),
            ("Espressif Systems", "ESP32-S3-WROOM-1-N8R2", "Wi-Fi 802.11 b/g/n + Bluetooth 5 LE", "2.4 GHz", 21m, "UART / SPI / I2C / USB", "3.0 - 3.6 V", "PCB Kart Anteni", "18.0 x 25.5 x 3.1 mm"),
            ("Espressif Systems", "ESP32-S3-WROOM-1-N16R8", "Wi-Fi 802.11 b/g/n + Bluetooth 5 LE", "2.4 GHz", 21m, "UART / SPI / I2C / USB", "3.0 - 3.6 V", "PCB Kart Anteni", "18.0 x 25.5 x 3.1 mm"),
            ("Espressif Systems", "ESP32-C3-MINI-1-N4", "Wi-Fi 802.11 b/g/n + Bluetooth 5 LE", "2.4 GHz", 21m, "UART / SPI / I2C", "3.0 - 3.6 V", "PCB Kart Anteni", "13.2 x 16.6 x 2.4 mm"),
            ("Espressif Systems", "ESP32-C6-WROOM-1-N8", "Wi-Fi 6 + Bluetooth 5 LE + 802.15.4", "2.4 GHz", 20m, "UART / SPI / I2C / USB", "3.0 - 3.6 V", "PCB Kart Anteni", "18.0 x 25.5 x 3.1 mm"),
            ("Espressif Systems", "ESP32-S2-MINI-1-N4", "Wi-Fi 802.11 b/g/n", "2.4 GHz", 19.5m, "UART / SPI / I2C / USB", "3.0 - 3.6 V", "PCB Kart Anteni", "15.4 x 20.0 x 2.4 mm"),
            ("Espressif Systems", "ESP32-C3-WROOM-02-N4", "Wi-Fi 802.11 b/g/n + Bluetooth 5 LE", "2.4 GHz", 21m, "UART / SPI / I2C", "3.0 - 3.6 V", "PCB Kart Anteni", "18.0 x 20.0 x 3.2 mm"),

            ("Ai-Thinker", "ESP-12F", "Wi-Fi 802.11 b/g/n", "2.4 GHz", 20m, "UART / SPI", "3.0 - 3.6 V", "PCB Kart Anteni", "16.0 x 24.0 x 3.0 mm"),
            ("Ai-Thinker", "ESP-12E", "Wi-Fi 802.11 b/g/n", "2.4 GHz", 20m, "UART / SPI", "3.0 - 3.6 V", "PCB Kart Anteni", "16.0 x 24.0 x 3.0 mm"),
            ("Ai-Thinker", "ESP-01S", "Wi-Fi 802.11 b/g/n", "2.4 GHz", 20m, "UART", "3.0 - 3.6 V", "PCB Kart Anteni", "14.3 x 24.8 x 3.0 mm"),
            ("Ai-Thinker", "ESP-07S", "Wi-Fi 802.11 b/g/n", "2.4 GHz", 20m, "UART / SPI", "3.0 - 3.6 V", "U.FL Harici Anten", "17.0 x 16.0 x 3.0 mm"),
            ("Ai-Thinker", "ESP32-CAM", "Wi-Fi 802.11 b/g/n + Bluetooth 4.2", "2.4 GHz", 20m, "UART / SPI / Kamera", "4.75 - 5.25 V", "PCB Kart Anteni", "27.0 x 40.5 x 4.5 mm"),

            ("u-blox", "NINA-B306-00B", "Bluetooth 5.1 LE", "2.4 GHz", 8m, "UART / SPI / I2C", "1.7 - 3.6 V", "PCB Kart Anteni", "10.0 x 14.0 x 3.8 mm"),
            ("u-blox", "ANNA-B112-00B-0", "Bluetooth 5.0 LE", "2.4 GHz", 8m, "UART / SPI / I2C", "1.7 - 3.6 V", "Dahili Anten", "6.5 x 6.5 x 1.5 mm"),
            ("u-blox", "NINA-W106-00B", "Wi-Fi 802.11 b/g/n + Bluetooth 4.2", "2.4 GHz", 20m, "UART / SPI", "3.0 - 3.6 V", "PCB Kart Anteni", "10.4 x 14.3 x 3.8 mm"),
            ("u-blox", "JODY-W377-00B", "Wi-Fi 6 + Bluetooth 5.2", "2.4 / 5 GHz", 20m, "SDIO / UART", "3.0 - 3.6 V", "U.FL Harici Anten", "13.8 x 19.8 x 2.4 mm"),

            ("Murata", "LBEE5KL1DX-883", "Wi-Fi 802.11 b/g/n + Bluetooth 4.2", "2.4 GHz", 18m, "SDIO / UART", "3.0 - 3.6 V", "U.FL Harici Anten", "6.5 x 8.0 x 1.1 mm"),
            ("Silicon Labs", "BGM220PC22HNA2", "Bluetooth 5.2 LE", "2.4 GHz", 8m, "UART / SPI / I2C", "1.71 - 3.8 V", "PCB Kart Anteni", "12.9 x 15.0 x 2.2 mm"),
            ("Silicon Labs", "MGM210PA22JIA2", "Zigbee / Thread / Bluetooth 5.2", "2.4 GHz", 20m, "UART / SPI / I2C", "1.71 - 3.8 V", "Dahili Anten", "12.9 x 15.0 x 2.2 mm"),
            ("Microchip Technology", "RN4871-V/RM118", "Bluetooth 5.0 LE", "2.4 GHz", 0m, "UART", "1.9 - 3.6 V", "PCB Kart Anteni", "9.0 x 11.5 x 2.1 mm"),
            ("Microchip Technology", "ATWINC1500-MR210PB", "Wi-Fi 802.11 b/g/n", "2.4 GHz", 18m, "SPI", "3.0 - 4.2 V", "PCB Kart Anteni", "21.7 x 14.7 x 2.1 mm"),
            ("Nordic Semiconductor", "NRF52840-DONGLE", "Bluetooth 5 LE / Thread / Zigbee", "2.4 GHz", 8m, "USB", "5 V", "PCB Kart Anteni", "16.0 x 45.0 x 4.0 mm")
        ];

        return liste.Select(x => RfModul("wifi-bluetooth-modulleri", x.Uretici, x.Mpn, x.Protokol, x.Band, x.Dbm, x.Arayuz, x.Besleme, x.Anten, x.Boyut));
    }

    private static IEnumerable<HamParca> LoraSubGhz()
    {
        (string Uretici, string Mpn, string Protokol, string Band, decimal Dbm, string Arayuz, string Besleme, string Anten)[] liste =
        [
            ("HopeRF", "RFM95W-868S2", "LoRa / FSK", "868 MHz", 20m, "SPI", "1.8 - 3.7 V", "U.FL / Lehim Pad"),
            ("HopeRF", "RFM95W-915S2", "LoRa / FSK", "915 MHz", 20m, "SPI", "1.8 - 3.7 V", "U.FL / Lehim Pad"),
            ("HopeRF", "RFM96W-433S2", "LoRa / FSK", "433 MHz", 20m, "SPI", "1.8 - 3.7 V", "U.FL / Lehim Pad"),
            ("HopeRF", "RFM98W-433S2", "LoRa / FSK", "433 MHz", 20m, "SPI", "1.8 - 3.7 V", "U.FL / Lehim Pad"),
            ("HopeRF", "RFM69HCW-868S2", "FSK / GFSK / OOK", "868 MHz", 20m, "SPI", "1.8 - 3.6 V", "U.FL / Lehim Pad"),
            ("HopeRF", "RFM69HCW-433S2", "FSK / GFSK / OOK", "433 MHz", 20m, "SPI", "1.8 - 3.6 V", "U.FL / Lehim Pad"),
            ("HopeRF", "RFM22B-S2", "FSK / GFSK / OOK", "433 MHz", 20m, "SPI", "1.8 - 3.6 V", "U.FL / Lehim Pad"),

            ("Semtech", "SX1276IMLTRT", "LoRa / FSK Transceiver", "137 - 1020 MHz", 20m, "SPI", "1.8 - 3.7 V", "Harici Devre"),
            ("Semtech", "SX1278IMLTRT", "LoRa / FSK Transceiver", "137 - 525 MHz", 20m, "SPI", "1.8 - 3.7 V", "Harici Devre"),
            ("Semtech", "SX1262IMLTRT", "LoRa / FSK Transceiver", "150 - 960 MHz", 22m, "SPI", "1.8 - 3.7 V", "Harici Devre"),
            ("Semtech", "SX1268IMLTRT", "LoRa / FSK Transceiver", "410 - 810 MHz", 22m, "SPI", "1.8 - 3.7 V", "Harici Devre"),
            ("Semtech", "SX1280IMLTRT", "LoRa / FLRC / GFSK", "2.4 GHz", 12.5m, "SPI", "1.8 - 3.7 V", "Harici Devre"),

            ("Murata", "CMWX1ZZABZ-091", "LoRa (STM32L0 Entegreli)", "862 - 1020 MHz", 20m, "UART / SPI / I2C", "2.2 - 3.6 V", "Lehim Pad"),
            ("Murata", "LBAA0ZZ1SE-296", "LoRa (STM32WL Entegreli)", "863 - 928 MHz", 22m, "UART / SPI / I2C", "1.8 - 3.6 V", "Lehim Pad"),
            ("Ai-Thinker", "RA-01H", "LoRa", "803 - 930 MHz", 20m, "SPI", "1.8 - 3.7 V", "IPEX Harici Anten"),
            ("Ai-Thinker", "RA-02", "LoRa", "410 - 525 MHz", 18m, "SPI", "1.8 - 3.7 V", "IPEX Harici Anten"),
            ("Nordic Semiconductor", "NRF24L01P-R", "2.4 GHz GFSK Transceiver", "2.4 GHz", 0m, "SPI", "1.9 - 3.6 V", "Harici Devre"),
            ("Texas Instruments", "CC1101RGPR", "Sub-GHz Transceiver", "300 - 928 MHz", 12m, "SPI", "1.8 - 3.6 V", "Harici Devre"),
            ("Texas Instruments", "CC1310F128RGZR", "Sub-GHz SoC", "779 - 930 MHz", 14m, "SPI / UART", "1.8 - 3.8 V", "Harici Devre")
        ];

        return liste.Select(x => RfModul("lora-subghz-modulleri", x.Uretici, x.Mpn, x.Protokol, x.Band, x.Dbm, x.Arayuz, x.Besleme, x.Anten, null));
    }

    private static IEnumerable<HamParca> Gnss()
    {
        (string Uretici, string Mpn, string Protokol, string Band, string Dogruluk, string Arayuz, string Besleme, string Anten)[] liste =
        [
            ("u-blox", "NEO-6M-0-001", "GPS", "L1 1575.42 MHz", "2.5 m CEP", "UART / USB / SPI / I2C", "2.7 - 3.6 V", "Harici Aktif/Pasif Anten"),
            ("u-blox", "NEO-7M-0-000", "GPS / QZSS", "L1 1575.42 MHz", "2.5 m CEP", "UART / USB / SPI / I2C", "2.7 - 3.6 V", "Harici Aktif/Pasif Anten"),
            ("u-blox", "NEO-M8N-0-10", "GPS / GLONASS / Galileo / BeiDou", "L1", "2.0 m CEP", "UART / USB / SPI / I2C", "2.7 - 3.6 V", "Harici Aktif/Pasif Anten"),
            ("u-blox", "NEO-M9N-00B", "GPS / GLONASS / Galileo / BeiDou", "L1", "1.5 m CEP", "UART / USB / SPI / I2C", "2.7 - 3.6 V", "Harici Aktif/Pasif Anten"),
            ("u-blox", "MAX-M10S-00B", "GPS / GLONASS / Galileo / BeiDou", "L1", "1.5 m CEP", "UART / SPI / I2C", "2.7 - 3.6 V", "Harici Aktif/Pasif Anten"),
            ("u-blox", "SAM-M8Q-0", "GPS / GLONASS / Galileo", "L1", "2.5 m CEP", "UART / I2C", "2.7 - 3.6 V", "Dahili Patch Anten"),
            ("u-blox", "ZED-F9P-04B", "RTK GNSS (Çok Bantlı)", "L1 / L2 / L5", "0.01 m + 1 ppm (RTK)", "UART / USB / SPI / I2C", "2.7 - 3.6 V", "Harici Aktif Anten"),
            ("u-blox", "CAM-M8Q-0", "GPS / GLONASS / Galileo", "L1", "2.5 m CEP", "UART / I2C", "2.7 - 3.6 V", "Dahili Çip Anten"),

            ("Quectel", "L76-L", "GPS / GLONASS / Galileo / QZSS", "L1", "2.5 m CEP", "UART / I2C", "2.8 - 4.3 V", "Harici Aktif/Pasif Anten"),
            ("Quectel", "L80-R", "GPS", "L1 1575.42 MHz", "2.5 m CEP", "UART", "3.0 - 4.3 V", "Dahili Patch Anten"),
            ("Quectel", "L86-M33", "GPS / GLONASS", "L1", "2.5 m CEP", "UART", "3.0 - 4.3 V", "Dahili Patch Anten"),
            ("Quectel", "LC86GABMD", "GPS / GLONASS / Galileo / BeiDou", "L1", "1.5 m CEP", "UART", "3.0 - 4.3 V", "Dahili Patch Anten"),
            ("SIMCom", "SIM68M", "GPS / GLONASS / BeiDou", "L1", "2.5 m CEP", "UART", "3.0 - 4.3 V", "Harici Aktif/Pasif Anten"),
            ("SIMCom", "SIM33ELA", "GPS / GLONASS", "L1", "2.5 m CEP", "UART", "3.0 - 4.3 V", "Dahili Patch Anten")
        ];

        return liste.Select(x => new HamParca(
            "gnss-modulleri", x.Uretici, x.Mpn,
            $"GNSS MODÜL {x.Protokol} {x.Dogruluk} {x.Arayuz}",
            MontajTipi.Smt,
            [
                new("protokol", x.Protokol),
                new("frekans_bandi", x.Band),
                new("dogruluk", x.Dogruluk),
                new("arayuz", x.Arayuz),
                new("besleme_voltaji", x.Besleme),
                new("anten_tipi", x.Anten)
            ]));
    }

    private static IEnumerable<HamParca> Hucresel()
    {
        (string Uretici, string Mpn, string Protokol, string Band, decimal Dbm, string Arayuz, string Besleme, string Boyut)[] liste =
        [
            ("SIMCom", "SIM800L", "GSM / GPRS (2G)", "850 / 900 / 1800 / 1900 MHz", 33m, "UART", "3.4 - 4.4 V", "15.8 x 17.8 x 2.4 mm"),
            ("SIMCom", "SIM800C", "GSM / GPRS (2G)", "850 / 900 / 1800 / 1900 MHz", 33m, "UART / USB", "3.4 - 4.4 V", "17.6 x 15.7 x 2.3 mm"),
            ("SIMCom", "SIM868", "GSM / GPRS + GNSS", "850 / 900 / 1800 / 1900 MHz", 33m, "UART", "3.4 - 4.4 V", "17.6 x 15.7 x 2.3 mm"),
            ("SIMCom", "SIM7020E", "NB-IoT (Cat NB1)", "LTE B1/B3/B5/B8/B20/B28", 23m, "UART", "3.0 - 4.3 V", "17.6 x 15.7 x 2.3 mm"),
            ("SIMCom", "SIM7070G", "LTE Cat-M / NB-IoT / GPRS", "Küresel Bantlar", 23m, "UART / USB", "3.0 - 4.3 V", "24.0 x 24.0 x 2.5 mm"),
            ("SIMCom", "SIM7600E-H", "LTE Cat-4", "LTE B1/B3/B5/B7/B8/B20", 23m, "UART / USB", "3.4 - 4.2 V", "30.0 x 30.0 x 2.9 mm"),

            ("Quectel", "M95FA-03-STD", "GSM / GPRS (2G)", "850 / 900 / 1800 / 1900 MHz", 33m, "UART", "3.3 - 4.6 V", "19.9 x 23.6 x 2.7 mm"),
            ("Quectel", "BG96MA-128-SGN", "LTE Cat-M1 / NB-IoT / EGPRS", "Küresel Bantlar", 23m, "UART / USB", "3.3 - 4.3 V", "26.5 x 22.5 x 2.3 mm"),
            ("Quectel", "BC660K-GL", "NB-IoT (Cat NB2)", "Küresel Bantlar", 23m, "UART", "2.2 - 4.5 V", "17.7 x 15.8 x 2.0 mm"),
            ("Quectel", "EC25-EFA-512-STD", "LTE Cat-4", "LTE B1/B3/B5/B7/B8/B20", 23m, "UART / USB", "3.3 - 4.3 V", "29.0 x 32.0 x 2.4 mm"),
            ("Quectel", "EG915U-EU", "LTE Cat-1", "LTE B1/B3/B7/B8/B20/B28", 23m, "UART / USB", "3.3 - 4.3 V", "26.5 x 22.5 x 2.3 mm"),
            ("Quectel", "RM500Q-GL", "5G Sub-6 GHz", "5G NR / LTE", 26m, "USB 3.1 / PCIe", "3.135 - 4.4 V", "30.0 x 52.0 x 2.3 mm"),

            ("u-blox", "SARA-R410M-02B", "LTE Cat-M1 / NB-IoT", "Küresel Bantlar", 23m, "UART / USB", "3.2 - 4.5 V", "16.0 x 26.0 x 2.5 mm"),
            ("u-blox", "SARA-R510M8S-01B", "LTE Cat-M1 / NB-IoT + GNSS", "Küresel Bantlar", 23m, "UART / USB", "3.2 - 4.5 V", "16.0 x 26.0 x 2.5 mm"),
            ("u-blox", "LARA-R6001D-00B", "LTE Cat-1", "Küresel Bantlar", 23m, "UART / USB", "3.3 - 4.5 V", "26.0 x 26.0 x 2.6 mm"),
            ("u-blox", "SARA-G350-02S", "GSM / GPRS (2G)", "850 / 900 / 1800 / 1900 MHz", 33m, "UART", "3.35 - 4.5 V", "16.0 x 26.0 x 3.0 mm")
        ];

        return liste.Select(x => new HamParca(
            "hucresel-modulleri", x.Uretici, x.Mpn,
            $"HÜCRESEL MODÜL {x.Protokol} {x.Arayuz} {x.Boyut}",
            MontajTipi.Smt,
            [
                new("protokol", x.Protokol),
                new("frekans_bandi", x.Band),
                new("cikis_gucu", $"{ParcaKodlama.AnlamliBasamak(x.Dbm, 3)} dBm", x.Dbm),
                new("arayuz", x.Arayuz),
                new("besleme_voltaji", x.Besleme),
                new("boyutlar", x.Boyut)
            ]));
    }

    private static IEnumerable<HamParca> Antenler()
    {
        (string Uretici, string Mpn, string Tip, string Band, decimal Kazanc, string Konnektor, string Montaj, string Boyut)[] liste =
        [
            ("Taoglas", "FXP73.07.0100A", "Esnek PCB Anten", "2.4 / 5 GHz", 2m, "U.FL / I-PEX", "Yapışkanlı Yüzey", "45.0 x 7.0 x 0.1 mm"),
            ("Taoglas", "FXP830.07.0100C", "Esnek PCB Anten", "698 - 2700 MHz (LTE)", 2.5m, "U.FL / I-PEX", "Yapışkanlı Yüzey", "96.0 x 21.0 x 0.1 mm"),
            ("Taoglas", "PC104.07.0100A", "Seramik Çip Anten", "2.4 GHz", 1.5m, "Lehim Pad", "Yüzey Montaj", "10.0 x 3.2 x 1.3 mm"),
            ("Taoglas", "GW.71.5153", "Harici Vidalı Anten", "2.4 / 5 GHz", 3m, "SMA (Erkek)", "Panel / Vidalı", "153 mm uzunluk"),
            ("Taoglas", "AA.105.301111", "GNSS Aktif Anten", "1575.42 MHz", 28m, "SMA (Erkek)", "Manyetik Taban", "48.0 x 40.0 x 15.0 mm"),
            ("Taoglas", "AP.10F.07.0045C", "GNSS Patch Anten", "1575.42 MHz", 2m, "Lehim Pad", "Yüzey Montaj", "10.0 x 10.0 x 4.0 mm"),

            ("Molex", "1461870050", "PCB Çip Anten", "2.4 GHz", 1.5m, "Lehim Pad", "Yüzey Montaj", "7.0 x 2.0 x 1.0 mm"),
            ("Molex", "2069670001", "Esnek Anten (LTE)", "698 - 2690 MHz", 2m, "U.FL / I-PEX", "Yapışkanlı Yüzey", "80.0 x 20.0 x 0.1 mm"),
            ("Molex", "0479500001", "U.FL Koaksiyel Soket", "0 - 6 GHz", 0m, "U.FL", "Yüzey Montaj", "2.6 x 2.6 x 1.25 mm"),

            ("Würth Elektronik", "7488910245", "Harici Vidalı Anten", "2.4 GHz", 2m, "SMA (Erkek)", "Panel / Vidalı", "108 mm uzunluk"),
            ("Würth Elektronik", "7488910143", "PCB Çip Anten", "2.4 GHz", 0.5m, "Lehim Pad", "Yüzey Montaj", "3.2 x 1.6 x 1.1 mm"),
            ("Würth Elektronik", "60312002114503", "SMA Soket (Dik)", "0 - 6 GHz", 0m, "SMA (Dişi)", "Delikli Montaj", "PCB Montaj"),
            ("Würth Elektronik", "7488911245", "Harici Vidalı Anten (LTE)", "698 - 2700 MHz", 2m, "SMA (Erkek)", "Panel / Vidalı", "195 mm uzunluk"),

            ("Linx Technologies", "ANT-2.4-CW-RCT-SMA", "Harici Vidalı Anten", "2.4 GHz", 2m, "SMA (Erkek)", "Panel / Vidalı", "108 mm uzunluk"),
            ("Linx Technologies", "ANT-916-CW-HWR-SMA", "Harici Vidalı Anten", "916 MHz", 1m, "SMA (Erkek)", "Panel / Vidalı", "175 mm uzunluk"),
            ("Linx Technologies", "ANT-433-CW-RH-SMA", "Harici Vidalı Anten", "433 MHz", 1m, "SMA (Erkek)", "Panel / Vidalı", "195 mm uzunluk"),
            ("Linx Technologies", "ANT-GNSS-SPS-SMA", "GNSS Aktif Anten", "1575.42 MHz", 28m, "SMA (Erkek)", "Manyetik Taban", "45.0 x 36.0 x 13.0 mm"),
            ("Abracon", "APAE1575R2540ABDB1-T", "GNSS Patch Anten", "1575.42 MHz", 2m, "Lehim Pad", "Yüzey Montaj", "25.0 x 25.0 x 4.0 mm"),
            ("Amphenol", "SMA-J-P-H-ST-EM1", "SMA Soket (Dik)", "0 - 6 GHz", 0m, "SMA (Dişi)", "Delikli Montaj", "PCB Montaj")
        ];

        return liste.Select(x => new HamParca(
            "antenler", x.Uretici, x.Mpn,
            $"ANTEN {x.Tip} {x.Band} {x.Konnektor}",
            x.Montaj.Contains("Yüzey", StringComparison.Ordinal) ? MontajTipi.Smt
                : x.Montaj.Contains("Delikli", StringComparison.Ordinal) ? MontajTipi.Tht
                : MontajTipi.Yok,
            [
                new("anten_tipi", x.Tip),
                new("frekans_bandi", x.Band),
                new("cikis_gucu", $"{ParcaKodlama.AnlamliBasamak(x.Kazanc, 3)} dBi kazanç", x.Kazanc),
                new("konnektor_tipi", x.Konnektor),
                new("montaj_sekli", x.Montaj),
                new("boyutlar", x.Boyut)
            ]));
    }

    private static HamParca RfModul(
        string kategori, string uretici, string mpn, string protokol, string band,
        decimal dbm, string arayuz, string besleme, string anten, string? boyut = null)
    {
        var ozellikler = new List<ParcaOzelligi>
        {
            new("protokol", protokol),
            new("frekans_bandi", band),
            new("arayuz", arayuz),
            new("besleme_voltaji", besleme),
            new("anten_tipi", anten)
        };

        if (dbm > 0m)
            ozellikler.Insert(2, new ParcaOzelligi("cikis_gucu", $"{ParcaKodlama.AnlamliBasamak(dbm, 3)} dBm", dbm));

        if (boyut is not null)
            ozellikler.Add(new ParcaOzelligi("boyutlar", boyut));

        return new HamParca(
            kategori, uretici, mpn,
            $"MODÜL {protokol} {band} {arayuz}",
            MontajTipi.Smt, ozellikler);
    }
}
