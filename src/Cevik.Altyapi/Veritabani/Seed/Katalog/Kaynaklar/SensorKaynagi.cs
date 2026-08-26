using Cevik.Alan.Ortak;

namespace Cevik.Altyapi.Veritabani.Seed.Katalog.Kaynaklar;

/// <summary>
/// Sensörler — sıcaklık/nem, basınç, hareket, optik, akım, gaz ve termistörler.
///
/// Sensör parça numaraları küratörlüdür. Tek istisna Vishay NTCLE100E3 termistör
/// serisidir: sipariş kodundaki üç hane EIA direnç kodudur (NTCLE100E3<b>103</b>JB0
/// = 10 kΩ) ve seri bu kademelerin tamamını kapsar.
/// </summary>
public static class SensorKaynagi
{
    public static IEnumerable<HamParca> Uret()
    {
        foreach (var p in SicaklikNem()) yield return p;
        foreach (var p in Basinc()) yield return p;
        foreach (var p in HareketImu()) yield return p;
        foreach (var p in OptikYakinlik()) yield return p;
        foreach (var p in AkimSensorleri()) yield return p;
        foreach (var p in GazHavaKalitesi()) yield return p;
        foreach (var p in Termistorler()) yield return p;
    }

    private static IEnumerable<HamParca> SicaklikNem()
    {
        (string Uretici, string Mpn, string Tip, string Aralik, string Dogruluk, string Arayuz, string Besleme, string Kilif)[] liste =
        [
            ("Sensirion", "SHT31-DIS-B2.5KS", "Sıcaklık ve Nem", "-40 ~ +125 °C / %0 - %100 BN", "±0.3 °C / ±%2 BN", "I2C", "2.4 - 5.5 V", "DFN-8"),
            ("Sensirion", "SHT30-DIS-B2.5KS", "Sıcaklık ve Nem", "-40 ~ +125 °C / %0 - %100 BN", "±0.3 °C / ±%3 BN", "I2C", "2.4 - 5.5 V", "DFN-8"),
            ("Sensirion", "SHT35-DIS-B2.5KS", "Sıcaklık ve Nem", "-40 ~ +125 °C / %0 - %100 BN", "±0.2 °C / ±%1.5 BN", "I2C", "2.4 - 5.5 V", "DFN-8"),
            ("Sensirion", "SHT40-AD1B-R2", "Sıcaklık ve Nem", "-40 ~ +125 °C / %0 - %100 BN", "±0.2 °C / ±%1.8 BN", "I2C", "1.08 - 3.6 V", "DFN-4"),
            ("Sensirion", "SHT41-AD1B-R2", "Sıcaklık ve Nem", "-40 ~ +125 °C / %0 - %100 BN", "±0.2 °C / ±%1.8 BN", "I2C", "1.08 - 3.6 V", "DFN-4"),
            ("Sensirion", "SHTC3", "Sıcaklık ve Nem", "-40 ~ +125 °C / %0 - %100 BN", "±0.2 °C / ±%2 BN", "I2C", "1.62 - 3.6 V", "DFN-4"),
            ("Sensirion", "SHT85", "Sıcaklık ve Nem (Pin Tipi)", "-40 ~ +105 °C / %0 - %100 BN", "±0.1 °C / ±%1.5 BN", "I2C", "2.15 - 5.5 V", "4 Pinli Modül"),
            ("Sensirion", "STS31-DIS-B", "Sıcaklık", "-40 ~ +125 °C", "±0.2 °C", "I2C", "2.15 - 5.5 V", "DFN-8"),

            ("Bosch Sensortec", "BME280", "Sıcaklık, Nem ve Basınç", "-40 ~ +85 °C / 300 - 1100 hPa", "±1.0 °C / ±%3 BN", "I2C / SPI", "1.71 - 3.6 V", "LGA-8"),
            ("Bosch Sensortec", "BME680", "Sıcaklık, Nem, Basınç ve VOC", "-40 ~ +85 °C / 300 - 1100 hPa", "±1.0 °C / ±%3 BN", "I2C / SPI", "1.71 - 3.6 V", "LGA-8"),

            ("Analog Devices", "DS18B20+", "Dijital Sıcaklık (1-Wire)", "-55 ~ +125 °C", "±0.5 °C", "1-Wire", "3.0 - 5.5 V", "TO-92"),
            ("Analog Devices", "DS18B20+PAR", "Dijital Sıcaklık (Parazit Beslemeli)", "-55 ~ +125 °C", "±0.5 °C", "1-Wire", "3.0 - 5.5 V", "TO-92"),
            ("Analog Devices", "DS18B20U+", "Dijital Sıcaklık (1-Wire)", "-55 ~ +125 °C", "±0.5 °C", "1-Wire", "3.0 - 5.5 V", "µSOP-8"),
            ("Analog Devices", "DS1621S+", "Dijital Termometre ve Termostat", "-55 ~ +125 °C", "±0.5 °C", "I2C", "2.7 - 5.5 V", "SOIC-8"),
            ("Analog Devices", "MAX31855KASA+", "K Tipi Termokupl Arayüzü", "-270 ~ +1372 °C", "±2 °C", "SPI", "3.0 - 3.6 V", "SOIC-8"),
            ("Analog Devices", "MAX31865ATP+", "RTD (PT100 / PT1000) Arayüzü", "-200 ~ +850 °C", "±0.03 °C", "SPI", "3.0 - 3.6 V", "TQFN-20"),
            ("Analog Devices", "MAX6675ISA+", "K Tipi Termokupl Arayüzü", "0 ~ +1024 °C", "±3 °C", "SPI", "3.0 - 5.5 V", "SOIC-8"),
            ("Analog Devices", "TMP36GT9Z", "Analog Sıcaklık", "-40 ~ +125 °C", "±2 °C", "Analog", "2.7 - 5.5 V", "TO-92"),

            ("Texas Instruments", "LM35DZ/NOPB", "Analog Sıcaklık", "0 ~ +100 °C", "±0.5 °C", "Analog", "4 - 30 V", "TO-92"),
            ("Texas Instruments", "LM35CZ/NOPB", "Analog Sıcaklık", "-40 ~ +110 °C", "±0.5 °C", "Analog", "4 - 30 V", "TO-92"),
            ("Texas Instruments", "TMP36GRTZ", "Analog Sıcaklık", "-40 ~ +125 °C", "±2 °C", "Analog", "2.7 - 5.5 V", "SOT-23-5"),
            ("Texas Instruments", "TMP102AIDRLR", "Dijital Sıcaklık", "-40 ~ +125 °C", "±0.5 °C", "I2C", "1.4 - 3.6 V", "SOT-563"),
            ("Texas Instruments", "TMP117AIDRVR", "Yüksek Hassasiyetli Dijital Sıcaklık", "-55 ~ +150 °C", "±0.1 °C", "I2C", "1.8 - 5.5 V", "WSON-6"),
            ("Texas Instruments", "TMP235A2DBZR", "Analog Sıcaklık", "-40 ~ +150 °C", "±1 °C", "Analog", "2.3 - 5.5 V", "SOT-23-3"),
            ("Texas Instruments", "LM75BIMM-3/NOPB", "Dijital Sıcaklık ve Termostat", "-55 ~ +125 °C", "±2 °C", "I2C", "2.8 - 5.5 V", "VSSOP-8"),

            ("Microchip Technology", "MCP9808-E/MS", "Yüksek Hassasiyetli Dijital Sıcaklık", "-40 ~ +125 °C", "±0.25 °C", "I2C", "2.7 - 5.5 V", "MSOP-8"),
            ("Microchip Technology", "MCP9700A-E/TO", "Analog Sıcaklık", "-40 ~ +125 °C", "±1 °C", "Analog", "2.3 - 5.5 V", "TO-92"),
            ("Microchip Technology", "MCP9701A-E/TO", "Analog Sıcaklık", "-40 ~ +125 °C", "±1 °C", "Analog", "3.1 - 5.5 V", "TO-92"),
            ("Microchip Technology", "TC74A0-3.3VAT", "Dijital Sıcaklık", "-40 ~ +125 °C", "±2 °C", "I2C", "2.7 - 5.5 V", "TO-220-5"),
            ("Microchip Technology", "EMC1001-1-ACZL-TR", "Uzaktan Dijital Sıcaklık", "-40 ~ +125 °C", "±1 °C", "I2C", "3.0 - 3.6 V", "SOIC-8"),

            ("NXP Semiconductors", "LM75BD,118", "Dijital Sıcaklık ve Termostat", "-55 ~ +125 °C", "±2 °C", "I2C", "2.8 - 5.5 V", "SOIC-8"),
            ("NXP Semiconductors", "PCT2075TP,147", "Dijital Sıcaklık", "-55 ~ +125 °C", "±1 °C", "I2C", "2.7 - 5.5 V", "TSSOP-8"),
            ("STMicroelectronics", "STTS751-0DP3F", "Dijital Sıcaklık", "-40 ~ +125 °C", "±1 °C", "I2C", "2.25 - 3.6 V", "DFN-6"),
            ("STMicroelectronics", "HTS221TR", "Sıcaklık ve Nem", "-40 ~ +120 °C / %0 - %100 BN", "±0.5 °C / ±%3.5 BN", "I2C / SPI", "1.7 - 3.6 V", "HLGA-6"),

            ("Aosong", "DHT11", "Sıcaklık ve Nem Modülü", "0 ~ +50 °C / %20 - %90 BN", "±2 °C / ±%5 BN", "Tek Telli Seri", "3.0 - 5.5 V", "4 Pinli Modül"),
            ("Aosong", "DHT22", "Sıcaklık ve Nem Modülü", "-40 ~ +80 °C / %0 - %100 BN", "±0.5 °C / ±%2 BN", "Tek Telli Seri", "3.3 - 6.0 V", "4 Pinli Modül"),
            ("Aosong", "AM2320", "Sıcaklık ve Nem Modülü", "-40 ~ +80 °C / %0 - %100 BN", "±0.5 °C / ±%3 BN", "I2C / Tek Telli", "3.1 - 5.5 V", "4 Pinli Modül"),

            ("Melexis", "MLX90614ESF-BAA-000-TU", "Kızılötesi Temassız Sıcaklık", "-70 ~ +380 °C", "±0.5 °C", "I2C / PWM", "4.5 - 5.5 V", "TO-39"),
            ("Melexis", "MLX90632SLD-DCB-000-RE", "Kızılötesi Temassız Sıcaklık", "-20 ~ +200 °C", "±1 °C", "I2C", "1.6 - 3.6 V", "QFN-5"),
            ("Melexis", "MLX90640ESF-BAA-000-TU", "32x24 Termal Kamera Dizisi", "-40 ~ +300 °C", "±1 °C", "I2C", "3.3 V", "SMD-4"),
            ("Honeywell", "HIH6130-021-001", "Sıcaklık ve Nem", "-25 ~ +85 °C / %0 - %100 BN", "±0.5 °C / ±%4 BN", "I2C", "2.3 - 5.5 V", "SOIC-8"),
            ("Honeywell", "HIH8121-021-001", "Sıcaklık ve Nem (Filtreli)", "-40 ~ +100 °C / %0 - %100 BN", "±0.5 °C / ±%2 BN", "I2C", "2.3 - 5.5 V", "SOIC-8")
        ];

        return liste.Select(x => Sensor("sicaklik-nem-sensorleri", x.Uretici, x.Mpn, x.Tip, x.Aralik, x.Dogruluk, x.Arayuz, x.Besleme, x.Kilif));
    }

