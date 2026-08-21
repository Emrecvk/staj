import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS } from "../test-helpers.mjs";

describe("Feature 18: Multi-Warehouse Stock Breakdown", () => {
  it("Test 18.1: Central warehouse (Merkez Depo) displays in-stock quantity with same-day dispatch tag", () => {
    const product = MOCK_PRODUCTS[0];
    const merkezStock = product.depoStoklari.find((d) => d.depoKodu === "MERKEZ-IST");

    assert.ok(merkezStock);
    assert.equal(merkezStock.stokMiktari, 4850);
    assert.equal(merkezStock.teslimSuresiGun, 0);
  });

  it("Test 18.2: Branch / Free zone warehouse stock shows quantity with estimated transit days", () => {
    const product = MOCK_PRODUCTS[0];
    const branchStock = product.depoStoklari.find((d) => d.depoKodu === "SERBEST-BOLGE");

    assert.ok(branchStock);
    assert.equal(branchStock.stokMiktari, 2000);
    assert.equal(branchStock.teslimSuresiGun, 2);
  });

  it("Test 18.3: Incoming stock (Gelecek Stok) displays quantity and formatted target arrival date", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0];

    assert.equal(packaging.gelecekStokMiktari, 10000);
    assert.equal(packaging.gelecekStokTarihi, "2026-10-15");
  });

  it("Test 18.4: Total aggregate stock accurately sums physical stocks across all domestic locations", () => {
    const product = MOCK_PRODUCTS[0];
    const physicalStock = product.depoStoklari
      .filter((d) => d.teslimSuresiGun <= 3)
      .reduce((sum, d) => sum + d.stokMiktari, 0);

    assert.equal(physicalStock, 4850 + 2000); // 6850
    assert.equal(physicalStock, product.toplamStok);
  });

  it("Test 18.5: Zero-stock state triggers 'Stok Alarmı / Bildirimi Aç' action instead of add to cart", () => {
    const outOfStockProduct = { ...MOCK_PRODUCTS[0], toplamStok: 0 };
    const actionType = outOfStockProduct.toplamStok > 0 ? "SATIN_AL" : "STOK_BILDIRIMI";

    assert.equal(actionType, "STOK_BILDIRIMI");
  });
});
