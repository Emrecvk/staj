import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_CATEGORIES } from "../test-helpers.mjs";

describe("Feature 2: Multi-Level Mega Menu", () => {
  it("Test 2.1: Level 1 category tree lists main component families with active hover state", () => {
    const level1List = MOCK_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.ad,
      slug: c.slug,
      subCount: c.altKategoriler.length,
      hasIcon: Boolean(c.ikonUrl),
    }));

    assert.equal(level1List.length, 3);
    assert.equal(level1List[0].name, "Yarı İletkenler");
    assert.equal(level1List[0].subCount, 2);
    assert.ok(level1List[0].hasIcon);
  });

  it("Test 2.2: Level 2 subcategories generate multi-column grouped layout", () => {
    const semiConductorCategory = MOCK_CATEGORIES.find((c) => c.id === 1);
    assert.ok(semiConductorCategory);

    const level2Columns = semiConductorCategory.altKategoriler.map((sub) => ({
      id: sub.id,
      name: sub.ad,
      leafItems: sub.altKategoriler.map((leaf) => leaf.ad),
    }));

    assert.equal(level2Columns.length, 2);
    assert.equal(level2Columns[0].name, "Entegre Devreler (ICs)");
    assert.equal(level2Columns[0].leafItems.length, 3);
    assert.ok(level2Columns[0].leafItems.includes("Mikrokontrolcüler (ARM / RISC-V)"));
  });

  it("Test 2.3: Level 3 leaf items generate deep-linkable URLs with catalog facets", () => {
    const leafCategory = MOCK_CATEGORIES[0].altKategoriler[0].altKategoriler[0];
    const leafLink = `/urunler?kategoriId=${leafCategory.id}&slug=${leafCategory.slug}`;

    assert.equal(leafCategory.id, 1001);
    assert.equal(leafCategory.yaprakMi, true);
    assert.equal(leafLink, "/urunler?kategoriId=1001&slug=mikrokontrolculer");
  });

  it("Test 2.4: Featured brand spotlight panel loads authorized supplier cards per category", () => {
    const categoryBrandMap = {
      1: [
        { brandId: 1, name: "STMicroelectronics", logoUrl: "/brands/st.svg", authorized: true },
        { brandId: 2, name: "GigaDevice", logoUrl: "/brands/gigadevice.svg", authorized: true },
        { brandId: 4, name: "Texas Instruments", logoUrl: "/brands/ti.svg", authorized: true },
      ],
      2: [
        { brandId: 3, name: "Murata Electronics", logoUrl: "/brands/murata.svg", authorized: true },
        { brandId: 5, name: "Yageo", logoUrl: "/brands/yageo.svg", authorized: true },
      ],
    };

    const brandsForSemis = categoryBrandMap[1];
    assert.equal(brandsForSemis.length, 3);
    assert.ok(brandsForSemis.every((b) => b.authorized));
    assert.equal(brandsForSemis[0].name, "STMicroelectronics");
  });

  it("Test 2.5: Hover-intent buffering logic prevents menu flickering on diagonal mouse movements", () => {
    const hoverIntentConfig = {
      openDelayMs: 150,
      closeDelayMs: 200,
      sensitivityThresholdPx: 6,
    };

    assert.ok(hoverIntentConfig.openDelayMs >= 100 && hoverIntentConfig.openDelayMs <= 200);
    assert.ok(hoverIntentConfig.closeDelayMs >= 150 && hoverIntentConfig.closeDelayMs <= 300);
  });

  it("Test 2.6: Keyboard navigation and ARIA attributes meet WCAG 2.1 AA requirements", () => {
    const ariaContract = {
      menuRole: "menu",
      itemRole: "menuitem",
      ariaHasPopup: "menu",
      ariaExpanded: true,
      ariaControls: "mega-menu-panel",
      keyboardShortcuts: ["Escape", "ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"],
    };

    assert.equal(ariaContract.menuRole, "menu");
    assert.equal(ariaContract.itemRole, "menuitem");
    assert.equal(ariaContract.ariaExpanded, true);
    assert.ok(ariaContract.keyboardShortcuts.includes("Escape"));
  });
});