    private static IEnumerable<HamParca> Basinc()
    {
        (string Uretici, string Mpn, string Tip, string Aralik, string Dogruluk, string Arayuz, string Besleme, string Kilif)[] liste =
        [
            ("Bosch Sensortec", "BMP280", "Barometrik Basınç", "300 - 1100 hPa", "±1 hPa", "I2C / SPI", "1.71 - 3.6 V", "LGA-8"),
            ("Bosch Sensortec", "BMP388", "Barometrik Basınç", "300 - 1250 hPa", "±0.5 hPa", "I2C / SPI", "1.65 - 3.6 V", "LGA-10"),
            ("Bosch Sensortec", "BMP390", "Barometrik Basınç", "300 - 1250 hPa", "±0.5 hPa", "I2C / SPI", "1.65 - 3.6 V", "LGA-10"),
            ("Bosch Sensortec", "BMP581", "Barometrik Basınç", "300 - 1250 hPa", "±0.3 hPa", "I2C / SPI", "1.7 - 3.6 V", "LGA-10"),

            ("TE Connectivity", "MS561101BA03-50", "Barometrik Basınç", "10 - 1200 mbar", "±1.5 mbar", "I2C / SPI", "1.8 - 3.6 V", "QFN-8"),
            ("TE Connectivity", "MS580314BA01-50", "Su Altı Basınç", "0 - 14 bar", "±20 mbar", "I2C / SPI", "1.8 - 3.6 V", "QFN-8"),
            ("TE Connectivity", "MS4525DO-DS5AI001DP", "Fark Basıncı", "0 - 1 psi", "±%0.25", "I2C", "3.3 - 5.0 V", "Endüstriyel Gövde"),
            ("TE Connectivity", "1620-101G-3L", "Yüksek Basınç Transdüseri", "0 - 100 bar", "±%0.25", "Analog", "5 - 30 V", "Endüstriyel Gövde"),

            ("Honeywell", "ABPDANN060PGAA5", "Kalibreli Basınç (Gauge)", "0 - 60 psi", "±%0.25", "I2C", "3.3 V", "SIP Gövde"),
            ("Honeywell", "ABPDANT001PG2A5", "Kalibreli Basınç (Gauge)", "0 - 1 psi", "±%0.25", "I2C", "3.3 V", "SIP Gövde"),
            ("Honeywell", "MPRLS0025PA00001A", "Basınç (Mutlak)", "0 - 25 psi", "±%0.25", "I2C", "3.3 V", "SMD Gövde"),
            ("Honeywell", "SSCDANN150PGAA5", "Kalibreli Basınç (Gauge)", "0 - 150 psi", "±%0.25", "I2C", "3.3 V", "SIP Gövde"),
            ("Honeywell", "26PCAFA6D", "Fark Basıncı (Analog)", "0 - 5 psi", "±%0.5", "Analog", "10 V", "DIP Gövde"),
            ("Honeywell", "HSCDRRN100MDSA3", "Fark Basıncı", "±100 mbar", "±%0.25", "SPI", "3.3 V", "DIP Gövde"),

            ("NXP Semiconductors", "MPX5700AP", "Basınç (Mutlak)", "0 - 700 kPa", "±%2.5", "Analog", "4.75 - 5.25 V", "SIP Gövde"),
            ("NXP Semiconductors", "MPX4250AP", "Basınç (Mutlak)", "20 - 250 kPa", "±%1.5", "Analog", "4.85 - 5.35 V", "SIP Gövde"),
            ("NXP Semiconductors", "MPXV7002DP", "Fark Basıncı", "-2 ~ +2 kPa", "±%2.5", "Analog", "4.75 - 5.25 V", "SIP Gövde"),
            ("NXP Semiconductors", "MPXH6400A6U", "Basınç (Mutlak)", "20 - 400 kPa", "±%1.5", "Analog", "4.75 - 5.25 V", "SSOP-8"),
            ("NXP Semiconductors", "MPL3115A2R1", "Barometrik Basınç ve Yükseklik", "20 - 110 kPa", "±0.4 kPa", "I2C", "1.95 - 3.6 V", "LGA-8"),

            ("Sensirion", "SDP810-500PA", "Fark Basıncı", "±500 Pa", "±%3", "I2C", "3.0 - 3.6 V", "Modül"),
            ("Sensirion", "SDP31-500PA", "Fark Basıncı", "±500 Pa", "±%3", "I2C", "3.0 - 3.6 V", "DFN-8"),
            ("Sensata", "P51-100-A-A-I36-4V5-000-000", "Endüstriyel Basınç Transdüseri", "0 - 100 psi", "±%0.25", "Analog", "5 V", "Endüstriyel Gövde"),
            ("STMicroelectronics", "LPS22HBTR", "Barometrik Basınç", "260 - 1260 hPa", "±0.1 hPa", "I2C / SPI", "1.7 - 3.6 V", "HLGA-10"),
            ("STMicroelectronics", "LPS25HBTR", "Barometrik Basınç", "260 - 1260 hPa", "±0.2 hPa", "I2C / SPI", "1.7 - 3.6 V", "HLGA-10")
        ];

        return liste.Select(x => Sensor("basinc-sensorleri", x.Uretici, x.Mpn, x.Tip, x.Aralik, x.Dogruluk, x.Arayuz, x.Besleme, x.Kilif));
    }

