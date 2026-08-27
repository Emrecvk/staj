/**
 * Çevik Elektronik Frontend E2E Test Suite - Test Helpers & Fixtures
 * 
 * Provides mock data fixtures, assertion utilities, calculation engines,
 * and DOM/URL simulation helpers for Tiers 1-4 tests.
 */

import assert from "node:assert/strict";

// ============================================================================
// 1. BRAND DESIGN SYSTEM CONSTANTS & TOKENS
// ============================================================================

export const BRAND_TOKENS = {
  INK_PRIMARY: "#32202B",
  INK_HOVER: "#5F3247",
  SIGNAL_ACCENT: "#F7763F",
  SIGNAL_HIGH_CONTRAST: "#963219",
  SIGNAL_BG_TINT: "#FFF4EB",
  SURFACE_DEFAULT: "#F6F1E9",
  SURFACE_CARD: "#FFFDF8",
  SURFACE_EMBEDDED: "#EEE7DD",
  BORDER_DEFAULT: "#DED4C8",
  BORDER_STRONG: "#C8BAAB",
  SUCCESS_50: "#ECFDF3",
  SUCCESS_600: "#0D8A43",
  WARNING_50: "#FFFAEB",
  WARNING_600: "#B45F05",
  DANGER_50: "#FEF3F2",
  DANGER_600: "#B42318",
  FORBIDDEN_OZDISAN_RED: "#CC0000",
};

// ============================================================================
// 2. MOCK DATA FIXTURES
// ============================================================================

export const MOCK_CATEGORIES = [
  {
    id: 1,
    ad: "Yarı İletkenler",
    slug: "yari-iletkenler",
    ikonUrl: "/icons/semiconductor.svg",
    yaprakMi: false,
    sira: 1,
    altKategoriler: [
      {
        id: 101,
        ad: "Entegre Devreler (ICs)",
        slug: "entegre-devreler",
        ikonUrl: null,
        yaprakMi: false,
        sira: 1,
        altKategoriler: [
          { id: 1001, ad: "Mikrokontrolcüler (ARM / RISC-V)", slug: "mikrokontrolculer", ikonUrl: null, yaprakMi: true, sira: 1, altKategoriler: [] },
          { id: 1002, ad: "Güç Yönetimi (LDO & Regülatörler)", slug: "guc-yonetimi", ikonUrl: null, yaprakMi: true, sira: 2, altKategoriler: [] },
          { id: 1003, ad: "Bellekler (Flash, EEPROM, SRAM)", slug: "bellekler", ikonUrl: null, yaprakMi: true, sira: 3, altKategoriler: [] },
        ],
      },
      {
        id: 102,
        ad: "Ayrık Yarı İletkenler (Discretes)",
        slug: "ayrik-yari-iletkenler",
        ikonUrl: null,
        yaprakMi: false,
        sira: 2,
        altKategoriler: [
          { id: 1004, ad: "MOSFET & Transistörler", slug: "mosfet-transistor", ikonUrl: null, yaprakMi: true, sira: 1, altKategoriler: [] },
          { id: 1005, ad: "Diyot & Doğrultucular", slug: "diyot-dogrultucu", ikonUrl: null, yaprakMi: true, sira: 2, altKategoriler: [] },
        ],
      },
    ],
  },
  {
    id: 2,
    ad: "Pasif Komponentler",
    slug: "pasif-komponentler",
    ikonUrl: "/icons/passive.svg",
    yaprakMi: false,
    sira: 2,
    altKategoriler: [
      {
        id: 201,
        ad: "Kondansatörler",
        slug: "kondansatorler",
        ikonUrl: null,
        yaprakMi: false,
        sira: 1,
        altKategoriler: [
          { id: 2001, ad: "MLCC Seramik Kondansatörler", slug: "seramik-kondansatorler", ikonUrl: null, yaprakMi: true, sira: 1, altKategoriler: [] },
          { id: 2002, ad: "Elektrolitik Kondansatörler", slug: "elektrolitik-kondansatorler", ikonUrl: null, yaprakMi: true, sira: 2, altKategoriler: [] },
        ],
      },
      {
        id: 202,
        ad: "Dirençler",
        slug: "direncler",
        ikonUrl: null,
        yaprakMi: false,
        sira: 2,
        altKategoriler: [
          { id: 2003, ad: "SMD Çip Dirençler", slug: "smd-cip-direncler", ikonUrl: null, yaprakMi: true, sira: 1, altKategoriler: [] },
        ],
      },
    ],
  },
  {
    id: 3,
    ad: "Konnektörler",
    slug: "konnektorler",
    ikonUrl: "/icons/connector.svg",
    yaprakMi: false,
    sira: 3,
    altKategoriler: [
      {
        id: 301,
        ad: "PCB Konnektörleri",
        slug: "pcb-konnektorleri",
        ikonUrl: null,
        yaprakMi: false,
        sira: 1,
        altKategoriler: [
          { id: 3001, ad: "Pin Header & Soketler", slug: "pin-header", ikonUrl: null, yaprakMi: true, sira: 1, altKategoriler: [] },
          { id: 3002, ad: "Terminal Blokları (Klemensler)", slug: "terminal-bloklari", ikonUrl: null, yaprakMi: true, sira: 2, altKategoriler: [] },
        ],
      },
    ],
  },
];

