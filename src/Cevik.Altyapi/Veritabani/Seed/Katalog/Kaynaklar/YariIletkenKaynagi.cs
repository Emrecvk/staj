using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Yarı iletken entegreler — mikrodenetleyici, bellek, analog ve arayüz.
///
/// Bu aileler KOMBİNATORYAL DEĞİLDİR: STM32F103C8T6 gerçek bir parçadır ama aynı şemayla
/// üretilecek STM32F847K3T6 diye bir parça yoktur. Bu yüzden burada kod üretilmez,
/// gerçek parça numaraları listelenir. Teknik değerler üreticinin veri sayfasındaki
/// başlık değerleridir.
/// </summary>
public static class YariIletkenKaynagi
{
    private const string EndustriyelSicaklik = "-40 ~ +85 °C";

    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in Mikrodenetleyiciler()) yield return p;
        foreach (var p in Bellekler()) yield return p;
        foreach (var p in Opamplar()) yield return p;
        foreach (var p in Karsilastiricilar()) yield return p;
        foreach (var p in VeriDonusturucular()) yield return p;
        foreach (var p in ArayuzEntegreleri()) yield return p;
        foreach (var p in SaatVeZamanlayicilar()) yield return p;
    }

    // -----------------------------------------------------------------------
    // Mikrodenetleyiciler
    // -----------------------------------------------------------------------

    /// <param name="Mhz">Maksimum çekirdek frekansı.</param>
    /// <param name="Flash">kB cinsinden program belleği.</param>
    /// <param name="Ram">kB cinsinden SRAM.</param>
    private sealed record McuKaydi(
        string Uretici, string Mpn, string Cekirdek, string Bit,
        decimal Mhz, decimal Flash, decimal Ram, string Kilif, int Pin, string Besleme);

    private static IEnumerable<HamParca> Mikrodenetleyiciler()
    {
        const string st32 = "2.0 - 3.6 V";
        const string avr5 = "1.8 - 5.5 V";

        McuKaydi[] liste =
        [
            // --- STMicroelectronics STM32 ---
            new("STMicroelectronics", "STM32F030F4P6",  "ARM Cortex-M0",   "32 Bit", 48m, 16m, 4m, "TSSOP-20", 20, st32),
            new("STMicroelectronics", "STM32F030K6T6",  "ARM Cortex-M0",   "32 Bit", 48m, 32m, 4m, "LQFP-32", 32, st32),
            new("STMicroelectronics", "STM32F030C8T6",  "ARM Cortex-M0",   "32 Bit", 48m, 64m, 8m, "LQFP-48", 48, st32),
            new("STMicroelectronics", "STM32F030R8T6",  "ARM Cortex-M0",   "32 Bit", 48m, 64m, 8m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F031K6T6",  "ARM Cortex-M0",   "32 Bit", 48m, 32m, 4m, "LQFP-32", 32, st32),
            new("STMicroelectronics", "STM32F042K6T6",  "ARM Cortex-M0",   "32 Bit", 48m, 32m, 6m, "LQFP-32", 32, st32),
            new("STMicroelectronics", "STM32F051K8T6",  "ARM Cortex-M0",   "32 Bit", 48m, 64m, 8m, "LQFP-32", 32, st32),
            new("STMicroelectronics", "STM32F072CBT6",  "ARM Cortex-M0",   "32 Bit", 48m, 128m, 16m, "LQFP-48", 48, st32),
            new("STMicroelectronics", "STM32F091RCT6",  "ARM Cortex-M0",   "32 Bit", 48m, 256m, 32m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F103C8T6",  "ARM Cortex-M3",   "32 Bit", 72m, 64m, 20m, "LQFP-48", 48, st32),
            new("STMicroelectronics", "STM32F103CBT6",  "ARM Cortex-M3",   "32 Bit", 72m, 128m, 20m, "LQFP-48", 48, st32),
            new("STMicroelectronics", "STM32F103RBT6",  "ARM Cortex-M3",   "32 Bit", 72m, 128m, 20m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F103RCT6",  "ARM Cortex-M3",   "32 Bit", 72m, 256m, 48m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F103VET6",  "ARM Cortex-M3",   "32 Bit", 72m, 512m, 64m, "LQFP-100", 100, st32),
            new("STMicroelectronics", "STM32F103ZET6",  "ARM Cortex-M3",   "32 Bit", 72m, 512m, 64m, "LQFP-144", 144, st32),
            new("STMicroelectronics", "STM32F105RBT6",  "ARM Cortex-M3",   "32 Bit", 72m, 128m, 64m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F107VCT6",  "ARM Cortex-M3",   "32 Bit", 72m, 256m, 64m, "LQFP-100", 100, st32),
            new("STMicroelectronics", "STM32F205RGT6",  "ARM Cortex-M3",   "32 Bit", 120m, 1024m, 128m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F207ZGT6",  "ARM Cortex-M3",   "32 Bit", 120m, 1024m, 128m, "LQFP-144", 144, st32),
            new("STMicroelectronics", "STM32F303CBT6",  "ARM Cortex-M4",   "32 Bit", 72m, 128m, 40m, "LQFP-48", 48, st32),
            new("STMicroelectronics", "STM32F303RET6",  "ARM Cortex-M4",   "32 Bit", 72m, 512m, 64m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F334C8T6",  "ARM Cortex-M4",   "32 Bit", 72m, 64m, 16m, "LQFP-48", 48, st32),
            new("STMicroelectronics", "STM32F401CCU6",  "ARM Cortex-M4",   "32 Bit", 84m, 256m, 64m, "UFQFPN-48", 48, st32),
            new("STMicroelectronics", "STM32F401RET6",  "ARM Cortex-M4",   "32 Bit", 84m, 512m, 96m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F405RGT6",  "ARM Cortex-M4",   "32 Bit", 168m, 1024m, 192m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F407VET6",  "ARM Cortex-M4",   "32 Bit", 168m, 512m, 192m, "LQFP-100", 100, st32),
            new("STMicroelectronics", "STM32F407VGT6",  "ARM Cortex-M4",   "32 Bit", 168m, 1024m, 192m, "LQFP-100", 100, st32),
            new("STMicroelectronics", "STM32F407ZGT6",  "ARM Cortex-M4",   "32 Bit", 168m, 1024m, 192m, "LQFP-144", 144, st32),
            new("STMicroelectronics", "STM32F411CEU6",  "ARM Cortex-M4",   "32 Bit", 100m, 512m, 128m, "UFQFPN-48", 48, st32),
            new("STMicroelectronics", "STM32F411RET6",  "ARM Cortex-M4",   "32 Bit", 100m, 512m, 128m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F429ZIT6",  "ARM Cortex-M4",   "32 Bit", 180m, 2048m, 256m, "LQFP-144", 144, st32),
            new("STMicroelectronics", "STM32F446RET6",  "ARM Cortex-M4",   "32 Bit", 180m, 512m, 128m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32F746ZGT6",  "ARM Cortex-M7",   "32 Bit", 216m, 1024m, 320m, "LQFP-144", 144, st32),
            new("STMicroelectronics", "STM32F767ZIT6",  "ARM Cortex-M7",   "32 Bit", 216m, 2048m, 512m, "LQFP-144", 144, st32),
            new("STMicroelectronics", "STM32G030F6P6",  "ARM Cortex-M0+",  "32 Bit", 64m, 32m, 8m, "TSSOP-20", 20, st32),
            new("STMicroelectronics", "STM32G031K8T6",  "ARM Cortex-M0+",  "32 Bit", 64m, 64m, 8m, "LQFP-32", 32, st32),
            new("STMicroelectronics", "STM32G070RBT6",  "ARM Cortex-M0+",  "32 Bit", 64m, 128m, 36m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32G071RBT6",  "ARM Cortex-M0+",  "32 Bit", 64m, 128m, 36m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32G0B1RET6",  "ARM Cortex-M0+",  "32 Bit", 64m, 512m, 144m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32G431CBT6",  "ARM Cortex-M4",   "32 Bit", 170m, 128m, 32m, "LQFP-48", 48, st32),
            new("STMicroelectronics", "STM32G474RET6",  "ARM Cortex-M4",   "32 Bit", 170m, 512m, 128m, "LQFP-64", 64, st32),
            new("STMicroelectronics", "STM32H743ZIT6",  "ARM Cortex-M7",   "32 Bit", 480m, 2048m, 1024m, "LQFP-144", 144, st32),
            new("STMicroelectronics", "STM32H750VBT6",  "ARM Cortex-M7",   "32 Bit", 480m, 128m, 1024m, "LQFP-100", 100, st32),
            new("STMicroelectronics", "STM32L010F4P6",  "ARM Cortex-M0+",  "32 Bit", 32m, 16m, 2m, "TSSOP-20", 20, "1.65 - 3.6 V"),
            new("STMicroelectronics", "STM32L031K6T6",  "ARM Cortex-M0+",  "32 Bit", 32m, 32m, 8m, "LQFP-32", 32, "1.65 - 3.6 V"),
            new("STMicroelectronics", "STM32L051K8T6",  "ARM Cortex-M0+",  "32 Bit", 32m, 64m, 8m, "LQFP-32", 32, "1.65 - 3.6 V"),
            new("STMicroelectronics", "STM32L071KBT6",  "ARM Cortex-M0+",  "32 Bit", 32m, 128m, 20m, "LQFP-32", 32, "1.65 - 3.6 V"),
            new("STMicroelectronics", "STM32L152RET6",  "ARM Cortex-M3",   "32 Bit", 32m, 512m, 80m, "LQFP-64", 64, "1.65 - 3.6 V"),
            new("STMicroelectronics", "STM32L432KCU6",  "ARM Cortex-M4",   "32 Bit", 80m, 256m, 64m, "UFQFPN-32", 32, "1.71 - 3.6 V"),
            new("STMicroelectronics", "STM32L476RGT6",  "ARM Cortex-M4",   "32 Bit", 80m, 1024m, 128m, "LQFP-64", 64, "1.71 - 3.6 V"),
            new("STMicroelectronics", "STM32L496ZGT6",  "ARM Cortex-M4",   "32 Bit", 80m, 1024m, 320m, "LQFP-144", 144, "1.71 - 3.6 V"),
            new("STMicroelectronics", "STM32U575ZIT6",  "ARM Cortex-M33",  "32 Bit", 160m, 2048m, 786m, "LQFP-144", 144, "1.71 - 3.6 V"),
            new("STMicroelectronics", "STM32WB55RGV6",  "ARM Cortex-M4",   "32 Bit", 64m, 1024m, 256m, "VFQFPN-68", 68, "1.71 - 3.6 V"),
            new("STMicroelectronics", "STM32WLE5CCU6",  "ARM Cortex-M4",   "32 Bit", 48m, 256m, 64m, "UFQFPN-48", 48, "1.8 - 3.6 V"),

            // --- Microchip PIC ---
            new("Microchip Technology", "PIC10F200T-I/OT", "PIC10",  "8 Bit", 4m, 0.375m, 0.016m, "SOT-23-6", 6, "2.0 - 5.5 V"),
            new("Microchip Technology", "PIC12F675-I/P",   "PIC12",  "8 Bit", 20m, 1.75m, 0.064m, "PDIP-8", 8, "2.0 - 5.5 V"),
            new("Microchip Technology", "PIC12F1822-I/SN", "PIC12F", "8 Bit", 32m, 3.5m, 0.128m, "SOIC-8", 8, "1.8 - 5.5 V"),
            new("Microchip Technology", "PIC16F84A-04/P",  "PIC16",  "8 Bit", 4m, 1.75m, 0.068m, "PDIP-18", 18, "2.0 - 5.5 V"),
            new("Microchip Technology", "PIC16F628A-I/P",  "PIC16",  "8 Bit", 20m, 3.5m, 0.224m, "PDIP-18", 18, "3.0 - 5.5 V"),
            new("Microchip Technology", "PIC16F676-I/P",   "PIC16",  "8 Bit", 20m, 1.75m, 0.064m, "PDIP-14", 14, "2.0 - 5.5 V"),
            new("Microchip Technology", "PIC16F877A-I/P",  "PIC16",  "8 Bit", 20m, 14m, 0.368m, "PDIP-40", 40, "2.0 - 5.5 V"),
            new("Microchip Technology", "PIC16F887-I/P",   "PIC16",  "8 Bit", 20m, 14m, 0.368m, "PDIP-40", 40, "2.0 - 5.5 V"),
            new("Microchip Technology", "PIC16F1503-I/SL", "PIC16F", "8 Bit", 20m, 3.5m, 0.128m, "SOIC-14", 14, "2.3 - 5.5 V"),
            new("Microchip Technology", "PIC16F1827-I/SO", "PIC16F", "8 Bit", 32m, 7m, 0.384m, "SOIC-18", 18, "1.8 - 5.5 V"),
            new("Microchip Technology", "PIC16F18877-I/PT","PIC16F", "8 Bit", 32m, 56m, 4m, "TQFP-44", 44, "1.8 - 5.5 V"),
            new("Microchip Technology", "PIC18F2550-I/SP", "PIC18",  "8 Bit", 48m, 32m, 2m, "SPDIP-28", 28, "2.0 - 5.5 V"),
            new("Microchip Technology", "PIC18F4550-I/P",  "PIC18",  "8 Bit", 48m, 32m, 2m, "PDIP-40", 40, "2.0 - 5.5 V"),
            new("Microchip Technology", "PIC18F25K22-I/SS","PIC18",  "8 Bit", 64m, 32m, 1.536m, "SSOP-28", 28, "1.8 - 5.5 V"),
            new("Microchip Technology", "PIC18F45K22-I/PT","PIC18",  "8 Bit", 64m, 32m, 1.536m, "TQFP-44", 44, "1.8 - 5.5 V"),
            new("Microchip Technology", "PIC18F26K80-I/SS","PIC18",  "8 Bit", 64m, 64m, 3.648m, "SSOP-28", 28, "1.8 - 5.5 V"),
            new("Microchip Technology", "PIC18F47Q10-I/PT","PIC18Q", "8 Bit", 64m, 128m, 4m, "TQFP-44", 44, "1.8 - 5.5 V"),
            new("Microchip Technology", "PIC24FJ64GA002-I/SP", "PIC24F", "16 Bit", 32m, 64m, 8m, "SPDIP-28", 28, "2.0 - 3.6 V"),
            new("Microchip Technology", "PIC32MX250F128B-I/SP", "MIPS M4K", "32 Bit", 50m, 128m, 32m, "SPDIP-28", 28, "2.3 - 3.6 V"),
            new("Microchip Technology", "PIC32MX795F512L-80I/PT", "MIPS M4K", "32 Bit", 80m, 512m, 128m, "TQFP-100", 100, "2.3 - 3.6 V"),
            new("Microchip Technology", "dsPIC33FJ128MC802-I/SP", "dsPIC33F", "16 Bit", 40m, 128m, 16m, "SPDIP-28", 28, "3.0 - 3.6 V"),

            // --- Microchip AVR / SAM ---
            new("Microchip Technology", "ATMEGA8A-PU",     "AVR", "8 Bit", 16m, 8m, 1m, "PDIP-28", 28, "2.7 - 5.5 V"),
            new("Microchip Technology", "ATMEGA16A-PU",    "AVR", "8 Bit", 16m, 16m, 1m, "PDIP-40", 40, "2.7 - 5.5 V"),
            new("Microchip Technology", "ATMEGA32A-PU",    "AVR", "8 Bit", 16m, 32m, 2m, "PDIP-40", 40, "2.7 - 5.5 V"),
            new("Microchip Technology", "ATMEGA48PA-AU",   "AVR", "8 Bit", 20m, 4m, 0.512m, "TQFP-32", 32, avr5),
            new("Microchip Technology", "ATMEGA88PA-AU",   "AVR", "8 Bit", 20m, 8m, 1m, "TQFP-32", 32, avr5),
            new("Microchip Technology", "ATMEGA168PA-AU",  "AVR", "8 Bit", 20m, 16m, 1m, "TQFP-32", 32, avr5),
            new("Microchip Technology", "ATMEGA328P-PU",   "AVR", "8 Bit", 20m, 32m, 2m, "PDIP-28", 28, avr5),
            new("Microchip Technology", "ATMEGA328P-AU",   "AVR", "8 Bit", 20m, 32m, 2m, "TQFP-32", 32, avr5),
            new("Microchip Technology", "ATMEGA644PA-AU",  "AVR", "8 Bit", 20m, 64m, 4m, "TQFP-44", 44, avr5),
            new("Microchip Technology", "ATMEGA1284P-PU",  "AVR", "8 Bit", 20m, 128m, 16m, "PDIP-40", 40, avr5),
            new("Microchip Technology", "ATMEGA2560-16AU", "AVR", "8 Bit", 16m, 256m, 8m, "TQFP-100", 100, "4.5 - 5.5 V"),
            new("Microchip Technology", "ATMEGA32U4-AU",   "AVR", "8 Bit", 16m, 32m, 2.5m, "TQFP-44", 44, "2.7 - 5.5 V"),
            new("Microchip Technology", "ATTINY13A-SSU",   "AVR", "8 Bit", 20m, 1m, 0.064m, "SOIC-8", 8, avr5),
            new("Microchip Technology", "ATTINY85-20PU",   "AVR", "8 Bit", 20m, 8m, 0.512m, "PDIP-8", 8, "2.7 - 5.5 V"),
            new("Microchip Technology", "ATTINY85-20SU",   "AVR", "8 Bit", 20m, 8m, 0.512m, "SOIC-8", 8, "2.7 - 5.5 V"),
            new("Microchip Technology", "ATTINY84A-SSU",   "AVR", "8 Bit", 20m, 8m, 0.512m, "SOIC-14", 14, avr5),
            new("Microchip Technology", "ATTINY1614-SSN",  "AVR", "8 Bit", 20m, 16m, 2m, "SOIC-14", 14, avr5),
            new("Microchip Technology", "ATSAMD21G18A-AU", "ARM Cortex-M0+", "32 Bit", 48m, 256m, 32m, "TQFP-48", 48, "1.62 - 3.63 V"),
            new("Microchip Technology", "ATSAMD51J19A-AU", "ARM Cortex-M4", "32 Bit", 120m, 512m, 192m, "TQFP-64", 64, "1.71 - 3.6 V"),
            new("Microchip Technology", "ATSAM3X8E-AU",    "ARM Cortex-M3", "32 Bit", 84m, 512m, 100m, "LQFP-144", 144, "1.62 - 3.6 V"),

            // --- Espressif ---
            new("Espressif Systems", "ESP32-D0WD-V3", "Xtensa LX6 (2 çekirdek)", "32 Bit", 240m, 0m, 520m, "QFN-48", 48, "3.0 - 3.6 V"),
            new("Espressif Systems", "ESP8266EX",     "Xtensa L106", "32 Bit", 160m, 0m, 160m, "QFN-32", 32, "2.5 - 3.6 V"),
            new("Espressif Systems", "ESP32-C3FH4",   "RISC-V", "32 Bit", 160m, 4096m, 400m, "QFN-32", 32, "3.0 - 3.6 V"),
            new("Espressif Systems", "ESP32-S3FN8",   "Xtensa LX7 (2 çekirdek)", "32 Bit", 240m, 8192m, 512m, "QFN-56", 56, "3.0 - 3.6 V"),

            // --- Raspberry Pi ---
            new("Raspberry Pi", "RP2040", "ARM Cortex-M0+ (2 çekirdek)", "32 Bit", 133m, 0m, 264m, "QFN-56", 56, "1.8 - 3.3 V"),
            new("Raspberry Pi", "RP2350A", "ARM Cortex-M33 (2 çekirdek)", "32 Bit", 150m, 0m, 520m, "QFN-60", 60, "1.8 - 3.3 V"),

            // --- Texas Instruments MSP430 ---
            new("Texas Instruments", "MSP430G2553IN20",  "MSP430", "16 Bit", 16m, 16m, 0.512m, "PDIP-20", 20, "1.8 - 3.6 V"),
            new("Texas Instruments", "MSP430G2452IPW20", "MSP430", "16 Bit", 16m, 8m, 0.256m, "TSSOP-20", 20, "1.8 - 3.6 V"),
            new("Texas Instruments", "MSP430F5529IPN",   "MSP430", "16 Bit", 25m, 128m, 8m, "LQFP-80", 80, "1.8 - 3.6 V"),
            new("Texas Instruments", "MSP430FR2433IRGE", "MSP430 FRAM", "16 Bit", 16m, 15.5m, 4m, "VQFN-24", 24, "1.8 - 3.6 V"),
            new("Texas Instruments", "MSP430FR5969IRGZ", "MSP430 FRAM", "16 Bit", 16m, 64m, 2m, "VQFN-48", 48, "1.8 - 3.6 V"),

            // --- NXP ---
            new("NXP Semiconductors", "LPC1114FN28/102",  "ARM Cortex-M0", "32 Bit", 50m, 32m, 4m, "PDIP-28", 28, "1.8 - 3.6 V"),
            new("NXP Semiconductors", "LPC1768FBD100",    "ARM Cortex-M3", "32 Bit", 100m, 512m, 64m, "LQFP-100", 100, "2.4 - 3.6 V"),
            new("NXP Semiconductors", "LPC845M301JBD48",  "ARM Cortex-M0+", "32 Bit", 30m, 64m, 16m, "LQFP-48", 48, "1.8 - 3.6 V"),
            new("NXP Semiconductors", "MKL25Z128VLK4",    "ARM Cortex-M0+", "32 Bit", 48m, 128m, 16m, "LQFP-80", 80, "1.71 - 3.6 V"),
            new("NXP Semiconductors", "MK64FN1M0VLL12",   "ARM Cortex-M4", "32 Bit", 120m, 1024m, 256m, "LQFP-100", 100, "1.71 - 3.6 V"),
            new("NXP Semiconductors", "S32K144HFT0VLLT",  "ARM Cortex-M4", "32 Bit", 112m, 512m, 64m, "LQFP-100", 100, "2.7 - 5.5 V"),

            // --- GigaDevice / Nuvoton / Holtek / Renesas ---
            new("GigaDevice", "GD32F103C8T6",  "ARM Cortex-M3", "32 Bit", 108m, 64m, 20m, "LQFP-48", 48, st32),
            new("GigaDevice", "GD32F303CCT6",  "ARM Cortex-M4", "32 Bit", 120m, 256m, 48m, "LQFP-48", 48, st32),
            new("GigaDevice", "GD32E230K8T6",  "ARM Cortex-M23", "32 Bit", 72m, 64m, 8m, "LQFP-32", 32, st32),
            new("GigaDevice", "GD32VF103CBT6", "RISC-V", "32 Bit", 108m, 128m, 32m, "LQFP-48", 48, st32),
            new("Nuvoton", "N76E003AT20",  "8051", "8 Bit", 16m, 18m, 1m, "TSSOP-20", 20, "2.4 - 5.5 V"),
            new("Nuvoton", "NUC131LD2AE",  "ARM Cortex-M0", "32 Bit", 50m, 64m, 16m, "LQFP-48", 48, "2.5 - 5.5 V"),
            new("Nuvoton", "M032LG6AE",    "ARM Cortex-M0", "32 Bit", 72m, 256m, 32m, "LQFP-64", 64, "2.5 - 5.5 V"),
            new("Holtek", "HT66F018",      "HT8", "8 Bit", 8m, 2m, 0.128m, "SOP-16", 16, "2.2 - 5.5 V"),
            new("Renesas Electronics", "R5F100LEAFB", "RL78", "16 Bit", 32m, 64m, 4m, "LQFP-64", 64, "1.6 - 5.5 V"),
            new("Renesas Electronics", "R7FA4M1AB3CFM#AA0", "ARM Cortex-M4", "32 Bit", 48m, 256m, 32m, "LQFP-64", 64, "1.6 - 5.5 V"),

            // --- Kablosuz SoC ---
            new("Nordic Semiconductor", "NRF52832-QFAA-R", "ARM Cortex-M4", "32 Bit", 64m, 512m, 64m, "QFN-48", 48, "1.7 - 3.6 V"),
            new("Nordic Semiconductor", "NRF52840-QIAA-R", "ARM Cortex-M4", "32 Bit", 64m, 1024m, 256m, "QFN-73", 73, "1.7 - 5.5 V"),
            new("Nordic Semiconductor", "NRF51822-QFAA-R", "ARM Cortex-M0", "32 Bit", 16m, 256m, 16m, "QFN-48", 48, "1.8 - 3.6 V"),
            new("Silicon Labs", "EFM32PG22C200F512IM40", "ARM Cortex-M33", "32 Bit", 76m, 512m, 32m, "QFN-40", 40, "1.71 - 3.8 V"),
            new("Silicon Labs", "EFR32BG22C224F512GM32", "ARM Cortex-M33", "32 Bit", 76m, 512m, 32m, "QFN-32", 32, "1.71 - 3.8 V")
        ];

        foreach (var m in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("cekirdek", m.Cekirdek),
                new("bit_sayisi", m.Bit),
                new("frekans", $"{ParcaKodlama.AnlamliBasamak(m.Mhz, 4)} MHz", m.Mhz),
                new("ram", $"{ParcaKodlama.AnlamliBasamak(m.Ram, 5)} kB", m.Ram),
                new("kilif", m.Kilif),
                new("pin_sayisi", m.Pin.ToString(), m.Pin),
                new("besleme_voltaji", m.Besleme),
                // Listedeki her denetleyicide bu üç çevre birimi bulunur; ailelere özgü
                // CAN / USB / Ethernet gibi ekleri parça parça doğrulamadan yazmıyoruz.
                new("arayuz", "UART / SPI / I2C"),
                new("calisma_sicakligi", EndustriyelSicaklik)
            };

            // Harici flash kullanan SoC'lerde (ESP8266, RP2040) dahili program belleği yoktur;
            // 0 kB yazmak yerine parametreyi hiç eklemiyoruz.
            if (m.Flash > 0m)
                ozellikler.Insert(3, new ParcaOzelligi("flash_bellek", $"{ParcaKodlama.AnlamliBasamak(m.Flash, 5)} kB", m.Flash));

            var flashYazi = m.Flash > 0m ? $"{ParcaKodlama.AnlamliBasamak(m.Flash, 5)}KB FLASH " : "";

            yield return new HamParca(
                "mikrodenetleyiciler", m.Uretici, m.Mpn,
                $"MCU {m.Bit} {ParcaKodlama.AnlamliBasamak(m.Mhz, 4)}MHz {flashYazi}{m.Kilif}",
                m.Kilif.Contains("DIP", StringComparison.Ordinal) ? MontajTipi.Tht : MontajTipi.Smt,
                ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // Bellek
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Bellekler()
    {
        (string Uretici, string Mpn, string Tip, decimal Mbit, string Arayuz, decimal Hiz, string Kilif, string Besleme)[] liste =
        [
            // SPI NOR flash
            ("Winbond", "W25Q32JVSSIQ",   "NOR Flash", 32m, "SPI / Quad SPI", 133m, "SOIC-8 (208 mil)", "2.7 - 3.6 V"),
            ("Winbond", "W25Q64JVSSIQ",   "NOR Flash", 64m, "SPI / Quad SPI", 133m, "SOIC-8 (208 mil)", "2.7 - 3.6 V"),
            ("Winbond", "W25Q128JVSIQ",   "NOR Flash", 128m, "SPI / Quad SPI", 133m, "SOIC-8 (208 mil)", "2.7 - 3.6 V"),
            ("Winbond", "W25Q16JVSNIQ",   "NOR Flash", 16m, "SPI / Quad SPI", 133m, "SOIC-8 (150 mil)", "2.7 - 3.6 V"),
            ("Winbond", "W25Q80DVSNIG",   "NOR Flash", 8m, "SPI", 104m, "SOIC-8 (150 mil)", "2.7 - 3.6 V"),
            ("Winbond", "W25N01GVZEIG",   "NAND Flash", 1024m, "SPI", 104m, "WSON-8", "2.7 - 3.6 V"),
            ("Macronix", "MX25L12835FM2I-10G", "NOR Flash", 128m, "SPI / Quad SPI", 104m, "SOP-8", "2.7 - 3.6 V"),
            ("Macronix", "MX25L6433FM2I-08G",  "NOR Flash", 64m, "SPI / Quad SPI", 80m, "SOP-8", "2.7 - 3.6 V"),
            ("GigaDevice", "GD25Q64CSIG",  "NOR Flash", 64m, "SPI / Quad SPI", 120m, "SOP-8", "2.7 - 3.6 V"),
            ("GigaDevice", "GD25Q128CSIG", "NOR Flash", 128m, "SPI / Quad SPI", 120m, "SOP-8", "2.7 - 3.6 V"),

            // I2C / SPI EEPROM
            ("Microchip Technology", "24LC256-I/P",  "EEPROM", 0.256m, "I2C", 0.4m, "PDIP-8", "1.7 - 5.5 V"),
            ("Microchip Technology", "24LC256-I/SN", "EEPROM", 0.256m, "I2C", 0.4m, "SOIC-8", "1.7 - 5.5 V"),
            ("Microchip Technology", "24LC512-I/SN", "EEPROM", 0.512m, "I2C", 0.4m, "SOIC-8", "2.5 - 5.5 V"),
            ("Microchip Technology", "24LC64-I/SN",  "EEPROM", 0.064m, "I2C", 0.4m, "SOIC-8", "1.7 - 5.5 V"),
            ("Microchip Technology", "24AA02E48T-I/OT", "EEPROM", 0.002m, "I2C", 0.4m, "SOT-23-6", "1.7 - 5.5 V"),
            ("Microchip Technology", "25LC256-I/SN", "EEPROM", 0.256m, "SPI", 10m, "SOIC-8", "2.5 - 5.5 V"),
            ("Microchip Technology", "93LC46B-I/SN", "EEPROM", 0.001m, "Microwire", 3m, "SOIC-8", "2.5 - 5.5 V"),
            ("STMicroelectronics", "M24C02-RMN6TP",  "EEPROM", 0.002m, "I2C", 0.4m, "SOIC-8", "1.8 - 5.5 V"),
            ("STMicroelectronics", "M24C64-RMN6TP",  "EEPROM", 0.064m, "I2C", 0.4m, "SOIC-8", "1.8 - 5.5 V"),
            ("STMicroelectronics", "M95640-RMN6TP",  "EEPROM", 0.064m, "SPI", 10m, "SOIC-8", "1.8 - 5.5 V"),
            ("Microchip Technology", "AT24C32E-SSHM-B", "EEPROM", 0.032m, "I2C", 1m, "SOIC-8", "1.7 - 5.5 V"),

            // SRAM / FRAM
            ("ISSI", "IS61LV5128AL-10TLI", "SRAM", 4m, "Paralel", 100m, "TSOP-44", "3.0 - 3.6 V"),
            ("ISSI", "IS62WV51216BLL-55TLI", "SRAM", 8m, "Paralel", 18m, "TSOP-44", "2.5 - 3.6 V"),
            ("Alliance Memory", "AS6C4008-55PCN", "SRAM", 4m, "Paralel", 18m, "PDIP-32", "2.7 - 5.5 V"),
            ("Alliance Memory", "AS6C62256-55PCN", "SRAM", 0.256m, "Paralel", 18m, "PDIP-28", "2.7 - 5.5 V"),
            ("Alliance Memory", "AS7C34098A-10TCN", "SRAM", 4m, "Paralel", 100m, "TSOP-44", "3.0 - 3.6 V"),
            ("Microchip Technology", "23LC1024-I/SN", "SRAM (Seri)", 1m, "SPI", 20m, "SOIC-8", "2.5 - 5.5 V"),
            ("Infineon Technologies", "FM24CL16B-GTR", "FRAM", 0.016m, "I2C", 1m, "SOIC-8", "2.0 - 3.6 V"),
            ("Infineon Technologies", "FM25V02A-GTR",  "FRAM", 0.256m, "SPI", 40m, "SOIC-8", "2.0 - 3.6 V"),

            // DRAM
            ("Micron Technology", "MT41K256M16TW-107:P", "DDR3L SDRAM", 4096m, "Paralel", 933m, "FBGA-96", "1.35 V"),
            ("Micron Technology", "MT48LC16M16A2P-6A:G", "SDRAM", 256m, "Paralel", 166m, "TSOP-54", "3.0 - 3.6 V"),
            ("ISSI", "IS42S16160J-7TLI", "SDRAM", 256m, "Paralel", 143m, "TSOP-54", "3.0 - 3.6 V"),
            ("Alliance Memory", "AS4C16M16SA-6TIN", "SDRAM", 256m, "Paralel", 166m, "TSOP-54", "3.0 - 3.6 V")
        ];

        return liste.Select(x => new HamParca(
            "bellek-entegreleri", x.Uretici, x.Mpn,
            $"IC {x.Tip.ToUpperInvariant()} {BellekYazisi(x.Mbit)} {x.Arayuz} {x.Kilif}",
            x.Kilif.Contains("DIP", StringComparison.Ordinal) ? MontajTipi.Tht : MontajTipi.Smt,
            [
                new("bellek_tipi", x.Tip),
                new("bellek_boyutu", BellekYazisi(x.Mbit), x.Mbit),
                new("arayuz", x.Arayuz),
                new("hiz", $"{ParcaKodlama.AnlamliBasamak(x.Hiz, 4)} MHz", x.Hiz),
                new("besleme_voltaji", x.Besleme),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", EndustriyelSicaklik)
            ]));
    }

    private static string BellekYazisi(decimal mbit) => mbit switch
    {
        >= 1024m => $"{ParcaKodlama.AnlamliBasamak(mbit / 1024m, 4)} Gbit",
        >= 1m => $"{ParcaKodlama.AnlamliBasamak(mbit, 4)} Mbit",
        _ => $"{ParcaKodlama.AnlamliBasamak(mbit * 1024m, 4)} kbit"
    };

    // -----------------------------------------------------------------------
    // İşlemsel yükselteçler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Opamplar()
    {
        // (üretici, temel kod, kanal, GBW MHz, slew V/µs, offset µV, rail-to-rail, besleme, kılıf sonekleri)
        (string Uretici, string Kod, int Kanal, decimal Gbw, decimal Slew, decimal Offset, string Rtr, string Besleme,
            (string Sonek, string Kilif)[] Kiliflar)[] liste =
        [
            ("Texas Instruments", "LM358", 2, 1.0m, 0.5m, 2_000m, "Hayır", "3 - 32 V",
                [("P", "PDIP-8"), ("DR", "SOIC-8"), ("PWR", "TSSOP-8"), ("DGKR", "VSSOP-8")]),
            ("Texas Instruments", "LM324", 4, 1.0m, 0.5m, 2_000m, "Hayır", "3 - 32 V",
                [("N", "PDIP-14"), ("DR", "SOIC-14"), ("PWR", "TSSOP-14")]),
            ("Texas Instruments", "TL072", 2, 3.0m, 13m, 3_000m, "Hayır", "±5 - ±18 V",
                [("CP", "PDIP-8"), ("CDR", "SOIC-8"), ("IDR", "SOIC-8")]),
            ("Texas Instruments", "TL074", 4, 3.0m, 13m, 3_000m, "Hayır", "±5 - ±18 V",
                [("CN", "PDIP-14"), ("CDR", "SOIC-14")]),
            ("Texas Instruments", "TL081", 1, 3.0m, 13m, 3_000m, "Hayır", "±5 - ±18 V",
                [("CP", "PDIP-8"), ("CDR", "SOIC-8")]),
            ("Texas Instruments", "NE5532", 2, 10m, 9m, 500m, "Hayır", "±5 - ±20 V",
                [("P", "PDIP-8"), ("DR", "SOIC-8")]),
            ("Texas Instruments", "OPA2134", 2, 8m, 20m, 500m, "Hayır", "±2.5 - ±18 V",
                [("PA", "PDIP-8"), ("UA", "SOIC-8")]),
            ("Texas Instruments", "OPA2340", 2, 5.5m, 6m, 150m, "Giriş ve Çıkış", "2.7 - 5.5 V",
                [("UA", "SOIC-8"), ("PA", "PDIP-8")]),
            ("Texas Instruments", "OPA333", 1, 0.35m, 0.16m, 10m, "Giriş ve Çıkış", "1.8 - 5.5 V",
                [("AIDBVR", "SOT-23-5"), ("AIDR", "SOIC-8")]),
            ("Texas Instruments", "OPA1612", 2, 40m, 27m, 100m, "Hayır", "±2.25 - ±18 V",
                [("AID", "SOIC-8")]),
            ("Texas Instruments", "TLV2372", 2, 3m, 2.4m, 1_500m, "Giriş ve Çıkış", "2.7 - 16 V",
                [("IDR", "SOIC-8")]),
            ("Texas Instruments", "LMV358", 2, 1m, 1m, 1_700m, "Çıkış", "2.7 - 5.5 V",
                [("IDR", "SOIC-8"), ("IDGKR", "VSSOP-8")]),
            ("Texas Instruments", "INA128", 1, 1.3m, 4m, 50m, "Hayır", "±2.25 - ±18 V",
                [("UA", "SOIC-8"), ("PA", "PDIP-8")]),
            ("Texas Instruments", "INA333", 1, 0.35m, 0.16m, 25m, "Giriş ve Çıkış", "1.8 - 5.5 V",
                [("AIDGKR", "VSSOP-8")]),

            ("Analog Devices", "AD8541", 1, 1m, 0.92m, 1_000m, "Giriş ve Çıkış", "2.7 - 5.5 V",
                [("ARTZ-REEL7", "SOT-23-5"), ("ARZ", "SOIC-8")]),
            ("Analog Devices", "AD8620", 2, 25m, 60m, 250m, "Hayır", "±5 - ±13 V",
                [("ARZ", "SOIC-8")]),
            ("Analog Devices", "AD8226", 1, 1.5m, 0.4m, 60m, "Hayır", "2.2 - 36 V",
                [("ARZ", "SOIC-8"), ("ARMZ", "MSOP-8")]),
            ("Analog Devices", "OP07", 1, 0.6m, 0.3m, 75m, "Hayır", "±3 - ±18 V",
                [("CPZ", "PDIP-8"), ("CSZ", "SOIC-8")]),
            ("Analog Devices", "AD620", 1, 1m, 1.2m, 50m, "Hayır", "±2.3 - ±18 V",
                [("ANZ", "PDIP-8"), ("ARZ", "SOIC-8")]),
            ("Analog Devices", "ADA4522", 2, 2.7m, 1.2m, 5m, "Çıkış", "4.5 - 55 V",
                [("-2ARZ", "SOIC-8")]),

            ("STMicroelectronics", "TSV991", 1, 20m, 12m, 200m, "Giriş ve Çıkış", "2.5 - 5.5 V",
                [("ILT", "SOT-23-5")]),
            ("STMicroelectronics", "TSV912", 2, 8m, 4.5m, 600m, "Giriş ve Çıkış", "2.5 - 5.5 V",
                [("IDT", "SOIC-8")]),
            ("STMicroelectronics", "TL084", 4, 3m, 13m, 3_000m, "Hayır", "±5 - ±18 V",
                [("CN", "PDIP-14"), ("CDT", "SOIC-14")]),
            ("STMicroelectronics", "LM358", 2, 1m, 0.5m, 2_000m, "Hayır", "3 - 32 V",
                [("DT", "SOIC-8"), ("N", "PDIP-8")]),

            ("Microchip Technology", "MCP6002", 2, 1m, 0.6m, 4_500m, "Giriş ve Çıkış", "1.8 - 6.0 V",
                [("-I/SN", "SOIC-8"), ("-I/P", "PDIP-8"), ("-I/MS", "MSOP-8")]),
            ("Microchip Technology", "MCP6004", 4, 1m, 0.6m, 4_500m, "Giriş ve Çıkış", "1.8 - 6.0 V",
                [("-I/SL", "SOIC-14"), ("-I/P", "PDIP-14")]),
            ("Microchip Technology", "MCP601", 1, 2.8m, 2.3m, 2_000m, "Çıkış", "2.7 - 6.0 V",
                [("-I/SN", "SOIC-8"), ("-I/P", "PDIP-8")]),
            ("Microchip Technology", "MCP6231", 1, 0.3m, 0.15m, 4_000m, "Giriş ve Çıkış", "1.8 - 6.0 V",
                [("-E/OT", "SOT-23-5")]),

            ("onsemi", "LM358", 2, 1m, 0.5m, 2_000m, "Hayır", "3 - 32 V",
                [("DR2G", "SOIC-8"), ("NG", "PDIP-8")]),
            ("onsemi", "MC33078", 2, 16m, 7m, 150m, "Hayır", "±5 - ±18 V",
                [("DR2G", "SOIC-8")]),
            ("onsemi", "MC33172", 2, 2.1m, 2m, 2_000m, "Hayır", "3 - 44 V",
                [("DR2G", "SOIC-8")]),

            ("ROHM Semiconductor", "BA2904YF-CE2", 2, 1.2m, 0.5m, 3_000m, "Hayır", "3 - 32 V",
                [("", "SOP-J8")]),
            ("ROHM Semiconductor", "LMR1802G-LB", 2, 40m, 27m, 400m, "Giriş ve Çıkış", "2.5 - 5.5 V",
                [("", "SSOP-8")])
        ];

        foreach (var o in liste)
        foreach (var (sonek, kilif) in o.Kiliflar)
        {
            yield return new HamParca(
                "islemsel-yukseltecler", o.Uretici, o.Kod + sonek,
                $"IC OPAMP {KanalYazisi(o.Kanal)} {ParcaKodlama.AnlamliBasamak(o.Gbw, 3)}MHz {kilif}",
                kilif.Contains("DIP", StringComparison.Ordinal) ? MontajTipi.Tht : MontajTipi.Smt,
                [
                    new("kanal_sayisi", o.Kanal.ToString(), o.Kanal),
                    new("bant_genisligi", $"{ParcaKodlama.AnlamliBasamak(o.Gbw, 3)} MHz", o.Gbw),
                    new("slew_rate", $"{ParcaKodlama.AnlamliBasamak(o.Slew, 3)} V/µs", o.Slew),
                    new("offset_voltaji", $"{ParcaKodlama.AnlamliBasamak(o.Offset, 4)} µV", o.Offset),
                    new("rail_to_rail", o.Rtr),
                    new("besleme_voltaji", o.Besleme),
                    new("kilif", kilif),
                    new("calisma_sicakligi", EndustriyelSicaklik)
                ]);
        }
    }

    private static string KanalYazisi(int kanal) => kanal switch
    {
        1 => "TEKLİ",
        2 => "İKİLİ",
        4 => "DÖRTLÜ",
        _ => $"{kanal} KANAL"
    };

    // -----------------------------------------------------------------------
    // Karşılaştırıcılar
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> Karsilastiricilar()
    {
        (string Uretici, string Mpn, int Kanal, string Besleme, string CikisTipi, string Kilif)[] liste =
        [
            ("Texas Instruments", "LM393P",       2, "2 - 36 V", "Açık Kollektör", "PDIP-8"),
            ("Texas Instruments", "LM393DR",      2, "2 - 36 V", "Açık Kollektör", "SOIC-8"),
            ("Texas Instruments", "LM339N",       4, "2 - 36 V", "Açık Kollektör", "PDIP-14"),
            ("Texas Instruments", "LM339DR",      4, "2 - 36 V", "Açık Kollektör", "SOIC-14"),
            ("Texas Instruments", "LM311P",       1, "±3 - ±18 V", "Açık Kollektör", "PDIP-8"),
            ("Texas Instruments", "LM311DR",      1, "±3 - ±18 V", "Açık Kollektör", "SOIC-8"),
            ("Texas Instruments", "TLV3501AIDBVR",1, "2.7 - 5.5 V", "Push-Pull", "SOT-23-6"),
            ("Texas Instruments", "TLV7011DBVR",  1, "1.6 - 5.5 V", "Push-Pull", "SOT-23-5"),
            ("Texas Instruments", "LM2903DR",     2, "2 - 36 V", "Açık Kollektör", "SOIC-8"),
            ("Texas Instruments", "TL331IDBVR",   1, "2 - 36 V", "Açık Kollektör", "SOT-23-5"),
            ("STMicroelectronics", "LM393DT",     2, "2 - 36 V", "Açık Kollektör", "SOIC-8"),
            ("STMicroelectronics", "LM339DT",     4, "2 - 36 V", "Açık Kollektör", "SOIC-14"),
            ("STMicroelectronics", "TS3011ILT",   1, "1.8 - 5.5 V", "Push-Pull", "SOT-23-5"),
            ("STMicroelectronics", "TS391ILT",    1, "2.7 - 16 V", "Açık Kollektör", "SOT-23-5"),
            ("onsemi", "LM393DR2G",               2, "2 - 36 V", "Açık Kollektör", "SOIC-8"),
            ("onsemi", "LM339DR2G",               4, "2 - 36 V", "Açık Kollektör", "SOIC-14"),
            ("onsemi", "NCS2200SQ2T2G",           1, "1.8 - 5.5 V", "Push-Pull", "SC-88A"),
            ("Microchip Technology", "MCP6541-I/SN", 1, "1.6 - 5.5 V", "Push-Pull", "SOIC-8"),
            ("Microchip Technology", "MCP6542-I/SN", 2, "1.6 - 5.5 V", "Push-Pull", "SOIC-8"),
            ("Analog Devices", "ADCMP600BKSZ-REEL7", 1, "2.5 - 5.5 V", "Push-Pull", "SC-70-5"),
            ("Analog Devices", "LT1719CS5#TRMPBF",   1, "2.7 - 6 V", "Push-Pull", "SOT-23-5"),
            ("Diodes Incorporated", "AZV393GEUSTR-E1", 2, "2 - 36 V", "Açık Kollektör", "US-8")
        ];

        return liste.Select(x => new HamParca(
            "karsilastiricilar", x.Uretici, x.Mpn,
            $"IC KARŞILAŞTIRICI {KanalYazisi(x.Kanal)} {x.CikisTipi} {x.Kilif}",
            x.Kilif.Contains("DIP", StringComparison.Ordinal) ? MontajTipi.Tht : MontajTipi.Smt,
            [
                new("kanal_sayisi", x.Kanal.ToString(), x.Kanal),
                new("besleme_voltaji", x.Besleme),
                new("cikis_tipi", x.CikisTipi),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", EndustriyelSicaklik)
            ]));
    }

    // -----------------------------------------------------------------------
    // Veri dönüştürücüler
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> VeriDonusturucular()
    {
        (string Uretici, string Mpn, string Tip, decimal Bit, decimal Ksps, int Kanal, string Arayuz, string Besleme, string Kilif)[] liste =
        [
            ("Texas Instruments", "ADS1115IDGSR", "ADC", 16m, 0.86m, 4, "I2C", "2.0 - 5.5 V", "VSSOP-10"),
            ("Texas Instruments", "ADS1015IDGSR", "ADC", 12m, 3.3m, 4, "I2C", "2.0 - 5.5 V", "VSSOP-10"),
            ("Texas Instruments", "ADS1256IDBR",  "ADC", 24m, 30m, 8, "SPI", "4.75 - 5.25 V", "SSOP-28"),
            ("Texas Instruments", "ADS8688IPWR",  "ADC", 16m, 500m, 8, "SPI", "4.75 - 5.25 V", "TSSOP-38"),
            ("Texas Instruments", "ADS7828E/250", "ADC", 12m, 50m, 8, "I2C", "2.7 - 5.5 V", "TSSOP-16"),
            ("Texas Instruments", "DAC8552IDGKR", "DAC", 16m, 0m, 2, "SPI", "2.7 - 5.5 V", "VSSOP-8"),
            ("Texas Instruments", "DAC8562SDGSR", "DAC", 16m, 0m, 2, "SPI", "2.7 - 5.5 V", "VSSOP-10"),
            ("Texas Instruments", "PCM5102APWR",  "DAC (Ses)", 32m, 384m, 2, "I2S", "3.3 V", "TSSOP-20"),
            ("Texas Instruments", "ADS131M04IPWR","ADC", 24m, 32m, 4, "SPI", "3.0 - 3.6 V", "TSSOP-20"),

            ("Microchip Technology", "MCP3008-I/P",  "ADC", 10m, 200m, 8, "SPI", "2.7 - 5.5 V", "PDIP-16"),
            ("Microchip Technology", "MCP3008-I/SL", "ADC", 10m, 200m, 8, "SPI", "2.7 - 5.5 V", "SOIC-16"),
            ("Microchip Technology", "MCP3208-CI/P", "ADC", 12m, 100m, 8, "SPI", "2.7 - 5.5 V", "PDIP-16"),
            ("Microchip Technology", "MCP3204-CI/SL","ADC", 12m, 100m, 4, "SPI", "2.7 - 5.5 V", "SOIC-14"),
            ("Microchip Technology", "MCP3421A0T-E/CH", "ADC", 18m, 3.75m, 1, "I2C", "2.7 - 5.5 V", "SOT-23-6"),
            ("Microchip Technology", "MCP4725A0T-E/CH", "DAC", 12m, 0m, 1, "I2C", "2.7 - 5.5 V", "SOT-23-6"),
            ("Microchip Technology", "MCP4921-E/SN", "DAC", 12m, 0m, 1, "SPI", "2.7 - 5.5 V", "SOIC-8"),
            ("Microchip Technology", "MCP4922-E/SL", "DAC", 12m, 0m, 2, "SPI", "2.7 - 5.5 V", "SOIC-14"),
            ("Microchip Technology", "MCP4131-103E/P", "Dijital Potansiyometre", 7m, 0m, 1, "SPI", "2.7 - 5.5 V", "PDIP-8"),

            ("Analog Devices", "AD7606BSTZ",   "ADC", 16m, 200m, 8, "SPI / Paralel", "4.75 - 5.25 V", "LQFP-64"),
            ("Analog Devices", "AD7124-8BCPZ", "ADC", 24m, 19.2m, 8, "SPI", "2.7 - 3.6 V", "LFCSP-32"),
            ("Analog Devices", "AD5940BCBZ-RL","ADC / Analog Ön Uç", 16m, 800m, 2, "SPI", "2.8 - 3.6 V", "WLCSP-56"),
            ("Analog Devices", "AD5693RBRMZ",  "DAC", 16m, 0m, 1, "I2C", "2.7 - 5.5 V", "MSOP-10"),
            ("Analog Devices", "AD5310BRTZ-REEL7", "DAC", 10m, 0m, 1, "SPI", "2.7 - 5.5 V", "SOT-23-6"),
            ("Analog Devices", "AD9833BRMZ",   "DDS Sinyal Üreteci", 10m, 25_000m, 1, "SPI", "2.3 - 5.5 V", "MSOP-10"),
            ("Analog Devices", "AD8232ACPZ-R7","Biyopotansiyel Analog Ön Uç", 0m, 0m, 1, "Analog", "2.0 - 3.5 V", "LFCSP-20"),

            ("STMicroelectronics", "TSC1641IST", "ADC (Akım/Voltaj)", 16m, 1m, 1, "I2C", "2.7 - 5.5 V", "TSSOP-14"),
            ("NXP Semiconductors", "PCF8591T/2,518", "ADC / DAC", 8m, 11m, 4, "I2C", "2.5 - 6.0 V", "SOIC-16"),
            ("Maxim Integrated", "MAX11645EUA+", "ADC", 12m, 94.4m, 2, "I2C", "2.7 - 3.6 V", "MSOP-8"),
            ("Maxim Integrated", "MAX5216GUA+",  "DAC", 16m, 0m, 1, "SPI", "2.7 - 5.5 V", "MSOP-8")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("sensor_tipi", x.Tip),
                new("kanal_sayisi", x.Kanal.ToString(), x.Kanal),
                new("arayuz", x.Arayuz),
                new("besleme_voltaji", x.Besleme),
                new("kilif", x.Kilif)
            };

            if (x.Bit > 0m)
                ozellikler.Insert(1, new ParcaOzelligi("cozunurluk", $"{ParcaKodlama.AnlamliBasamak(x.Bit, 3)} Bit", x.Bit));

            if (x.Ksps > 0m)
                ozellikler.Insert(2, new ParcaOzelligi("ornekleme_hizi", $"{ParcaKodlama.AnlamliBasamak(x.Ksps, 6)} kSPS", x.Ksps));

            var bitYazi = x.Bit > 0m ? $"{ParcaKodlama.AnlamliBasamak(x.Bit, 3)}BIT " : "";

            yield return new HamParca(
                "veri-donusturucular", x.Uretici, x.Mpn,
                $"IC {x.Tip.ToUpperInvariant()} {bitYazi}{x.Kanal}CH {x.Arayuz} {x.Kilif}",
                x.Kilif.Contains("DIP", StringComparison.Ordinal) ? MontajTipi.Tht : MontajTipi.Smt,
                ozellikler);
        }
    }

    // -----------------------------------------------------------------------
    // Arayüz entegreleri
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> ArayuzEntegreleri()
    {
        (string Uretici, string Mpn, string Protokol, int Kanal, decimal Hiz, string Besleme, string Izolasyon, string Kilif)[] liste =
        [
            ("Texas Instruments", "MAX232IDR",     "RS-232", 2, 0.12m, "4.5 - 5.5 V", "İzolesiz", "SOIC-16"),
            ("Texas Instruments", "MAX3232IDR",    "RS-232", 2, 0.25m, "3.0 - 5.5 V", "İzolesiz", "SOIC-16"),
            ("Texas Instruments", "MAX3232CPWR",   "RS-232", 2, 0.25m, "3.0 - 5.5 V", "İzolesiz", "TSSOP-16"),
            ("Texas Instruments", "SN65HVD230DR",  "CAN", 1, 1m, "3.0 - 3.6 V", "İzolesiz", "SOIC-8"),
            ("Texas Instruments", "SN65HVD232DR",  "CAN", 1, 1m, "3.0 - 3.6 V", "İzolesiz", "SOIC-8"),
            ("Texas Instruments", "SN65HVD251DR",  "CAN", 1, 1m, "4.5 - 5.5 V", "İzolesiz", "SOIC-8"),
            ("Texas Instruments", "SN65HVD75DR",   "RS-485", 1, 50m, "3.0 - 3.6 V", "İzolesiz", "SOIC-8"),
            ("Texas Instruments", "SN75176BDR",    "RS-485", 1, 10m, "4.75 - 5.25 V", "İzolesiz", "SOIC-8"),
            ("Texas Instruments", "ISO1050DUBR",   "CAN", 1, 1m, "3.0 - 5.5 V", "5000 Vrms Galvanik", "SOP-8"),
            ("Texas Instruments", "ISO7721DR",     "Dijital İzolatör", 2, 100m, "2.25 - 5.5 V", "5000 Vrms Galvanik", "SOIC-8"),
            ("Texas Instruments", "TCA9548APWR",   "I2C Multiplexer", 8, 0.4m, "1.65 - 5.5 V", "İzolesiz", "TSSOP-24"),
            ("Texas Instruments", "PCA9306DCUR",   "I2C Seviye Çevirici", 2, 0.4m, "1.2 - 5.5 V", "İzolesiz", "VSSOP-8"),
            ("Texas Instruments", "TXS0108EPWR",   "Seviye Çevirici", 8, 110m, "1.2 - 3.6 V", "İzolesiz", "TSSOP-20"),
            ("Texas Instruments", "TXB0104PWR",    "Seviye Çevirici", 4, 100m, "1.2 - 3.6 V", "İzolesiz", "TSSOP-14"),

            ("Analog Devices", "ADM3202ARNZ",  "RS-232", 2, 0.46m, "3.0 - 5.5 V", "İzolesiz", "SOIC-16"),
            ("Analog Devices", "ADM2587EBRWZ", "RS-485", 1, 0.5m, "3.0 - 5.5 V", "2500 Vrms Galvanik", "SOIC-20"),
            ("Analog Devices", "ADUM1201ARZ",  "Dijital İzolatör", 2, 1m, "2.7 - 5.5 V", "2500 Vrms Galvanik", "SOIC-8"),
            ("Analog Devices", "ADUM1250ARZ",  "I2C İzolatör", 2, 1m, "3.0 - 5.5 V", "2500 Vrms Galvanik", "SOIC-8"),

            ("Maxim Integrated", "MAX485CSA+",  "RS-485", 1, 2.5m, "4.75 - 5.25 V", "İzolesiz", "SOIC-8"),
            ("Maxim Integrated", "MAX3485CSA+", "RS-485", 1, 10m, "3.0 - 3.6 V", "İzolesiz", "SOIC-8"),
            ("Maxim Integrated", "MAX3078EASA+","RS-485", 1, 16m, "3.0 - 3.6 V", "İzolesiz", "SOIC-8"),

            ("Microchip Technology", "MCP2515-I/SO",  "CAN Kontrolcü", 1, 1m, "2.7 - 5.5 V", "İzolesiz", "SOIC-18"),
            ("Microchip Technology", "MCP2515-I/P",   "CAN Kontrolcü", 1, 1m, "2.7 - 5.5 V", "İzolesiz", "PDIP-18"),
            ("Microchip Technology", "MCP2551-I/SN",  "CAN", 1, 1m, "4.5 - 5.5 V", "İzolesiz", "SOIC-8"),
            ("Microchip Technology", "MCP2562-E/SN",  "CAN", 1, 1m, "4.5 - 5.5 V", "İzolesiz", "SOIC-8"),
            ("Microchip Technology", "MCP23017-E/SP", "I2C GPIO Genişletici", 16, 1.7m, "1.8 - 5.5 V", "İzolesiz", "SPDIP-28"),
            ("Microchip Technology", "MCP23017-E/SO", "I2C GPIO Genişletici", 16, 1.7m, "1.8 - 5.5 V", "İzolesiz", "SOIC-28"),
            ("Microchip Technology", "MCP23S17-E/SO", "SPI GPIO Genişletici", 16, 10m, "1.8 - 5.5 V", "İzolesiz", "SOIC-28"),

            ("NXP Semiconductors", "PCF8574T/3,518",  "I2C GPIO Genişletici", 8, 0.1m, "2.5 - 6.0 V", "İzolesiz", "SOIC-16"),
            ("NXP Semiconductors", "PCF8574AT/3,518", "I2C GPIO Genişletici", 8, 0.1m, "2.5 - 6.0 V", "İzolesiz", "SOIC-16"),
            ("NXP Semiconductors", "TJA1050T/CM,118", "CAN", 1, 1m, "4.75 - 5.25 V", "İzolesiz", "SOIC-8"),
            ("NXP Semiconductors", "TJA1051T/3,118",  "CAN", 1, 5m, "4.75 - 5.25 V", "İzolesiz", "SOIC-8"),

            ("FTDI", "FT232RL-REEL",   "USB - UART", 1, 3m, "3.3 - 5.25 V", "İzolesiz", "SSOP-28"),
            ("FTDI", "FT232RQ-REEL",   "USB - UART", 1, 3m, "3.3 - 5.25 V", "İzolesiz", "QFN-32"),
            ("FTDI", "FT2232HL-REEL",  "USB - UART / FIFO", 2, 12m, "3.0 - 3.6 V", "İzolesiz", "LQFP-64"),
            ("FTDI", "FT230XS-R",      "USB - UART", 1, 3m, "3.0 - 5.5 V", "İzolesiz", "SSOP-16"),
            ("WCH", "CH340G",          "USB - UART", 1, 2m, "3.3 - 5.0 V", "İzolesiz", "SOP-16"),
            ("WCH", "CH340C",          "USB - UART", 1, 2m, "3.3 - 5.0 V", "İzolesiz", "SOP-16"),
            ("WCH", "CH9102F",         "USB - UART", 1, 4m, "3.3 - 5.0 V", "İzolesiz", "QFN-24"),
            ("Silicon Labs", "CP2102-GMR",   "USB - UART", 1, 1m, "3.0 - 3.6 V", "İzolesiz", "QFN-28"),
            ("Silicon Labs", "CP2104-F03-GM","USB - UART", 1, 2m, "3.0 - 3.6 V", "İzolesiz", "QFN-24"),
            ("Silicon Labs", "CP2112-F02-GM","USB - I2C", 1, 0.4m, "3.0 - 3.6 V", "İzolesiz", "QFN-24")
        ];

        return liste.Select(x => new HamParca(
            "arayuz-entegreleri", x.Uretici, x.Mpn,
            $"IC ARAYÜZ {x.Protokol} {ParcaKodlama.AnlamliBasamak(x.Hiz, 4)}Mbps {x.Kilif}",
            x.Kilif.Contains("DIP", StringComparison.Ordinal) ? MontajTipi.Tht : MontajTipi.Smt,
            [
                new("protokol", x.Protokol),
                new("kanal_sayisi", x.Kanal.ToString(), x.Kanal),
                new("hiz", $"{ParcaKodlama.AnlamliBasamak(x.Hiz, 4)} Mbps", x.Hiz),
                new("besleme_voltaji", x.Besleme),
                new("izolasyon", x.Izolasyon),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", EndustriyelSicaklik)
            ]));
    }

    // -----------------------------------------------------------------------
    // Saat ve zamanlayıcılar
    // -----------------------------------------------------------------------

    private static IEnumerable<HamParca> SaatVeZamanlayicilar()
    {
        (string Uretici, string Mpn, string Tip, string Arayuz, string Dogruluk, string Besleme, string Kilif)[] liste =
        [
            ("Analog Devices", "DS3231SN#",     "Gerçek Zamanlı Saat (TCXO)", "I2C", "±2 ppm (0 ~ +40 °C)", "2.3 - 5.5 V", "SOIC-16"),
            ("Analog Devices", "DS3231M+",      "Gerçek Zamanlı Saat (MEMS)", "I2C", "±5 ppm", "2.3 - 5.5 V", "SOIC-8"),
            ("Analog Devices", "DS1307Z+",      "Gerçek Zamanlı Saat", "I2C", "Harici kristale bağlı", "4.5 - 5.5 V", "SOIC-8"),
            ("Analog Devices", "DS1302S+",      "Gerçek Zamanlı Saat", "3 Telli Seri", "Harici kristale bağlı", "2.0 - 5.5 V", "SOIC-8"),
            ("Analog Devices", "DS1338Z-33+",   "Gerçek Zamanlı Saat", "I2C", "Harici kristale bağlı", "3.0 - 3.6 V", "SOIC-8"),
            ("NXP Semiconductors", "PCF8563T/5,518", "Gerçek Zamanlı Saat", "I2C", "Harici kristale bağlı", "1.0 - 5.5 V", "SOIC-8"),
            ("NXP Semiconductors", "PCF8523T/1,118", "Gerçek Zamanlı Saat", "I2C", "±20 ppm ayarlanabilir", "1.0 - 5.5 V", "SOIC-8"),
            ("NXP Semiconductors", "PCF2129AT/2,518","Gerçek Zamanlı Saat (TCXO)", "I2C / SPI", "±3 ppm", "1.8 - 4.2 V", "SOIC-16"),
            ("Microchip Technology", "MCP7940N-I/SN", "Gerçek Zamanlı Saat", "I2C", "Dijital düzeltmeli", "1.8 - 5.5 V", "SOIC-8"),
            ("Microchip Technology", "MCP79410-I/SN", "Gerçek Zamanlı Saat + EEPROM", "I2C", "Dijital düzeltmeli", "1.8 - 5.5 V", "SOIC-8"),
            ("Epson", "RX8900CE UB",            "Gerçek Zamanlı Saat (DTCXO)", "I2C", "±5 ppm", "2.5 - 5.5 V", "SMD 3.2 x 2.5 mm"),
            ("Epson", "RX8025T UB",             "Gerçek Zamanlı Saat (DTCXO)", "I2C", "±5 ppm", "2.5 - 5.5 V", "SMD 5.0 x 3.2 mm"),

            ("Texas Instruments", "NE555P",     "Zamanlayıcı", "Analog", "—", "4.5 - 16 V", "PDIP-8"),
            ("Texas Instruments", "NE555DR",    "Zamanlayıcı", "Analog", "—", "4.5 - 16 V", "SOIC-8"),
            ("Texas Instruments", "NE556DR",    "İkili Zamanlayıcı", "Analog", "—", "4.5 - 16 V", "SOIC-14"),
            ("Texas Instruments", "TLC555CP",   "Zamanlayıcı (CMOS)", "Analog", "—", "2.0 - 15 V", "PDIP-8"),
            ("Texas Instruments", "TLC555CDR",  "Zamanlayıcı (CMOS)", "Analog", "—", "2.0 - 15 V", "SOIC-8"),
            ("Texas Instruments", "LMC555CMM/NOPB", "Zamanlayıcı (CMOS)", "Analog", "—", "1.5 - 15 V", "VSSOP-8"),
            ("STMicroelectronics", "NE555N",    "Zamanlayıcı", "Analog", "—", "4.5 - 16 V", "PDIP-8"),
            ("onsemi", "NE555DR2G",             "Zamanlayıcı", "Analog", "—", "4.5 - 16 V", "SOIC-8"),
            ("Diodes Incorporated", "AP7377-33W5-7", "Watchdog Zamanlayıcı", "Analog", "—", "1.6 - 6.0 V", "SOT-25"),

            ("Texas Instruments", "CDCE913PWR", "Programlanabilir Saat Üreteci", "I2C", "±50 ppm", "3.0 - 3.6 V", "TSSOP-20"),
            ("Texas Instruments", "CDCLVC1102PWR", "Saat Tamponu", "—", "—", "2.3 - 3.6 V", "TSSOP-8"),
            ("Silicon Labs", "SI5351A-B-GTR",   "Programlanabilir Saat Üreteci", "I2C", "±50 ppm", "2.5 - 3.6 V", "MSOP-10"),
            ("Microchip Technology", "MCP1416T-E/OT", "Saat / Gate Sürücü", "—", "—", "4.5 - 18 V", "SOT-23-5")
        ];

        return liste.Select(x => new HamParca(
            "saat-zamanlayicilar", x.Uretici, x.Mpn,
            $"IC {x.Tip.ToUpperInvariant()} {x.Arayuz} {x.Kilif}",
            x.Kilif.Contains("DIP", StringComparison.Ordinal) ? MontajTipi.Tht : MontajTipi.Smt,
            [
                new("sensor_tipi", x.Tip),
                new("arayuz", x.Arayuz),
                new("dogruluk", x.Dogruluk),
                new("besleme_voltaji", x.Besleme),
                new("kilif", x.Kilif),
                new("calisma_sicakligi", EndustriyelSicaklik)
            ]));
    }
}
