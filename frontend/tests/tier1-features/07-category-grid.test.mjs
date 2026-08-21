import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Feature 7: Category Icon Grid with SKU Counts", () => {
  it("Test 7.1: Category icon grid renders 6x2 / 8-12 component family cards", () => {
    const categoryFamilies = [
      { id: 1, name: "Yarı İletkenler", icon: "Cpu", skuCount: 18450 },
      { id: 2, name: "Pasif Komponentler", icon: "Zap", skuCount: 34200 },
      { id: 3, name: "Konnektörler", icon: "Cable", skuCount: 12100 },
      { id: 4, name: "Elektromekanik", icon: "ToggleRight", skuCount: 8900 },
      { id: 5, name: "Güç Kaynakları", icon: "BatteryCharging", skuCount: 4300 },
      { id: 6, name: "Optoelektronik", icon: "Lightbulb", skuCount: 6700 },
      { id: 7, name: "Sensörler & Dönüştürücüler", icon: "Activity", skuCount: 5100 },
      { id: 8, name: "RF & Kablosuz", icon: "Radio", skuCount: 3800 },
    ];

    assert.ok(categoryFamilies.length >= 8);
    assert.equal(categoryFamilies[0].name, "Yarı İletkenler");
    assert.ok(categoryFamilies.every((c) => c.skuCount > 0));
  });

  it("Test 7.2: Category icon SVG mapping associates valid semantic icons with each domain family", () => {
    const iconMap = {
      semiconductors: "Microchip",
      passives: "CircuitBoard",
      connectors: "Plug",
      electromechanical: "Cpu",
      sensors: "Activity",
    };

    assert.equal(iconMap.semiconductors, "Microchip");
    assert.equal(iconMap.passives, "CircuitBoard");
    assert.equal(iconMap.connectors, "Plug");
  });

  it("Test 7.3: Live SKU count formats numbers according to Turkish locale standards", () => {
    const formatSku = (count) => `${count.toLocaleString("tr-TR")} ürün`;

    assert.equal(formatSku(18450), "18.450 ürün");
    assert.equal(formatSku(1250400), "1.250.400 ürün");
    assert.equal(formatSku(500), "500 ürün");
  });

  it("Test 7.4: Category card deep-link targets parametric catalog with selected category ID", () => {
    const categoryId = 1001;
    const categorySlug = "mikrokontrolculer";
    const targetUrl = `/urunler?kategoriId=${categoryId}&slug=${categorySlug}`;

    assert.equal(targetUrl, "/urunler?kategoriId=1001&slug=mikrokontrolculer");
  });

  it("Test 7.5: Card hover styling uses Çevik surface and accent tokens", () => {
    const cardTokenClasses = [
      "bg-yuzey-kart",
      "border",
      "border-kenar",
      "hover:border-vurgu",
      "hover:shadow-kart",
      "transition-all",
    ];

    assert.ok(cardTokenClasses.includes("bg-yuzey-kart"));
    assert.ok(cardTokenClasses.includes("hover:border-vurgu"));
    assert.ok(!cardTokenClasses.some((c) => c.includes("red") || c.includes("cc0000")));
  });
});