export const MOCK_PRODUCTS = [
  {
    id: 101,
    ureticiUrunKodu: "STM32F407VGT6",
    ureticiId: 1,
    ureticiAd: "STMicroelectronics",
    kategoriId: 1001,
    kategoriYolu: ["Yarı İletkenler", "Entegre Devreler", "Mikrokontrolcüler"],
    kisaAciklama: "ARM Cortex-M4 32-Bit MCU, 168 MHz, 1024 KB Flash, 192 KB SRAM, LQFP-100",
    detayliAciklama: "Yüksek performanslı endüstriyel mikrokontrolcü ünitesi, FPU ve DSP desteği.",
    anaGorselUrl: "/products/stm32f407vgt6.jpg",
    gorselUrlleri: ["/products/stm32f407vgt6.jpg", "/products/stm32f407_top.jpg"],
    gorselTemsiliMi: false,
    urunDurumu: "Aktif",
    rohsDurumu: "Belgeli",
    montajTipi: "SMD",
    ureticiTeslimSuresi: "2 Hafta",
    toplamStok: 6850,
    baslangicFiyati: 12.50,
    paraBirimi: "USD",
    kampanyaliMi: false,
    dokumanlar: [
      { tip: 1, url: "/docs/stm32f407_datasheet.pdf", baslik: "Teknik Datasheet (PDF, 3.8 MB)", boyutByte: 3984588, dil: "EN" },
      { tip: 2, url: "/cad/stm32f407_lqfp100.step", baslik: "3D CAD Model (STEP)", boyutByte: 1240500, dil: "EN" },
      { tip: 3, url: "/certs/rohs_stmicro.pdf", baslik: "RoHS / REACH Uygunluk Belgesi", boyutByte: 450120, dil: "EN" },
    ],
    ozellikler: {
      "Çekirdek": "ARM Cortex-M4",
      "Saat Frekansı": "168 MHz",
      "Flash Bellek": "1024 KB",
      "RAM Kapasitesi": "192 KB",
      "Çalışma Gerilimi": "1.8V ~ 3.6V",
      "Kılıf / Paket": "LQFP-100",
      "Çalışma Sıcaklığı": "-40°C ~ +85°C",
      "G/Ç Sayısı (I/O)": "82",
    },
    depoStoklari: [
      { depoKodu: "MERKEZ-IST", depoAdi: "Merkez Depo (İstanbul)", stokMiktari: 4850, teslimSuresiGun: 0 },
      { depoKodu: "SERBEST-BOLGE", depoAdi: "Şube / Serbest Bölge Depo", stokMiktari: 2000, teslimSuresiGun: 2 },
      { depoKodu: "GELECEK-SIPARIS", depoAdi: "Gelecek Stok (Üretici)", stokMiktari: 10000, teslimSuresiGun: 14 },
    ],
    ambalajlarVeFiyatlar: [
      {
        ambalajId: 1011,
        ad: "Tepsi (Tray)",
        ambalajTipi: 2,
        mpq: 90,
        moq: 90,
        katlamaMiktari: 90,
        stokMiktari: 4850,
        gelecekStokMiktari: 10000,
        gelecekStokTarihi: "2026-10-15",
        varsayilanMi: true,
        fiyatlar: [
          { minMiktar: 1, maxMiktar: 89, birimFiyat: 12.50, paraBirimi: "USD" },
          { minMiktar: 90, maxMiktar: 269, birimFiyat: 11.20, paraBirimi: "USD" },
          { minMiktar: 270, maxMiktar: 899, birimFiyat: 9.80, paraBirimi: "USD" },
          { minMiktar: 900, maxMiktar: null, birimFiyat: 7.95, paraBirimi: "USD" },
        ],
      },
      {
        ambalajId: 1012,
        ad: "Makara (Tape & Reel)",
        ambalajTipi: 1,
        mpq: 1000,
        moq: 1000,
        katlamaMiktari: 1000,
        stokMiktari: 2000,
        gelecekStokMiktari: 5000,
        gelecekStokTarihi: "2026-11-01",
        varsayilanMi: false,
        fiyatlar: [
          { minMiktar: 1000, maxMiktar: 2999, birimFiyat: 7.50, paraBirimi: "USD" },
          { minMiktar: 3000, maxMiktar: null, birimFiyat: 6.90, paraBirimi: "USD" },
        ],
      },
    ],
    muadiller: [
      { id: 102, ureticiUrunKodu: "GD32F407VGT6", kisaAciklama: "GigaDevice 168MHz MCU LQFP-100", anaGorselUrl: null },
    ],
    benzerUrunler: [
      { id: 103, ureticiUrunKodu: "STM32F429ZIT6", kisaAciklama: "ST 180MHz MCU LQFP-144", anaGorselUrl: null },
    ],
    parametrikUrunler: [],
    birlikteKullanilanlar: [
      { id: 201, ureticiUrunKodu: "GRM188R71C104KA01D", kisaAciklama: "Murata 100nF 16V 0603 MLCC", anaGorselUrl: null },
    ],
  },
  {
    id: 102,
    ureticiUrunKodu: "GD32F407VGT6",
    ureticiId: 2,
    ureticiAd: "GigaDevice",
    kategoriId: 1001,
    kategoriYolu: ["Yarı İletkenler", "Entegre Devreler", "Mikrokontrolcüler"],
    kisaAciklama: "ARM Cortex-M4 32-Bit MCU, 168 MHz, 1024 KB Flash, 192 KB SRAM, LQFP-100",
    detayliAciklama: "Pin-to-pin STM32F407 muadili maliyet odaklı MCU.",
    anaGorselUrl: "/products/gd32f407.jpg",
    gorselUrlleri: ["/products/gd32f407.jpg"],
    gorselTemsiliMi: false,
    urunDurumu: "Aktif",
    rohsDurumu: "Belgeli",
    montajTipi: "SMD",
    ureticiTeslimSuresi: "1 Hafta",
    toplamStok: 15000,
    baslangicFiyati: 6.40,
    paraBirimi: "USD",
    kampanyaliMi: true,
    dokumanlar: [
      { tip: 1, url: "/docs/gd32f407_datasheet.pdf", baslik: "GD32F407 Datasheet (PDF)", boyutByte: 2500000, dil: "EN" },
    ],
    ozellikler: {
      "Çekirdek": "ARM Cortex-M4",
      "Saat Frekansı": "168 MHz",
      "Flash Bellek": "1024 KB",
      "RAM Kapasitesi": "192 KB",
      "Çalışma Gerilimi": "2.6V ~ 3.6V",
      "Kılıf / Paket": "LQFP-100",
      "Çalışma Sıcaklığı": "-40°C ~ +85°C",
      "G/Ç Sayısı (I/O)": "82",
    },
    depoStoklari: [
      { depoKodu: "MERKEZ-IST", depoAdi: "Merkez Depo (İstanbul)", stokMiktari: 15000, teslimSuresiGun: 0 },
    ],
    ambalajlarVeFiyatlar: [
      {
        ambalajId: 1021,
        ad: "Tepsi (Tray)",
        ambalajTipi: 2,
        mpq: 90,
        moq: 90,
        katlamaMiktari: 90,
        stokMiktari: 15000,
        gelecekStokMiktari: 0,
        gelecekStokTarihi: null,
        varsayilanMi: true,
        fiyatlar: [
          { minMiktar: 1, maxMiktar: 89, birimFiyat: 6.40, paraBirimi: "USD" },
          { minMiktar: 90, maxMiktar: 899, birimFiyat: 5.80, paraBirimi: "USD" },
          { minMiktar: 900, maxMiktar: null, birimFiyat: 4.90, paraBirimi: "USD" },
        ],
      },
    ],
    muadiller: [],
    benzerUrunler: [],
    parametrikUrunler: [],
    birlikteKullanilanlar: [],
  },
  {
    id: 103,
    ureticiUrunKodu: "STM32F429ZIT6",
    ureticiId: 1,
    ureticiAd: "STMicroelectronics",
    kategoriId: 1001,
    kategoriYolu: ["Yarı İletkenler", "Entegre Devreler", "Mikrokontrolcüler"],
    kisaAciklama: "ARM Cortex-M4 32-Bit MCU, 180 MHz, 2048 KB Flash, 260 KB SRAM, LQFP-144, LCD-TFT",
    detayliAciklama: "Gelişmiş grafik denetleyicili yüksek performanslı MCU.",
    anaGorselUrl: "/products/stm32f429.jpg",
    gorselUrlleri: ["/products/stm32f429.jpg"],
    gorselTemsiliMi: false,
    urunDurumu: "Aktif",
    rohsDurumu: "Belgeli",
    montajTipi: "SMD",
    ureticiTeslimSuresi: "3 Hafta",
    toplamStok: 120,
    baslangicFiyati: 16.50,
    paraBirimi: "USD",
    kampanyaliMi: false,
    dokumanlar: [
      { tip: 1, url: "/docs/stm32f429_datasheet.pdf", baslik: "STM32F429 Datasheet (PDF)", boyutByte: 4100000, dil: "EN" },
    ],
    ozellikler: {
      "Çekirdek": "ARM Cortex-M4",
      "Saat Frekansı": "180 MHz",
      "Flash Bellek": "2048 KB",
      "RAM Kapasitesi": "260 KB",
      "Çalışma Gerilimi": "1.8V ~ 3.6V",
      "Kılıf / Paket": "LQFP-144",
      "Çalışma Sıcaklığı": "-40°C ~ +85°C",
      "G/Ç Sayısı (I/O)": "114",
    },
    depoStoklari: [
      { depoKodu: "MERKEZ-IST", depoAdi: "Merkez Depo (İstanbul)", stokMiktari: 120, teslimSuresiGun: 0 },
    ],
    ambalajlarVeFiyatlar: [
      {
        ambalajId: 1031,
        ad: "Tepsi (Tray)",
        ambalajTipi: 2,
        mpq: 60,
        moq: 60,
        katlamaMiktari: 60,
        stokMiktari: 120,
        gelecekStokMiktari: 500,
        gelecekStokTarihi: "2026-11-20",
        varsayilanMi: true,
        fiyatlar: [
          { minMiktar: 1, maxMiktar: 59, birimFiyat: 16.50, paraBirimi: "USD" },
          { minMiktar: 60, maxMiktar: 299, birimFiyat: 14.50, paraBirimi: "USD" },
          { minMiktar: 300, maxMiktar: null, birimFiyat: 12.80, paraBirimi: "USD" },
        ],
      },
    ],
    muadiller: [],
    benzerUrunler: [],
    parametrikUrunler: [],
    birlikteKullanilanlar: [],
  },
  {
    id: 201,
    ureticiUrunKodu: "GRM188R71C104KA01D",
    ureticiId: 3,
    ureticiAd: "Murata Electronics",
    kategoriId: 2001,
    kategoriYolu: ["Pasif Komponentler", "Kondansatörler", "MLCC Seramik Kondansatörler"],
    kisaAciklama: "CAP CER 100nF 16V X7R 0603 (1608 Metric) ±10%",
    detayliAciklama: "Otomotiv ve endüstriyel sınıf seramik kapasitör.",
    anaGorselUrl: "/products/grm188.jpg",
    gorselUrlleri: ["/products/grm188.jpg"],
    gorselTemsiliMi: true,
    urunDurumu: "Aktif",
    rohsDurumu: "Belgeli",
    montajTipi: "SMD",
    ureticiTeslimSuresi: "Stoktan",
    toplamStok: 250000,
    baslangicFiyati: 0.045,
    paraBirimi: "USD",
    kampanyaliMi: false,
    dokumanlar: [
      { tip: 1, url: "/docs/grm188r71c104ka01d.pdf", baslik: "Datasheet (PDF)", boyutByte: 850000, dil: "EN" },
    ],
    ozellikler: {
      "Kapasitans": "100 nF",
      "Gerilim (Voltaj)": "16 V",
      "Tolerans": "±10%",
      "Sıcaklık Katsayısı": "X7R",
      "Kılıf / Paket": "0603 (1608 Metric)",
      "Çalışma Sıcaklığı": "-55°C ~ +125°C",
    },
    depoStoklari: [
      { depoKodu: "MERKEZ-IST", depoAdi: "Merkez Depo (İstanbul)", stokMiktari: 250000, teslimSuresiGun: 0 },
    ],
    ambalajlarVeFiyatlar: [
      {
        ambalajId: 2011,
        ad: "Makara (Tape & Reel)",
        ambalajTipi: 1,
        mpq: 4000,
        moq: 4000,
        katlamaMiktari: 4000,
        stokMiktari: 250000,
        gelecekStokMiktari: 500000,
        gelecekStokTarihi: "2026-10-01",
        varsayilanMi: true,
        fiyatlar: [
          { minMiktar: 4000, maxMiktar: 19999, birimFiyat: 0.0085, paraBirimi: "USD" },
          { minMiktar: 20000, maxMiktar: 99999, birimFiyat: 0.0062, paraBirimi: "USD" },
          { minMiktar: 100000, maxMiktar: null, birimFiyat: 0.0048, paraBirimi: "USD" },
        ],
      },
      {
        ambalajId: 2012,
        ad: "Kesik Şerit (Cut Tape)",
        ambalajTipi: 4,
        mpq: 100,
        moq: 100,
        katlamaMiktari: 100,
        stokMiktari: 10000,
        gelecekStokMiktari: 0,
        gelecekStokTarihi: null,
        varsayilanMi: false,
        fiyatlar: [
          { minMiktar: 100, maxMiktar: 999, birimFiyat: 0.045, paraBirimi: "USD" },
          { minMiktar: 1000, maxMiktar: 3999, birimFiyat: 0.025, paraBirimi: "USD" },
        ],
      },
    ],
    muadiller: [],
    benzerUrunler: [],
    parametrikUrunler: [],
    birlikteKullanilanlar: [],
  },
  {
    id: 301,
    ureticiUrunKodu: "LM358DR",
    ureticiId: 4,
    ureticiAd: "Texas Instruments",
    kategoriId: 1002,
    kategoriYolu: ["Yarı İletkenler", "Entegre Devreler", "Güç Yönetimi"],
    kisaAciklama: "Dual Operational Amplifier, 3V-32V, SOIC-8",
    detayliAciklama: "Endüstri standardı çiftli opamp entegresi.",
    anaGorselUrl: "/products/lm358dr.jpg",
    gorselUrlleri: ["/products/lm358dr.jpg"],
    gorselTemsiliMi: false,
    urunDurumu: "Aktif",
    rohsDurumu: "Belgeli",
    montajTipi: "SMD",
    ureticiTeslimSuresi: "Stoktan",
    toplamStok: 50000,
    baslangicFiyati: 0.18,
    paraBirimi: "USD",
    kampanyaliMi: false,
    dokumanlar: [
      { tip: 1, url: "/docs/lm358dr_datasheet.pdf", baslik: "Datasheet (PDF)", boyutByte: 1200000, dil: "EN" },
    ],
    ozellikler: {
      "Kanal Sayısı": "2",
      "Bant Genişliği (GBP)": "1.2 MHz",
      "Besleme Gerilimi": "3V ~ 32V (±1.5V ~ ±16V)",
      "Giriş Ofset Gerilimi": "3 mV",
      "Kılıf / Paket": "SOIC-8",
      "Çalışma Sıcaklığı": "0°C ~ +70°C",
    },
    depoStoklari: [
      { depoKodu: "MERKEZ-IST", depoAdi: "Merkez Depo (İstanbul)", stokMiktari: 50000, teslimSuresiGun: 0 },
    ],
    ambalajlarVeFiyatlar: [
      {
        ambalajId: 3011,
        ad: "Makara (Tape & Reel)",
        ambalajTipi: 1,
        mpq: 2500,
        moq: 2500,
        katlamaMiktari: 2500,
        stokMiktari: 50000,
        gelecekStokMiktari: 100000,
        gelecekStokTarihi: "2026-09-30",
        varsayilanMi: true,
        fiyatlar: [
          { minMiktar: 2500, maxMiktar: 9999, birimFiyat: 0.12, paraBirimi: "USD" },
          { minMiktar: 10000, maxMiktar: 49999, birimFiyat: 0.095, paraBirimi: "USD" },
          { minMiktar: 50000, maxMiktar: null, birimFiyat: 0.078, paraBirimi: "USD" },
        ],
      },
      {
        ambalajId: 3012,
        ad: "Kesik Şerit (Cut Tape)",
        ambalajTipi: 4,
        mpq: 50,
        moq: 50,
        katlamaMiktari: 50,
        stokMiktari: 2000,
        gelecekStokMiktari: 0,
        gelecekStokTarihi: null,
        varsayilanMi: false,
        fiyatlar: [
          { minMiktar: 50, maxMiktar: 249, birimFiyat: 0.18, paraBirimi: "USD" },
          { minMiktar: 250, maxMiktar: 2499, birimFiyat: 0.14, paraBirimi: "USD" },
        ],
      },
    ],
    muadiller: [],
    benzerUrunler: [],
    parametrikUrunler: [],
    birlikteKullanilanlar: [],
  },
];

