using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Geliştirme kartları, programlayıcılar, genişletme kartları ile termal, mekanik
/// ve kablo ürünleri. Tamamı küratörlüdür — bu ailelerde sipariş kodu teknik
/// parametreden türetilemez, üreticinin verdiği SKU'dur.
/// </summary>
public static class KartMekanikKaynagi
{
    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in GelistirmeKartlari()) yield return p;
        foreach (var p in ProgramlayiciDebugger()) yield return p;
        foreach (var p in GenisletmeKartlari()) yield return p;
        foreach (var p in Sogutucular()) yield return p;
        foreach (var p in Fanlar()) yield return p;
        foreach (var p in Muhafazalar()) yield return p;
        foreach (var p in MontajDonanimlari()) yield return p;
        foreach (var p in JumperTestKablolari()) yield return p;
        foreach (var p in SeritKablolar()) yield return p;
        foreach (var p in KabloYonetimi()) yield return p;
    }

    // -----------------------------------------------------------------------
    // Geliştirme kartları
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> GelistirmeKartlari()
    {
        (string Uretici, string Mpn, string Aile, string Islemci, string Baglanti, string Besleme, string Arayuz, string Boyut)[] liste =
        [
            ("Arduino", "A000066", "Arduino UNO R3", "ATmega328P", "USB-B", "7 - 12 VDC", "UART / SPI / I2C", "68.6 x 53.4 mm"),
            ("Arduino", "A000073", "Arduino UNO R3 SMD", "ATmega328P", "USB-B", "7 - 12 VDC", "UART / SPI / I2C", "68.6 x 53.4 mm"),
            ("Arduino", "A000005", "Arduino Nano", "ATmega328P", "Mini USB-B", "7 - 12 VDC", "UART / SPI / I2C", "45.0 x 18.0 mm"),
            ("Arduino", "A000067", "Arduino Mega 2560 R3", "ATmega2560", "USB-B", "7 - 12 VDC", "UART x4 / SPI / I2C", "101.5 x 53.3 mm"),
            ("Arduino", "A000057", "Arduino Leonardo", "ATmega32U4", "Micro USB-B", "7 - 12 VDC", "UART / SPI / I2C / USB HID", "68.6 x 53.3 mm"),
            ("Arduino", "ABX00027", "Arduino Nano Every", "ATmega4809", "Micro USB-B", "7 - 21 VDC", "UART / SPI / I2C", "45.0 x 18.0 mm"),
            ("Arduino", "ABX00030", "Arduino Nano 33 IoT", "SAMD21 + NINA-W102", "Micro USB-B", "5 VDC", "Wi-Fi / BLE / SPI / I2C", "45.0 x 18.0 mm"),
            ("Arduino", "ABX00032", "Arduino Nano 33 BLE", "nRF52840", "Micro USB-B", "5 VDC", "BLE / SPI / I2C", "45.0 x 18.0 mm"),
            ("Arduino", "ABX00053", "Arduino UNO R4 WiFi", "RA4M1 + ESP32-S3", "USB-C", "6 - 24 VDC", "Wi-Fi / BLE / CAN / I2C", "68.9 x 53.4 mm"),
            ("Arduino", "ABX00080", "Arduino UNO R4 Minima", "RA4M1", "USB-C", "6 - 24 VDC", "UART / SPI / I2C / CAN", "68.9 x 53.4 mm"),
            ("Arduino", "A000079", "Arduino Due", "ATSAM3X8E", "Micro USB-B", "7 - 12 VDC", "UART x4 / SPI / I2C / CAN", "101.5 x 53.3 mm"),

            ("Raspberry Pi", "SC0915", "Raspberry Pi Pico", "RP2040", "Micro USB-B", "1.8 - 5.5 VDC", "UART / SPI / I2C / PIO", "51.0 x 21.0 mm"),
            ("Raspberry Pi", "SC0917", "Raspberry Pi Pico H", "RP2040", "Micro USB-B", "1.8 - 5.5 VDC", "UART / SPI / I2C / PIO", "51.0 x 21.0 mm"),
            ("Raspberry Pi", "SC0918", "Raspberry Pi Pico W", "RP2040 + CYW43439", "Micro USB-B", "1.8 - 5.5 VDC", "Wi-Fi / BLE / SPI / I2C", "51.0 x 21.0 mm"),
            ("Raspberry Pi", "SC0919", "Raspberry Pi Pico WH", "RP2040 + CYW43439", "Micro USB-B", "1.8 - 5.5 VDC", "Wi-Fi / BLE / SPI / I2C", "51.0 x 21.0 mm"),
            ("Raspberry Pi", "SC0194", "Raspberry Pi 4 Model B 4 GB", "BCM2711 (Cortex-A72)", "USB-C", "5.1 VDC / 3 A", "Wi-Fi / BT / Ethernet / USB 3.0", "85.0 x 56.0 mm"),
            ("Raspberry Pi", "SC0510", "Raspberry Pi Zero 2 W", "RP3A0 (Cortex-A53)", "Micro USB-B", "5 VDC", "Wi-Fi / BT / USB OTG", "65.0 x 30.0 mm"),

            ("STMicroelectronics", "NUCLEO-F103RB", "STM32 Nucleo-64", "STM32F103RB", "Mini USB-B", "3.3 / 5 / 7-12 VDC", "UART / SPI / I2C / Arduino Uno V3", "70.0 x 82.5 mm"),
            ("STMicroelectronics", "NUCLEO-F401RE", "STM32 Nucleo-64", "STM32F401RE", "Mini USB-B", "3.3 / 5 / 7-12 VDC", "UART / SPI / I2C / Arduino Uno V3", "70.0 x 82.5 mm"),
            ("STMicroelectronics", "NUCLEO-F446RE", "STM32 Nucleo-64", "STM32F446RE", "Mini USB-B", "3.3 / 5 / 7-12 VDC", "UART / SPI / I2C / CAN", "70.0 x 82.5 mm"),
            ("STMicroelectronics", "NUCLEO-G071RB", "STM32 Nucleo-64", "STM32G071RB", "Micro USB-B", "3.3 / 5 / 7-12 VDC", "UART / SPI / I2C", "70.0 x 82.5 mm"),
            ("STMicroelectronics", "NUCLEO-L476RG", "STM32 Nucleo-64", "STM32L476RG", "Mini USB-B", "3.3 / 5 / 7-12 VDC", "UART / SPI / I2C / Düşük Güç", "70.0 x 82.5 mm"),
            ("STMicroelectronics", "NUCLEO-H743ZI2", "STM32 Nucleo-144", "STM32H743ZI", "Micro USB-B", "3.3 / 5 / 7-12 VDC", "Ethernet / USB OTG / SPI / I2C", "70.0 x 133.0 mm"),
            ("STMicroelectronics", "NUCLEO-WB55RG", "STM32 Nucleo-64", "STM32WB55RG", "Micro USB-B", "3.3 / 5 VDC", "BLE 5 / Zigbee / SPI / I2C", "70.0 x 82.5 mm"),
            ("STMicroelectronics", "STM32F4DISCOVERY", "STM32 Discovery", "STM32F407VG", "Mini USB-B", "5 VDC", "USB OTG / I2S / SPI / I2C", "97.0 x 66.0 mm"),
            ("STMicroelectronics", "STM32F429I-DISC1", "STM32 Discovery (TFT)", "STM32F429ZI", "Mini USB-B", "5 VDC", "TFT LCD / USB OTG / SPI", "97.0 x 66.0 mm"),
            ("STMicroelectronics", "B-L475E-IOT01A", "STM32 IoT Discovery", "STM32L475VG", "Micro USB-B", "5 VDC", "Wi-Fi / BLE / Sub-GHz / NFC", "78.0 x 55.0 mm"),

            ("Espressif Systems", "ESP32-DEVKITC-32E", "ESP32 DevKitC", "ESP32-WROOM-32E", "Micro USB-B", "5 VDC", "Wi-Fi / BT / UART / SPI / I2C", "54.4 x 27.9 mm"),
            ("Espressif Systems", "ESP32-S3-DEVKITC-1-N8R8", "ESP32-S3 DevKitC", "ESP32-S3-WROOM-1", "USB-C", "5 VDC", "Wi-Fi / BLE / USB OTG", "63.0 x 25.5 mm"),
            ("Espressif Systems", "ESP32-C3-DEVKITM-1", "ESP32-C3 DevKitM", "ESP32-C3-MINI-1", "Micro USB-B", "5 VDC", "Wi-Fi / BLE / UART / SPI", "50.2 x 25.5 mm"),
            ("Espressif Systems", "ESP32-C6-DEVKITC-1-N8", "ESP32-C6 DevKitC", "ESP32-C6-WROOM-1", "USB-C", "5 VDC", "Wi-Fi 6 / BLE / 802.15.4", "63.0 x 25.5 mm"),

            ("Microchip Technology", "DM320103", "Curiosity Nano", "PIC32MM0256GPM064", "Micro USB-B", "5 VDC", "UART / SPI / I2C", "76.0 x 63.0 mm"),
            ("Microchip Technology", "ATMEGA328P-XMINI", "Xplained Mini", "ATmega328P", "Micro USB-B", "5 VDC", "UART / SPI / I2C", "61.0 x 40.0 mm"),
            ("Microchip Technology", "DM164137", "Curiosity HPC", "PIC18F47K42", "Micro USB-B", "5 VDC", "UART / SPI / I2C / mikroBUS", "89.0 x 76.0 mm"),
            ("NXP Semiconductors", "FRDM-K64F", "FRDM Geliştirme Kartı", "MK64FN1M0VLL12", "Micro USB-B", "5 VDC", "Ethernet / SPI / I2C / Arduino R3", "81.0 x 53.0 mm"),
            ("NXP Semiconductors", "FRDM-KL25Z", "FRDM Geliştirme Kartı", "MKL25Z128VLK4", "Micro USB-B", "5 VDC", "USB / SPI / I2C / Arduino R3", "81.0 x 53.0 mm"),
            ("Texas Instruments", "MSP-EXP430G2ET", "MSP430 LaunchPad", "MSP430G2553", "Micro USB-B", "5 VDC", "UART / SPI / I2C", "68.0 x 51.0 mm"),
            ("Texas Instruments", "LAUNCHXL-CC1310", "SimpleLink LaunchPad", "CC1310", "Micro USB-B", "5 VDC", "Sub-GHz / SPI / I2C", "100.0 x 55.0 mm"),
            ("Nordic Semiconductor", "NRF52840-DK", "nRF Geliştirme Kiti", "nRF52840", "Micro USB-B", "5 VDC", "BLE / Thread / Zigbee / NFC", "102.0 x 63.5 mm"),
            ("Silicon Labs", "SLTB010A", "Thunderboard", "EFR32BG22", "Micro USB-B", "5 VDC", "BLE / SPI / I2C", "30.0 x 45.0 mm"),
            ("SparkFun", "DEV-15574", "SparkFun Thing Plus", "ESP32-WROOM", "USB-C", "5 VDC", "Wi-Fi / BT / Qwiic I2C", "58.0 x 23.0 mm"),
            ("Adafruit", "4759", "Adafruit Feather RP2040", "RP2040", "USB-C", "5 VDC", "STEMMA QT / SPI / I2C", "50.8 x 22.8 mm"),
            ("DFRobot", "DFR0654", "FireBeetle 2 ESP32-E", "ESP32-WROOM-32E", "USB-C", "5 VDC", "Wi-Fi / BT / SPI / I2C", "58.0 x 29.0 mm")
        ];

        return liste.Select(x => new HamParca(
            "gelistirme-kartlari-urun", x.Uretici, x.Mpn,
            $"GELİŞTİRME KARTI {x.Aile} — {x.Islemci}",
            MontajTipi.Yok,
            [
                new("kart_ailesi", x.Aile),
                new("islemci", x.Islemci),
                new("konnektivite", x.Baglanti),
                new("besleme_voltaji", x.Besleme),
                new("arayuz", x.Arayuz),
                new("boyutlar", x.Boyut)
            ]));
    }

    private static IEnumerable<HamParca> ProgramlayiciDebugger()
    {
        (string Uretici, string Mpn, string Aile, string Protokol, string Arayuz, string Besleme)[] liste =
        [
            ("SEGGER", "8.08.00", "J-Link BASE", "SWD / JTAG", "USB 2.0", "5 VDC (USB)"),
            ("SEGGER", "8.08.90", "J-Link EDU", "SWD / JTAG", "USB 2.0", "5 VDC (USB)"),
            ("SEGGER", "8.19.28", "J-Link EDU Mini", "SWD", "USB 2.0", "5 VDC (USB)"),
            ("SEGGER", "8.12.00", "J-Link PLUS", "SWD / JTAG", "USB 2.0", "5 VDC (USB)"),
            ("SEGGER", "8.06.00", "J-Trace PRO Cortex-M", "SWD / JTAG / ETM", "USB 3.0 / Ethernet", "5 VDC (USB)"),

            ("STMicroelectronics", "ST-LINK/V2", "ST-LINK", "SWD / SWIM / JTAG", "USB 2.0", "5 VDC (USB)"),
            ("STMicroelectronics", "ST-LINK/V2-ISOL", "ST-LINK (İzoleli)", "SWD / SWIM / JTAG", "USB 2.0", "5 VDC (USB)"),
            ("STMicroelectronics", "STLINK-V3SET", "STLINK-V3", "SWD / JTAG / VCP", "USB-C", "5 VDC (USB)"),
            ("STMicroelectronics", "STLINK-V3MINIE", "STLINK-V3 MINIE", "SWD / VCP", "USB-C", "5 VDC (USB)"),

            ("Microchip Technology", "PG164100", "MPLAB Snap", "ICSP / SWD / JTAG", "Micro USB-B", "5 VDC (USB)"),
            ("Microchip Technology", "PG164140", "MPLAB PICkit 4", "ICSP / SWD / JTAG", "Micro USB-B", "5 VDC (USB)"),
            ("Microchip Technology", "PG164150", "MPLAB PICkit 5", "ICSP / SWD / JTAG", "USB-C", "5 VDC (USB)"),
            ("Microchip Technology", "ATATMEL-ICE", "Atmel-ICE", "SWD / JTAG / PDI / UPDI / debugWIRE", "Micro USB-B", "5 VDC (USB)"),
            ("Microchip Technology", "ATATMEL-ICE-BASIC", "Atmel-ICE Basic", "SWD / JTAG / PDI / UPDI", "Micro USB-B", "5 VDC (USB)"),

            ("FTDI", "TTL-232R-3V3", "USB-Seri Kablo", "UART (3.3 V TTL)", "USB-A", "5 VDC (USB)"),
            ("FTDI", "TTL-232R-5V", "USB-Seri Kablo", "UART (5 V TTL)", "USB-A", "5 VDC (USB)"),
            ("FTDI", "C232HM-DDHSL-0", "USB-SPI/I2C Kablo", "SPI / I2C / JTAG", "USB-A", "3.3 VDC"),
            ("NXP Semiconductors", "LPC-LINK2", "LPC-Link2", "SWD / JTAG", "Micro USB-B", "5 VDC (USB)"),
            ("Texas Instruments", "MSP-FET", "MSP-FET", "Spy-Bi-Wire / JTAG", "Micro USB-B", "5 VDC (USB)"),
            ("Raspberry Pi", "SC0889", "Raspberry Pi Debug Probe", "SWD / UART", "USB-C", "5 VDC (USB)"),
            ("Waveshare", "18170", "USB-TTL Dönüştürücü (CP2102)", "UART", "USB-A", "5 VDC (USB)")
        ];

        return liste.Select(x => new HamParca(
            "programlayici-debugger", x.Uretici, x.Mpn,
            $"PROGRAMLAYICI / DEBUGGER {x.Aile} — {x.Protokol}",
            MontajTipi.Yok,
            [
                new("kart_ailesi", x.Aile),
                new("protokol", x.Protokol),
                new("arayuz", x.Arayuz),
                new("besleme_voltaji", x.Besleme)
            ]));
    }

    private static IEnumerable<HamParca> GenisletmeKartlari()
    {
        (string Uretici, string Mpn, string Aile, string Baglanti, string Arayuz, string Besleme, string Boyut)[] liste =
        [
            ("Arduino", "A000110", "Arduino Ethernet Shield 2", "Ethernet 10/100", "SPI / microSD", "5 VDC", "68.6 x 53.4 mm"),
            ("Arduino", "A000024", "Arduino Motor Shield R3", "L298P Motor Sürücü", "PWM / Analog", "7 - 12 VDC", "68.6 x 53.4 mm"),
            ("Arduino", "TSX00003", "Arduino MKR ENV Shield", "Çevre Sensörleri", "I2C / SPI", "3.3 VDC", "61.5 x 25.0 mm"),
            ("Arduino", "ASX00007", "Arduino MKR RGB Shield", "12x7 RGB Matris", "SPI", "5 VDC", "61.5 x 25.0 mm"),

            ("Waveshare", "13891", "Raspberry Pi RS485 CAN HAT", "RS-485 / CAN", "SPI / UART", "3.3 / 5 VDC", "65.0 x 30.0 mm"),
            ("Waveshare", "15384", "Raspberry Pi PoE HAT", "802.3af PoE", "Ethernet", "5 VDC", "65.0 x 56.0 mm"),
            ("Waveshare", "14515", "Raspberry Pi 4.3\" DSI LCD", "Dokunmatik Ekran", "DSI", "5 VDC", "105.5 x 67.2 mm"),
            ("Waveshare", "17765", "ESP32 Genişletme Kartı", "Röle ve Sensör Girişleri", "GPIO / I2C", "5 VDC", "90.0 x 60.0 mm"),
            ("Waveshare", "19614", "Raspberry Pi Pico Genişletme Kartı", "Breadboard Adaptörü", "GPIO", "3.3 / 5 VDC", "76.0 x 52.0 mm"),

            ("Adafruit", "2348", "Adafruit Motor Shield V2", "Adım / DC Motor Sürücü", "I2C", "5 - 12 VDC", "68.6 x 53.4 mm"),
            ("Adafruit", "1438", "Adafruit Motor HAT", "Adım / DC Motor Sürücü", "I2C", "5 - 12 VDC", "65.0 x 56.0 mm"),
            ("Adafruit", "2885", "Adafruit PiTFT 2.8\" Kapasitif", "Dokunmatik Ekran", "SPI / I2C", "3.3 VDC", "65.0 x 56.0 mm"),
            ("Adafruit", "3651", "Adafruit Perma-Proto HAT", "Prototipleme", "GPIO", "3.3 / 5 VDC", "65.0 x 56.0 mm"),

            ("SparkFun", "DEV-14352", "SparkFun Qwiic Shield", "Qwiic I2C Genişletme", "I2C", "3.3 VDC", "68.6 x 53.4 mm"),
            ("SparkFun", "DEV-13288", "SparkFun MicroSD Shield", "microSD Kart", "SPI", "5 VDC", "68.6 x 53.4 mm"),
            ("DFRobot", "DFR0327", "DFRobot IO Genişletme Kalkanı", "Sensör / Servo Girişleri", "GPIO / I2C / UART", "5 VDC", "68.6 x 53.4 mm"),
            ("DFRobot", "DFR0009", "DFRobot LCD Keypad Shield", "16x2 LCD + Butonlar", "Paralel 4 Bit", "5 VDC", "80.0 x 58.0 mm"),
            ("Microchip Technology", "AC164160", "mikroBUS Click Adaptörü", "mikroBUS Yuvası", "SPI / I2C / UART", "3.3 / 5 VDC", "57.0 x 25.0 mm")
        ];

        return liste.Select(x => new HamParca(
            "genisletme-kartlari", x.Uretici, x.Mpn,
            $"GENİŞLETME KARTI {x.Aile} — {x.Baglanti}",
            MontajTipi.Yok,
            [
                new("kart_ailesi", x.Aile),
                new("konnektivite", x.Baglanti),
                new("arayuz", x.Arayuz),
                new("besleme_voltaji", x.Besleme),
                new("boyutlar", x.Boyut)
            ]));
    }

    // -----------------------------------------------------------------------
    // Termal
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Sogutucular()
    {
        (string Uretici, string Mpn, string Malzeme, decimal Termal, string Boyut, string Kilif, string Montaj)[] liste =
        [
            ("Fischer Elektronik", "SK 104 25,4 STS", "Alüminyum (Siyah Eloksal)", 9.0m, "25.4 x 42.0 x 25.0 mm", "TO-220", "Vidalı"),
            ("Fischer Elektronik", "SK 104 38,1 STS", "Alüminyum (Siyah Eloksal)", 6.5m, "38.1 x 42.0 x 25.0 mm", "TO-220", "Vidalı"),
            ("Fischer Elektronik", "SK 104 50,8 STS", "Alüminyum (Siyah Eloksal)", 5.4m, "50.8 x 42.0 x 25.0 mm", "TO-220", "Vidalı"),
            ("Fischer Elektronik", "SK 129 25,4 STS", "Alüminyum (Siyah Eloksal)", 6.0m, "25.4 x 45.0 x 33.0 mm", "TO-247", "Vidalı"),
            ("Fischer Elektronik", "ICK S 25 X 25 X 18,5", "Alüminyum (Siyah Eloksal)", 8.0m, "25.0 x 25.0 x 18.5 mm", "Entegre / BGA", "Yapışkanlı"),
            ("Fischer Elektronik", "ICK S 14 X 14 X 6", "Alüminyum (Siyah Eloksal)", 21.0m, "14.0 x 14.0 x 6.0 mm", "Entegre / BGA", "Yapışkanlı"),
            ("Fischer Elektronik", "FK 216 SA-220-E", "Alüminyum (Siyah Eloksal)", 21.0m, "19.0 x 12.7 x 9.5 mm", "TO-220", "Klipsli"),
            ("Fischer Elektronik", "FK 224 SA-220-E", "Alüminyum (Siyah Eloksal)", 15.0m, "25.4 x 12.7 x 12.7 mm", "TO-220", "Klipsli"),
            ("Fischer Elektronik", "SK 481 50 SA", "Alüminyum (Doğal)", 2.2m, "50.0 x 100.0 x 40.0 mm", "Genel Amaçlı", "Vidalı"),
            ("Fischer Elektronik", "SK 92 25,4 SA", "Alüminyum (Doğal)", 5.5m, "25.4 x 40.0 x 40.0 mm", "TO-3", "Vidalı"),

            ("Aavid", "507302B00000G", "Alüminyum (Siyah Eloksal)", 22.0m, "19.0 x 12.7 x 9.5 mm", "TO-220", "Klipsli"),
            ("Aavid", "573300B00000G", "Alüminyum (Siyah Eloksal)", 12.0m, "25.4 x 25.4 x 12.7 mm", "TO-220", "Vidalı"),
            ("Aavid", "6398BG", "Alüminyum (Siyah Eloksal)", 5.0m, "50.8 x 42.0 x 25.4 mm", "TO-220 / TO-247", "Vidalı"),
            ("Aavid", "374624B00000G", "Alüminyum (Siyah Eloksal)", 30.0m, "12.7 x 12.7 x 6.35 mm", "SMD / SOT-223", "Yapışkanlı"),
            ("Wakefield-Vette", "637-25ABPE", "Alüminyum (Siyah Eloksal)", 8.5m, "25.4 x 42.0 x 25.0 mm", "TO-220", "Vidalı"),
            ("Wakefield-Vette", "274-1AB", "Alüminyum (Siyah Eloksal)", 24.0m, "19.0 x 12.7 x 9.5 mm", "TO-220", "Klipsli"),
            ("Wakefield-Vette", "882-25AB", "Alüminyum (Siyah Eloksal)", 4.2m, "50.8 x 50.8 x 25.4 mm", "Genel Amaçlı", "Vidalı"),
            ("Bergquist", "SP400-0.007-00-1010", "Silikon Termal Ped", 0m, "10.0 x 10.0 x 0.18 mm", "Termal Arayüz", "Yapışkanlı"),
            ("Bergquist", "GF1500-0.010-00-0404", "Grafit Termal Ped", 0m, "101.6 x 101.6 x 0.25 mm", "Termal Arayüz", "Yapışkanlı"),
            ("Würth Elektronik", "4260000123", "Alüminyum (Siyah Eloksal)", 20.0m, "19.0 x 13.0 x 10.0 mm", "TO-220", "Klipsli")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("malzeme", x.Malzeme),
                new("boyutlar", x.Boyut),
                new("kilif", x.Kilif),
                new("montaj_sekli", x.Montaj)
            };

            if (x.Termal > 0m)
                ozellikler.Insert(1, new ParcaOzelligi("termal_direnc", $"{ParcaKodlama.AnlamliBasamak(x.Termal, 3)} °C/W", x.Termal));

            yield return new HamParca(
                "sogutucular", x.Uretici, x.Mpn,
                $"SOĞUTUCU {x.Kilif} {x.Boyut}{(x.Termal > 0m ? " " + ParcaKodlama.AnlamliBasamak(x.Termal, 3) + "°C/W" : "")}",
                MontajTipi.Yok, ozellikler);
        }
    }

    private static IEnumerable<HamParca> Fanlar()
    {
        (string Uretici, string Mpn, string Boy, decimal Volt, decimal Cfm, decimal Db, string Boyut, string Ip)[] liste =
        [
            ("Sunon", "MF40101V1-1000U-A99", "40 mm", 12m, 8.2m, 25.5m, "40 x 40 x 10 mm", "IP20"),
            ("Sunon", "MF40201V1-1000U-A99", "40 mm", 12m, 12.5m, 32.0m, "40 x 40 x 20 mm", "IP20"),
            ("Sunon", "MF50151V1-1000U-A99", "50 mm", 12m, 17.5m, 30.0m, "50 x 50 x 15 mm", "IP20"),
            ("Sunon", "MF60101V1-1000U-A99", "60 mm", 12m, 20.9m, 28.5m, "60 x 60 x 10 mm", "IP20"),
            ("Sunon", "MF80251V1-1000U-A99", "80 mm", 12m, 39.5m, 32.0m, "80 x 80 x 25 mm", "IP20"),
            ("Sunon", "EE80251S1-000U-A99", "80 mm", 12m, 31.7m, 28.0m, "80 x 80 x 25 mm", "IP20"),
            ("Sunon", "KDE1204PKV3", "40 mm", 12m, 5.9m, 21.0m, "40 x 40 x 10 mm", "IP20"),
            ("Sunon", "MF92251V1-1000U-A99", "92 mm", 12m, 55.0m, 34.0m, "92 x 92 x 25 mm", "IP20"),
            ("Sunon", "MF120251V1-1000U-A99", "120 mm", 12m, 87.6m, 36.0m, "120 x 120 x 25 mm", "IP20"),
            ("Sunon", "MF40100V2-1000U-A99", "40 mm", 24m, 8.2m, 25.5m, "40 x 40 x 10 mm", "IP20"),
            ("Sunon", "MF80252V1-1000U-A99", "80 mm", 24m, 39.5m, 32.0m, "80 x 80 x 25 mm", "IP20"),

            ("Delta Electronics", "AFB0412HHB-A", "40 mm", 12m, 10.5m, 30.0m, "40 x 40 x 10 mm", "IP20"),
            ("Delta Electronics", "AFB0612HH-A", "60 mm", 12m, 26.8m, 33.0m, "60 x 60 x 15 mm", "IP20"),
            ("Delta Electronics", "AFB0812HH-A", "80 mm", 12m, 42.6m, 35.0m, "80 x 80 x 25 mm", "IP20"),
            ("Delta Electronics", "EFB0412VHD-F00", "40 mm", 12m, 9.6m, 29.0m, "40 x 40 x 10 mm", "IP20"),
            ("Delta Electronics", "ASB0412HA-A", "40 mm", 12m, 8.0m, 26.0m, "40 x 40 x 10 mm", "IP20"),
            ("Delta Electronics", "AFC1212DE-F00", "120 mm", 12m, 190.5m, 52.5m, "120 x 120 x 38 mm", "IP20"),

            ("CUI Inc", "CFM-4010V-115-190-11", "40 mm", 12m, 8.5m, 26.0m, "40 x 40 x 10 mm", "IP20"),
            ("CUI Inc", "CFM-6015V-125-210-11", "60 mm", 12m, 19.0m, 30.0m, "60 x 60 x 15 mm", "IP20"),
            ("CUI Inc", "CFM-8025V-145-320-11", "80 mm", 12m, 38.0m, 33.0m, "80 x 80 x 25 mm", "IP20"),
            ("CUI Inc", "CFM-A225-25-11", "120 mm", 24m, 88.0m, 38.0m, "120 x 120 x 25 mm", "IP20")
        ];

        return liste.Select(x => new HamParca(
            "fanlar", x.Uretici, x.Mpn,
            $"FAN {x.Boy} {ParcaKodlama.AnlamliBasamak(x.Volt, 3)}VDC {ParcaKodlama.AnlamliBasamak(x.Cfm, 4)}CFM {ParcaKodlama.AnlamliBasamak(x.Db, 3)}dBA",
            MontajTipi.Yok,
            [
                new("fan_boyutu", x.Boy),
                new("besleme_voltaji", $"{ParcaKodlama.AnlamliBasamak(x.Volt, 3)} VDC"),
                new("hava_debisi", $"{ParcaKodlama.AnlamliBasamak(x.Cfm, 4)} CFM", x.Cfm),
                new("gurultu", $"{ParcaKodlama.AnlamliBasamak(x.Db, 3)} dBA", x.Db),
                new("boyutlar", x.Boyut),
                new("ip_sinifi", x.Ip)
            ]));
    }

    private static IEnumerable<HamParca> Muhafazalar()
    {
        (string Uretici, string Mpn, string Malzeme, string Boyut, string Ip, string Renk, string Montaj)[] liste =
        [
            ("Hammond Manufacturing", "1591XXBK", "ABS Plastik", "85 x 56 x 25 mm", "IP54", "Siyah", "Duvar / Masaüstü"),
            ("Hammond Manufacturing", "1591ABK", "ABS Plastik", "100 x 50 x 25 mm", "IP54", "Siyah", "Duvar / Masaüstü"),
            ("Hammond Manufacturing", "1591BBK", "ABS Plastik", "112 x 62 x 31 mm", "IP54", "Siyah", "Duvar / Masaüstü"),
            ("Hammond Manufacturing", "1591CBK", "ABS Plastik", "120 x 65 x 40 mm", "IP54", "Siyah", "Duvar / Masaüstü"),
            ("Hammond Manufacturing", "1591MSBK", "ABS Plastik", "85 x 56 x 39 mm", "IP54", "Siyah", "Duvar / Masaüstü"),
            ("Hammond Manufacturing", "1455C801", "Alüminyum (Ekstrüzyon)", "80 x 79 x 27 mm", "IP40", "Doğal", "Masaüstü"),
            ("Hammond Manufacturing", "1455K1201", "Alüminyum (Ekstrüzyon)", "120 x 103 x 30 mm", "IP40", "Doğal", "Masaüstü"),
            ("Hammond Manufacturing", "1554F2GY", "Polikarbonat", "120 x 80 x 60 mm", "IP68", "Gri", "Duvar"),
            ("Hammond Manufacturing", "1554K2GY", "Polikarbonat", "160 x 90 x 60 mm", "IP68", "Gri", "Duvar"),
            ("Hammond Manufacturing", "1590BBK", "Döküm Alüminyum", "112 x 60 x 31 mm", "IP54", "Siyah", "Duvar"),
            ("Hammond Manufacturing", "1590DDBK", "Döküm Alüminyum", "188 x 120 x 57 mm", "IP54", "Siyah", "Duvar"),
            ("Hammond Manufacturing", "1593KBK", "ABS Plastik", "112 x 66 x 21 mm", "IP54", "Siyah", "El Tipi"),

            ("Bopla", "22035000", "ABS Plastik", "84 x 59 x 30 mm", "IP40", "Açık Gri", "Masaüstü"),
            ("Bopla", "06018000", "ABS Plastik", "120 x 65 x 40 mm", "IP40", "Açık Gri", "Duvar / Masaüstü"),
            ("Bopla", "97022000", "Polikarbonat", "160 x 80 x 55 mm", "IP66", "Açık Gri", "Duvar"),
            ("Bopla", "25025000", "ABS Plastik", "160 x 95 x 40 mm", "IP40", "Açık Gri", "Masaüstü"),

            ("Phoenix Contact", "2200962", "Polikarbonat", "DIN Ray 22.5 mm modül", "IP20", "Açık Gri", "DIN Ray TS-35"),
            ("Phoenix Contact", "2201110", "Polikarbonat", "DIN Ray 45 mm modül", "IP20", "Açık Gri", "DIN Ray TS-35"),
            ("Weidmüller", "1998780000", "Polikarbonat", "DIN Ray 22.5 mm modül", "IP20", "Açık Gri", "DIN Ray TS-35"),
            ("Würth Elektronik", "710800001", "ABS Plastik", "70 x 50 x 25 mm", "IP40", "Siyah", "Masaüstü")
        ];

        return liste.Select(x => new HamParca(
            "muhafazalar", x.Uretici, x.Mpn,
            $"MUHAFAZA {x.Malzeme} {x.Boyut} {x.Ip} {x.Renk}",
            MontajTipi.Yok,
            [
                new("malzeme", x.Malzeme),
                new("boyutlar", x.Boyut),
                new("ip_sinifi", x.Ip),
                new("renk", x.Renk),
                new("montaj_sekli", x.Montaj)
            ]));
    }

    private static IEnumerable<HamParca> MontajDonanimlari()
    {
        (string Uretici, string Mpn, string Malzeme, string Boyut, decimal Adim, string Montaj)[] liste =
        [
            ("Würth Elektronik", "970100154", "Pirinç (Nikel Kaplama)", "M3 x 10 mm dişi-dişi ara pul", 3m, "Vidalı"),
            ("Würth Elektronik", "970150154", "Pirinç (Nikel Kaplama)", "M3 x 15 mm dişi-dişi ara pul", 3m, "Vidalı"),
            ("Würth Elektronik", "970200154", "Pirinç (Nikel Kaplama)", "M3 x 20 mm dişi-dişi ara pul", 3m, "Vidalı"),
            ("Würth Elektronik", "9774030243", "Poliamid", "M3 x 3 mm ara pul", 3m, "Vidalı"),
            ("Würth Elektronik", "9774100243", "Poliamid", "M3 x 10 mm ara pul", 3m, "Vidalı"),
            ("Würth Elektronik", "702312000", "Poliamid", "PCB kart ayağı Ø6.4 mm", 0m, "Geçmeli"),
            ("Würth Elektronik", "9774020360R", "Poliamid", "M3 x 2 mm ara pul", 3m, "Vidalı"),

            ("Keystone Electronics", "8831", "Pirinç (Nikel Kaplama)", "M3 x 6 mm dişi-dişi ara pul", 3m, "Vidalı"),
            ("Keystone Electronics", "8832", "Pirinç (Nikel Kaplama)", "M3 x 10 mm dişi-dişi ara pul", 3m, "Vidalı"),
            ("Keystone Electronics", "4356", "Poliamid", "PCB kart ayağı Ø4.8 mm", 0m, "Geçmeli"),
            ("Keystone Electronics", "1892", "Pirinç", "Test noktası (delikli)", 0m, "Delikli Montaj"),
            ("Keystone Electronics", "5015", "Pirinç (Nikel Kaplama)", "Test noktası (SMD)", 0m, "Yüzey Montaj"),
            ("Keystone Electronics", "7305", "Poliamid", "Kablo bağı tabanı 19 x 19 mm", 0m, "Yapışkanlı"),

            ("Harwin", "R30-3010202", "Pirinç (Nikel Kaplama)", "M2 x 10 mm dişi-dişi ara pul", 2m, "Vidalı"),
            ("Harwin", "R30-1000202", "Pirinç (Nikel Kaplama)", "M2 x 5 mm dişi-dişi ara pul", 2m, "Vidalı"),
            ("Harwin", "R25-1001002", "Poliamid", "PCB kart ayağı Ø5.0 mm", 0m, "Geçmeli"),
            ("Harwin", "S1751-46R", "Pirinç (Altın Kaplama)", "Ø1.02 mm PCB pin soketi", 0m, "Delikli Montaj"),

            ("3M", "929850-01-36-RK", "Poliamid + Pirinç", "2.54 mm tek sıra pin şeridi (36 pin)", 2.54m, "Delikli Montaj"),
            ("3M", "929974-01-36-RK", "Poliamid + Pirinç", "2.54 mm tek sıra soket şeridi (36 pin)", 2.54m, "Delikli Montaj"),
            ("Panduit", "MTP1S-E6-C", "Poliamid 6.6", "Kablo bağı tabanı 19 x 19 mm", 0m, "Yapışkanlı"),
            ("Bopla", "22102000", "Poliamid", "Muhafaza montaj kiti M3", 3m, "Vidalı")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("malzeme", x.Malzeme),
                new("boyutlar", x.Boyut),
                new("montaj_sekli", x.Montaj)
            };

            if (x.Adim > 0m)
                ozellikler.Insert(2, new ParcaOzelligi("adim_mm", $"{ParcaKodlama.AnlamliBasamak(x.Adim, 3)} mm", x.Adim));

            yield return new HamParca(
                "montaj-donanimlari", x.Uretici, x.Mpn,
                $"MONTAJ DONANIMI {x.Boyut} {x.Malzeme}",
                x.Montaj == "Yüzey Montaj" ? MontajTipi.Smt
                    : x.Montaj == "Delikli Montaj" ? MontajTipi.Tht
                    : MontajTipi.Yok,
                ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // Kablo ve bağlantı
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> JumperTestKablolari()
    {
        (string Uretici, string Mpn, int Iletken, string Awg, decimal Uzunluk, string Konnektor, string Renk)[] liste =
        [
            ("Adafruit", "758", 40, "26 AWG", 0.15m, "Erkek-Erkek Jumper", "Karışık (10 renk)"),
            ("Adafruit", "759", 40, "26 AWG", 0.15m, "Dişi-Dişi Jumper", "Karışık (10 renk)"),
            ("Adafruit", "826", 40, "26 AWG", 0.15m, "Erkek-Dişi Jumper", "Karışık (10 renk)"),
            ("Adafruit", "794", 70, "22 AWG", 0.10m, "Breadboard Bağlantı Teli", "Karışık (6 renk)"),
            ("Adafruit", "4209", 1, "24 AWG", 0.20m, "STEMMA QT / Qwiic (JST SH 4 Pin)", "Siyah"),
            ("Adafruit", "4210", 1, "24 AWG", 0.10m, "STEMMA QT / Qwiic (JST SH 4 Pin)", "Siyah"),

            ("SparkFun", "PRT-12795", 20, "26 AWG", 0.15m, "Erkek-Erkek Jumper", "Karışık (10 renk)"),
            ("SparkFun", "PRT-12796", 20, "26 AWG", 0.15m, "Dişi-Dişi Jumper", "Karışık (10 renk)"),
            ("SparkFun", "PRT-14427", 1, "26 AWG", 0.10m, "Qwiic (JST SH 4 Pin)", "Siyah"),
            ("SparkFun", "PRT-00124", 70, "22 AWG", 0.10m, "Breadboard Bağlantı Teli", "Karışık (6 renk)"),

            ("Würth Elektronik", "649901120001", 1, "28 AWG", 0.15m, "JST XH 2 Pin - Açık Uç", "Kırmızı / Siyah"),
            ("Würth Elektronik", "649904120001", 4, "28 AWG", 0.15m, "JST XH 4 Pin - Açık Uç", "Karışık"),
            ("Molex", "0151340402", 4, "26 AWG", 0.15m, "PicoBlade 4 Pin - Açık Uç", "Karışık"),
            ("Molex", "0151340602", 6, "26 AWG", 0.15m, "PicoBlade 6 Pin - Açık Uç", "Karışık"),
            ("Alpha Wire", "3050 BK005", 1, "24 AWG", 30.5m, "Açık Uç (Tek Damar)", "Siyah"),
            ("Alpha Wire", "3050 RD005", 1, "24 AWG", 30.5m, "Açık Uç (Tek Damar)", "Kırmızı"),
            ("Alpha Wire", "3051 BK005", 1, "22 AWG", 30.5m, "Açık Uç (Tek Damar)", "Siyah"),
            ("Alpha Wire", "3051 RD005", 1, "22 AWG", 30.5m, "Açık Uç (Tek Damar)", "Kırmızı"),
            ("Alpha Wire", "3055 BK005", 1, "20 AWG", 30.5m, "Açık Uç (Tek Damar)", "Siyah"),
            ("Waveshare", "14926", 40, "26 AWG", 0.20m, "Erkek-Dişi Jumper", "Karışık (10 renk)")
        ];

        return liste.Select(x => new HamParca(
            "jumper-test-kablolari", x.Uretici, x.Mpn,
            $"KABLO {x.Konnektor} {x.Iletken} iletken {x.Awg} {ParcaKodlama.AnlamliBasamak(x.Uzunluk, 4)}m",
            MontajTipi.Yok,
            [
                new("iletken_sayisi", x.Iletken.ToString(), x.Iletken),
                new("awg", x.Awg),
                new("uzunluk", $"{ParcaKodlama.AnlamliBasamak(x.Uzunluk, 4)} m", x.Uzunluk),
                new("konnektor_tipi", x.Konnektor),
                new("renk", x.Renk)
            ]));
    }

    private static IEnumerable<HamParca> SeritKablolar()
    {
        (string Uretici, string Mpn, int Iletken, string Awg, decimal Adim, decimal Uzunluk, string Renk)[] liste =
        [
            ("3M", "3365/10 300", 10, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("3M", "3365/14 300", 14, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("3M", "3365/16 300", 16, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("3M", "3365/20 300", 20, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("3M", "3365/26 300", 26, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("3M", "3365/34 300", 34, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("3M", "3365/40 300", 40, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("3M", "3302/10 100", 10, "28 AWG", 1.27m, 30.5m, "Renkli (Gökkuşağı)"),
            ("3M", "3302/16 100", 16, "28 AWG", 1.27m, 30.5m, "Renkli (Gökkuşağı)"),
            ("3M", "3302/20 100", 20, "28 AWG", 1.27m, 30.5m, "Renkli (Gökkuşağı)"),
            ("3M", "3302/26 100", 26, "28 AWG", 1.27m, 30.5m, "Renkli (Gökkuşağı)"),
            ("3M", "3302/40 100", 40, "28 AWG", 1.27m, 30.5m, "Renkli (Gökkuşağı)"),

            ("Amphenol", "135-2801-010", 10, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("Amphenol", "135-2801-016", 16, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("Amphenol", "135-2801-026", 26, "28 AWG", 1.27m, 30.5m, "Gri"),
            ("Molex", "0150210260", 26, "28 AWG", 1.00m, 30.5m, "Gri"),
            ("Molex", "0150210400", 40, "28 AWG", 1.00m, 30.5m, "Gri"),
            ("LAPP", "1119302", 3, "18 AWG", 0m, 50.0m, "Gri (ÖLFLEX Kontrol Kablosu)"),
            ("LAPP", "1119304", 4, "18 AWG", 0m, 50.0m, "Gri (ÖLFLEX Kontrol Kablosu)"),
            ("Alpha Wire", "3583/10 SL005", 10, "28 AWG", 1.27m, 30.5m, "Gri")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("iletken_sayisi", x.Iletken.ToString(), x.Iletken),
                new("awg", x.Awg),
                new("uzunluk", $"{ParcaKodlama.AnlamliBasamak(x.Uzunluk, 4)} m", x.Uzunluk),
                new("renk", x.Renk)
            };

            if (x.Adim > 0m)
                ozellikler.Insert(2, new ParcaOzelligi("adim_mm", $"{ParcaKodlama.AnlamliBasamak(x.Adim, 3)} mm", x.Adim));

            yield return new HamParca(
                "serit-kablolar", x.Uretici, x.Mpn,
                $"ŞERİT KABLO {x.Iletken} iletken {x.Awg} {ParcaKodlama.AnlamliBasamak(x.Uzunluk, 4)}m",
                MontajTipi.Yok, ozellikler);
        }
    }

    private static IEnumerable<HamParca> KabloYonetimi()
    {
        (string Uretici, string Mpn, string Malzeme, string Boyut, string Renk, string Sicaklik)[] liste =
        [
            ("Panduit", "PLT1M-M", "Poliamid 6.6", "99 x 2.5 mm kablo bağı", "Doğal", "-60 ~ +85 °C"),
            ("Panduit", "PLT1M-M0", "Poliamid 6.6", "99 x 2.5 mm kablo bağı", "Siyah", "-60 ~ +85 °C"),
            ("Panduit", "PLT2S-M", "Poliamid 6.6", "188 x 4.8 mm kablo bağı", "Doğal", "-60 ~ +85 °C"),
            ("Panduit", "PLT2S-M0", "Poliamid 6.6", "188 x 4.8 mm kablo bağı", "Siyah", "-60 ~ +85 °C"),
            ("Panduit", "PLT3S-M0", "Poliamid 6.6", "292 x 4.8 mm kablo bağı", "Siyah", "-60 ~ +85 °C"),
            ("Panduit", "PLT4S-M0", "Poliamid 6.6", "366 x 4.8 mm kablo bağı", "Siyah", "-60 ~ +85 °C"),
            ("Panduit", "ABM100-AT-C", "Poliamid 6.6", "25 x 25 mm yapışkanlı bağ tabanı", "Doğal", "-40 ~ +85 °C"),
            ("Panduit", "T25F-C0", "Poliolefin", "6.4 mm makaron (1.5 m)", "Siyah", "-55 ~ +135 °C"),
            ("Panduit", "T50F-C0", "Poliolefin", "12.7 mm makaron (1.5 m)", "Siyah", "-55 ~ +135 °C"),
            ("Panduit", "HSTT19-48-Q5", "Poliolefin", "4.8 mm makaron (1.2 m, 5 renk)", "Karışık", "-55 ~ +135 °C"),
            ("Panduit", "SE50P-CR0", "Poliolefin", "12.7 mm spiral sargı (30 m)", "Siyah", "-40 ~ +85 °C"),
            ("Panduit", "E1X1LG6-A", "PVC", "25 x 25 mm kablo kanalı (2 m)", "Açık Gri", "-20 ~ +60 °C"),

            ("3M", "FP-301-1/4-BLACK-200'", "Poliolefin", "6.4 mm makaron (61 m)", "Siyah", "-55 ~ +135 °C"),
            ("3M", "FP-301-1/2-BLACK-100'", "Poliolefin", "12.7 mm makaron (30 m)", "Siyah", "-55 ~ +135 °C"),
            ("3M", "EPS-200-1/4-48\"-BLACK", "Poliolefin (Yapışkanlı)", "6.4 mm makaron (1.2 m)", "Siyah", "-55 ~ +110 °C"),
            ("3M", "1400-3/4-BK", "PET", "19 mm örgü sargı (50 m)", "Siyah", "-50 ~ +150 °C"),

            ("Würth Elektronik", "3010005", "Poliamid 6.6", "100 x 2.5 mm kablo bağı", "Doğal", "-40 ~ +85 °C"),
            ("Würth Elektronik", "3010015", "Poliamid 6.6", "200 x 4.8 mm kablo bağı", "Doğal", "-40 ~ +85 °C"),
            ("LAPP", "61802000", "Poliamid", "M12 kablo rakoru", "Gri", "-20 ~ +100 °C"),
            ("LAPP", "61802020", "Poliamid", "M16 kablo rakoru", "Gri", "-20 ~ +100 °C"),
            ("LAPP", "61802040", "Poliamid", "M20 kablo rakoru", "Gri", "-20 ~ +100 °C")
        ];

        return liste.Select(x => new HamParca(
            "kablo-yonetimi", x.Uretici, x.Mpn,
            $"KABLO YÖNETİMİ {x.Boyut} {x.Malzeme} {x.Renk}",
            MontajTipi.Yok,
            [
                new("malzeme", x.Malzeme),
                new("boyutlar", x.Boyut),
                new("renk", x.Renk),
                new("calisma_sicakligi", x.Sicaklik)
            ]));
    }
}
