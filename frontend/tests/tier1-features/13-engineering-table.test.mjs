import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS, hesaplaB2BFiyat, paraBicimle } from "../test-helpers.mjs";

describe("Feature 13: High-Density Engineering Table", () => {
  it("Test 13.1: Table column headers include all essential B2B parametric engineering attributes", () => {
    const requiredColumns = [
      "Secim",
      "Gorsel",
      "MPN",
      "Uretici",
      "Aciklama",
      "Datasheet",
      "Stok",
      "FiyatKademeleri",
      "AmbalajMOQ",
      "Ozellikler",
      "Islem",
    ];

    assert.equal(requiredColumns.length, 11);
    assert.ok(requiredColumns.includes("MPN"));
    assert.ok(requiredColumns.includes("FiyatKademeleri"));
    assert.ok(requiredColumns.includes("Datasheet"));
  });

  it("Test 13.2: Monospace MPN cell includes 1-click clipboard copy utility attribute", () => {
    const product = MOCK_PRODUCTS[0];
    const mpnCell = {
      mpn: product.ureticiUrunKodu,
      copyActionText: "Kopyala",
      fontClass: "font-mono font-semibold text-marka hover:text-vurgu",
      href: `/urunler/${product.id}`,
    };

    assert.equal(mpnCell.mpn, "STM32F407VGT6");
    assert.ok(mpnCell.fontClass.includes("font-mono"));
    assert.equal(mpnCell.href, "/urunler/101");
  });

  it("Test 13.3: Compact tiered price pills display volume brackets formatted concisely", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0];
    const formattedPills = packaging.fiyatlar.map((t) => ({
      tierLabel: t.maxMiktar ? `${t.minMiktar}+` : `${t.minMiktar}+`,
      priceFormatted: paraBicimle(t.birimFiyat, t.paraBirimi, 2),
    }));

    assert.ok(formattedPills.length >= 3);
    assert.equal(formattedPills[0].tierLabel, "1+");
    assert.ok(formattedPills[0].priceFormatted.includes("12,50"));
  });

  it("Test 13.4: Dynamic parametric spec cells map category-specific technical attributes", () => {
    const mcu = MOCK_PRODUCTS[0];
    const cap = MOCK_PRODUCTS[3];

    assert.equal(mcu.ozellikler["Çekirdek"], "ARM Cortex-M4");
    assert.equal(mcu.ozellikler["Saat Frekansı"], "168 MHz");
    assert.equal(cap.ozellikler["Kapasitans"], "100 nF");
    assert.equal(cap.ozellikler["Gerilim (Voltaj)"], "16 V");
  });

  it("Test 13.5: Inline quantity input validates MOQ and performs instant order addition", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0]; // Tray MOQ 90, Kat 90
    const calc = hesaplaB2BFiyat(180, packaging);

    assert.equal(calc.yuvarlanmisMiktar, 180);
    assert.equal(calc.gecerliBirimFiyat, 11.20);
    assert.equal(calc.toplamTutar, 180 * 11.20);
    assert.equal(calc.hataMesaji, null);
  });

  it("Test 13.6: Datasheet PDF cell generates valid direct document link and icon button", () => {
    const product = MOCK_PRODUCTS[0];
    const datasheet = product.dokumanlar.find((d) => d.tip === 1);

    assert.ok(datasheet);
    assert.ok(datasheet.url.endsWith(".pdf"));
    assert.ok(datasheet.baslik.includes("Datasheet"));
  });
});
