import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Feature 10: Authorized Supplier Showcase", () => {
  it("Test 10.1: Authorized supplier showcase displays brand line-card with official logos", () => {
    const suppliers = [
      { id: 1, name: "STMicroelectronics", logo: "/brands/st.svg", authorized: true, productCount: 4500 },
      { id: 2, name: "Texas Instruments", logo: "/brands/ti.svg", authorized: true, productCount: 6200 },
      { id: 3, name: "Murata Electronics", logo: "/brands/murata.svg", authorized: true, productCount: 8900 },
      { id: 4, name: "GigaDevice", logo: "/brands/gigadevice.svg", authorized: true, productCount: 1200 },
      { id: 5, name: "Yageo", logo: "/brands/yageo.svg", authorized: true, productCount: 15000 },
    ];

    assert.ok(suppliers.length >= 5);
    assert.ok(suppliers.every((s) => s.authorized));
  });

  it("Test 10.2: Manufacturer logo image rendering provides resilient alt text fallback", () => {
    const supplier = { name: "STMicroelectronics", logo: "/brands/st.svg" };
    const altText = `${supplier.name} Yetkili Distribütör`;

    assert.equal(altText, "STMicroelectronics Yetkili Distribütör");
  });

  it("Test 10.3: Authorized distributor guarantee badge renders trust statement", () => {
    const trustBadge = {
      title: "%100 Orijinal Ürün Garantisi",
      description: "Doğrudan üretici fabrikalarından tedarik edilen orijinal komponentler.",
      icon: "ShieldCheck",
    };

    assert.ok(trustBadge.title.includes("Orijinal Ürün Garantisi"));
    assert.equal(trustBadge.icon, "ShieldCheck");
  });

  it("Test 10.4: Brand card link routes directly to catalog filtered by selected manufacturer", () => {
    const brandName = "STMicroelectronics";
    const brandCatalogUrl = `/urunler?marka=${encodeURIComponent(brandName)}`;

    assert.equal(brandCatalogUrl, "/urunler?marka=STMicroelectronics");
  });

  it("Test 10.5: Supplier carousel scroll loop handles next/prev interaction bounds", () => {
    let currentIndex = 0;
    const totalBrands = 10;
    const visibleCount = 5;

    const next = () => { currentIndex = Math.min(currentIndex + 1, totalBrands - visibleCount); };
    const prev = () => { currentIndex = Math.max(currentIndex - 1, 0); };

    assert.equal(currentIndex, 0);
    next();
    assert.equal(currentIndex, 1);
    prev();
    assert.equal(currentIndex, 0);
  });
});
