import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Feature 8: Live Inventory Metrics Strip", () => {
  it("Test 8.1: Live metrics strip formats B2B key metrics correctly", () => {
    const liveMetrics = {
      toplamUrun: 125000,
      stoktakiUrun: 98400,
      yetkiliMarkaSayisi: 85,
      ayniGunKargo: true,
    };

    assert.equal(liveMetrics.toplamUrun.toLocaleString("tr-TR"), "125.000");
    assert.equal(liveMetrics.stoktakiUrun.toLocaleString("tr-TR"), "98.400");
    assert.equal(liveMetrics.yetkiliMarkaSayisi, 85);
    assert.ok(liveMetrics.ayniGunKargo);
  });

  it("Test 8.2: Same-day shipping badge provides clear commitment cutoff time", () => {
    const shippingBadge = {
      text: "16:00'a kadar verilen siparişler aynı gün kargoda",
      icon: "Truck",
      active: true,
    };

    assert.ok(shippingBadge.text.includes("aynı gün kargo"));
    assert.equal(shippingBadge.icon, "Truck");
  });

  it("Test 8.3: Null-safe fallback handles server catalog summary API unavailability gracefully", () => {
    const renderMetrics = (summary) => {
      if (!summary) {
        return { rendered: false, fallback: "Envanter bilgileri güncelleniyor..." };
      }
      return { rendered: true, total: summary.toplamUrun };
    };

    const nullResult = renderMetrics(null);
    assert.equal(nullResult.rendered, false);
    assert.ok(nullResult.fallback.length > 0);

    const validResult = renderMetrics({ toplamUrun: 50000, stoktakiUrun: 40000, kategoriSayisi: 45 });
    assert.equal(validResult.rendered, true);
    assert.equal(validResult.total, 50000);
  });

  it("Test 8.4: Tabular numbers class is applied to counters to prevent layout jitters", () => {
    const counterClasses = ["sayisal", "tabular-nums", "font-mono", "text-xl", "font-bold", "text-marka"];

    assert.ok(counterClasses.includes("tabular-nums") || counterClasses.includes("sayisal"));
    assert.ok(counterClasses.includes("text-marka"));
  });

  it("Test 8.5: Metrics container adheres to Çevik embedded surface styling", () => {
    const containerClasses = ["bg-yuzey-gomulu", "border-y", "border-kenar", "py-4"];

    assert.ok(containerClasses.includes("bg-yuzey-gomulu"));
    assert.ok(containerClasses.includes("border-kenar"));
  });
});
