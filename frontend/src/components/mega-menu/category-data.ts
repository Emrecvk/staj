import type { Category } from "@/lib/api";

export interface MegaMenuLeaf {
  ad: string;
  slug: string;
  urunSayisi?: number;
}

export interface MegaMenuSubcategory {
  ad: string;
  slug: string;
  yapraklar: MegaMenuLeaf[];
}

export interface FeaturedBrand {
  ad: string;
  slug: string;
  logoMetin: string;
  yetkiliDistribitor: boolean;
}

export interface MegaMenuCategoryItem {
  id: number;
  ad: string;
  slug: string;
  ikonAdi: string;
  toplamUrun: number;
  altKategoriler: MegaMenuSubcategory[];
  oneCikanMarkalar: FeaturedBrand[];
  banner?: {
    baslik: string;
    aciklama: string;
    linkMetni: string;
    linkUrl: string;
  };
}

export const MEGA_MENU_DATA: MegaMenuCategoryItem[] = [
  {
    id: 1,
    ad: "Yarı İletkenler",
    slug: "yari-iletkenler",
    ikonAdi: "Cpu",
    toplamUrun: 42850,
    altKategoriler: [
      {
        ad: "Mikrokontrolcüler & DSP",
        slug: "mikrokontrolculer-dsp",
        yapraklar: [
          { ad: "ARM Cortex MCU", slug: "arm-cortex-mcu", urunSayisi: 3420 },
          { ad: "8-Bit & 16-Bit MCU", slug: "8-bit-16-bit-mcu", urunSayisi: 2150 },
          { ad: "Dijital Sinyal İşlemciler (DSP)", slug: "dsp", urunSayisi: 680 },
          { ad: "Kablosuz MCU & SoC", slug: "kablosuz-mcu-soc", urunSayisi: 1450 },
        ],
      },
      {
        ad: "Güç Yarı İletkenleri",
        slug: "guc-yari-iletkenleri",
        yapraklar: [
          { ad: "MOSFET Transistörler", slug: "mosfet-transistorler", urunSayisi: 6200 },
          { ad: "IGBT & Modüller", slug: "igbt-moduller", urunSayisi: 1840 },
          { ad: "Diyot & Doğrultucular", slug: "diyot-dogrultucular", urunSayisi: 4900 },
          { ad: "Tristör & Triyaklar", slug: "tristor-triyaklar", urunSayisi: 920 },
        ],
      },
      {
        ad: "Analog & Güç Yönetimi",
        slug: "analog-guc-yonetimi",
        yapraklar: [
          { ad: "LDO Voltaj Regülatörleri", slug: "ldo-voltaj-regulatorleri", urunSayisi: 3800 },
          { ad: "DC-DC Anahtarlamalı Regülatör", slug: "dc-dc-regulatorler", urunSayisi: 2900 },
          { ad: "Operasyonel Yükselteç (Op-Amp)", slug: "op-amp", urunSayisi: 3100 },
          { ad: "Komparatörler", slug: "komparatorler", urunSayisi: 850 },
        ],
      },
      {
        ad: "Bellek & Lojik Entegreler",
        slug: "bellek-lojik-entegreler",
        yapraklar: [
          { ad: "EEPROM & Flash Bellekler", slug: "eeprom-flash", urunSayisi: 1750 },
          { ad: "SRAM & DRAM", slug: "sram-dram", urunSayisi: 640 },
          { ad: "Lojik Kapılar & Buffer", slug: "lojik-kapilar-buffer", urunSayisi: 2800 },
          { ad: "Arayüz & RS485/CAN Alıcıları", slug: "arayuz-rs485-can", urunSayisi: 1600 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "STMicroelectronics", slug: "stmicroelectronics", logoMetin: "ST", yetkiliDistribitor: true },
      { ad: "Texas Instruments", slug: "texas-instruments", logoMetin: "TI", yetkiliDistribitor: true },
      { ad: "Microchip", slug: "microchip", logoMetin: "MCHP", yetkiliDistribitor: true },
      { ad: "Nexperia", slug: "nexperia", logoMetin: "NX", yetkiliDistribitor: true },
      { ad: "Diodes Incorporated", slug: "diodes-inc", logoMetin: "DIODES", yetkiliDistribitor: true },
    ],
    banner: {
      baslik: "STM32 Yeni Nesil MCU Serisi",
      aciklama: "Yüksek performanslı Cortex-M7 & M33 çekirdekler stoktan teslim.",
      linkMetni: "Stoktaki MCU'ları İncele",
      linkUrl: "/urunler?aramaMetni=STM32",
    },
  },
  {
    id: 2,
    ad: "Pasif Komponentler",
    slug: "pasif-komponentler",
    ikonAdi: "Layers",
    toplamUrun: 86400,
    altKategoriler: [
      {
        ad: "Kondansatörler",
        slug: "kondansatorler",
        yapraklar: [
          { ad: "SMD Seramik MLCC (0402, 0603, 0805)", slug: "smd-seramik-mlcc", urunSayisi: 24500 },
          { ad: "Alüminyum Elektrolitik Kondansatör", slug: "aluminyum-elektrolitik", urunSayisi: 8200 },
          { ad: "Tantal & Polimer Kondansatör", slug: "tantal-polimer", urunSayisi: 3900 },
          { ad: "Film & Süperkapasitörler", slug: "film-superkapasitorler", urunSayisi: 1650 },
        ],
      },
      {
        ad: "Dirençler & Potansiyometre",
        slug: "direncler-potansiyometre",
        yapraklar: [
          { ad: "SMD Çip Dirençler (0.1% - 5%)", slug: "smd-cip-direncler", urunSayisi: 28000 },
          { ad: "Şönt & Akım Algılama Dirençleri", slug: "sont-direncler", urunSayisi: 2400 },
          { ad: "Güç & Taş Dirençler", slug: "guc-tas-direncler", urunSayisi: 1950 },
          { ad: "Trimpot & Hassas Potansiyometre", slug: "trimpot-potansiyometre", urunSayisi: 1100 },
        ],
      },
      {
        ad: "İndüktörler & Bobinler",
        slug: "induktorler-bobinler",
        yapraklar: [
          { ad: "SMD Güç Bobinleri", slug: "smd-guc-bobinleri", urunSayisi: 7800 },
          { ad: "Ferrit Boncuk & Çip Boncuklar", slug: "ferrit-boncuk", urunSayisi: 3400 },
          { ad: "Toroid & Ortak Mod Boğucu", slug: "ortak-mod-bogucu", urunSayisi: 1850 },
        ],
      },
      {
        ad: "Kristal & Frekans Kontrolü",
        slug: "kristal-frekans-kontrolu",
        yapraklar: [
          { ad: "Kuvars Kristaller (32.768kHz - 50MHz)", slug: "kuvars-kristaller", urunSayisi: 2200 },
          { ad: "SMD Osilatörler & TCXO", slug: "smd-osilatorler-tcxo", urunSayisi: 1350 },
          { ad: "Seramik Rezonatörler", slug: "seramik-rezonatorler", urunSayisi: 450 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "Murata", slug: "murata", logoMetin: "MURATA", yetkiliDistribitor: true },
      { ad: "TDK / EPCOS", slug: "tdk", logoMetin: "TDK", yetkiliDistribitor: true },
      { ad: "Yageo", slug: "yageo", logoMetin: "YAGEO", yetkiliDistribitor: true },
      { ad: "Vishay", slug: "vishay", logoMetin: "VISHAY", yetkiliDistribitor: true },
      { ad: "KEMET", slug: "kemet", logoMetin: "KEMET", yetkiliDistribitor: true },
    ],
    banner: {
      baslik: "Murata Otomotiv Sınıfı MLCC",
      aciklama: "AEC-Q200 sertifikalı SMD seramik kondansatörler tam makara ve şerit ambalajda.",
      linkMetni: "Pasif Kataloğunu İncele",
      linkUrl: "/urunler?kategoriId=2",
    },
  },
  {
    id: 3,
    ad: "Elektromekanik",
    slug: "elektromekanik",
    ikonAdi: "ToggleLeft",
    toplamUrun: 21500,
    altKategoriler: [
      {
        ad: "Röleler & Kontaktörler",
        slug: "roleler-kontaktorler",
        yapraklar: [
          { ad: "PCB Güç Röleleri (5V, 12V, 24V)", slug: "pcb-guc-roleleri", urunSayisi: 3200 },
          { ad: "Sinyal & Telekom Röleleri", slug: "sinyal-roleleri", urunSayisi: 1400 },
          { ad: "Solid State Röleler (SSR)", slug: "solid-state-roleler", urunSayisi: 980 },
          { ad: "Endüstriyel DIN Ray Röleleri", slug: "din-ray-roleleri", urunSayisi: 1150 },
        ],
      },
      {
        ad: "Anahtarlar & Butonlar",
        slug: "anahtarlar-butonlar",
        yapraklar: [
          { ad: "SMD & THT Tact Switch", slug: "tact-switch", urunSayisi: 4500 },
          { ad: "Rocker & Işıklı Anahtarlar", slug: "rocker-anahtarlar", urunSayisi: 2100 },
          { ad: "Dip Switch & Kodlama Anahtarı", slug: "dip-switch", urunSayisi: 850 },
          { ad: "Toggle & Buton Switch", slug: "toggle-switch", urunSayisi: 1600 },
        ],
      },
      {
        ad: "Soğutma & Termal Yönetim",
        slug: "sogutma-termal-yonetim",
        yapraklar: [
          { ad: "Alüminyum Profil Soğutucular", slug: "aluminyum-sogutucular", urunSayisi: 1400 },
          { ad: "DC Eksenel Fanlar (5V, 12V, 24V)", slug: "dc-fanlar", urunSayisi: 1200 },
          { ad: "Termal Macun & Termal Ped", slug: "termal-macun-ped", urunSayisi: 420 },
        ],
      },
      {
        ad: "Devre Koruma & Sigortalar",
        slug: "devre-koruma-sigortalar",
        yapraklar: [
          { ad: "SMD & Cam Sigortalar", slug: "smd-cam-sigortalar", urunSayisi: 2600 },
          { ad: "PPTC Sıfırlanabilir Sigortalar", slug: "pptc-sigortalar", urunSayisi: 950 },
          { ad: "TVS Diyot & ESD Koruma", slug: "tvs-esd-koruma", urunSayisi: 2100 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "Omron", slug: "omron", logoMetin: "OMRON", yetkiliDistribitor: true },
      { ad: "Finder", slug: "finder", logoMetin: "FINDER", yetkiliDistribitor: true },
      { ad: "Littelfuse", slug: "littelfuse", logoMetin: "LF", yetkiliDistribitor: true },
      { ad: "Sunon", slug: "sunon", logoMetin: "SUNON", yetkiliDistribitor: true },
    ],
    banner: {
      baslik: "Endüstriyel Röle & Devre Koruma",
      aciklama: "Yüksek anahtarlama kapasiteli Omron ve Finder röle serileri.",
      linkMetni: "Röle Çözümlerine Git",
      linkUrl: "/urunler?aramaMetni=Role",
    },
  },
  {
    id: 4,
    ad: "Konnektör & Bağlantı",
    slug: "konnektor-baglanti",
    ikonAdi: "Cable",
    toplamUrun: 38200,
    altKategoriler: [
      {
        ad: "Klemens & Terminal Blok",
        slug: "klemens-terminal-blok",
        yapraklar: [
          { ad: "PCB Vidalı Klemensler (3.5mm, 5.0mm)", slug: "pcb-vidali-klemens", urunSayisi: 4600 },
          { ad: "Yay Baskılı Klemensler", slug: "yay-baskili-klemens", urunSayisi: 2800 },
          { ad: "Tak-Çıkar Konnektörlü Klemens", slug: "tak-cikar-klemens", urunSayisi: 3100 },
          { ad: "Ray Tipi Endüstriyel Klemens", slug: "ray-tipi-klemens", urunSayisi: 1900 },
        ],
      },
      {
        ad: "Pin Header & Soketler",
        slug: "pin-header-soketler",
        yapraklar: [
          { ad: "2.54mm Erkek & Dişi Header", slug: "254mm-header", urunSayisi: 5200 },
          { ad: "2.00mm & 1.27mm İnce Hat Header", slug: "ince-hat-header", urunSayisi: 2900 },
          { ad: "IC Entegre Soketleri & ZIF", slug: "ic-soketleri", urunSayisi: 850 },
        ],
      },
      {
        ad: "G/Ç & Veri Konnektörleri",
        slug: "veri-konnektorleri",
        yapraklar: [
          { ad: "USB Type-C & Micro USB", slug: "usb-type-c-micro", urunSayisi: 2400 },
          { ad: "RJ45 Magnetik Ethernet Soket", slug: "rj45-ethernet", urunSayisi: 1300 },
          { ad: "D-Sub & Mini D-Sub", slug: "d-sub", urunSayisi: 1800 },
          { ad: "FFC / FPC Esnek Kablo Soketleri", slug: "ffc-fpc-soket", urunSayisi: 2600 },
        ],
      },
      {
        ad: "Endüstriyel & Dairesel",
        slug: "endustriyel-dairesel",
        yapraklar: [
          { ad: "M8 & M12 Sensör Konnektörleri", slug: "m8-m12-konnektor", urunSayisi: 3200 },
          { ad: "Ağır Hizmet Konnektörleri (Harting)", slug: "agir-hizmet-konnektor", urunSayisi: 1100 },
          { ad: "Otomotiv Soket & Terminaller", slug: "otomotiv-soketleri", urunSayisi: 2400 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "Phoenix Contact", slug: "phoenix-contact", logoMetin: "PHOENIX", yetkiliDistribitor: true },
      { ad: "Molex", slug: "molex", logoMetin: "MOLEX", yetkiliDistribitor: true },
      { ad: "TE Connectivity", slug: "te-connectivity", logoMetin: "TE", yetkiliDistribitor: true },
      { ad: "Wurth Elektronik", slug: "wurth-elektronik", logoMetin: "WE", yetkiliDistribitor: true },
    ],
    banner: {
      baslik: "Phoenix Contact Terminal Çözümleri",
      aciklama: "Vidalı ve yaylı PCB klemenslerinde geniş stok ve avantajlı B2B fiyatları.",
      linkMetni: "Klemensleri Gör",
      linkUrl: "/urunler?aramaMetni=Klemens",
    },
  },
  {
    id: 5,
    ad: "Güç Kaynakları & Trafo",
    slug: "guc-kaynaklari-trafo",
    ikonAdi: "Zap",
    toplamUrun: 15400,
    altKategoriler: [
      {
        ad: "Dahili Güç Kaynakları",
        slug: "dahili-guc-kaynaklari",
        yapraklar: [
          { ad: "Metal Kasa AC/DC (25W - 1000W)", slug: "metal-kasa-ac-dc", urunSayisi: 2800 },
          { ad: "Açık Çerçeve (Open Frame)", slug: "acik-cerceve-guc-kaynagi", urunSayisi: 1600 },
          { ad: "PCB Montajlı AC/DC Modüller", slug: "pcb-montaj-ac-dc", urunSayisi: 1900 },
        ],
      },
      {
        ad: "DIN Ray Güç Kaynakları",
        slug: "din-ray-guc-kaynaklari",
        yapraklar: [
          { ad: "24V DC Endüstriyel DIN Ray", slug: "24v-din-ray", urunSayisi: 2400 },
          { ad: "12V & 48V DIN Ray Kaynaklar", slug: "12v-48v-din-ray", urunSayisi: 1100 },
          { ad: "Yedekli (Redundant) Güç Modülleri", slug: "yedekli-guc-modulleri", urunSayisi: 450 },
        ],
      },
      {
        ad: "DC-DC İzole Modüller",
        slug: "dc-dc-izole-moduller",
        yapraklar: [
          { ad: "1W - 3W SIP/DIP Çeviriciler", slug: "1w-3w-sip-dip", urunSayisi: 1800 },
          { ad: "5W - 60W Geniş Girişli DC-DC", slug: "5w-60w-dc-dc", urunSayisi: 1650 },
          { ad: "Yüksek İzolasyonlu Medikal Modüller", slug: "medikal-dc-dc", urunSayisi: 420 },
        ],
      },
      {
        ad: "Adaptör & Trafolar",
        slug: "adaptor-trafolar",
        yapraklar: [
          { ad: "Masaüstü & Duvar Adaptörleri", slug: "duvar-adaptorleri", urunSayisi: 1300 },
          { ad: "Akım Trafoları & Pulse Trafo", slug: "akim-trafolari", urunSayisi: 980 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "Mean Well", slug: "mean-well", logoMetin: "MW", yetkiliDistribitor: true },
      { ad: "Mornsun", slug: "mornsun", logoMetin: "MORNSUN", yetkiliDistribitor: true },
      { ad: "Traco Power", slug: "traco-power", logoMetin: "TRACO", yetkiliDistribitor: true },
      { ad: "Delta Electronics", slug: "delta", logoMetin: "DELTA", yetkiliDistribitor: true },
    ],
    banner: {
      baslik: "Mean Well Orijinal Distribütörlüğü",
      aciklama: "Endüstriyel DIN Ray ve Metal Kasa güç kaynaklarında tam stok garantisi.",
      linkMetni: "Güç Kaynaklarını Keşfet",
      linkUrl: "/urunler?aramaMetni=MeanWell",
    },
  },
  {
    id: 6,
    ad: "Sensörler & Dönüştürücüler",
    slug: "sensorler-donusturuculer",
    ikonAdi: "Activity",
    toplamUrun: 12800,
    altKategoriler: [
      {
        ad: "Çevre & Sıcaklık Sensörleri",
        slug: "cevre-sicaklik-sensorleri",
        yapraklar: [
          { ad: "Dijital Sıcaklık & Nem (I2C/SPI)", slug: "dijital-sicaklik-nem", urunSayisi: 1900 },
          { ad: "NTC / PTC Termistörler", slug: "ntc-ptc-termistor", urunSayisi: 2400 },
          { ad: "Barometrik Basınç & Rakım", slug: "barometrik-basinc", urunSayisi: 680 },
          { ad: "Gaz & Hava Kalitesi Sensörleri", slug: "gaz-hava-kalitesi", urunSayisi: 520 },
        ],
      },
      {
        ad: "Hareket & Konum Sensörleri",
        slug: "hareket-konum-sensorleri",
        yapraklar: [
          { ad: "3-Eksen İvmeölçer (IMU)", slug: "ivmeolcer-imu", urunSayisi: 950 },
          { ad: "Jiroskop & Manyetometre", slug: "jiroskop-manyetometre", urunSayisi: 620 },
          { ad: "Manyetik Hall Efekt Sensörleri", slug: "hall-efekt-sensorler", urunSayisi: 1800 },
          { ad: "Optik / PIR Hareket Sensörü", slug: "optik-pir-sensor", urunSayisi: 740 },
        ],
      },
      {
        ad: "Akım, Gerilim & Güç Algılama",
        slug: "akim-gerilim-guc-algilama",
        yapraklar: [
          { ad: "Hall Efektli Akım Sensörleri", slug: "hall-akim-sensoru", urunSayisi: 1100 },
          { ad: "Gerilim Bölücü & İzole Algılayıcı", slug: "izole-gerilim-algilayici", urunSayisi: 580 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "Bosch Sensortec", slug: "bosch-sensortec", logoMetin: "BOSCH", yetkiliDistribitor: true },
      { ad: "Sensirion", slug: "sensirion", logoMetin: "SENSIRION", yetkiliDistribitor: true },
      { ad: "Honeywell", slug: "honeywell", logoMetin: "HONEYWELL", yetkiliDistribitor: true },
      { ad: "Allegro MicroSystems", slug: "allegro", logoMetin: "ALLEGRO", yetkiliDistribitor: true },
    ],
  },
  {
    id: 7,
    ad: "RF, Kablosuz & IoT Modülleri",
    slug: "rf-kablosuz-iot",
    ikonAdi: "Radio",
    toplamUrun: 8900,
    altKategoriler: [
      {
        ad: "Wi-Fi & Bluetooth Modülleri",
        slug: "wifi-bluetooth-modulleri",
        yapraklar: [
          { ad: "ESP32 & ESP8266 Modüller", slug: "esp32-esp8266", urunSayisi: 1600 },
          { ad: "Bluetooth 5.0 / BLE Modüller", slug: "ble-moduller", urunSayisi: 1200 },
          { ad: "Wi-Fi 6 & Çift Bant Modüller", slug: "wifi6-moduller", urunSayisi: 450 },
        ],
      },
      {
        ad: "Hücresel & GNSS Modülleri",
        slug: "hucresel-gnss-modulleri",
        yapraklar: [
          { ad: "LTE-M & NB-IoT Modüller", slug: "lte-m-nbiot", urunSayisi: 850 },
          { ad: "GPS / GLONASS / Galileo Modül", slug: "gps-gnss-moduller", urunSayisi: 780 },
          { ad: "4G / 5G Endüstriyel Modemler", slug: "4g-5g-modemler", urunSayisi: 320 },
        ],
      },
      {
        ad: "LoRa & Sub-1GHz",
        slug: "lora-sub-1ghz",
        yapraklar: [
          { ad: "LoRa & LoRaWAN Düğüm Modülleri", slug: "lorawan-moduller", urunSayisi: 650 },
          { ad: "433MHz & 868MHz Alıcı-Vericiler", slug: "433-868mhz-rf", urunSayisi: 920 },
          { ad: "RF Antenler (PCB, Çubuk, Patch)", slug: "rf-antenler", urunSayisi: 1400 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "Espressif", slug: "espressif", logoMetin: "ESPRESSIF", yetkiliDistribitor: true },
      { ad: "Quectel", slug: "quectel", logoMetin: "QUECTEL", yetkiliDistribitor: true },
      { ad: "Nordic Semiconductor", slug: "nordic-semi", logoMetin: "NORDIC", yetkiliDistribitor: true },
      { ad: "Taoglas", slug: "taoglas", logoMetin: "TAOGLAS", yetkiliDistribitor: true },
    ],
  },
  {
    id: 8,
    ad: "Optoelektronik & Ekran",
    slug: "optoelektronik-ekran",
    ikonAdi: "Monitor",
    toplamUrun: 18700,
    altKategoriler: [
      {
        ad: "LED & Işık Kaynakları",
        slug: "led-isik-kaynaklari",
        yapraklar: [
          { ad: "SMD Gösterge LED'leri (0603, 0805, 1206)", slug: "smd-led", urunSayisi: 4800 },
          { ad: "Güç LED'leri & COB", slug: "guc-led-cob", urunSayisi: 1400 },
          { ad: "7-Segment & Alfanumerik Display", slug: "7-segment-display", urunSayisi: 1100 },
        ],
      },
      {
        ad: "Ekran & Panel Modülleri",
        slug: "ekran-panel-modulleri",
        yapraklar: [
          { ad: "Grafik & Karakter LCD", slug: "karakter-grafik-lcd", urunSayisi: 1600 },
          { ad: "Renkli TFT & IPS Dokunmatik Ekran", slug: "tft-ips-ekran", urunSayisi: 2100 },
          { ad: "Monokrom & Renkli OLED", slug: "oled-ekran", urunSayisi: 950 },
          { ad: "E-Paper / E-Mürekkep Paneller", slug: "e-paper-paneller", urunSayisi: 320 },
        ],
      },
      {
        ad: "Optokuplör & İzolasyon",
        slug: "optokuplor-izolasyon",
        yapraklar: [
          { ad: "Transistör Çıkışlı Optokuplör", slug: "transistor-optokuplor", urunSayisi: 2800 },
          { ad: "Triyak / Tristör Çıkışlı Opto", slug: "triyak-optokuplor", urunSayisi: 1200 },
          { ad: "Yüksek Hızlı Dijital İzolatör", slug: "dijital-izolator", urunSayisi: 980 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "Kingbright", slug: "kingbright", logoMetin: "KINGBRIGHT", yetkiliDistribitor: true },
      { ad: "Everlight", slug: "everlight", logoMetin: "EVERLIGHT", yetkiliDistribitor: true },
      { ad: "Winstar", slug: "winstar", logoMetin: "WINSTAR", yetkiliDistribitor: true },
      { ad: "Broadcom", slug: "broadcom", logoMetin: "BROADCOM", yetkiliDistribitor: true },
    ],
  },
  {
    id: 9,
    ad: "Geliştirme Kartları & Aletler",
    slug: "gelistirme-kartlari-aletler",
    ikonAdi: "Boxes",
    toplamUrun: 6400,
    altKategoriler: [
      {
        ad: "MCU & FPGA Geliştirme Kitleri",
        slug: "mcu-fpga-gelistirme-kitleri",
        yapraklar: [
          { ad: "STM32 Nucleo & Discovery Kitler", slug: "stm32-nucleo", urunSayisi: 450 },
          { ad: "Raspberry Pi & Aksesuarları", slug: "raspberry-pi", urunSayisi: 680 },
          { ad: "Arduino Orijinal Kartlar", slug: "arduino", urunSayisi: 380 },
        ],
      },
      {
        ad: "Programlayıcı & Hata Ayıklayıcı",
        slug: "programlayici-debug",
        yapraklar: [
          { ad: "ST-Link, J-Link & Atmel ICE", slug: "stlink-jlink", urunSayisi: 310 },
          { ad: "PICkit & Microchip Programlayıcı", slug: "pickit", urunSayisi: 190 },
          { ad: "Evrensel Çip Programlayıcılar", slug: "evrensel-programlayici", urunSayisi: 140 },
        ],
      },
      {
        ad: "Prototipleme & Sarf",
        slug: "prototipleme-sarf",
        yapraklar: [
          { ad: "Delikli Plaket & Breadboard", slug: "breadboard-plaket", urunSayisi: 850 },
          { ad: "Jumper Kablo & Test Probları", slug: "jumper-test-probu", urunSayisi: 1200 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "STMicroelectronics", slug: "stmicroelectronics", logoMetin: "ST", yetkiliDistribitor: true },
      { ad: "Raspberry Pi", slug: "raspberry-pi", logoMetin: "RPI", yetkiliDistribitor: true },
      { ad: "Segger", slug: "segger", logoMetin: "SEGGER", yetkiliDistribitor: true },
    ],
  },
  {
    id: 10,
    ad: "Test, Ölçüm & Lehimleme",
    slug: "test-olcum-lehimleme",
    ikonAdi: "Wrench",
    toplamUrun: 9200,
    altKategoriler: [
      {
        ad: "Ölçüm Cihazları",
        slug: "olcum-cihazlari",
        yapraklar: [
          { ad: "Dijital Multimetreler (True RMS)", slug: "dijital-multimetre", urunSayisi: 1400 },
          { ad: "Dijital Depolamalı Osiloskoplar", slug: "dijital-osiloskop", urunSayisi: 650 },
          { ad: "Ayarlı DC Laboratuvar Güç Kaynağı", slug: "laboratuvar-guc-kaynagi", urunSayisi: 520 },
          { ad: "LCR Metre & Fonksiyon Jeneratörü", slug: "lcr-fonksiyon-jeneratoru", urunSayisi: 380 },
        ],
      },
      {
        ad: "Lehimleme İstasyonları",
        slug: "lehimleme-istasyonlari",
        yapraklar: [
          { ad: "Sıcak Hava & Havya İstasyonları", slug: "havya-istasyonu", urunSayisi: 850 },
          { ad: "Lehim Uçları & Rezistanslar", slug: "lehim-uclari", urunSayisi: 1600 },
          { ad: "ESD Güvenli Cımbız & El Aletleri", slug: "esd-cimbiz-el-aletleri", urunSayisi: 1100 },
        ],
      },
      {
        ad: "Kimyasallar & Lehim Sarf",
        slug: "kimyasallar-lehim-sarf",
        yapraklar: [
          { ad: "Kurşunsuz SAC305 Lehim Teli", slug: "kursunsuz-lehim-teli", urunSayisi: 780 },
          { ad: "Krem Lehim & No-Clean Flux", slug: "krem-lehim-flux", urunSayisi: 540 },
          { ad: "Devre Koruyucu Vernik & Temizleyici", slug: "vernik-temizleyici", urunSayisi: 420 },
        ],
      },
    ],
    oneCikanMarkalar: [
      { ad: "Uni-T", slug: "uni-t", logoMetin: "UNI-T", yetkiliDistribitor: true },
      { ad: "Siglent", slug: "siglent", logoMetin: "SIGLENT", yetkiliDistribitor: true },
      { ad: "Weller", slug: "weller", logoMetin: "WELLER", yetkiliDistribitor: true },
      { ad: "Hakko", slug: "hakko", logoMetin: "HAKKO", yetkiliDistribitor: true },
    ],
  },
];

export function getMergedCategories(serverCategories: Category[]): MegaMenuCategoryItem[] {
  if (!serverCategories || serverCategories.length === 0) {
    return MEGA_MENU_DATA;
  }

  // If server categories exist, blend server category IDs/slugs with our rich structure
  return MEGA_MENU_DATA.map((item, index) => {
    const matchedServer = serverCategories.find(
      (sc) =>
        sc.slug === item.slug ||
        sc.ad.toLowerCase() === item.ad.toLowerCase()
    );

    if (matchedServer) {
      return {
        ...item,
        id: matchedServer.id,
        ad: matchedServer.ad,
        slug: matchedServer.slug,
      };
    }
    return { ...item, id: 90000 + item.id };
  });
}
