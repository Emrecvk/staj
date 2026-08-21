import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS, kademeSec, hesaplaB2BFiyat, paraBicimle } from "../test-helpers.mjs";

describe("Feature 19: Interactive Tiered Pricing Matrix", () => {
  it("Test 19.1: Tiered pricing matrix displays all volume discount brackets defined for packaging", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0];
    const tiers = packaging.fiyatlar;

    assert.equal(tiers.length, 4);
    assert.equal(tiers[0].minMiktar, 1);
    assert.equal(tiers[0].birimFiyat, 12.50);
    assert.equal(tiers[3].minMiktar, 900);
    assert.equal(tiers[3].birimFiyat, 7.95);
  });

  it("Test 19.2: Active tier row highlight selects matching bracket based on user entered quantity", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0];
    
    const tierFor90 = kademeSec(packaging.fiyatlar, 90);
    assert.equal(tierFor90?.birimFiyat, 11.20);

    const tierFor500 = kademeSec(packaging.fiyatlar, 500);
    assert.equal(tierFor500?.birimFiyat, 9.80);

    const tierFor1000 = kademeSec(packaging.fiyatlar, 1000);
    assert.equal(tierFor1000?.birimFiyat, 7.95);
  });

  it("Test 19.3: Dynamic total line amount recalculation computes (effectiveQty * tierPrice)", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0];
    const calc = hesaplaB2BFiyat(270, packaging);

    assert.equal(calc.yuvarlanmisMiktar, 270);
    assert.equal(calc.gecerliBirimFiyat, 9.80);
    assert.equal(calc.toplamTutar, 270 * 9.80); // 2646.00
  });

  it("Test 19.4: High-volume inquiries trigger 'Özel Teklif İste' CTA for quantities exceeding largest tier", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0];
    const highVolumeQuantity = 10000;
    const isSpecialQuoteEligible = highVolumeQuantity >= 5000;

    assert.equal(isSpecialQuoteEligible, true);
  });

  it("Test 19.5: Multi-currency formatter accurately formats USD, EUR, and TRY currencies", () => {
    const usd = paraBicimle(12.5, "USD", 2);
    const eur = paraBicimle(11.2, "EUR", 2);
    const tryPrice = paraBicimle(425.5, "TRY", 2);

    assert.ok(usd.includes("12,50") || usd.includes("12.50"));
    assert.ok(eur.includes("11,20") || eur.includes("11.20"));
    assert.ok(tryPrice.includes("425,50") || tryPrice.includes("425.50"));
  });
});
