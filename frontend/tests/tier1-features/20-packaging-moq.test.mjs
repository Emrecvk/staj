import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS, miktariDogrula, yukariYuvarla, kademeUlasilabilirMi } from "../test-helpers.mjs";

describe("Feature 20: Packaging Selector with MOQ/MPQ Rules", () => {
  it("Test 20.1: Packaging variant selector exposes all packaging options with MPQ and MOQ", () => {
    const product = MOCK_PRODUCTS[0];
    const packagingOptions = product.ambalajlarVeFiyatlar;

    assert.equal(packagingOptions.length, 2);
    assert.equal(packagingOptions[0].ad, "Tepsi (Tray)");
    assert.equal(packagingOptions[0].moq, 90);
    assert.equal(packagingOptions[1].ad, "Makara (Tape & Reel)");
    assert.equal(packagingOptions[1].moq, 1000);
  });

  it("Test 20.2: MOQ enforcement: input less than MOQ returns validation error and rounds up", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0]; // MOQ 90, Kat 90
    const result = miktariDogrula(10, packaging.moq, packaging.katlamaMiktari);

    assert.equal(result.gecerliMi, false);
    assert.ok(result.hata?.includes("Minimum sipariş miktarı 90"));
    assert.equal(result.onerilenMiktar, 90);
  });

  it("Test 20.3: MPQ step multiplier validation enforces order increment multiples", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0]; // MOQ 90, Kat 90
    const result = miktariDogrula(150, packaging.moq, packaging.katlamaMiktari);

    assert.equal(result.gecerliMi, false);
    assert.ok(result.hata?.includes("90 adedin katı olmalıdır"));
    assert.equal(result.onerilenMiktar, 180);
  });

  it("Test 20.4: kademeUlasilabilirMi accurately flags inaccessible price tiers for high-MOQ packaging", () => {
    const tapeReel = MOCK_PRODUCTS[3].ambalajlarVeFiyatlar[0]; // Reel MOQ 4000
    const tier1to99 = { minMiktar: 1, maxMiktar: 99, birimFiyat: 0.05, paraBirimi: "USD" };
    const tier4000to19999 = { minMiktar: 4000, maxMiktar: 19999, birimFiyat: 0.0085, paraBirimi: "USD" };

    assert.equal(kademeUlasilabilirMi(tier1to99, tapeReel.moq), false);
    assert.equal(kademeUlasilabilirMi(tier4000to19999, tapeReel.moq), true);
  });

  it("Test 20.5: yukariYuvarla helper correctly aligns quantities to positive packaging multipliers", () => {
    assert.equal(yukariYuvarla(1, 90), 90);
    assert.equal(yukariYuvarla(90, 90), 90);
    assert.equal(yukariYuvarla(91, 90), 180);
    assert.equal(yukariYuvarla(2501, 2500), 5000);
    assert.equal(yukariYuvarla(500, 1), 500);
  });
});