    private static IEnumerable<HamParca> HareketImu()
    {
        (string Uretici, string Mpn, string Tip, string Aralik, int Eksen, string Arayuz, string Besleme, string Kilif)[] liste =
        [
            ("TDK InvenSense", "MPU-6050", "6 Eksenli IMU (İvme + Jiroskop)", "±16 g / ±2000 °/s", 6, "I2C", "2.375 - 3.46 V", "QFN-24"),
            ("TDK InvenSense", "MPU-6500", "6 Eksenli IMU (İvme + Jiroskop)", "±16 g / ±2000 °/s", 6, "I2C / SPI", "1.71 - 3.6 V", "QFN-24"),
            ("TDK InvenSense", "MPU-9250", "9 Eksenli IMU (İvme + Jiro + Manyeto)", "±16 g / ±2000 °/s", 9, "I2C / SPI", "2.4 - 3.6 V", "QFN-24"),
            ("TDK InvenSense", "ICM-20948", "9 Eksenli IMU", "±16 g / ±2000 °/s", 9, "I2C / SPI", "1.71 - 3.6 V", "QFN-24"),
            ("TDK InvenSense", "ICM-42688-P", "6 Eksenli IMU (Düşük Gürültülü)", "±16 g / ±2000 °/s", 6, "I2C / SPI", "1.71 - 3.6 V", "LGA-14"),
            ("TDK InvenSense", "ICM-20602", "6 Eksenli IMU", "±16 g / ±2000 °/s", 6, "I2C / SPI", "1.71 - 3.45 V", "LGA-16"),

            ("Bosch Sensortec", "BMI160", "6 Eksenli IMU", "±16 g / ±2000 °/s", 6, "I2C / SPI", "1.71 - 3.6 V", "LGA-14"),
            ("Bosch Sensortec", "BMI270", "6 Eksenli IMU (Akıllı)", "±16 g / ±2000 °/s", 6, "I2C / SPI", "1.71 - 3.6 V", "LGA-14"),
            ("Bosch Sensortec", "BNO055", "9 Eksenli Füzyon IMU", "±16 g / ±2000 °/s", 9, "I2C / UART", "2.4 - 3.6 V", "LGA-28"),
            ("Bosch Sensortec", "BNO085", "9 Eksenli Füzyon IMU", "±16 g / ±2000 °/s", 9, "I2C / SPI / UART", "1.65 - 3.6 V", "LGA-28"),
            ("Bosch Sensortec", "BMA400", "3 Eksenli İvmeölçer (Ultra Düşük Güç)", "±16 g", 3, "I2C / SPI", "1.71 - 3.6 V", "LGA-12"),
            ("Bosch Sensortec", "BMM150", "3 Eksenli Manyetometre", "±1300 µT", 3, "I2C / SPI", "1.62 - 3.6 V", "LGA-12"),

            ("STMicroelectronics", "LSM6DSOXTR", "6 Eksenli IMU (Makine Öğrenmeli)", "±16 g / ±2000 °/s", 6, "I2C / SPI", "1.71 - 3.6 V", "LGA-14"),
            ("STMicroelectronics", "LSM6DS3TR-C", "6 Eksenli IMU", "±16 g / ±2000 °/s", 6, "I2C / SPI", "1.71 - 3.6 V", "LGA-14"),
            ("STMicroelectronics", "LIS3DHTR", "3 Eksenli İvmeölçer", "±16 g", 3, "I2C / SPI", "1.71 - 3.6 V", "LGA-16"),
            ("STMicroelectronics", "LIS2DW12TR", "3 Eksenli İvmeölçer (Düşük Güç)", "±16 g", 3, "I2C / SPI", "1.62 - 3.6 V", "LGA-12"),
            ("STMicroelectronics", "LIS3MDLTR", "3 Eksenli Manyetometre", "±16 gauss", 3, "I2C / SPI", "1.9 - 3.6 V", "LGA-12"),
            ("STMicroelectronics", "LSM303AGRTR", "6 Eksenli İvme + Manyetometre", "±16 g / ±50 gauss", 6, "I2C / SPI", "1.71 - 3.6 V", "LGA-14"),
            ("STMicroelectronics", "L3GD20HTR", "3 Eksenli Jiroskop", "±2000 °/s", 3, "I2C / SPI", "2.2 - 3.6 V", "LGA-16"),

            ("Analog Devices", "ADXL345BCCZ", "3 Eksenli İvmeölçer", "±16 g", 3, "I2C / SPI", "2.0 - 3.6 V", "LGA-14"),
            ("Analog Devices", "ADXL343BCCZ-RL7", "3 Eksenli İvmeölçer", "±16 g", 3, "I2C / SPI", "2.0 - 3.6 V", "LGA-14"),
            ("Analog Devices", "ADXL335BCPZ-RL7", "3 Eksenli Analog İvmeölçer", "±3 g", 3, "Analog", "1.8 - 3.6 V", "LFCSP-16"),
            ("Analog Devices", "ADXL355BEZ", "3 Eksenli Düşük Gürültülü İvmeölçer", "±8 g", 3, "I2C / SPI", "2.25 - 3.6 V", "LCC-14"),
            ("Analog Devices", "ADIS16470AMLZ", "6 Eksenli Endüstriyel IMU", "±40 g / ±2000 °/s", 6, "SPI", "3.0 - 3.6 V", "Modül"),
            ("Melexis", "MLX90393SLW-ABA-011-RE", "3 Eksenli Manyetometre", "±50 mT", 3, "I2C / SPI", "2.2 - 3.6 V", "QFN-16"),
            ("Melexis", "US5881LUA", "Hall Etkili Anahtar", "±80 gauss", 1, "Dijital Çıkış", "3.5 - 24 V", "TO-92"),
            ("Honeywell", "SS49E", "Doğrusal Hall Sensörü", "±1000 gauss", 1, "Analog", "2.7 - 6.5 V", "TO-92")
        ];

        return liste.Select(x => new HamParca(
            "hareket-imu-sensorleri", x.Uretici, x.Mpn,
            $"SENSÖR {x.Tip} {x.Aralik} {x.Arayuz} {x.Kilif}",
            MontajTipi.Smt,
            [
                new("sensor_tipi", x.Tip),
                new("olcum_araligi", x.Aralik),
                new("kanal_sayisi", x.Eksen.ToString(), x.Eksen),
                new("arayuz", x.Arayuz),
                new("besleme_voltaji", x.Besleme),
                new("kilif", x.Kilif)
            ]));
    }

