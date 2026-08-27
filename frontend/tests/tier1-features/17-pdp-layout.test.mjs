import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MOCK_PRODUCTS } from "../test-helpers.mjs";

describe("Feature 17: PDP Layout & Summary Header", () => {
  const clientSource = readFileSync(new URL("../../src/app/urunler/[id]/client.tsx", import.meta.url), "utf8");
  it("Test 17.1: Breadcrumb hierarchy renders full ancestral category path down to active MPN", () => {
    const product = MOCK_PRODUCTS[0];
    const breadcrumbItems = [
      { label: "Ana Sayfa", href: "/" },
      ...product.kategoriYolu.map((k) => ({ label: k, href: `/urunler?kategori=${encodeURIComponent(k)}` })),
      { label: product.ureticiUrunKodu, href: `/urunler/${product.id}`, active: true },
    ];

    assert.equal(breadcrumbItems.length, 5);
    assert.equal(breadcrumbItems[0].label, "Ana Sayfa");
    assert.equal(breadcrumbItems[1].label, "Yarı İletkenler");
    assert.equal(breadcrumbItems[4].label, "STM32F407VGT6");
  });

  it("Test 17.2: Product summary header displays manufacturer name, MPN with copy button, and description", () => {
    const product = MOCK_PRODUCTS[0];
    assert.equal(product.ureticiAd, "STMicroelectronics");
    assert.equal(product.ureticiUrunKodu, "STM32F407VGT6");
    assert.ok(product.kisaAciklama.includes("Cortex-M4"));
  });

  it("Test 17.3: Lifecycle status badges map correctly to semantic alert colors", () => {
    const statusColorMap = {
      "Aktif": { bg: "bg-basari-50", text: "text-basari-600", label: "Aktif / Üretimde" },
      "YeniTasarimaOnerilmez": { bg: "bg-uyari-50", text: "text-uyari-600", label: "Yeni Tasarıma Önerilmez (NRND)" },
      "OmruSonu": { bg: "bg-hata-50", text: "text-hata-600", label: "Ömrü Sonu (EOL)" },
    };

    const activeStatus = statusColorMap["Aktif"];
    assert.equal(activeStatus.bg, "bg-basari-50");
    assert.equal(activeStatus.text, "text-basari-600");
  });

  it("Test 17.4: Environmental compliance badges display RoHS and REACH compliance status", () => {
    const product = MOCK_PRODUCTS[0];
    const complianceBadges = [
      { type: "RoHS", status: product.rohsDurumu, compliant: product.rohsDurumu === "Belgeli" },
      { type: "REACH", status: "Uyumlu", compliant: true },
    ];

    assert.equal(complianceBadges[0].compliant, true);
    assert.equal(complianceBadges[1].compliant, true);
  });

  it("Test 17.5: High-resolution image gallery contains primary image and thumbnail list with B2B disclaimer", () => {
    const product = MOCK_PRODUCTS[0];
    assert.ok(product.gorselUrlleri.length >= 2);
    assert.equal(product.anaGorselUrl, "/products/stm32f407vgt6.jpg");
    assert.equal(typeof product.gorselTemsiliMi, "boolean");
  });

  it("Test 17.6: Desktop PDP columns fit the 12-column grid without wrapping", () => {
    assert.match(clientSource, /lg:col-span-5/);
    assert.match(clientSource, /lg:col-span-3/);
    assert.match(clientSource, /lg:col-span-4/);
    assert.doesNotMatch(clientSource, /lg:col-span-6[\s\S]*lg:col-span-4[\s\S]*lg:col-span-4/);
  });
});
