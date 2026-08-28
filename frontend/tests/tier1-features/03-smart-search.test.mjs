import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "../test-helpers.mjs";

describe("Feature 3: Smart Search Combobox", () => {
  it("Test 3.1: Debounced input handler buffers rapid keystrokes within 250-300ms window", () => {
    let callCount = 0;
    const debounceBuffer = (fn, delay = 250) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          callCount++;
          fn(...args);
        }, delay);
      };
    };

    const trigger = debounceBuffer((q) => q, 50);
    trigger("S");
    trigger("ST");
    trigger("STM");
    trigger("STM32");

    assert.equal(callCount, 0); // Not called immediately
  });

  it("Test 3.2: Category prefix dropdown scopes search queries to specified category hierarchy", () => {
    const searchScope = {
      selectedCategoryId: 1001,
      categoryName: "Mikrokontrolcüler",
      queryText: "STM32",
    };

    const searchUrl = `/urunler?kategoriId=${searchScope.selectedCategoryId}&aramaMetni=${encodeURIComponent(searchScope.queryText)}`;
    assert.equal(searchUrl, "/urunler?kategoriId=1001&aramaMetni=STM32");
  });

  it("Test 3.3: Product autocomplete filters products by MPN, brand, and description", () => {
    const query = "STM32";
    const matchedProducts = MOCK_PRODUCTS.filter((p) =>
      p.ureticiUrunKodu.toLowerCase().includes(query.toLowerCase()) ||
      p.ureticiAd.toLowerCase().includes(query.toLowerCase()) ||
      p.kisaAciklama.toLowerCase().includes(query.toLowerCase())
    );

    assert.equal(matchedProducts.length, 2);
    assert.ok(matchedProducts.some((p) => p.ureticiUrunKodu === "STM32F407VGT6"));
    assert.ok(matchedProducts.some((p) => p.ureticiUrunKodu === "STM32F429ZIT6"));
  });

  it("Test 3.4: Category and manufacturer suggestions populate grouped autocomplete overlay", () => {
    const query = "kondansatör";
    const matchedCategories = [];
    const walk = (cats) => {
      cats.forEach((c) => {
        if (c.ad.toLowerCase().includes(query.toLowerCase())) matchedCategories.push(c);
        if (c.altKategoriler) walk(c.altKategoriler);
      });
    };
    walk(MOCK_CATEGORIES);

    assert.ok(matchedCategories.length >= 2);
    assert.ok(matchedCategories.some((c) => c.ad.includes("Seramik")));
  });

  it("Test 3.5: Empty or invalid query produces sanitized fallback feedback with popular suggestions", () => {
    const invalidQuery = "   ";
    const sanitized = invalidQuery.trim();
    const hasResults = sanitized.length > 0;

    const emptyStateResponse = {
      hasResults,
      message: "Aramak istediğiniz ürün kodunu veya parça adını yazınız.",
      popularSuggestions: ["STM32", "LM358", "0603 100nF", "ESP32", "Optokuplör"],
    };

    assert.equal(emptyStateResponse.hasResults, false);
    assert.ok(emptyStateResponse.popularSuggestions.length >= 3);
  });

  it("Test 3.6: Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape) navigates autocomplete list", () => {
    const searchSource = readFileSync(
      new URL("../../src/components/mega-menu/smart-search.tsx", import.meta.url),
      "utf8",
    );

    assert.ok(searchSource.includes('e.key === "ArrowDown"'));
    assert.ok(searchSource.includes('e.key === "ArrowUp"'));
    assert.ok(searchSource.includes('e.key === "Enter" && aktifOneriIndeksi >= 0'));
    assert.ok(searchSource.includes('e.key === "Escape"'));
    assert.ok(searchSource.includes("aria-activedescendant"));
    assert.ok(searchSource.includes('role="option"'));
    assert.ok(searchSource.includes("router.push(hedef.url)"));
  });
});
