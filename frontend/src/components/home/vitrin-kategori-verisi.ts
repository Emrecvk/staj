export interface VitrinKategoriDali {
  ad: string;
  altlar: VitrinKategoriDali[];
}

// Özdisan'ın kamuya açık kategori ağacı (24 Ağustos 2026) temel alınmıştır.
// Ürün sayıları özellikle tutulmaz; Çevik kataloğu yalnızca kendi gerçek verisini gösterir.
export const VITRIN_KATEGORI_AGACI: VitrinKategoriDali[] = [
  {
    "ad": "Elektronik Komponentler",
    "altlar": [
      {
        "ad": "Güç Yarı İletkenleri",
        "altlar": [
          {
            "ad": "Diyaklar ve Sidaklar",
            "altlar": [
              {
                "ad": "Diyaklar",
                "altlar": []
              },
              {
                "ad": "Sidaklar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Diyotlar, Modül Diyotlar ve Doğrultucular",
            "altlar": [
              {
                "ad": "Schottky Diyotlar",
                "altlar": []
              },
              {
                "ad": "TVS Diyotlar",
                "altlar": []
              },
              {
                "ad": "Köprü Diyotlar",
                "altlar": []
              },
              {
                "ad": "Modül Diyotlar",
                "altlar": []
              },
              {
                "ad": "Doğrultucu Diyotlar",
                "altlar": []
              },
              {
                "ad": "Zener Diyotlar",
                "altlar": []
              },
              {
                "ad": "Varikap - Varaktör - Değişken Kapasiteli Diyotlar",
                "altlar": []
              },
              {
                "ad": "Stud Diyotlar",
                "altlar": []
              },
              {
                "ad": "Disk Diyotlar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Güç Modülleri",
            "altlar": [
              {
                "ad": "IGBT Sürücüler",
                "altlar": []
              },
              {
                "ad": "Mosfet Sürücüler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Güç Yarı İletkeni Aksesuarları",
            "altlar": [
              {
                "ad": "Yarı İletken Kelepçeler",
                "altlar": []
              },
              {
                "ad": "Yarı İletken Katod Kablolar",
                "altlar": []
              },
              {
                "ad": "Yarı İletken İndikatörler",
                "altlar": []
              },
              {
                "ad": "Yarı İletken Klipsler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "IGBTler",
            "altlar": [
              {
                "ad": "Modül PIM IGBTler",
                "altlar": []
              },
              {
                "ad": "Modül IGBTler",
                "altlar": []
              },
              {
                "ad": "Modül IPM IGBTler",
                "altlar": []
              },
              {
                "ad": "Discrete IGBTler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Mosfetler",
            "altlar": [
              {
                "ad": "Discrete Mosfetler",
                "altlar": []
              },
              {
                "ad": "Modül Mosfetler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Transistörler",
            "altlar": [
              {
                "ad": "Discrete Transistörler",
                "altlar": []
              },
              {
                "ad": "Modül Transistörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Tristörler",
            "altlar": [
              {
                "ad": "Stud Tristörler",
                "altlar": []
              },
              {
                "ad": "Discrete Tristörler",
                "altlar": []
              },
              {
                "ad": "Modül Tristörler",
                "altlar": []
              },
              {
                "ad": "Modül Diyot Tristörler",
                "altlar": []
              },
              {
                "ad": "Disk Tristörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Triyaklar",
            "altlar": [
              {
                "ad": "Stud Triyaklar",
                "altlar": []
              },
              {
                "ad": "Discrete Triyaklar",
                "altlar": []
              },
              {
                "ad": "Modül Triyaklar",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Devre Koruyucular",
        "altlar": [
          {
            "ad": "Termistörler",
            "altlar": [
              {
                "ad": "PTC Termistörler",
                "altlar": []
              },
              {
                "ad": "NTC Termistörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Devre, Akım ve Gerilim Koruyucular",
            "altlar": [
              {
                "ad": "Tristör Gerilim Koruyucular",
                "altlar": []
              },
              {
                "ad": "Akım Koruyucular",
                "altlar": []
              },
              {
                "ad": "TVS Karma Koruyucular",
                "altlar": []
              },
              {
                "ad": "TVS - Yüksek Gerilim Koruyucular",
                "altlar": []
              },
              {
                "ad": "Termostatlar",
                "altlar": []
              },
              {
                "ad": "Termal Koruyucular",
                "altlar": []
              },
              {
                "ad": "Manyetik Devre Koruyucular",
                "altlar": []
              },
              {
                "ad": "Termal Devre Kesiciler",
                "altlar": []
              },
              {
                "ad": "Demeraj Akım Sınırlayıcılar",
                "altlar": []
              },
              {
                "ad": "GDT - Gaz Deşarj Tüpleri",
                "altlar": []
              },
              {
                "ad": "Varistörler",
                "altlar": []
              },
              {
                "ad": "SPG - Kıvılcım Aralığı Koruyucuları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Sigorta Bileşenleri",
            "altlar": [
              {
                "ad": "Diğer Tip Sigortalar",
                "altlar": []
              },
              {
                "ad": "Diyot ve Direnç Özel Tip Ürünler",
                "altlar": []
              },
              {
                "ad": "Sigorta Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Termal Sigortalar",
                "altlar": []
              },
              {
                "ad": "Batarya Koruma Sigortaları",
                "altlar": []
              },
              {
                "ad": "PTC Sigortalar",
                "altlar": []
              },
              {
                "ad": "Sigorta Yuvası Kapakları",
                "altlar": []
              },
              {
                "ad": "Sigorta Yuvaları",
                "altlar": []
              },
              {
                "ad": "Sigorta Kitleri",
                "altlar": []
              },
              {
                "ad": "Sigortalar",
                "altlar": []
              },
              {
                "ad": "Otomotiv Sigortalar",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Pasif Komponentler",
        "altlar": [
          {
            "ad": "Dirençler",
            "altlar": [
              {
                "ad": "Alüminyum Kaplama Dirençler",
                "altlar": []
              },
              {
                "ad": "THT - DİP Dirençler",
                "altlar": []
              },
              {
                "ad": "SMT - SMD ve Çip Dirençler",
                "altlar": []
              },
              {
                "ad": "Hassas ve Şönt Dirençler",
                "altlar": []
              },
              {
                "ad": "Ağ ve Sıra Dirençler",
                "altlar": []
              },
              {
                "ad": "Taş Dirençler",
                "altlar": []
              },
              {
                "ad": "Jumper ve Tel Dirençler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Kapasitörler",
            "altlar": [
              {
                "ad": "Power Film Kapasitörler",
                "altlar": []
              },
              {
                "ad": "Snubber Kapasitörler",
                "altlar": []
              },
              {
                "ad": "Tantal Kapasitörler",
                "altlar": []
              },
              {
                "ad": "Film Kapasitörler",
                "altlar": []
              },
              {
                "ad": "Alüminyum Kapasitörler",
                "altlar": []
              },
              {
                "ad": "Seramik Kapasitörler",
                "altlar": []
              },
              {
                "ad": "Multilayer Kapasitörler",
                "altlar": []
              },
              {
                "ad": "Elektrik Çift Katmanlı Kapasitörler - Süper Kapasitörler",
                "altlar": []
              },
              {
                "ad": "SMT - SMD ve MLCC Kapasitörler",
                "altlar": []
              },
              {
                "ad": "Niyobyum Oksit Kapasitörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "İndüktörler ve Bobinler",
            "altlar": [
              {
                "ad": "Endüstriyel Gaz Ateşleme Bobinler",
                "altlar": []
              },
              {
                "ad": "Kablosuz Şarj Bobinleri",
                "altlar": []
              },
              {
                "ad": "Sabit İndüktörler",
                "altlar": []
              },
              {
                "ad": "Bead Feritler",
                "altlar": []
              },
              {
                "ad": "Ortak Mod Bobinler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Ferritler",
            "altlar": [
              {
                "ad": "Ferrit Kablo Çekirdekleri",
                "altlar": []
              },
              {
                "ad": "Karkaslar ve Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Ferrit Çekirdekler",
                "altlar": []
              },
              {
                "ad": "Snap Ferritler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Trafolar",
            "altlar": [
              {
                "ad": "Genel Tip Trafolar",
                "altlar": []
              },
              {
                "ad": "Darbe Trafolar",
                "altlar": []
              },
              {
                "ad": "Özel Trafolar",
                "altlar": []
              },
              {
                "ad": "SMPS Trafolar",
                "altlar": []
              },
              {
                "ad": "Akım Trafolar",
                "altlar": []
              },
              {
                "ad": "ADSL Trafolar",
                "altlar": []
              },
              {
                "ad": "Ses - Sinyal Trafolar",
                "altlar": []
              },
              {
                "ad": "RF Trafolar ve Balunlar",
                "altlar": []
              },
              {
                "ad": "Voltaj Trafolar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Kristaller, Osilatörler ve Rezanatörler",
            "altlar": [
              {
                "ad": "Kristaller",
                "altlar": []
              },
              {
                "ad": "Rezonatörler",
                "altlar": []
              },
              {
                "ad": "Osilatörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Filtreler",
            "altlar": [
              {
                "ad": "Seramik Filtreler",
                "altlar": []
              },
              {
                "ad": "SAW Filtreler",
                "altlar": []
              },
              {
                "ad": "EMI Filtreler",
                "altlar": []
              },
              {
                "ad": "PLF-Güç Hattı Filtreleri",
                "altlar": []
              },
              {
                "ad": "RFI Filtreler",
                "altlar": []
              },
              {
                "ad": "Entegre Pasif Filtreler",
                "altlar": []
              },
              {
                "ad": "Feed Through Kapasitörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Pasif Komponent Ürün Setleri",
            "altlar": [
              {
                "ad": "Kapasitör Setleri",
                "altlar": []
              },
              {
                "ad": "İndüktör Setleri",
                "altlar": []
              },
              {
                "ad": "Direnç Setleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Pasif Komponent Aksesuarları",
            "altlar": [
              {
                "ad": "Pasif Komponent Kelepçeler",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Entegre Devreler (IC'ler)",
        "altlar": [
          {
            "ad": "Embedded Entegreler",
            "altlar": [
              {
                "ad": "SoC Yonga Sistemi",
                "altlar": []
              },
              {
                "ad": "Diğer Embedded Entegreler",
                "altlar": []
              },
              {
                "ad": "Mikroişlemciler",
                "altlar": []
              },
              {
                "ad": "Programlanabilir Karmaşık Mantıksal Entegreler",
                "altlar": []
              },
              {
                "ad": "FPGAler",
                "altlar": []
              },
              {
                "ad": "Ses İşlemcileri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Filtreler",
            "altlar": [
              {
                "ad": "EMI, RFI Filtre Entegreleri",
                "altlar": []
              },
              {
                "ad": "Aktif Filtre Entegreleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Güç Entegreleri",
            "altlar": [
              {
                "ad": "Batarya Yönetimi Entegreleri",
                "altlar": []
              },
              {
                "ad": "DC-DC Voltaj Kontrolörleri",
                "altlar": []
              },
              {
                "ad": "Balast Kontrolörleri",
                "altlar": []
              },
              {
                "ad": "Diğer Güç Yönetimi Entegreleri",
                "altlar": []
              },
              {
                "ad": "Hot Swap Voltaj Kontrol Entegreleri",
                "altlar": []
              },
              {
                "ad": "DC Anahtarlamalı Step Down Regülatörleri",
                "altlar": []
              },
              {
                "ad": "Güç Sürücü Entegreleri",
                "altlar": []
              },
              {
                "ad": "Güç Siviç Entegreleri",
                "altlar": []
              },
              {
                "ad": "Supervisor Entegreleri",
                "altlar": []
              },
              {
                "ad": "Analog Front End Entegreler",
                "altlar": []
              },
              {
                "ad": "AC-DC Çevirici ve Offline Siviç Entegreleri",
                "altlar": []
              },
              {
                "ad": "DC-DC Voltaj Regülatörleri",
                "altlar": []
              },
              {
                "ad": "V-F ve F-V Çevirici Entegreleri",
                "altlar": []
              },
              {
                "ad": "Termal Yönetim Entegreleri",
                "altlar": []
              },
              {
                "ad": "Akım Yönetimi Entegreleri",
                "altlar": []
              },
              {
                "ad": "Enerji Ölçümleme Entegreleri",
                "altlar": []
              },
              {
                "ad": "LED Display Sürücü Entegreleri",
                "altlar": []
              },
              {
                "ad": "Lineer Voltaj Regülatörleri",
                "altlar": []
              },
              {
                "ad": "OR Kontrolörleri ve İdeal Diyotlar",
                "altlar": []
              },
              {
                "ad": "Güç Faktörü Düzeltme (PFC)",
                "altlar": []
              },
              {
                "ad": "Voltaj Referans Entegreleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Hafıza Entegreleri",
            "altlar": [
              {
                "ad": "Diğer Hafıza Entegreleri",
                "altlar": []
              },
              {
                "ad": "Embedded Hafıza Entegreleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Arayüz Entegreleri",
            "altlar": [
              {
                "ad": "Driver, Receiver ve Transceiver Entegreleri",
                "altlar": []
              },
              {
                "ad": "Dokunmatik Ekran Kontrolörleri",
                "altlar": []
              },
              {
                "ad": "Dijitalden Analoğa Dönüştürücü Entegreler -DAC",
                "altlar": []
              },
              {
                "ad": "Signal Buffer, Repeater ve Splitter Entegreleri",
                "altlar": []
              },
              {
                "ad": "Diğer Arayüz Entegreleri",
                "altlar": []
              },
              {
                "ad": "IO Expander Entegreleri",
                "altlar": []
              },
              {
                "ad": "Sensör ve Transdüser Arayüzleri",
                "altlar": []
              },
              {
                "ad": "Telekom Entegreleri",
                "altlar": []
              },
              {
                "ad": "Arayüz Kontrolör Entegreleri",
                "altlar": []
              },
              {
                "ad": "Dekoder Entegreleri",
                "altlar": []
              },
              {
                "ad": "Generator Entegreleri",
                "altlar": []
              },
              {
                "ad": "Ses Kayıt Entegreleri",
                "altlar": []
              },
              {
                "ad": "Kodek Entegreleri",
                "altlar": []
              },
              {
                "ad": "Analogtan Dijitale Dönüştürücü Entegreler - ADC",
                "altlar": []
              },
              {
                "ad": "Siviç Entegreleri",
                "altlar": []
              },
              {
                "ad": "Enkoder Entegreleri",
                "altlar": []
              },
              {
                "ad": "Enkoder ve Dekoder Entegreleri",
                "altlar": []
              },
              {
                "ad": "Sıra Transistör Entegreler",
                "altlar": []
              },
              {
                "ad": "Dijital Potansiyometre Entegreleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Lineer Entegreler",
            "altlar": [
              {
                "ad": "Amplifikatörler",
                "altlar": []
              },
              {
                "ad": "Analog Komparatörler",
                "altlar": []
              },
              {
                "ad": "Ses Amplifikatörleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Logic Entegreler",
            "altlar": [
              {
                "ad": "Signal Switches, Multiplexer, Decoder ve Encoder Entegreleri",
                "altlar": []
              },
              {
                "ad": "Diğer Logic Entegreler",
                "altlar": []
              },
              {
                "ad": "Shift Register Entegreleri",
                "altlar": []
              },
              {
                "ad": "Logic Kapı ve Çevirici Entegreleri",
                "altlar": []
              },
              {
                "ad": "Translator Entegreleri",
                "altlar": []
              },
              {
                "ad": "Flip Flop Entegreleri",
                "altlar": []
              },
              {
                "ad": "Multivibratörler",
                "altlar": []
              },
              {
                "ad": "Buffer, Driver, Receiver ve Transceiver Entegreleri",
                "altlar": []
              },
              {
                "ad": "Counter ve Dividers Entegreleri",
                "altlar": []
              },
              {
                "ad": "Dijital Komparatörler",
                "altlar": []
              },
              {
                "ad": "Latch Entegreleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Modüller",
            "altlar": [
              {
                "ad": "Modem Modülleri",
                "altlar": []
              },
              {
                "ad": "IR Modülleri",
                "altlar": []
              },
              {
                "ad": "CPU Modülleri",
                "altlar": []
              },
              {
                "ad": "Ethernet Modülleri",
                "altlar": []
              },
              {
                "ad": "Optik Modülleri",
                "altlar": []
              },
              {
                "ad": "Güç Modülleri",
                "altlar": []
              },
              {
                "ad": "Diğer Modülleri",
                "altlar": []
              },
              {
                "ad": "Sistem Modülleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Multimedya Entegreleri",
            "altlar": [
              {
                "ad": "Ses ve Video Modülatörleri",
                "altlar": []
              },
              {
                "ad": "Video İşleme Entegreleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Özel Entegreler",
            "altlar": [
              {
                "ad": "Diğer Özel Entegreler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Ses Entegreleri",
            "altlar": [
              {
                "ad": "Ses Modülleri ve Bordları",
                "altlar": []
              },
              {
                "ad": "Çok Defa Programlanabilir Ses Entegreleri",
                "altlar": []
              },
              {
                "ad": "Bir Defa Programlanabilir Ses Entegreleri",
                "altlar": []
              },
              {
                "ad": "Tekrar Programlanabilen Ses Entegreleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Zamanlama Entegreleri",
            "altlar": [
              {
                "ad": "Clock Generators Entegreleri",
                "altlar": []
              },
              {
                "ad": "Bataryalı Gerçek Zamanlı Saat Entegreleri",
                "altlar": []
              },
              {
                "ad": "Faz Dedektörü Entegreleri",
                "altlar": []
              },
              {
                "ad": "Buffer - Clock Sürücü Entegreleri",
                "altlar": []
              },
              {
                "ad": "Programlanabilir Zamanlayıcı ve Osilatör Entegreleri",
                "altlar": []
              },
              {
                "ad": "Gerçek Zamanlı Saat Entegreleri",
                "altlar": []
              },
              {
                "ad": "Function Generators Entegreleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "İzolatör Entegreleri",
            "altlar": [
              {
                "ad": "Dijital İzolatörler",
                "altlar": []
              },
              {
                "ad": "İzole Gate Sürücüleri",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Sensörler & Transdüserler",
        "altlar": [
          {
            "ad": "Sensörler",
            "altlar": [
              {
                "ad": "Reed Sensörler",
                "altlar": []
              },
              {
                "ad": "Akım Sensörleri",
                "altlar": []
              },
              {
                "ad": "Jiroskoplar",
                "altlar": []
              },
              {
                "ad": "Varlık Algılama Sensörleri",
                "altlar": []
              },
              {
                "ad": "Basınç Sensörleri",
                "altlar": []
              },
              {
                "ad": "Yakınlık Sensörleri",
                "altlar": []
              },
              {
                "ad": "Manyetik Sensörler",
                "altlar": []
              },
              {
                "ad": "LDR sensörler",
                "altlar": []
              },
              {
                "ad": "Radarlı Hareket Sensörleri",
                "altlar": []
              },
              {
                "ad": "Dokunmatik Sensörler",
                "altlar": []
              },
              {
                "ad": "Ultrasonik Sensörler",
                "altlar": []
              },
              {
                "ad": "Diğer Sensörler",
                "altlar": []
              },
              {
                "ad": "Mesafe Sensörleri",
                "altlar": []
              },
              {
                "ad": "Sensör Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Kuvvet Sensörleri",
                "altlar": []
              },
              {
                "ad": "İvmeölçerler",
                "altlar": []
              },
              {
                "ad": "Gaz Sensörleri",
                "altlar": []
              },
              {
                "ad": "Nem Sensörleri",
                "altlar": []
              },
              {
                "ad": "Kızılötesi Alıcılar",
                "altlar": []
              },
              {
                "ad": "Optik Navigasyon Sensörleri",
                "altlar": []
              },
              {
                "ad": "Hareket Sensörleri",
                "altlar": []
              },
              {
                "ad": "Sıcaklık Sensörleri",
                "altlar": []
              },
              {
                "ad": "Fotodiyot Çıkışlı Optik Sensörler",
                "altlar": []
              },
              {
                "ad": "Mıknatıslar",
                "altlar": []
              },
              {
                "ad": "Fototransistör Çıkışlı Optik Sensörler",
                "altlar": []
              },
              {
                "ad": "Termopil Sensörler",
                "altlar": []
              },
              {
                "ad": "Anahtarlama Sensörleri",
                "altlar": []
              },
              {
                "ad": "Pozisyon Sensörleri",
                "altlar": []
              },
              {
                "ad": "Renk Sensörleri",
                "altlar": []
              },
              {
                "ad": "Yansımalı Fotoelektrik - Analog Çıkış",
                "altlar": []
              },
              {
                "ad": "Optik Çatal (U-Slot) Sensörler",
                "altlar": []
              },
              {
                "ad": "IR, UV ve Görünür LEDler",
                "altlar": []
              },
              {
                "ad": "Akış Sensörleri",
                "altlar": []
              },
              {
                "ad": "Yansımalı Fotoelektrik - Dijital Çıkış",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Transdüserler",
            "altlar": [
              {
                "ad": "Akım Transdüserleri",
                "altlar": []
              },
              {
                "ad": "Enerji Transdüserleri",
                "altlar": []
              },
              {
                "ad": "Voltaj Transdüserleri",
                "altlar": []
              },
              {
                "ad": "Transdüser Aksesuarları",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Elektromekanik Komponentler",
        "altlar": [
          {
            "ad": "Potansiyometreler ve Trimpotlar",
            "altlar": [
              {
                "ad": "Trimpot Potansiyometreler",
                "altlar": []
              },
              {
                "ad": "Çevrilebilir Potansiyometreler",
                "altlar": []
              },
              {
                "ad": "Karbon Potansiyometreler",
                "altlar": []
              },
              {
                "ad": "Potansiyometre Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Diyaller",
                "altlar": []
              },
              {
                "ad": "Sürgülü Potansiyometreler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Röleler ve Röle Soketleri",
            "altlar": [
              {
                "ad": "Röle Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Genel Tip Röleler",
                "altlar": []
              },
              {
                "ad": "Röle Soketleri",
                "altlar": []
              },
              {
                "ad": "Solid State Röleler",
                "altlar": []
              },
              {
                "ad": "I/O Röle Modülleri",
                "altlar": []
              },
              {
                "ad": "Güvenlik Röleleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Enkoder Ürünleri",
            "altlar": [
              {
                "ad": "Enkoderler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Siviçler ve Anahtarlar",
            "altlar": [
              {
                "ad": "Tact Siviçler",
                "altlar": []
              },
              {
                "ad": "Mikro Siviçler",
                "altlar": []
              },
              {
                "ad": "Limit Siviçler",
                "altlar": []
              },
              {
                "ad": "Push-Button Siviçler",
                "altlar": []
              },
              {
                "ad": "Toggle Siviçler",
                "altlar": []
              },
              {
                "ad": "Rocker Siviçler",
                "altlar": []
              },
              {
                "ad": "DIP Siviçler",
                "altlar": []
              },
              {
                "ad": "Siviç Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Reed Siviçler",
                "altlar": []
              },
              {
                "ad": "Çevirmeli Siviçler",
                "altlar": []
              },
              {
                "ad": "Sürgülü Siviçler",
                "altlar": []
              },
              {
                "ad": "Dedektör Siviçler",
                "altlar": []
              },
              {
                "ad": "Kodlu Çevirmeli Siviçler",
                "altlar": []
              },
              {
                "ad": "Basınç Siviçleri",
                "altlar": []
              },
              {
                "ad": "Thumbwheel Siviçleri",
                "altlar": []
              },
              {
                "ad": "Çoklu Fonksiyon Siviçler",
                "altlar": []
              },
              {
                "ad": "Endüstriyel Siviçler",
                "altlar": []
              },
              {
                "ad": "Navigasyon Siviçler",
                "altlar": []
              },
              {
                "ad": "Keylock Siviçler",
                "altlar": []
              },
              {
                "ad": "Hook Siviçler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Soğutucular",
            "altlar": [
              {
                "ad": "Alüminyum Soğutucular",
                "altlar": []
              },
              {
                "ad": "Soğutucu Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Su Soğutucuları",
                "altlar": []
              },
              {
                "ad": "Peltier Modüller",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Fanlar",
            "altlar": [
              {
                "ad": "Salyangoz Fanlar",
                "altlar": []
              },
              {
                "ad": "Santrifüj Fanlar",
                "altlar": []
              },
              {
                "ad": "Genel Tip Fanlar",
                "altlar": []
              },
              {
                "ad": "Fan Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Ses Ürünleri",
            "altlar": [
              {
                "ad": "Buzzerlar",
                "altlar": []
              },
              {
                "ad": "Hoparlörler",
                "altlar": []
              },
              {
                "ad": "Mikrofonlar",
                "altlar": []
              },
              {
                "ad": "Dinamik Alıcılar",
                "altlar": []
              },
              {
                "ad": "Buzzer ve Piezo Elemanları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "İzolasyon Ürünleri",
            "altlar": [
              {
                "ad": "Elektriksel İzolasyonlar",
                "altlar": []
              },
              {
                "ad": "Telekom İzolasyonları",
                "altlar": []
              },
              {
                "ad": "Koruyucu ve Emici Materyaller",
                "altlar": []
              },
              {
                "ad": "Isı ile Daralan Makaronlar",
                "altlar": []
              },
              {
                "ad": "Isı ile Daralan Lehimli Ek Makaronlar",
                "altlar": []
              },
              {
                "ad": "Isı ile Daralan Kablo Kılıfları, Kapakları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Motorlar ve Solenoidler",
            "altlar": [
              {
                "ad": "DC Motorlar",
                "altlar": []
              },
              {
                "ad": "Solenoidler",
                "altlar": []
              },
              {
                "ad": "Step Motorlar",
                "altlar": []
              },
              {
                "ad": "Hava Pompaları",
                "altlar": []
              },
              {
                "ad": "Vakum Pompaları",
                "altlar": []
              },
              {
                "ad": "Su Pompaları",
                "altlar": []
              },
              {
                "ad": "Amfibi Dalgıç Motorlar",
                "altlar": []
              },
              {
                "ad": "DC Motor Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Peristaltik Motorlar",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "TFT, LCD ve LED Ekranlar",
        "altlar": [
          {
            "ad": "TFT Ekran Modülleri",
            "altlar": [
              {
                "ad": "Akıllı Displayler",
                "altlar": []
              },
              {
                "ad": "TFT Demo Kitleri",
                "altlar": []
              },
              {
                "ad": "HMI ve HDMI Modüller",
                "altlar": []
              },
              {
                "ad": "TFT Dokunmatik Paneller",
                "altlar": []
              },
              {
                "ad": "TFT Kablo ve Konnektörleri",
                "altlar": []
              },
              {
                "ad": "TFT Paneller",
                "altlar": []
              },
              {
                "ad": "TFT Modüller",
                "altlar": []
              },
              {
                "ad": "TFT Kontrol Boardları",
                "altlar": []
              },
              {
                "ad": "Board Kameralar ve Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "LED Ekran Modülleri",
            "altlar": [
              {
                "ad": "Karakter ve Nümerik LED Displayler",
                "altlar": []
              },
              {
                "ad": "Diğer LED Displayler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "LCD Ekran Modülleri",
            "altlar": [
              {
                "ad": "Karakter LCDler",
                "altlar": []
              },
              {
                "ad": "COG LCDler",
                "altlar": []
              },
              {
                "ad": "Grafik LCDler",
                "altlar": []
              },
              {
                "ad": "LCD Dokunmatikleri",
                "altlar": []
              },
              {
                "ad": "Display Arka Işıklar",
                "altlar": []
              },
              {
                "ad": "E-Paper LCDler",
                "altlar": []
              },
              {
                "ad": "Karakter ve Nümerik LCD Displayler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "OLED Ekran Modülleri",
            "altlar": [
              {
                "ad": "Karakter OLEDler",
                "altlar": []
              },
              {
                "ad": "Grafik OLEDler",
                "altlar": []
              },
              {
                "ad": "COG OLEDler",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Optoelektronikler",
        "altlar": [
          {
            "ad": "Optokuplörler, Fotokuplörler ve Optikler",
            "altlar": [
              {
                "ad": "Logıc Çıkışlı Optokuplörler",
                "altlar": []
              },
              {
                "ad": "Gate Sürücü Optokuplörleri",
                "altlar": []
              },
              {
                "ad": "Fiber Optik Alıcı ve Vericiler",
                "altlar": []
              },
              {
                "ad": "Lazer Diyotlar",
                "altlar": []
              },
              {
                "ad": "Transistör ve Fotovoltaik Çıkışlı Optokuplörler",
                "altlar": []
              },
              {
                "ad": "Triyak SCR Çıkışlı Optokuplörler",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Konnektör ve Bağlantı Elemanları",
        "altlar": [
          {
            "ad": "Şöntler ve Jumperlar",
            "altlar": [
              {
                "ad": "Mini Jumperlar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Konnektör Çeşitleri",
            "altlar": [
              {
                "ad": "PCB Konnektörler",
                "altlar": []
              },
              {
                "ad": "Housing Konnektörler",
                "altlar": []
              },
              {
                "ad": "Array ve Mezzanine Konnektörler",
                "altlar": []
              },
              {
                "ad": "Yay Yüklü Konnektörler",
                "altlar": []
              },
              {
                "ad": "Mikro Match Konnektörler",
                "altlar": []
              },
              {
                "ad": "PCB Konnektör Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Housing Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Aydınlatma Konnektörleri",
            "altlar": [
              {
                "ad": "LED Konnektörleri",
                "altlar": []
              },
              {
                "ad": "Aydınlatma Konnektörü Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Su Geçirmez Koruyucu Valfler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Dairesel Konnektörler",
            "altlar": [
              {
                "ad": "Mikro Mike Jack Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Arka Kapak ve Kablo Kelepçeleri",
                "altlar": []
              },
              {
                "ad": "MIL Spec Konnektörleri",
                "altlar": []
              },
              {
                "ad": "Mikro Mike Jack Terminalleri",
                "altlar": []
              },
              {
                "ad": "Mikro Mike Jackler",
                "altlar": []
              },
              {
                "ad": "Mini DIN Jack Konnektörler",
                "altlar": []
              },
              {
                "ad": "Dairesel Konnektör Housingleri",
                "altlar": []
              },
              {
                "ad": "Dairesel Güç Konnektörleri",
                "altlar": []
              },
              {
                "ad": "Dairesel Güç Adaptörleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Terminal Konnektörler",
            "altlar": [
              {
                "ad": "Vida Tipi Konnektörler",
                "altlar": []
              },
              {
                "ad": "Quick Disconnect Konnektörler",
                "altlar": []
              },
              {
                "ad": "Yuvarlak Tip Konnektörler",
                "altlar": []
              },
              {
                "ad": "Kablo Pin Konnektörler",
                "altlar": []
              },
              {
                "ad": "Çatal Tip Terminaller",
                "altlar": []
              },
              {
                "ad": "Barrel - Bullet Konnektörler",
                "altlar": []
              },
              {
                "ad": "Tekli Pin Konnektörler",
                "altlar": []
              },
              {
                "ad": "Hazneli Pimler",
                "altlar": []
              },
              {
                "ad": "Kablo Birleştirici Konnektörleri",
                "altlar": []
              },
              {
                "ad": "Pil Yayları",
                "altlar": []
              },
              {
                "ad": "Pabuç Terminaller",
                "altlar": []
              },
              {
                "ad": "Yaylı-Baskılı Konnektörler",
                "altlar": []
              },
              {
                "ad": "Kablo Yüksükleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "USB, DVI, HDMI Konnektörler",
            "altlar": [
              {
                "ad": "HDMI Konnektörler",
                "altlar": []
              },
              {
                "ad": "USB, DVI, HDMI Konnektör Adaptörleri",
                "altlar": []
              },
              {
                "ad": "DVI Konnektörleri",
                "altlar": []
              },
              {
                "ad": "USB Konnektörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Modüler Konnektörler",
            "altlar": [
              {
                "ad": "Keystone - Insert Jackler",
                "altlar": []
              },
              {
                "ad": "Trafolu Modüler Jackler",
                "altlar": []
              },
              {
                "ad": "Modüler Pluglar",
                "altlar": []
              },
              {
                "ad": "Kablolu Modüler Jackler",
                "altlar": []
              },
              {
                "ad": "Modüler Jackler",
                "altlar": []
              },
              {
                "ad": "Modüler Konnektör Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Power Konnektörler",
            "altlar": [
              {
                "ad": "Power Jackler",
                "altlar": []
              },
              {
                "ad": "Power Pluglar",
                "altlar": []
              },
              {
                "ad": "Güç Giriş Modülleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Entegre Soketleri",
            "altlar": [
              {
                "ad": "Hassas Entegre Soketler",
                "altlar": []
              },
              {
                "ad": "Yay Yüklü Entegre Soketler",
                "altlar": []
              },
              {
                "ad": "ZIF Soketler",
                "altlar": []
              },
              {
                "ad": "PLCC Soketleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Klemensler",
            "altlar": [
              {
                "ad": "Terminal Şeritleri ve Taret Panoları",
                "altlar": []
              },
              {
                "ad": "PCB Klemensler",
                "altlar": []
              },
              {
                "ad": "Geçmeli Klemensler",
                "altlar": []
              },
              {
                "ad": "Trafo Klemensleri",
                "altlar": []
              },
              {
                "ad": "Klemens Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Duvar Tipi Klemensler",
                "altlar": []
              },
              {
                "ad": "Bariyer Tipi Klemensler",
                "altlar": []
              },
              {
                "ad": "Ray Tipi Klemensler",
                "altlar": []
              },
              {
                "ad": "Arayüz Modülü",
                "altlar": []
              },
              {
                "ad": "Besleme Terminalleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Header Konnektörler",
            "altlar": [
              {
                "ad": "Pin Headerlar",
                "altlar": []
              },
              {
                "ad": "Dişi Headerlar",
                "altlar": []
              },
              {
                "ad": "Box Headerlar",
                "altlar": []
              },
              {
                "ad": "Kilitli Box Headerlar",
                "altlar": []
              },
              {
                "ad": "Kilitli Box Header Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "D-Sub ve D-Shaped Konnektörler",
            "altlar": [
              {
                "ad": "D-SUB Konnektörler",
                "altlar": []
              },
              {
                "ad": "D-SUB Kapakları",
                "altlar": []
              },
              {
                "ad": "D-SUB Vidaları",
                "altlar": []
              },
              {
                "ad": "D-SUB Terminalleri",
                "altlar": []
              },
              {
                "ad": "D-Shaped Konnektörler",
                "altlar": []
              },
              {
                "ad": "D-SUB Housing Konnektörler",
                "altlar": []
              },
              {
                "ad": "D-Sub ve D-Shaped Konnektör Adaptörleri",
                "altlar": []
              },
              {
                "ad": "D-Sub ve D-Shaped Konnektör Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Distanslar, İzolatörler ve Bağlantı Elemanları",
            "altlar": [
              {
                "ad": "LED Distansları",
                "altlar": []
              },
              {
                "ad": "Tırnaklı Distanslar",
                "altlar": []
              },
              {
                "ad": "PCB Distanslar",
                "altlar": []
              },
              {
                "ad": "LED Yuvaları",
                "altlar": []
              },
              {
                "ad": "Delik Kapakları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "RF Arabağlantıları",
            "altlar": [
              {
                "ad": "Koaksiyel Konnektörler, RF Sonlandırıcıları",
                "altlar": []
              },
              {
                "ad": "Koaksiyel Konnektörler, RF Konnektörleri",
                "altlar": []
              },
              {
                "ad": "Koaksiyel Konnektörler, RF Adaptörleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Hafıza Konnektörleri",
            "altlar": [
              {
                "ad": "Inline Modül Soketleri",
                "altlar": []
              },
              {
                "ad": "Inline Modül Soket Aksesuarları",
                "altlar": []
              },
              {
                "ad": "PC Kart Soketleri",
                "altlar": []
              },
              {
                "ad": "Aksesuarlar",
                "altlar": []
              },
              {
                "ad": "PC Kart Adaptörleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Card Edge Konnektörler",
            "altlar": [
              {
                "ad": "Card Edge Terminalleri",
                "altlar": []
              },
              {
                "ad": "Edgeboard Konnektörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Arka Panel Konnektörleri",
            "altlar": [
              {
                "ad": "DIN41612",
                "altlar": []
              },
              {
                "ad": "Özellikli Arka Panel Konnektörleri",
                "altlar": []
              },
              {
                "ad": "Arka Panel Konnektör Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Sert Metrik Konnektörler",
                "altlar": []
              },
              {
                "ad": "Arka Panel Konnektör Housingleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "FFC ve FPC Serisi Konnektörleri",
            "altlar": [
              {
                "ad": "FFC ve FPC Konnektörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Kontaktlar",
            "altlar": [
              {
                "ad": "PCB Konnektör Terminalleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Barrel-Audio Konnektörler",
            "altlar": [
              {
                "ad": "Audio Jackler",
                "altlar": []
              },
              {
                "ad": "Phone Jackler",
                "altlar": []
              },
              {
                "ad": "RCA Jackler",
                "altlar": []
              },
              {
                "ad": "Phone RCA Pluglar",
                "altlar": []
              },
              {
                "ad": "XLR Pluglar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "IDC Konnektörler",
            "altlar": [
              {
                "ad": "IDC Soketler",
                "altlar": []
              },
              {
                "ad": "IDC Soket Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Geçmeli Konnektörler",
            "altlar": [
              {
                "ad": "SFP,QSFP Konnektörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Fiber Optik Zayıflatıcıları ve Konnektörleri",
            "altlar": [
              {
                "ad": "Fiber Optik Konnektörleri",
                "altlar": []
              },
              {
                "ad": "Fiber Optik Adaptörleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Aletler",
            "altlar": [
              {
                "ad": "Kablo Sıkıştırıcıları, Soyucuları ve Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Çeşitli Pense Setleri",
                "altlar": []
              },
              {
                "ad": "Kıvırıcı, Aplikatör, Pres Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Pin Ekleme, Çıkarma Aletleri",
                "altlar": []
              },
              {
                "ad": "Sıkıştırma Başlıkları ve Kalıp Setleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Heavy Duty Konnektörler",
            "altlar": [
              {
                "ad": "Insert ve Modüller",
                "altlar": []
              },
              {
                "ad": "Heavy Duty Kapakları",
                "altlar": []
              },
              {
                "ad": "Heavy Duty Tabanları",
                "altlar": []
              },
              {
                "ad": "Heavy Duty Terminalleri",
                "altlar": []
              },
              {
                "ad": "Heavy Duty Konnektör Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Konnektör Kitleri",
            "altlar": [
              {
                "ad": "SMA Kitleri",
                "altlar": []
              },
              {
                "ad": "Distans Kitleri",
                "altlar": []
              },
              {
                "ad": "Dikdörtgensel Kitler",
                "altlar": []
              },
              {
                "ad": "Terminal Kitleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Fotovoltaik Konnektörler",
            "altlar": [
              {
                "ad": "Solar Panel Konnektörler",
                "altlar": []
              },
              {
                "ad": "Solar Panel Konnektör Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Test Konnektörleri ve Klipsleri",
            "altlar": [
              {
                "ad": "Bağlantı Maşaları",
                "altlar": []
              },
              {
                "ad": "Banana Plugları ve Konnektörler",
                "altlar": []
              },
              {
                "ad": "Test Konnektör Adaptörleri",
                "altlar": []
              },
              {
                "ad": "BNC Güvenlik Konnektörleri,Soketler, Kablolar",
                "altlar": []
              },
              {
                "ad": "Binding Postlar",
                "altlar": []
              },
              {
                "ad": "Kavrayıcı Klipsler ve Kancalar",
                "altlar": []
              },
              {
                "ad": "İğne Uçlu Problar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Test Uçları ve Probları",
            "altlar": [
              {
                "ad": "Test Uçları ve Sayaç Arayüzleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Test Pointler",
            "altlar": [
              {
                "ad": "Pc Test Pointler ve Minyatürleri",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Kablolar ve Teller",
        "altlar": [
          {
            "ad": "USB Kablolar ve Çevirici Adaptörler",
            "altlar": [
              {
                "ad": "USB Kablolar",
                "altlar": []
              },
              {
                "ad": "Çevirici Adaptörler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Kablo Takımları",
            "altlar": [
              {
                "ad": "Telefon Kabloları",
                "altlar": []
              },
              {
                "ad": "Tekli İletken Kablolar",
                "altlar": []
              },
              {
                "ad": "Dairesel Kablo Takımları",
                "altlar": []
              },
              {
                "ad": "Çoklu İletken Kablolar",
                "altlar": []
              },
              {
                "ad": "Barrel-Audio Kabloları",
                "altlar": []
              },
              {
                "ad": "Video Kabloları",
                "altlar": []
              },
              {
                "ad": "Fiber Optik Kablo Takımları",
                "altlar": []
              },
              {
                "ad": "D-SUB Kablo Takımları",
                "altlar": []
              },
              {
                "ad": "Atlama Kabloları, Krimp Bağlantılı Ara Kabloları",
                "altlar": []
              },
              {
                "ad": "Dikdörtgensel Kablo Takımları",
                "altlar": []
              },
              {
                "ad": "Güç, Kablo Hatları ve Uzatma Kordonları",
                "altlar": []
              },
              {
                "ad": "Koaksiyel Kablo Takımları",
                "altlar": []
              },
              {
                "ad": "Modüler Kablolar",
                "altlar": []
              },
              {
                "ad": "Fotovoltaik Kablo Takımları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Kablo Yönetimleri",
            "altlar": [
              {
                "ad": "Kablo Lehim Kılıfı",
                "altlar": []
              },
              {
                "ad": "Topraklama Örgüleri",
                "altlar": []
              },
              {
                "ad": "Kablo Rakorları",
                "altlar": []
              },
              {
                "ad": "Kablo Destekleyici ve Bağlayıcıları",
                "altlar": []
              },
              {
                "ad": "Kablo Bağları",
                "altlar": []
              },
              {
                "ad": "Kablo Etiketleme Ürünleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Flat Flexible Kablolar ve Jumperlar",
            "altlar": [
              {
                "ad": "FFC ve FPC Kablolar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Flat Kablolar",
            "altlar": [
              {
                "ad": "Flat Ribbon Kablolar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Fiber Optikler",
            "altlar": [
              {
                "ad": "Fiber Optik Kablolar",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Bataryalar",
        "altlar": [
          {
            "ad": "Şarj Edilemeyen Piller",
            "altlar": [
              {
                "ad": "Çinko-Karbon Piller",
                "altlar": []
              },
              {
                "ad": "Çinko-Hava Piller",
                "altlar": []
              },
              {
                "ad": "Alkalin Piller",
                "altlar": []
              },
              {
                "ad": "Lityum Piller",
                "altlar": []
              }
            ]
          },
          {
            "ad": "VRLA Kuru Aküler",
            "altlar": [
              {
                "ad": "AGM Kuru Aküler",
                "altlar": []
              },
              {
                "ad": "JEL Kuru Aküler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Batarya Aksesuarları",
            "altlar": [
              {
                "ad": "Pil Yuvaları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Şarj Edilebilir Piller",
            "altlar": [
              {
                "ad": "Şarj Edilebilir Lityum Piller",
                "altlar": []
              },
              {
                "ad": "Ni-Cd Piller",
                "altlar": []
              },
              {
                "ad": "Ni-Mh Piller",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Taşınabilir Şarj Cihazları",
            "altlar": [
              {
                "ad": "Powerbanklar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Pil Şarj Cihazları",
            "altlar": [
              {
                "ad": "Pil Şarj Aletleri",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "Enerji & Güç Kaynakları",
        "altlar": [
          {
            "ad": "Dönüştürücü Modüller",
            "altlar": [
              {
                "ad": "AC/DC Dönüştürücüler",
                "altlar": []
              },
              {
                "ad": "DC/DC Dönüştürücüler",
                "altlar": []
              },
              {
                "ad": "İzole Dönüştürücü Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "UPS - Kesintisiz Güç Kaynakları",
            "altlar": [
              {
                "ad": "Line Interactive UPS",
                "altlar": []
              },
              {
                "ad": "On-Line UPS",
                "altlar": []
              },
              {
                "ad": "Hibrit UPS",
                "altlar": []
              },
              {
                "ad": "UPS Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "STS - Statik Transfer Anahtarları",
            "altlar": [
              {
                "ad": "Raf Montajlı Statik Transfer Anahtarları",
                "altlar": []
              },
              {
                "ad": "Hot Swap Statik Transfer Anahtarları",
                "altlar": []
              },
              {
                "ad": "Kabinli Statik Transfer Anahtarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "AC/DC Adaptörler",
            "altlar": [
              {
                "ad": "Tek Çıkışlı Adaptörler",
                "altlar": []
              },
              {
                "ad": "Duvar Tipi Adaptörler",
                "altlar": []
              },
              {
                "ad": "Masaüstü Tipi Adaptörler",
                "altlar": []
              },
              {
                "ad": "Çok Çıkışlı Adaptörler",
                "altlar": []
              },
              {
                "ad": "Adaptör Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Elektrikli Araç (EV) Şarj & Mobilite Sistemleri",
            "altlar": [
              {
                "ad": "Elektrikli Araç (EV) Şarj Kontaktörleri",
                "altlar": []
              },
              {
                "ad": "Elektrikli Araç (EV) Şarj Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Elektrikli Araç (EV) Şarj Soketleri & Fişleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Yenilenebilir Enerji Sistemleri",
            "altlar": [
              {
                "ad": "Tam Sinüs Dalgası Solar İnverterler",
                "altlar": []
              },
              {
                "ad": "Kristalize Güneş Panelleri",
                "altlar": []
              },
              {
                "ad": "MPPT Solar Şarj Cihazları",
                "altlar": []
              },
              {
                "ad": "PWM Solar Şarj Cihazları",
                "altlar": []
              },
              {
                "ad": "Röle Kontrol Modülleri",
                "altlar": []
              },
              {
                "ad": "Yenilenebilir Enerji Sistemleri Aksesuarları",
                "altlar": []
              }
            ]
          }
        ]
      },
      {
        "ad": "RF & Kablosuz Çözümleri",
        "altlar": [
          {
            "ad": "Antenler",
            "altlar": [
              {
                "ad": "RF Antenler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "RF Araç Gereçler",
            "altlar": [
              {
                "ad": "RF Aksesuarları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "RF Bitmiş Ürünler",
            "altlar": [
              {
                "ad": "RF Test ve Ölçümleme",
                "altlar": []
              },
              {
                "ad": "RF Uzaktan Kumandalar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "RF Geliştirme Kitleri ve Programlayıcıları",
            "altlar": [
              {
                "ad": "RF Geliştirme Devreleri",
                "altlar": []
              },
              {
                "ad": "RF Programlayıcıları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "RF Modüller",
            "altlar": [
              {
                "ad": "Bluetooth Modülleri",
                "altlar": []
              },
              {
                "ad": "UWB Modüller",
                "altlar": []
              },
              {
                "ad": "GSM ve GNSS Modülleri",
                "altlar": []
              },
              {
                "ad": "Radar Modülleri",
                "altlar": []
              },
              {
                "ad": "WiFi Modülleri",
                "altlar": []
              },
              {
                "ad": "Subghz modüller",
                "altlar": []
              }
            ]
          },
          {
            "ad": "RF Zayıflatıcılar",
            "altlar": [
              {
                "ad": "Diğer Zayıflatıcılar",
                "altlar": []
              },
              {
                "ad": "Chip Zayıflatıcılar",
                "altlar": []
              },
              {
                "ad": "Dijital Zayıflatıcılar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "RF & Mikrodalga Ürünleri",
            "altlar": [
              {
                "ad": "PIN Diyotlu RF Anahtarlama Modülleri",
                "altlar": []
              },
              {
                "ad": "RF Amplifikatörler",
                "altlar": []
              },
              {
                "ad": "RF Entegreleri",
                "altlar": []
              },
              {
                "ad": "RF Anahtarlama Entegreleri",
                "altlar": []
              },
              {
                "ad": "Dielektrik Osilatörler",
                "altlar": []
              },
              {
                "ad": "RF Sinyal Jeneratörleri",
                "altlar": []
              },
              {
                "ad": "RF Sürücü Yükselteçleri",
                "altlar": []
              },
              {
                "ad": "Frekans Dönüştürücüler",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Telekom Ürünleri",
            "altlar": [
              {
                "ad": "Telekom Jumperları",
                "altlar": []
              },
              {
                "ad": "Telekom Konnektörleri",
                "altlar": []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "ad": "LED & Aydınlatma Ürünleri",
    "altlar": [
      {
        "ad": "LED Devre Koruyucular",
        "altlar": [
          {
            "ad": "LED Şönt Koruyucular",
            "altlar": []
          },
          {
            "ad": "LED Transformatörler",
            "altlar": []
          },
          {
            "ad": "LED - Yüksek Gerilim Koruyucular",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Mobilya Aydınlatma",
        "altlar": [
          {
            "ad": "Gömme Spotlar",
            "altlar": []
          },
          {
            "ad": "Yarım Ay Vitrin Lamba",
            "altlar": []
          },
          {
            "ad": "Dağıtıcı Kutu",
            "altlar": []
          },
          {
            "ad": "Mobilya LED Sürücüleri",
            "altlar": []
          },
          {
            "ad": "Ses Sistemleri",
            "altlar": []
          },
          {
            "ad": "LED Gardırop Aydınlatma",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Lamba Çeşitleri",
        "altlar": [
          {
            "ad": "LED ve Aydınlatma İndikatörleri",
            "altlar": []
          },
          {
            "ad": "Sokak Lambaları",
            "altlar": []
          },
          {
            "ad": "Ampüller",
            "altlar": []
          },
          {
            "ad": "LED Floresanlar",
            "altlar": []
          },
          {
            "ad": "LED Paneller",
            "altlar": []
          },
          {
            "ad": "LED Ampüller",
            "altlar": []
          }
        ]
      },
      {
        "ad": "LED Optikleri",
        "altlar": [
          {
            "ad": "LED Lensleri",
            "altlar": []
          },
          {
            "ad": "LED Reflektörler",
            "altlar": []
          }
        ]
      },
      {
        "ad": "LED Komponentler",
        "altlar": [
          {
            "ad": "Aydınlatma LEDleri - Beyaz",
            "altlar": []
          },
          {
            "ad": "Sinyal LEDler - Tek Renkli",
            "altlar": []
          },
          {
            "ad": "Sinyal LEDler - Beyaz",
            "altlar": []
          },
          {
            "ad": "Görünmez Işık - Ultraviyole LEDler",
            "altlar": []
          },
          {
            "ad": "Aydınlatma LEDleri - Tek Renkli",
            "altlar": []
          },
          {
            "ad": "Sinyal LEDler - Çok Renkli",
            "altlar": []
          },
          {
            "ad": "Aydınlatma LEDleri - Çok Renkli",
            "altlar": []
          },
          {
            "ad": "Adreslenebilir LEDler",
            "altlar": []
          }
        ]
      },
      {
        "ad": "COB LEDler ve LED Modüller",
        "altlar": [
          {
            "ad": "COB LEDler",
            "altlar": []
          },
          {
            "ad": "COB LED Aksesuarları",
            "altlar": []
          },
          {
            "ad": "AC LED Modüller",
            "altlar": []
          },
          {
            "ad": "DC LED Modüller",
            "altlar": []
          }
        ]
      },
      {
        "ad": "LED Sürücüler",
        "altlar": [
          {
            "ad": "Dış Mekan LED Sürücüleri",
            "altlar": []
          },
          {
            "ad": "İç Mekan LED Sürücüleri",
            "altlar": []
          },
          {
            "ad": "Programlayıcılar",
            "altlar": []
          }
        ]
      }
    ]
  },
  {
    "ad": "Maker & IoT Ürünleri",
    "altlar": [
      {
        "ad": "3D Yazıcılar ve Filamentler",
        "altlar": [
          {
            "ad": "3D Yazıcılar",
            "altlar": []
          },
          {
            "ad": "3D Yazıcı Aksesuarları",
            "altlar": []
          },
          {
            "ad": "Filamentler",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Arduino",
        "altlar": [
          {
            "ad": "Arduino Sensörleri ve Modülleri",
            "altlar": []
          },
          {
            "ad": "Arduino Shield'ler",
            "altlar": []
          },
          {
            "ad": "Arduino Geliştirme Kartları",
            "altlar": []
          },
          {
            "ad": "Arduino Kitleri",
            "altlar": []
          },
          {
            "ad": "RFID Modüller ve Aksesuarlar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "DIY (Do It Yourself)",
        "altlar": [
          {
            "ad": "StemistBox",
            "altlar": []
          },
          {
            "ad": "Robotik Ürünler ve Aksesuarları",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Geliştirme Platformları",
        "altlar": [
          {
            "ad": "İnterface Dönüştürücüler",
            "altlar": []
          },
          {
            "ad": "Geliştirme Kitleri ve Aksesuarları",
            "altlar": []
          }
        ]
      },
      {
        "ad": "IoT Dünyası",
        "altlar": [
          {
            "ad": "LoRaWan Gateway",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Maker Araç ve Gereçleri",
        "altlar": [
          {
            "ad": "SMD - DIP  Dönüştürücüler ve Adaptörler",
            "altlar": []
          },
          {
            "ad": "Maker Aksesuarları",
            "altlar": []
          },
          {
            "ad": "Prototipleme Devreleri",
            "altlar": []
          },
          {
            "ad": "Hafıza Kartları ve Aksesuarları",
            "altlar": []
          },
          {
            "ad": "Programlayıcı Aksesuarları",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Maker ve IoT Fanlar",
        "altlar": [
          {
            "ad": "Aksiyel Fanlar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Programlayıcılar ve Hata Ayıklayıcılar",
        "altlar": [
          {
            "ad": "Ses Entegreleri Programlayıcıları",
            "altlar": []
          },
          {
            "ad": "İşlemci Programlayıcıları",
            "altlar": []
          },
          {
            "ad": "Diğer Programlayıcılar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Sensörler ve Modüller",
        "altlar": [
          {
            "ad": "TFT, LCD, OLED Modüller",
            "altlar": []
          },
          {
            "ad": "Sensörler",
            "altlar": []
          },
          {
            "ad": "Modüller",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Tek Kart Bilgisayarlar ve Modüller",
        "altlar": [
          {
            "ad": "Tek Kart Bilgisayarlar",
            "altlar": []
          },
          {
            "ad": "Tek Kart Bilgisayar Modülleri",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Akıllı Gözlükler",
        "altlar": [
          {
            "ad": "Artırılmış Gerçeklik (AR) Gözlükleri",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Robotik Ürünler",
        "altlar": [
          {
            "ad": "Otopilot Sistemleri",
            "altlar": []
          }
        ]
      }
    ]
  },
  {
    "ad": "Üretim Ekipmanları",
    "altlar": [
      {
        "ad": "ESD Giyim Ürünleri",
        "altlar": [
          {
            "ad": "ESD Ayakkabılar",
            "altlar": []
          },
          {
            "ad": "ESD Terlikler",
            "altlar": []
          },
          {
            "ad": "ESD Önlükler",
            "altlar": []
          },
          {
            "ad": " ESD T-Shirtler",
            "altlar": []
          },
          {
            "ad": "ESD Eldivenler ve Parmak Koruma",
            "altlar": []
          },
          {
            "ad": "ESD Tulumlar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Kimyasallar",
        "altlar": [
          {
            "ad": "Spreyler",
            "altlar": []
          },
          {
            "ad": "Kremler",
            "altlar": []
          },
          {
            "ad": "Sıvılar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Dizgi ve Sayma Ekipmanları",
        "altlar": [
          {
            "ad": "Komponent Sayma Makineleri",
            "altlar": []
          },
          {
            "ad": "Masaüstü İmalat Sistemleri",
            "altlar": []
          },
          {
            "ad": "SMD Tape & Reel Sarf Malzemeleri",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Büyüteçler ve Mikroskoplar",
        "altlar": [
          {
            "ad": "Ayaklı Akrobat Büyüteçler",
            "altlar": []
          },
          {
            "ad": "El Büyüteçleri",
            "altlar": []
          },
          {
            "ad": "Kafa Büyüteçleri",
            "altlar": []
          },
          {
            "ad": "Masa Bağlantılı Akrobat Büyüteçler",
            "altlar": []
          },
          {
            "ad": "Masa Tipi Büyüteçler",
            "altlar": []
          },
          {
            "ad": "Mikroskoplar",
            "altlar": []
          },
          {
            "ad": "Büyüteç ve Mikroskop Aydınlatma",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Aksesuarlar",
        "altlar": [
          {
            "ad": "Topraklama Ürünleri",
            "altlar": []
          },
          {
            "ad": "Giyim Ürünleri",
            "altlar": []
          },
          {
            "ad": "Mıknatıslama Ürünleri",
            "altlar": []
          },
          {
            "ad": "Sıvı Saklama Şişeleri",
            "altlar": []
          },
          {
            "ad": "Komponent Saklama Kutuları",
            "altlar": []
          },
          {
            "ad": "Su Terazileri",
            "altlar": []
          },
          {
            "ad": "Basınç Dengeleme Elemanları",
            "altlar": []
          },
          {
            "ad": "Koruyucu Gözlükler",
            "altlar": []
          }
        ]
      },
      {
        "ad": "ESD Ürünler",
        "altlar": [
          {
            "ad": "ESD Sandalyeler",
            "altlar": []
          },
          {
            "ad": "ESD El Aletleri",
            "altlar": []
          },
          {
            "ad": "ESD Tepsiler",
            "altlar": []
          },
          {
            "ad": "ESD Avadanlık",
            "altlar": []
          },
          {
            "ad": "ESD Kasalar",
            "altlar": []
          },
          {
            "ad": "ESD PCB Kart Taşıyıcılar",
            "altlar": []
          },
          {
            "ad": "ESD Poşetleri",
            "altlar": []
          },
          {
            "ad": "ESD Cımbızlar",
            "altlar": []
          },
          {
            "ad": "ESD Bileklikler",
            "altlar": []
          },
          {
            "ad": "ESD Aksesuarları",
            "altlar": []
          },
          {
            "ad": "ESD İletken Süngerler",
            "altlar": []
          },
          {
            "ad": "ESD Çöp Kovaları",
            "altlar": []
          },
          {
            "ad": "ESD Onarım Ürünleri",
            "altlar": []
          },
          {
            "ad": "ESD Temizleme Ürünleri",
            "altlar": []
          },
          {
            "ad": "ESD Entegre Vakum Kalemleri",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Sarf Malzemeler",
        "altlar": [
          {
            "ad": "Yaylar",
            "altlar": []
          },
          {
            "ad": "Silikon Matlar",
            "altlar": []
          },
          {
            "ad": "Flanşlar",
            "altlar": []
          },
          {
            "ad": "Cıvata Kapakları",
            "altlar": []
          },
          {
            "ad": "Dübeller",
            "altlar": []
          },
          {
            "ad": "Vidalar",
            "altlar": []
          },
          {
            "ad": "Cıvatalar",
            "altlar": []
          },
          {
            "ad": "Somunlar ve Rondelalar",
            "altlar": []
          },
          {
            "ad": "Bağlantı Kutuları",
            "altlar": []
          },
          {
            "ad": "Isı Transfer Bantları",
            "altlar": []
          },
          {
            "ad": "Elektrik İzolasyon Bantları",
            "altlar": []
          },
          {
            "ad": "Contalar",
            "altlar": []
          },
          {
            "ad": "Çift Taraflı Bantlar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Test ve Ölçüm Aletleri",
        "altlar": [
          {
            "ad": "Multimetreler",
            "altlar": []
          },
          {
            "ad": "Osiloskoplar",
            "altlar": []
          },
          {
            "ad": "Pensampermetreler",
            "altlar": []
          },
          {
            "ad": "Güç Kaynakları",
            "altlar": []
          },
          {
            "ad": "Test Cihazları",
            "altlar": []
          },
          {
            "ad": "Diğer Ölçüm Aletleri",
            "altlar": []
          },
          {
            "ad": "Kumpaslar ve Mikrometreler",
            "altlar": []
          },
          {
            "ad": "Görüntüleme Cihazları",
            "altlar": []
          },
          {
            "ad": "Şerit Metreler",
            "altlar": []
          },
          {
            "ad": "Kablo İzleyiciler",
            "altlar": []
          },
          {
            "ad": "Veri Kaydediciler",
            "altlar": []
          }
        ]
      },
      {
        "ad": "El Aletleri",
        "altlar": [
          {
            "ad": "Bıçak ve Kesiciler",
            "altlar": []
          },
          {
            "ad": "Cımbızlar",
            "altlar": []
          },
          {
            "ad": "Penseler",
            "altlar": []
          },
          {
            "ad": "Yankeskiler",
            "altlar": []
          },
          {
            "ad": "Silikon Tabancaları",
            "altlar": []
          },
          {
            "ad": "Alet Çantaları",
            "altlar": []
          },
          {
            "ad": "Tornavidalar",
            "altlar": []
          },
          {
            "ad": "Anahtarlar",
            "altlar": []
          },
          {
            "ad": "Cam Aynalar",
            "altlar": []
          },
          {
            "ad": "Cetveller",
            "altlar": []
          },
          {
            "ad": "Komponent Tutucu ve Sökücüler",
            "altlar": []
          },
          {
            "ad": "Konik Raybalar",
            "altlar": []
          },
          {
            "ad": "Makaslar",
            "altlar": []
          },
          {
            "ad": "Matkap Uçları",
            "altlar": []
          },
          {
            "ad": "Teknisyen Tamir Setleri",
            "altlar": []
          },
          {
            "ad": "Punch Setleri",
            "altlar": []
          },
          {
            "ad": "İşaretleyiciler",
            "altlar": []
          },
          {
            "ad": "Yaylı Kancalar",
            "altlar": []
          },
          {
            "ad": "Matkaplar",
            "altlar": []
          },
          {
            "ad": "Eğeler",
            "altlar": []
          },
          {
            "ad": "Testereler",
            "altlar": []
          },
          {
            "ad": "Mengeneler",
            "altlar": []
          },
          {
            "ad": "Takım Kitleri",
            "altlar": []
          },
          {
            "ad": "El Aletleri Tutucuları Ve Stantları",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Işıklar ve Fenerler",
        "altlar": [
          {
            "ad": "El Fenerleri",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Lehimleme Ürünleri",
        "altlar": [
          {
            "ad": "Lehimler ve Fluxlar",
            "altlar": [
              {
                "ad": "Lehim Telleri",
                "altlar": []
              },
              {
                "ad": "Lehim Fluxları",
                "altlar": []
              },
              {
                "ad": "Flux Tinerler",
                "altlar": []
              },
              {
                "ad": "Lehimleme Alkolleri",
                "altlar": []
              },
              {
                "ad": "Lehimleme Yardımcı Elemanları",
                "altlar": []
              },
              {
                "ad": "Lehim Kremleri",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Havyalar",
            "altlar": [
              {
                "ad": "USB Havyalar",
                "altlar": []
              },
              {
                "ad": "Pilli Havyalar",
                "altlar": []
              },
              {
                "ad": "Gazlı Havyalar",
                "altlar": []
              },
              {
                "ad": "Elektrikli Havyalar",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Yedek Malzemeler",
            "altlar": [
              {
                "ad": "Lehimleme Aksesuarları",
                "altlar": []
              },
              {
                "ad": "Havya Uçları",
                "altlar": []
              },
              {
                "ad": "Yedek Havya Kolları",
                "altlar": []
              },
              {
                "ad": "Lehim Nozulları",
                "altlar": []
              },
              {
                "ad": "Lehim Rezistansları",
                "altlar": []
              },
              {
                "ad": "Sıcak Hava Üfleme Kolları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Lehimleme Yardımcı Ürünleri",
            "altlar": [
              {
                "ad": "Lehim Sökücüler",
                "altlar": []
              },
              {
                "ad": "Sarf Malzemeleri",
                "altlar": []
              },
              {
                "ad": "Temizleme Ürünleri",
                "altlar": []
              },
              {
                "ad": "Lehim Pompaları",
                "altlar": []
              },
              {
                "ad": "Lehim Sehpaları",
                "altlar": []
              },
              {
                "ad": "Lehim Potaları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Hava Tabancaları",
            "altlar": [
              {
                "ad": "Sıcak Hava Tabancaları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "Lehim İstasyonları",
            "altlar": [
              {
                "ad": "BGA İstasyonları",
                "altlar": []
              },
              {
                "ad": "Lehimleme İstasyonları",
                "altlar": []
              },
              {
                "ad": "Isıtma İstasyonları",
                "altlar": []
              },
              {
                "ad": "Kablo Sıyırma İstasyonları",
                "altlar": []
              }
            ]
          },
          {
            "ad": "İyonizerler",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Duman Emici Sistemler",
        "altlar": [
          {
            "ad": "Duman Emici Ürünler",
            "altlar": []
          },
          {
            "ad": "Duman Emici Sistem Aksesuarları",
            "altlar": []
          }
        ]
      }
    ]
  },
  {
    "ad": "Otomasyon Ürünleri",
    "altlar": [
      {
        "ad": "PLC - Programlanabilir Logic Kontrolörler",
        "altlar": [
          {
            "ad": "PLC - CPU'lar",
            "altlar": []
          },
          {
            "ad": "PLC Ek Modüller",
            "altlar": []
          },
          {
            "ad": "PLC Aksesuarlar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Motion Kontrolcüler",
        "altlar": [
          {
            "ad": "Motion CPU'lar",
            "altlar": []
          },
          {
            "ad": "Motion Ek Modüller",
            "altlar": []
          },
          {
            "ad": "Motion Aksesuarlar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "AC Servolar",
        "altlar": [
          {
            "ad": "AC Servo Sürücüler",
            "altlar": []
          },
          {
            "ad": "AC Servo Motorlar",
            "altlar": []
          },
          {
            "ad": "AC Servo Aksesuarlar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "AC Frekans Konvertörleri",
        "altlar": [
          {
            "ad": "Frekans Konvertörleri",
            "altlar": []
          },
          {
            "ad": "VFD Aksesuarlar",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Operatör Paneller ve Ekipmanları",
        "altlar": [
          {
            "ad": "HMI Paneller",
            "altlar": []
          },
          {
            "ad": "Lisans Kodları",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Remote IO'lar",
        "altlar": [
          {
            "ad": "Remote IO Modüller",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Endüstriyel Siviçler ve Konvertörler",
        "altlar": [
          {
            "ad": "Siviçler ve Konvertörler",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Şalt Ürünleri",
        "altlar": [
          {
            "ad": "Otomatik Sigortalar",
            "altlar": []
          },
          {
            "ad": "Kontaktörler",
            "altlar": []
          },
          {
            "ad": "Şalt Ürün Aksesuarları",
            "altlar": []
          },
          {
            "ad": "Şalt Yardımcı Ürünleri",
            "altlar": []
          },
          {
            "ad": "Termik Röleler",
            "altlar": []
          },
          {
            "ad": "Anahtar Mandal Butonları",
            "altlar": []
          },
          {
            "ad": "Nihayet Şalterleri",
            "altlar": []
          },
          {
            "ad": "Darbe Akım Anahtarları",
            "altlar": []
          },
          {
            "ad": "Zaman Röleleri",
            "altlar": []
          },
          {
            "ad": "Kaçak Akım Koruma Şalterleri",
            "altlar": []
          },
          {
            "ad": "Işıklı Mandallı Butonlar",
            "altlar": []
          },
          {
            "ad": "Kompakt Şalterler",
            "altlar": []
          },
          {
            "ad": "Pnömatik Kontaktörler",
            "altlar": []
          },
          {
            "ad": "Parafudurlar",
            "altlar": []
          },
          {
            "ad": "Güç Şalterleri",
            "altlar": []
          },
          {
            "ad": "Motor Koruma Şalterleri",
            "altlar": []
          },
          {
            "ad": "Yük Ayırıcıları",
            "altlar": []
          },
          {
            "ad": "Tesisat Kontaktörleri",
            "altlar": []
          },
          {
            "ad": "Açık Tip Şalterler",
            "altlar": []
          },
          {
            "ad": "Bıçaklı Sigorta Taşıyıcılar",
            "altlar": []
          },
          {
            "ad": "Bıçak Sigortalar",
            "altlar": []
          },
          {
            "ad": "Toroid Akım Trafolar",
            "altlar": []
          },
          {
            "ad": "Kartuş Sigortalar",
            "altlar": []
          },
          {
            "ad": "Elektronik Röleler ve Kontroller",
            "altlar": []
          },
          {
            "ad": "Minyatür Röleler",
            "altlar": []
          },
          {
            "ad": "Minyatür Röle Soketleri",
            "altlar": []
          },
          {
            "ad": "Kartuş Sigorta Yuvaları",
            "altlar": []
          },
          {
            "ad": "Şebeke Analiz ve Ölçüm Cihazları",
            "altlar": []
          },
          {
            "ad": "Sınıflandırılmamış Şalt Ürünleri",
            "altlar": []
          },
          {
            "ad": "Pako Şalterler",
            "altlar": []
          },
          {
            "ad": "Buton ve Sinyal Lambaları",
            "altlar": []
          },
          {
            "ad": "Toroid Röleler",
            "altlar": []
          },
          {
            "ad": "Transfer Şalteri",
            "altlar": []
          },
          {
            "ad": "Güç Kondansatörleri",
            "altlar": []
          },
          {
            "ad": "Şönt Reaktörler",
            "altlar": []
          },
          {
            "ad": "Harmonik Reaktörler",
            "altlar": []
          },
          {
            "ad": "Yol Vericiler",
            "altlar": []
          },
          {
            "ad": "Yük Sürücüler",
            "altlar": []
          },
          {
            "ad": "Kaçak Akım Koruma Anahtarlı Otomatik Sigortalar",
            "altlar": []
          },
          {
            "ad": "Dağıtım Kutuları",
            "altlar": []
          },
          {
            "ad": "Endüstriyel Tip Fişler ve Prizler",
            "altlar": []
          },
          {
            "ad": "Kablo Kanalları ve Kapakları",
            "altlar": []
          },
          {
            "ad": "Solid State Kontaktörler",
            "altlar": []
          },
          {
            "ad": "Montaj Ürünleri",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Endüstriyel Otomasyon ve Kontrolleri",
        "altlar": [
          {
            "ad": "Diğer Endüstriyel Otomasyon Ürünleri",
            "altlar": []
          },
          {
            "ad": "Endüstriyel Otomasyon Aksesuarları",
            "altlar": []
          }
        ]
      },
      {
        "ad": "Endüstriyel Röleler",
        "altlar": [
          {
            "ad": "Otomasyon Röleleri",
            "altlar": []
          },
          {
            "ad": "Röle Bağlantı Soketleri",
            "altlar": []
          },
          {
            "ad": "Otomasyon Röle Tamamlayıcı Ürünleri",
            "altlar": []
          }
        ]
      }
    ]
  }
];

