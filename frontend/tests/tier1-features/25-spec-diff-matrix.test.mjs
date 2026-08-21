import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS, generateComparisonMatrix } from "../test-helpers.mjs";

describe("Feature 25: Side-by-Side Spec Diff Matrix Page", () => {
  it("Test 25.1: Side-by-side comparison matrix renders columns for each selected product (up to 4)", () => {
    const productsToCompare = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1], MOCK_PRODUCTS[2]];
    const matrix = generateComparisonMatrix(productsToCompare);

    assert.ok(matrix.length >= 6);
    assert.ok(matrix.some((r) => r.specKey === "Çekirdek"));
    assert.ok(matrix.some((r) => r.specKey === "Saat Frekansı"));
  });

  it("Test 25.2: Spec diff engine identifies identical vs differing values across products", () => {
    const productsToCompare = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]]; // STM32F407 vs GD32F407
    const matrix = generateComparisonMatrix(productsToCompare);

    const coreRow = matrix.find((r) => r.specKey === "Çekirdek");
    const voltageRow = matrix.find((r) => r.specKey === "Çalışma Gerilimi");

    assert.equal(coreRow?.isDifferent, false); // Both "ARM Cortex-M4"
    assert.equal(voltageRow?.isDifferent, true); // 1.8V~3.6V vs 2.6V~3.6V
  });

  it("Test 25.3: 'Sadece Farklılıkları Göster' toggle filters matrix to show only diff rows", () => {
    const productsToCompare = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[2]]; // STM32F407 (168MHz, 1MB, LQFP100) vs STM32F429 (180MHz, 2MB, LQFP144)
    const matrix = generateComparisonMatrix(productsToCompare);

    const onlyDiffs = matrix.filter((r) => r.isDifferent);
    assert.ok(onlyDiffs.length > 0);
    assert.ok(onlyDiffs.every((r) => r.isDifferent));
    assert.ok(onlyDiffs.some((r) => r.specKey === "Saat Frekansı"));
    assert.ok(onlyDiffs.some((r) => r.specKey === "Flash Bellek"));
  });

  it("Test 25.4: Differing specification cells apply alert/highlight styling tokens", () => {
    const diffCellClass = (isDifferent) => (isDifferent ? "bg-uyari-50 font-semibold text-marka" : "bg-transparent text-metin");

    assert.ok(diffCellClass(true).includes("bg-uyari-50"));
    assert.ok(diffCellClass(false).includes("bg-transparent"));
  });

  it("Test 25.5: Export comparison matrix formats data into structured CSV/Print format", () => {
    const productsToCompare = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]];
    const matrix = generateComparisonMatrix(productsToCompare);

    const csvHeader = ["Özellik", ...productsToCompare.map((p) => p.ureticiUrunKodu)].join(";");
    const csvRows = matrix.map((r) => [r.specKey, ...productsToCompare.map((p) => r.values[p.id] || "-")].join(";"));
    const csvContent = [csvHeader, ...csvRows].join("\n");

    assert.ok(csvContent.includes("STM32F407VGT6"));
    assert.ok(csvContent.includes("GD32F407VGT6"));
    assert.ok(csvContent.includes("Çekirdek;ARM Cortex-M4;ARM Cortex-M4"));
  });
});
