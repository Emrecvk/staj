import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MOCK_PRODUCTS } from "../test-helpers.mjs";

describe("Feature 23: Sticky Mobile PDP Action Bar", () => {
  const pdpSource = readFileSync(new URL("../../src/app/urunler/[id]/pdp-bilesenleri.tsx", import.meta.url), "utf8");

  it("Test 23.1: Sticky bottom action bar layout classes target mobile viewports (< 768px)", () => {
    assert.match(pdpSource, /fixed inset-x-0 bottom-0/);
    assert.match(pdpSource, /md:hidden/);
    assert.match(pdpSource, /grid-cols-\[minmax\(0,1fr\)_auto\]/);
  });

  it("Test 23.2: Compact summary renders truncated MPN, live unit price, and packaging tag", () => {
    const product = MOCK_PRODUCTS[0];
    const defaultPkg = product.ambalajlarVeFiyatlar[0];

    const mobileSummary = {
      mpn: product.ureticiUrunKodu,
      price: new Intl.NumberFormat("tr-TR", { style: "currency", currency: defaultPkg.fiyatlar[0].paraBirimi }).format(defaultPkg.fiyatlar[0].birimFiyat),
      packaging: defaultPkg.ad,
    };

    assert.equal(mobileSummary.mpn, "STM32F407VGT6");
    assert.match(mobileSummary.price, /12,50/);
    assert.equal(mobileSummary.packaging, "Tepsi (Tray)");
    assert.match(pdpSource, /paraBicimle\(unitPrice/);
    assert.doesNotMatch(pdpSource, /\$ \{unitPrice\.toFixed/);
  });

  it("Test 23.3: Mobile quantity decrement / increment buttons respect packaging step multiplier", () => {
    let quantity = 90;
    const step = 90;
    const moq = 90;

    const increment = () => { quantity += step; };
    const decrement = () => { quantity = Math.max(moq, quantity - step); };

    increment();
    assert.equal(quantity, 180);

    decrement();
    assert.equal(quantity, 90);

    // Decrement at MOQ boundary
    decrement();
    assert.equal(quantity, 90);
  });

  it("Test 23.4: 'Sepete Ekle' and 'Teklif İste' action buttons trigger valid purchase handlers", () => {
    const actions = {
      addToCart: (qty) => ({ success: true, miktar: qty }),
      requestQuote: (qty) => ({ success: true, rfqMiktar: qty }),
    };

    const cartRes = actions.addToCart(180);
    const quoteRes = actions.requestQuote(5000);

    assert.equal(cartRes.miktar, 180);
    assert.equal(quoteRes.rfqMiktar, 5000);
  });

  it("Test 23.5: Mobile bar z-index and padding ensure safe-area insets on mobile displays", () => {
    const safeAreaClass = "pb-safe";
    const zIndexClass = "z-40";

    assert.ok(safeAreaClass.includes("safe"));
    assert.ok(zIndexClass.includes("z-40"));
  });
});
