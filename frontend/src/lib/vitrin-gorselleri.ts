import type { ProductSummary } from "@/lib/api";

/**
 * API'deki logo URL'i her zaman önceliklidir. Seed katalogda logo boşsa,
 * yalnızca projeye indirilmiş marka dosyalarına düşülür; uzak adrese hotlink
 * bırakılmaz.
 */
const MARKA_LOGOLARI: Record<string, string> = {
  Vishay: "/markalar/vishay.svg",
  Yageo: "/markalar/yageo.svg",
  Panasonic: "/markalar/panasonic.svg",
  Bourns: "/markalar/bourns.svg",
  KEMET: "/markalar/kemet.svg",
  "Texas Instruments": "/markalar/texas-instruments.svg",
  Littelfuse: "/markalar/littelfuse.svg",
  STMicroelectronics: "/markalar/stmicroelectronics.svg",
  JST: "/markalar/jst.png",
  "MEAN WELL": "/markalar/mean-well.png",
  "Microchip Technology": "/markalar/microchip.png",
  "Würth Elektronik": "/markalar/wurth-elektronik.png",
  Murata: "/markalar/murata.png",
  Nexperia: "/markalar/nexperia.png",
  Kingbright: "/markalar/kingbright.png",
  "Infineon Technologies": "/markalar/infineon.png",
  "Lite-On": "/markalar/lite-on.png",
  Molex: "/markalar/molex.png",
  Omron: "/markalar/omron.png",
  "Espressif Systems": "/markalar/espressif.svg",
  "TE Connectivity": "/markalar/te-connectivity.png",
  Arduino: "/markalar/arduino.svg",
  "Bosch Sensortec": "/markalar/bosch-sensortec.png",
  "Phoenix Contact": "/markalar/phoenix-contact.png",
  "KOA Speer": "/markalar/koa-speer.png",
  STM: "/markalar/stmicroelectronics.svg",
  INFINEON: "/markalar/infineon.png",
  NEXPERIA: "/markalar/nexperia.png",
  VISHAY: "/markalar/vishay.svg",
  BOURNS: "/markalar/bourns.svg",
  "PANASONIC(EUROPE)": "/markalar/panasonic.svg",
  "OZD-ARDUINO": "/markalar/arduino.svg",
};

const NORMALIZE_MARKA_LOGOLARI = new Map(
  Object.entries(MARKA_LOGOLARI).map(([ad, url]) => [ad.toLocaleUpperCase("tr-TR"), url]),
);

export function markaLogosuGetir(ad: string, apiLogoUrl?: string | null): string | null {
  return apiLogoUrl || NORMALIZE_MARKA_LOGOLARI.get(ad.toLocaleUpperCase("tr-TR")) || null;
}

export type VitrinUrunGorseli = {
  url: string | null;
  temsiliMi: boolean;
};

/**
 * Ürünün gerçek görseli varsa onu kullanır. Seed katalog görselsizse yalnızca
 * paketi açıkça tanınabilen dirençlerde aynı kılıfın Özdisan görselini, birebir
 * eşleşen TRACO modülünde ise ürün fotoğrafını gösterir.
 */
export function vitrinUrunGorseliGetir(
  urun: Pick<ProductSummary, "anaGorselUrl" | "gorselTemsiliMi" | "ureticiUrunKodu" | "kisaAciklama">,
): VitrinUrunGorseli {
  if (urun.anaGorselUrl) {
    return { url: urun.anaGorselUrl, temsiliMi: urun.gorselTemsiliMi };
  }

  if (urun.ureticiUrunKodu === "THN 15-2411WIR") {
    return { url: "/urunler/dc-dc-thn-15-2411wir.jpg", temsiliMi: false };
  }

  const aciklama = urun.kisaAciklama.toLocaleUpperCase("tr-TR");
  if (aciklama.includes("EKSENEL") && aciklama.includes("RES")) {
    return { url: "/urunler/direnc-eksenel.jpg", temsiliMi: true };
  }

  if (aciklama.includes("RES SMD")) {
    const kiliflar = ["0402", "0603", "0805", "1206", "2512"] as const;
    const kilif = kiliflar.find((deger) => aciklama.includes(deger));
    if (kilif) return { url: `/urunler/smd-${kilif}.jpg`, temsiliMi: true };
  }

  return { url: null, temsiliMi: true };
}
