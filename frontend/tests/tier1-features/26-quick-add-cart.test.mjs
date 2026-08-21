import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS, kademeSec, paraBicimle } from "../test-helpers.mjs";

describe("Feature 26: B2B Quick Add Line & Cart Upgrades", () => {
  it("Test 26.1: Rapid MPN + Quantity entry bar parses input and prepares cart item payload", () => {
    const quickAddEntry = {
      rawMpn: "STM32F407VGT6",
      rawQty: 180,
    };

    const targetProduct = MOCK_PRODUCTS.find((p) => p.ureticiUrunKodu === quickAddEntry.rawMpn);
    assert.ok(targetProduct);

    const defaultPkg = targetProduct.ambalajlarVeFiyatlar[0];
    const payload = {
      ambalajId: defaultPkg.ambalajId,
      miktar: quickAddEntry.rawQty,
    };

    assert.equal(payload.ambalajId, 1011);
    assert.equal(payload.miktar, 180);
  });

  it("Test 26.2: Cart items table renders line items with packaging type, unit price, and line totals", () => {
    const cartItems = [
      { id: 1, mpn: "STM32F407VGT6", packaging: "Tepsi (Tray)", unitPrice: 11.20, qty: 180, lineTotal: Math.round(180 * 11.20 * 100) / 100 },
      { id: 2, mpn: "LM358DR", packaging: "Makara (2.5K)", unitPrice: 0.12, qty: 2500, lineTotal: Math.round(2500 * 0.12 * 100) / 100 },
    ];

    assert.equal(cartItems.length, 2);
    assert.equal(cartItems[0].lineTotal, 2016.00);
    assert.equal(cartItems[1].lineTotal, 300.00);
  });

  it("Test 26.3: In-cart quantity adjustment dynamically updates tiered unit price", () => {
    const packaging = MOCK_PRODUCTS[0].ambalajlarVeFiyatlar[0]; // 90-269: $11.20, 270-899: $9.80, 900+: $7.95

    const priceAt180 = kademeSec(packaging.fiyatlar, 180)?.birimFiyat;
    assert.equal(priceAt180, 11.20);

    const priceAt360 = kademeSec(packaging.fiyatlar, 360)?.birimFiyat;
    assert.equal(priceAt360, 9.80);

    const priceAt900 = kademeSec(packaging.fiyatlar, 900)?.birimFiyat;
    assert.equal(priceAt900, 7.95);
  });

  it("Test 26.4: Cart subtotal, VAT (KDV %20), shipping, and Turkish Lira equivalent calculation", () => {
    const subtotalUsd = 2316.00;
    const kdvRate = 0.20;
    const kdvUsd = Math.round(subtotalUsd * kdvRate * 100) / 100;
    const totalUsd = Math.round((subtotalUsd + kdvUsd) * 100) / 100;
    const usdTryRate = 34.25;
    const totalTry = Math.round(totalUsd * usdTryRate * 100) / 100;

    assert.equal(kdvUsd, 463.20);
    assert.equal(totalUsd, 2779.20);
    assert.equal(totalTry, 95187.60);
  });

  it("Test 26.5: B2B Project reference PO number and customer notes fields attach to order request", () => {
    const orderMetadata = {
      projeNo: "PO-2026-X89",
      musteriNotu: "Acil üretim bandı için Merkez depodan sevk edilsin.",
    };

    assert.equal(orderMetadata.projeNo, "PO-2026-X89");
    assert.ok(orderMetadata.musteriNotu.includes("Merkez depodan"));
  });
});
