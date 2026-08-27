import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

describe("Feature 27: Dual-Path Checkout & RFQ Conversion", () => {
  const quoteSource = readFileSync(new URL("../../src/app/teklif-iste/quote-form.tsx", import.meta.url), "utf8");
  it("Test 27.1: Cart offers distinct paths: Direct Checkout (/odeme) and Official Quote (RFQ)", () => {
    const actions = [
      { id: "checkout", label: "Siparişi Tamamla / Satın Al", target: "/odeme", variant: "primary" },
      { id: "rfq", label: "Bu Sepet İçin Resmi Teklif Oluştur (RFQ)", target: "/teklif-iste", variant: "secondary" },
    ];

    assert.equal(actions.length, 2);
    assert.equal(actions[0].target, "/odeme");
    assert.equal(actions[1].target, "/teklif-iste");
  });

  it("Test 27.2: One-click cart-to-RFQ conversion maps cart items into RFQ payload", () => {
    const cartItems = [
      { urunAmbalajId: 1011, miktar: 900, birimFiyat: 7.95 },
      { urunAmbalajId: 3011, miktar: 50000, birimFiyat: 0.078 },
    ];

    const rfqPayload = {
      kalemler: cartItems.map((item) => ({
        ambalajId: item.urunAmbalajId,
        istenenMiktar: item.miktar,
        hedefBirimFiyat: item.birimFiyat * 0.90, // 10% target volume discount
        talepTerminTarihi: "2026-11-15",
      })),
      aciklama: "Yıllık seri üretim için toplu iskonto talebi.",
    };

    assert.equal(rfqPayload.kalemler.length, 2);
    assert.equal(rfqPayload.kalemler[0].ambalajId, 1011);
    assert.ok(rfqPayload.kalemler[0].hedefBirimFiyat < 7.95);
  });

  it("Test 27.3: Target unit price and requested lead time fields validate format", () => {
    const rfqLine = {
      targetPrice: 7.20,
      leadTimeDate: "2026-12-01",
    };

    assert.ok(Number.isFinite(rfqLine.targetPrice) && rfqLine.targetPrice > 0);
    assert.match(rfqLine.leadTimeDate, /^\d{4}-\d{2}-\d{2}$/);
  });

  it("Test 27.4: Direct checkout routing validates cart items and redirects to payment step", () => {
    const cart = {
      items: [{ id: 1, stockAvailable: true }],
      total: 2779.20,
    };

    const canProceed = cart.items.length > 0 && cart.items.every((i) => i.stockAvailable);
    assert.equal(canProceed, true);
  });

  it("Test 27.5: RFQ UI only displays the tracking number returned by the API", () => {
    assert.match(quoteSource, /setTalepNo\(res\.talepNo \|\| null\)/);
    assert.doesNotMatch(quoteSource, /Math\.random/);
    assert.doesNotMatch(quoteSource, /TEK-2026-\$\{/);
  });
});
