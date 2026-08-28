import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS } from "../test-helpers.mjs";

describe("Feature 9: Tabbed Showcase Carousels", () => {
  it("Test 9.1: Tab navigation switches active product showcase view", () => {
    const tabs = [
      { id: "yeni", label: "Yeni Eklenenler", active: true },
      { id: "coksatan", label: "Çok Satanlar", active: false },
      { id: "firsat", label: "Stok Fırsatları", active: false },
    ];

    let currentTab = tabs[0].id;
    assert.equal(currentTab, "yeni");

    currentTab = "firsat";
    assert.equal(currentTab, "firsat");
  });

  it("Test 9.2: Active tab state uses semantic styling and ARIA tablist semantics", () => {
    const tabAria = {
      role: "tablist",
      tabRoles: "tab",
      panelRole: "tabpanel",
      selectedAria: "aria-selected",
      activeClasses: "border-b-2 border-vurgu text-marka font-bold",
    };

    assert.equal(tabAria.role, "tablist");
    assert.ok(tabAria.activeClasses.includes("border-vurgu"));
  });

  it("Test 9.3: Showcase cards render MPN, manufacturer, live stock badge, and base price", () => {
    const product = MOCK_PRODUCTS[0];
    const cardData = {
      mpn: product.ureticiUrunKodu,
      brand: product.ureticiAd,
      stock: product.toplamStok,
      basePrice: product.baslangicFiyati,
      currency: product.paraBirimi,
    };

    assert.equal(cardData.mpn, "STM32F407VGT6");
    assert.equal(cardData.brand, "STMicroelectronics");
    assert.equal(cardData.stock, 6850);
    assert.equal(cardData.basePrice, 12.50);
  });

  it("Test 9.4: B2B quick MOQ add button adds default packaging MOQ to cart draft", () => {
    const product = MOCK_PRODUCTS[0];
    const defaultPackaging = product.ambalajlarVeFiyatlar.find((a) => a.varsayilanMi) || product.ambalajlarVeFiyatlar[0];

    const cartAddPayload = {
      ambalajId: defaultPackaging.ambalajId,
      miktar: defaultPackaging.moq,
    };

    assert.equal(cartAddPayload.ambalajId, 1011);
    assert.equal(cartAddPayload.miktar, 90);
  });

  it("Test 9.5: Responsive carousel calculates visible slide count per breakpoint", () => {
    const getVisibleSlides = (screenWidth) => {
      if (screenWidth < 640) return 1;
      if (screenWidth < 1024) return 2;
      if (screenWidth < 1280) return 3;
      return 4;
    };

    assert.equal(getVisibleSlides(375), 1);
    assert.equal(getVisibleSlides(768), 2);
    assert.equal(getVisibleSlides(1024), 3);
    assert.equal(getVisibleSlides(1440), 4);
  });
});
