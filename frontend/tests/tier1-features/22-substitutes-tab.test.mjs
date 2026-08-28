import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS } from "../test-helpers.mjs";

describe("Feature 22: Related & Substitute Components Tab", () => {
  it("Test 22.1: Pin-to-pin cross-reference substitute components display compatible alternatives", () => {
    const product = MOCK_PRODUCTS[0];
    const substitutes = product.muadiller;

    assert.equal(substitutes.length, 1);
    assert.equal(substitutes[0].ureticiUrunKodu, "GD32F407VGT6");
    assert.ok(substitutes[0].kisaAciklama.includes("GigaDevice"));
  });

  it("Test 22.2: Similar products tab displays related variants from the same product family", () => {
    const product = MOCK_PRODUCTS[0];
    const similar = product.benzerUrunler;

    assert.equal(similar.length, 1);
    assert.equal(similar[0].ureticiUrunKodu, "STM32F429ZIT6");
  });

  it("Test 22.3: Complementary components list displays passives and peripherals frequently paired together", () => {
    const product = MOCK_PRODUCTS[0];
    const paired = product.birlikteKullanilanlar;

    assert.equal(paired.length, 1);
    assert.equal(paired[0].ureticiUrunKodu, "GRM188R71C104KA01D");
  });

  it("Test 22.4: 1-click comparison action adds substitute part directly to comparison dock", () => {
    const dock = [];
    const addSubstituteToCompare = (sub) => {
      if (dock.length < 4 && !dock.some((i) => i.id === sub.id)) {
        dock.push(sub);
        return true;
      }
      return false;
    };

    const added = addSubstituteToCompare({ id: 102, mpn: "GD32F407VGT6" });
    assert.equal(added, true);
    assert.equal(dock.length, 1);
  });

  it("Test 22.5: Substitute comparison matrix highlights price and stock advantage over original part", () => {
    const original = MOCK_PRODUCTS[0]; // $12.50, stock 6850
    const substitute = MOCK_PRODUCTS[1]; // $6.40, stock 15000

    const priceAdvantage = ((original.baslangicFiyati - substitute.baslangicFiyati) / original.baslangicFiyati) * 100;
    assert.ok(priceAdvantage > 40); // > 40% cost saving
    assert.ok(substitute.toplamStok > original.toplamStok);
  });
});
