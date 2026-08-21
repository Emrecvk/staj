import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS, hesaplaB2BFiyat, kademeSec, paraBicimle } from "../test-helpers.mjs";

describe("Tier 4: Real-World B2B Workload - High-Volume Tiered Pricing & Multi-Warehouse Routing", () => {
  it("Workload 4.3: Stress tests 500 tiered price matrix calculations with 100% numerical precision", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0];
    const quantities = [];
    for (let q = 90; q <= 45000; q += 90) {
      quantities.push(q);
    }

    assert.equal(quantities.length, 500);

    const startTime = performance.now();
    quantities.forEach((qty) => {
      const calc = hesaplaB2BFiyat(qty, packaging);
      assert.equal(calc.yuvarlanmisMiktar, qty);
      assert.ok(calc.toplamTutar > 0);
      assert.ok(Number.isFinite(calc.toplamTutar));
      assert.equal(calc.hataMesaji, null);

      if (qty >= 900) {
        assert.equal(calc.gecerliBirimFiyat, 7.95);
      } else if (qty >= 270) {
        assert.equal(calc.gecerliBirimFiyat, 9.80);
      } else if (qty >= 90) {
        assert.equal(calc.gecerliBirimFiyat, 11.20);
      }
    });

    const elapsedMs = performance.now() - startTime;
    assert.ok(elapsedMs < 100, `500 calculations took ${elapsedMs.toFixed(2)}ms (should be < 100ms)`);
  });

  it("Workload 4.4: Multi-warehouse allocation algorithm correctly routes split quantities and calculates lead times", () => {
    const product = MOCK_PRODUCTS[0];
    const warehouseInventory = [
      { depoKodu: "MERKEZ-IST", stok: 4850, leadTimeDays: 0 },
      { depoKodu: "SERBEST-BOLGE", stok: 2000, leadTimeDays: 2 },
      { depoKodu: "GELECEK-SIPARIS", stok: 10000, leadTimeDays: 14 },
    ];

    const allocateStock = (requestedQty) => {
      let remaining = requestedQty;
      const allocations = [];

      for (const wh of warehouseInventory) {
        if (remaining <= 0) break;
        const take = Math.min(remaining, wh.stok);
        if (take > 0) {
          allocations.push({
            depoKodu: wh.depoKodu,
            allocatedQty: take,
            leadTimeDays: wh.leadTimeDays,
          });
          remaining -= take;
        }
      }

      return {
        fulfilled: remaining === 0,
        unfulfilledQty: remaining,
        allocations,
        maxLeadTimeDays: Math.max(...allocations.map((a) => a.leadTimeDays), 0),
      };
    };

    // Case 1: Order within Merkez stock (3000 units)
    const result1 = allocateStock(3000);
    assert.equal(result1.fulfilled, true);
    assert.equal(result1.allocations.length, 1);
    assert.equal(result1.allocations[0].depoKodu, "MERKEZ-IST");
    assert.equal(result1.maxLeadTimeDays, 0);

    // Case 2: Order requiring Merkez + Serbest Bölge (6000 units)
    const result2 = allocateStock(6000);
    assert.equal(result2.fulfilled, true);
    assert.equal(result2.allocations.length, 2);
    assert.equal(result2.allocations[0].allocatedQty, 4850);
    assert.equal(result2.allocations[1].allocatedQty, 1150);
    assert.equal(result2.maxLeadTimeDays, 2);

    // Case 3: Order requiring factory incoming stock (10,000 units)
    const result3 = allocateStock(10000);
    assert.equal(result3.fulfilled, true);
    assert.equal(result3.allocations.length, 3);
    assert.equal(result3.maxLeadTimeDays, 14);
  });
});