// ============================================================================
// 3. COMPARISON STORE & SPEC DIFF ENGINE
// ============================================================================

export function createComparisonStore(initialItems = []) {
  let items = [...initialItems];

  return {
    getItems: () => [...items],
    getItemCount: () => items.length,
    addItem: (item) => {
      if (items.length >= 4) return false;
      if (items.some((i) => i.id === item.id)) return true;
      items.push(item);
      return true;
    },
    removeItem: (id) => {
      items = items.filter((i) => i.id !== id);
    },
    clear: () => {
      items = [];
    },
    isInComparison: (id) => items.some((i) => i.id === id),
  };
}

export function generateComparisonMatrix(products) {
  const allKeys = new Set();
  products.forEach((p) => {
    Object.keys(p.ozellikler || {}).forEach((k) => allKeys.add(k));
  });

  return Array.from(allKeys).map((key) => {
    const values = {};
    const distinctValues = new Set();

    products.forEach((p) => {
      const val = p.ozellikler?.[key] ?? null;
      values[p.id] = val;
      if (val !== null) distinctValues.add(val);
    });

    return {
      groupName: "Teknik Özellikler",
      specKey: key,
      isDifferent: distinctValues.size > 1,
      values,
    };
  });
}

// ============================================================================
// 4. B2B PRICING & QUANTITY CALCULATION HELPERS
// ============================================================================

