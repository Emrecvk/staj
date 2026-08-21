import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseCsvBom, MOCK_PRODUCTS, hesaplaB2BFiyat } from "../test-helpers.mjs";

describe("Tier 4: Real-World B2B Workload - High-Volume BOM Parsing & Matching", () => {
  it("Workload 4.1: Successfully parses 150-line complex CSV/TSV BOM with mixed quantities and headers", () => {
    // Generate synthetic 150-line BOM
    const baseMpns = ["STM32F407VGT6", "GD32F407VGT6", "STM32F429ZIT6", "GRM188R71C104KA01D", "LM358DR"];
    const lines = ['"Item No","Manufacturer Part Number (MPN)","Description","Requested Quantity"'];

    for (let i = 1; i <= 150; i++) {
      const mpn = baseMpns[(i - 1) % baseMpns.length];
      const qty = ((i % 10) + 1) * 100;
      lines.push(`${i},"${mpn}","Industrial Component Line ${i}",${qty}`);
    }

    const csvContent = lines.join("\n");
    const startTime = performance.now();
    const parsed = parseCsvBom(csvContent);
    const parseDurationMs = performance.now() - startTime;

    assert.equal(parsed.length, 150);
    assert.ok(parseDurationMs < 50, `Parsing 150 lines took ${parseDurationMs.toFixed(2)}ms (should be < 50ms)`);
    assert.equal(parsed[0].mpn, "STM32F407VGT6");
    assert.equal(parsed[149].mpn, "LM358DR");
  });

  it("Workload 4.2: Performs batch catalog resolution and price aggregation for 150 BOM items in < 100ms", () => {
    const baseMpns = ["STM32F407VGT6", "GD32F407VGT6", "STM32F429ZIT6", "GRM188R71C104KA01D", "LM358DR"];
    const bomItems = [];

    for (let i = 1; i <= 150; i++) {
      const mpn = baseMpns[(i - 1) % baseMpns.length];
      const qty = ((i % 5) + 1) * 200;
      bomItems.push({ mpn, miktar: qty, sira: i });
    }

    const startTime = performance.now();
    let totalBasketUsd = 0;
    let totalPieces = 0;
    let roundedCount = 0;

    bomItems.forEach((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.ureticiUrunKodu === item.mpn);
      assert.ok(product, `Product ${item.mpn} should match`);
      const pkg = product.ambalajlarVeFiyatlar[0];
      const calc = hesaplaB2BFiyat(item.miktar, pkg);

      totalBasketUsd += calc.toplamTutar;
      totalPieces += calc.yuvarlanmisMiktar;
      if (calc.yuvarlanmisMiktar !== item.miktar) roundedCount++;
    });

    const executionDurationMs = performance.now() - startTime;

    assert.ok(totalBasketUsd > 10000, `Total basket USD: ${totalBasketUsd}`);
    assert.ok(totalPieces > 50000, `Total pieces: ${totalPieces}`);
    assert.ok(executionDurationMs < 100, `Batch resolution took ${executionDurationMs.toFixed(2)}ms (should be < 100ms)`);
  });
});