    private static IEnumerable<HamParca> OptikYakinlik()
    {
        (string Uretici, string Mpn, string Tip, string Aralik, decimal Nm, string Arayuz, string Besleme, string Kilif)[] liste =
        [
            ("STMicroelectronics", "VL53L0CXV0DH/1", "Lazer Mesafe Sensörü (ToF)", "30 - 2000 mm", 940m, "I2C", "2.6 - 3.5 V", "Optik LGA-12"),
            ("STMicroelectronics", "VL53L1CXV0FY/1", "Lazer Mesafe Sensörü (ToF)", "40 - 4000 mm", 940m, "I2C", "2.6 - 3.5 V", "Optik LGA-12"),
            ("STMicroelectronics", "VL6180X", "Yakınlık ve Ortam Işığı (ToF)", "0 - 100 mm", 850m, "I2C", "2.6 - 3.0 V", "Optik LGA-12"),
            ("STMicroelectronics", "VL53L4CXV0DH/1", "Lazer Mesafe Sensörü (ToF)", "1 - 6000 mm", 940m, "I2C", "2.6 - 3.5 V", "Optik LGA-12"),

            ("ams-OSRAM", "TSL2591FN", "Ortam Işığı Sensörü", "0 - 88000 lux", 0m, "I2C", "2.7 - 3.6 V", "DFN-6"),
            ("ams-OSRAM", "TSL2561FN", "Ortam Işığı Sensörü", "0.1 - 40000 lux", 0m, "I2C", "2.7 - 3.6 V", "DFN-6"),
            ("ams-OSRAM", "TSL25911FN", "Ortam Işığı Sensörü", "0 - 88000 lux", 0m, "I2C", "2.7 - 3.6 V", "DFN-6"),
            ("ams-OSRAM", "AS7341-DLGM", "11 Kanallı Spektral Sensör", "350 - 1000 nm", 0m, "I2C", "1.7 - 2.0 V", "OLGA-8"),
            ("ams-OSRAM", "TCS34725FN", "RGB Renk Sensörü", "0 - 100 lux", 0m, "I2C", "2.7 - 3.6 V", "DFN-6"),
            ("ams-OSRAM", "TMD2635", "Yakınlık Sensörü (Minyatür)", "0 - 100 mm", 940m, "I2C", "1.7 - 3.6 V", "OLGA-8"),

            ("Vishay Semiconductor", "VCNL4040M3OE", "Yakınlık ve Ortam Işığı", "0 - 200 mm", 940m, "I2C", "2.5 - 3.6 V", "Optik LGA-8"),
            ("Vishay Semiconductor", "VCNL4200", "Yakınlık ve Ortam Işığı (Uzun Menzil)", "0 - 1500 mm", 940m, "I2C", "2.5 - 3.6 V", "Optik LGA-10"),
            ("Vishay Semiconductor", "VEML7700-TT", "Ortam Işığı Sensörü", "0 - 120000 lux", 0m, "I2C", "2.5 - 3.6 V", "OPLGA-6"),
            ("Vishay Semiconductor", "VEML6070", "UV Işık Sensörü", "UV Index 0 - 15", 355m, "I2C", "2.7 - 5.5 V", "OPLGA-4"),

            ("Broadcom", "APDS-9960", "Jest, Yakınlık, Renk ve Işık", "0 - 100 mm", 950m, "I2C", "2.4 - 3.6 V", "Optik Modül"),
            ("Broadcom", "APDS-9930", "Yakınlık ve Ortam Işığı", "0 - 100 mm", 950m, "I2C", "2.4 - 3.6 V", "Optik Modül"),
            ("Broadcom", "AEDR-8300-1K2", "Optik Enkoder (Yansımalı)", "150 - 300 LPI", 700m, "Dijital Çıkış", "3.0 - 5.5 V", "SMD Modül"),
            ("Broadcom", "HEDS-9040#T00", "Optik Enkoder Modülü", "500 CPR", 700m, "Dijital Çıkış", "4.5 - 5.5 V", "Modül"),

            ("Sharp", "GP2Y0A21YK0F", "Kızılötesi Mesafe Sensörü", "100 - 800 mm", 870m, "Analog", "4.5 - 5.5 V", "Modül"),
            ("Sharp", "GP2Y0A02YK0F", "Kızılötesi Mesafe Sensörü", "200 - 1500 mm", 870m, "Analog", "4.5 - 5.5 V", "Modül"),
            ("Sharp", "GP2Y0A41SK0F", "Kızılötesi Mesafe Sensörü", "40 - 300 mm", 870m, "Analog", "4.5 - 5.5 V", "Modül"),
            ("Sharp", "GP2Y1010AU0F", "Optik Toz Sensörü", "0 - 0.5 mg/m³", 870m, "Analog", "4.5 - 5.5 V", "Modül"),

            ("Lite-On", "LTR-329ALS-01", "Ortam Işığı Sensörü", "0.01 - 64000 lux", 0m, "I2C", "2.4 - 3.6 V", "ChipLED-6"),
            ("Lite-On", "LTR-559ALS-01", "Yakınlık ve Ortam Işığı", "0 - 100 mm", 940m, "I2C", "2.4 - 3.6 V", "Optik LGA-7"),
            ("Everlight", "ALS-PT19-315C/L177/TR8", "Analog Ortam Işığı Sensörü", "0 - 1000 lux", 0m, "Analog", "2.5 - 5.5 V", "0805"),
            ("Vishay Semiconductor", "TEPT4400", "Ortam Işığı Fototransistörü", "0 - 1000 lux", 570m, "Analog", "—", "5 mm")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("sensor_tipi", x.Tip),
                new("olcum_araligi", x.Aralik),
                new("arayuz", x.Arayuz),
                new("kilif", x.Kilif)
            };

            if (x.Nm > 0m)
                ozellikler.Insert(2, new ParcaOzelligi("dalga_boyu", $"{ParcaKodlama.AnlamliBasamak(x.Nm, 4)} nm", x.Nm));

            if (x.Besleme != "—")
                ozellikler.Add(new ParcaOzelligi("besleme_voltaji", x.Besleme));

            yield return new HamParca(
                "optik-yakinlik-sensorleri", x.Uretici, x.Mpn,
                $"SENSÖR {x.Tip} {x.Aralik} {x.Arayuz}",
                MontajTipi.Smt, ozellikler);
        }
    }

    private static IEnumerable<HamParca> AkimSensorleri()
    {
        (string Uretici, string Mpn, string Tip, string Aralik, decimal Izolasyon, string Arayuz, string Besleme, string Kilif)[] liste =
        [
            ("Allegro MicroSystems", "ACS712ELCTR-05B-T", "Hall Etkili Akım Sensörü", "±5 A", 2_100m, "Analog", "4.5 - 5.5 V", "SOIC-8"),
            ("Allegro MicroSystems", "ACS712ELCTR-20A-T", "Hall Etkili Akım Sensörü", "±20 A", 2_100m, "Analog", "4.5 - 5.5 V", "SOIC-8"),
            ("Allegro MicroSystems", "ACS712ELCTR-30A-T", "Hall Etkili Akım Sensörü", "±30 A", 2_100m, "Analog", "4.5 - 5.5 V", "SOIC-8"),
            ("Allegro MicroSystems", "ACS758LCB-050B-PFF-T", "Hall Etkili Akım Sensörü", "±50 A", 3_000m, "Analog", "3.0 - 5.5 V", "CB-PFF"),
            ("Allegro MicroSystems", "ACS758LCB-100B-PFF-T", "Hall Etkili Akım Sensörü", "±100 A", 3_000m, "Analog", "3.0 - 5.5 V", "CB-PFF"),
            ("Allegro MicroSystems", "ACS724LLCTR-10AU-T", "Hall Etkili Akım Sensörü", "0 - 10 A", 1_200m, "Analog", "4.5 - 5.5 V", "SOIC-8"),
            ("Allegro MicroSystems", "ACS37800KMACTR-030B3-I2C", "Güç İzleme Sensörü", "±30 A", 4_800m, "I2C", "3.0 - 5.5 V", "SOIC-16"),

            ("Texas Instruments", "INA219AIDR", "I2C Akım ve Güç İzleyici", "±3.2 A (şönte bağlı)", 0m, "I2C", "3.0 - 5.5 V", "SOIC-8"),
            ("Texas Instruments", "INA226AIDGSR", "I2C Akım ve Güç İzleyici", "±81.9 mV şönt", 0m, "I2C", "2.7 - 5.5 V", "VSSOP-10"),
            ("Texas Instruments", "INA260AIPWR", "Entegre Şöntlü Akım İzleyici", "±15 A", 0m, "I2C", "2.7 - 5.5 V", "TSSOP-16"),
            ("Texas Instruments", "INA240A2PWR", "Akım Algılama Yükselteci", "-4 ~ +80 V ortak mod", 0m, "Analog", "2.7 - 5.5 V", "TSSOP-8"),
            ("Texas Instruments", "INA169NA/250", "Yüksek Taraf Akım İzleyici", "2.7 - 60 V", 0m, "Analog", "2.7 - 60 V", "SOT-23-5"),
            ("Texas Instruments", "INA181A1IDBVR", "Akım Algılama Yükselteci", "-0.2 ~ +26 V ortak mod", 0m, "Analog", "2.7 - 5.5 V", "SOT-23-5"),
            ("Texas Instruments", "AMC1301DWVR", "İzoleli Akım Algılama Yükselteci", "±250 mV", 5_000m, "Analog", "3.0 - 5.5 V", "SOIC-8"),

            ("Analog Devices", "AD8210YRZ", "Akım Algılama Yükselteci", "-2 ~ +65 V ortak mod", 0m, "Analog", "4.5 - 5.5 V", "SOIC-8"),
            ("Analog Devices", "LTC6102HVIMS8#PBF", "Yüksek Taraf Akım İzleyici", "4 - 105 V", 0m, "Analog", "4 - 105 V", "MSOP-8"),
            ("Analog Devices", "MAX4080TASA+", "Yüksek Taraf Akım İzleyici", "4.5 - 76 V", 0m, "Analog", "4.5 - 76 V", "SOIC-8"),
            ("Melexis", "MLX91220KDC-ABA-000-SP", "Hall Etkili Akım Sensörü", "±50 A", 4_800m, "Analog", "3.3 - 5.0 V", "SOIC-8"),
            ("Honeywell", "CSLA1CD", "Doğrusal Akım Sensörü", "±72 A", 2_500m, "Analog", "6 - 12 V", "Modül"),
            ("LEM", "LA55-P", "Kapalı Çevrim Akım Transdüseri", "±100 A", 2_500m, "Analog", "±12 - ±15 V", "PCB Modül")
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("sensor_tipi", x.Tip),
                new("olcum_araligi", x.Aralik),
                new("arayuz", x.Arayuz),
                new("besleme_voltaji", x.Besleme),
                new("kilif", x.Kilif)
            };

            if (x.Izolasyon > 0m)
                ozellikler.Insert(2, new ParcaOzelligi("izolasyon_voltaji", $"{ParcaKodlama.AnlamliBasamak(x.Izolasyon, 5)} Vrms", x.Izolasyon));

            yield return new HamParca(
                "akim-sensorleri", x.Uretici, x.Mpn,
                $"SENSÖR {x.Tip} {x.Aralik} {x.Arayuz} {x.Kilif}",
                MontajTipi.Smt, ozellikler);
        }
    }

    private static IEnumerable<HamParca> GazHavaKalitesi()
    {
        (string Uretici, string Mpn, string Tip, string Aralik, string Arayuz, string Besleme, MontajTipi Montaj)[] liste =
        [
            ("Sensirion", "SGP30-2.5K", "VOC ve eCO2 Sensörü", "0 - 60000 ppb TVOC", "I2C", "1.62 - 1.98 V", MontajTipi.Smt),
            ("Sensirion", "SGP40-D-R4", "VOC Sensörü", "0 - 1000 VOC Index", "I2C", "1.7 - 3.6 V", MontajTipi.Smt),
            ("Sensirion", "SGP41-D-R4", "VOC ve NOx Sensörü", "0 - 500 VOC / NOx Index", "I2C", "1.7 - 3.6 V", MontajTipi.Smt),
            ("Sensirion", "SCD40-D-R2", "CO2, Sıcaklık ve Nem", "400 - 2000 ppm CO2", "I2C", "2.4 - 5.5 V", MontajTipi.Smt),
            ("Sensirion", "SCD41-D-R2", "CO2, Sıcaklık ve Nem", "400 - 5000 ppm CO2", "I2C", "2.4 - 5.5 V", MontajTipi.Smt),
            ("Sensirion", "SPS30", "Partikül Madde (PM1.0 - PM10)", "0 - 1000 µg/m³", "I2C / UART", "4.5 - 5.5 V", MontajTipi.Yok),
            ("Sensirion", "SEN55-SDN-T", "Hava Kalitesi Kombine Sensörü", "PM, VOC, NOx, T, BN", "I2C", "4.5 - 5.5 V", MontajTipi.Yok),
            ("Sensirion", "SFM3019-300-C", "Gaz Debi Sensörü", "0 - 300 slm", "I2C", "3.1 - 3.5 V", MontajTipi.Yok),

            ("Bosch Sensortec", "BME688", "Gaz, Sıcaklık, Nem ve Basınç", "VOC, CO, H2 tespiti", "I2C / SPI", "1.71 - 3.6 V", MontajTipi.Smt),
            ("ams-OSRAM", "CCS811B-JOPD500", "eCO2 ve TVOC Sensörü", "400 - 8192 ppm eCO2", "I2C", "1.8 - 3.6 V", MontajTipi.Smt),
            ("ams-OSRAM", "ENS160", "Çok Gazlı Hava Kalitesi Sensörü", "AQI, TVOC, eCO2", "I2C / SPI", "1.71 - 1.98 V", MontajTipi.Smt),

            ("Honeywell", "HPMA115S0-XXX", "Partikül Madde Sensörü", "0 - 1000 µg/m³", "UART", "5 V", MontajTipi.Yok),
            ("Honeywell", "4NE/CO-1000", "Elektrokimyasal CO Sensörü", "0 - 1000 ppm CO", "Analog", "—", MontajTipi.Yok),
            ("Sharp", "GP2Y1014AU0F", "Optik Toz Sensörü", "0 - 0.5 mg/m³", "Analog", "4.5 - 5.5 V", MontajTipi.Yok)
        ];

        return liste.Select(x => new HamParca(
            "gaz-hava-kalitesi", x.Uretici, x.Mpn,
            $"SENSÖR {x.Tip} {x.Aralik} {x.Arayuz}",
            x.Montaj,
            [
                new("sensor_tipi", x.Tip),
                new("olcum_araligi", x.Aralik),
                new("arayuz", x.Arayuz),
                new("besleme_voltaji", x.Besleme == "—" ? "Pasif (harici devre)" : x.Besleme),
                new("montaj_sekli", x.Montaj == MontajTipi.Smt ? "Yüzey Montaj" : "Modül / Kablo Bağlantılı")
            ]));
    }

    private static IEnumerable<HamParca> Termistorler()
    {
        // Vishay NTCLE100E3 serisi — kod ortasındaki üç hane EIA direnç kodudur.
        decimal[] degerler = [100m, 220m, 470m, 1_000m, 2_200m, 3_300m, 4_700m, 5_000m,
                              10_000m, 20_000m, 22_000m, 47_000m, 50_000m, 100_000m, 220_000m];

        foreach (var ohm in degerler)
        {
            yield return new HamParca(
                "termistorler", "Vishay", $"NTCLE100E3{ParcaKodlama.EiaUcHane(ohm)}JB0",
                $"NTC TERMISTÖR {ParcaKodlama.DirencKisa(ohm)} ±%5 EKSENEL",
                MontajTipi.Tht,
                [
                    new("direnc_degeri", $"{ParcaKodlama.DirencYazisi(ohm)} @25 °C", ohm),
                    new("tolerans", "±%5"),
                    new("sensor_tipi", "NTC Termistör (Negatif Sıcaklık Katsayılı)"),
                    new("olcum_araligi", "-55 ~ +125 °C"),
                    new("montaj_sekli", "Delikli Montaj")
                ]);
        }

        (string Uretici, string Mpn, decimal Ohm, string Tip, string Aralik, string Kilif, MontajTipi Montaj)[] liste =
        [
            ("Murata", "NCP18XH103F03RB", 10_000m, "NTC Termistör (Çip)", "-40 ~ +125 °C", "0603", MontajTipi.Smt),
            ("Murata", "NCP15XH103F03RC", 10_000m, "NTC Termistör (Çip)", "-40 ~ +125 °C", "0402", MontajTipi.Smt),
            ("Murata", "NCP21XV103J03RA", 10_000m, "NTC Termistör (Çip)", "-40 ~ +125 °C", "0805", MontajTipi.Smt),
            ("Murata", "NCP18WB473J03RB", 47_000m, "NTC Termistör (Çip)", "-40 ~ +125 °C", "0603", MontajTipi.Smt),
            ("Murata", "NCU15XH103F6SRC", 10_000m, "NTC Termistör (Çip)", "-40 ~ +150 °C", "0402", MontajTipi.Smt),
            ("Murata", "NXFT15XH103FA2B100", 10_000m, "NTC Termistör (Problu)", "-40 ~ +125 °C", "Kablolu Prob", MontajTipi.Yok),

            ("TDK", "B57861S0103F040", 10_000m, "NTC Termistör (Cam Kaplı)", "-55 ~ +155 °C", "Eksenel", MontajTipi.Tht),
            ("TDK", "B57891M0103K000", 10_000m, "NTC Termistör (Disk)", "-55 ~ +125 °C", "Radyal", MontajTipi.Tht),
            ("TDK", "B57891M0472K000", 4_700m, "NTC Termistör (Disk)", "-55 ~ +125 °C", "Radyal", MontajTipi.Tht),
            ("EPCOS", "B57153S0479M000", 4.7m, "NTC Akım Sınırlayıcı (Inrush)", "-25 ~ +200 °C", "Disk 15 mm", MontajTipi.Tht),
            ("EPCOS", "B57236S0100M000", 10m, "NTC Akım Sınırlayıcı (Inrush)", "-25 ~ +200 °C", "Disk 20 mm", MontajTipi.Tht),

            ("Vishay", "NTCLE203E3103SB0", 10_000m, "NTC Termistör (Minyatür)", "-40 ~ +125 °C", "Eksenel", MontajTipi.Tht),
            ("Vishay", "NTCLE413E2103F102L", 10_000m, "NTC Termistör (Kablolu)", "-40 ~ +125 °C", "Kablolu Prob", MontajTipi.Yok),
            ("Vishay", "NTHS0603N02N1002JE", 10_000m, "NTC Termistör (Çip)", "-40 ~ +125 °C", "0603", MontajTipi.Smt),
            ("Bourns", "PTS080501B500RP100", 500m, "PTC Termistör (Platin)", "-50 ~ +150 °C", "0805", MontajTipi.Smt),
            ("Bourns", "PTS1206M1B1K00P100", 1_000m, "PTC Termistör (Platin PT1000)", "-50 ~ +150 °C", "1206", MontajTipi.Smt),
            ("Panasonic", "ERT-J1VR103J", 10_000m, "NTC Termistör (Çip)", "-40 ~ +125 °C", "0603", MontajTipi.Smt)
        ];

        foreach (var x in liste)
        {
            var ozellikler = new List<ParcaOzelligi>
            {
                new("direnc_degeri", $"{ParcaKodlama.DirencYazisi(x.Ohm)} @25 °C", x.Ohm),
                new("tolerans", "±%1"),
                new("sensor_tipi", x.Tip),
                new("olcum_araligi", x.Aralik),
                new("montaj_sekli", x.Montaj switch
                {
                    MontajTipi.Smt => "Yüzey Montaj",
                    MontajTipi.Tht => "Delikli Montaj",
                    _ => "Kablolu / Prob"
                })
            };

            // Çip termistörlerde EIA boyut kodu vardır; eksenel ve problu olanlarda yoktur.
            if (x.Kilif.Length == 4 && x.Kilif.All(char.IsDigit))
                ozellikler.Add(new ParcaOzelligi("boyut_kodu", x.Kilif));

            yield return new HamParca(
                "termistorler", x.Uretici, x.Mpn,
                $"{x.Tip} {ParcaKodlama.DirencKisa(x.Ohm)} {x.Aralik} {x.Kilif}",
                x.Montaj, ozellikler);
        }
    }

    private static HamParca Sensor(
        string kategori, string uretici, string mpn, string tip,
        string aralik, string dogruluk, string arayuz, string besleme, string kilif) =>
        new(
            kategori, uretici, mpn,
            $"SENSÖR {tip} {aralik} {arayuz} {kilif}",
            kilif.Contains("Modül", StringComparison.Ordinal) ? MontajTipi.Yok
                : kilif.Contains("TO-", StringComparison.Ordinal) ? MontajTipi.Tht
                : MontajTipi.Smt,
            [
                new("sensor_tipi", tip),
                new("olcum_araligi", aralik),
                new("dogruluk", dogruluk),
                new("arayuz", arayuz),
                new("besleme_voltaji", besleme),
                new("kilif", kilif)
            ]);
}