export function yukariYuvarla(deger, katlama) {
  if (katlama <= 1) return deger;
  const kalan = deger % katlama;
  return kalan === 0 ? deger : deger + (katlama - kalan);
}

export function miktariDogrula(miktar, moq, katlamaMiktari) {
  const katlama = katlamaMiktari > 0 ? katlamaMiktari : 1;
  const enAz = moq > 0 ? moq : 1;

  if (!Number.isFinite(miktar) || miktar <= 0) {
    return { gecerliMi: false, hata: "Miktar sıfırdan büyük olmalıdır.", onerilenMiktar: Math.max(enAz, 1) };
  }

  if (miktar < enAz) {
    return {
      gecerliMi: false,
      hata: `Minimum sipariş miktarı ${enAz.toLocaleString("tr-TR")} adettir.`,
      onerilenMiktar: yukariYuvarla(enAz, katlama),
    };
  }

  if (miktar % katlama !== 0) {
    return {
      gecerliMi: false,
      hata: `Sipariş miktarı ${katlama.toLocaleString("tr-TR")} adedin katı olmalıdır.`,
      onerilenMiktar: yukariYuvarla(miktar, katlama),
    };
  }

  return { gecerliMi: true, hata: null, onerilenMiktar: miktar };
}

export function kademeSec(kademeler, miktar) {
  const kapsayan = kademeler.filter(
    (k) => miktar >= k.minMiktar && (k.maxMiktar === null || miktar <= k.maxMiktar)
  );

  if (kapsayan.length > 0) {
    return kapsayan.reduce((ucuz, k) => (k.birimFiyat < ucuz.birimFiyat ? k : ucuz));
  }

  const altindakiler = kademeler.filter((k) => miktar >= k.minMiktar);
  if (altindakiler.length === 0) return null;

  return altindakiler.reduce((en, k) => (k.minMiktar > en.minMiktar ? k : en));
}

