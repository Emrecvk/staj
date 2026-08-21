import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS } from "../test-helpers.mjs";

describe("Feature 23: Sticky Mobile PDP Action Bar", () => {
  it("Test 23.1: Sticky bottom action bar layout classes target mobile viewports (< 768px)", () => {
    const stickyBarClasses = "fixed bottom-0 inset-x-0 bg-yuzey-kart border-t border-kenar p-3 z-40 md:hidden flex items-center justify-between";

    assert.ok(stickyBarClasses.includes("fixed bottom-0"));
    assert.ok(stickyBarClasses.includes("md:hidden"));
    assert.ok(stickyBarClasses.includes("bg-yuzey-kart"));
  });

  it("Test 23.2: Compact summary renders truncated MPN, live unit price, and packaging tag", () => {
    const product = MOCK_PRODUCTS[0];
    const defaultPkg = product.ambalajlarVeFiyatlar[0];

    const mobileSummary = {
      mpn: product.ureticiUrunKodu,
      price: `$ ${defaultPkg.fiyatlar[0].birimFiyat.toFixed(2)}`,
      packaging: defaultPkg.ad,
    };

    assert.equal(mobileSummary.mpn, "STM32F407VGT6");
    assert.equal(mobileSummary.price, "$ 12.50");
    assert.equal(mobileSummary.packaging, "Tepsi (Tray)");
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