export function hesaplaB2BFiyat(miktar, ambalaj) {
  const dogrulama = miktariDogrula(miktar, ambalaj.moq, ambalaj.katlamaMiktari);
  const hesaplananMiktar = dogrulama.onerilenMiktar;
  const aktifKademe = kademeSec(ambalaj.fiyatlar, hesaplananMiktar);
  const birimFiyat = aktifKademe?.birimFiyat ?? (ambalaj.fiyatlar[0]?.birimFiyat || 0);
  const toplamTutar = hesaplananMiktar * birimFiyat;

  return {
    gecerliBirimFiyat: birimFiyat,
    aktifKademe,
    toplamTutar,
    hataMesaji: dogrulama.gecerliMi ? null : dogrulama.hata,
    uyariMesaji: !dogrulama.gecerliMi && dogrulama.onerilenMiktar !== miktar
      ? `Miktar ${dogrulama.onerilenMiktar} adede yuvarlandı.`
      : null,
    yuvarlanmisMiktar: hesaplananMiktar,
  };
}

export function kademeUlasilabilirMi(kademe, moq) {
  const enAz = moq > 0 ? moq : 1;
  return kademe.maxMiktar === null || kademe.maxMiktar >= enAz;
}

export function paraBicimle(deger, paraBirimi = "USD", basamak = 4) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: paraBirimi,
    maximumFractionDigits: basamak,
  }).format(deger);
}

// ============================================================================
// 5. BOM PARSER SIMULATION HELPER
// ============================================================================

export function parseCsvBom(content) {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const splitLine = (line) => {
    if (line.includes(",")) return line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (line.includes(";")) return line.split(";").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (line.includes("\t")) return line.split("\t").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    return line.split(/\s+/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
  };

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  const mpnIdx = headers.findIndex((h) => ["mpn", "parca", "part", "kod", "urun_kodu"].some((k) => h.includes(k)));
  const qtyIdx = headers.findIndex((h) => ["qty", "miktar", "adet", "adetler", "count"].some((k) => h.includes(k)));

  const isHeaderPresent = mpnIdx !== -1 || qtyIdx !== -1;
  const effectiveMpnIdx = mpnIdx !== -1 ? mpnIdx : 0;
  const effectiveQtyIdx = qtyIdx !== -1 ? qtyIdx : 1;

  const startLine = isHeaderPresent ? 1 : 0;
  const items = [];

  for (let i = startLine; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = splitLine(rawLine);
    const mpn = cols[effectiveMpnIdx] || "";
    let miktar = 1;
    if (cols[effectiveQtyIdx]) {
      const parsed = parseInt(cols[effectiveQtyIdx], 10);
      if (!isNaN(parsed) && parsed > 0) miktar = parsed;
    }
    if (mpn) {
      items.push({ mpn, miktar, sira: items.length + 1 });
    }
  }

  return items;
}
