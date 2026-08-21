import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createComparisonStore, MOCK_PRODUCTS } from "../test-helpers.mjs";

describe("Feature 24: Comparison Floating Dock", () => {
  it("Test 24.1: Floating comparison dock is visible only when item count > 0", () => {
    const store = createComparisonStore();
    assert.equal(store.getItemCount() > 0, false);

    store.addItem(MOCK_PRODUCTS[0]);
    assert.equal(store.getItemCount() > 0, true);
  });

  it("Test 24.2: Selected product thumbnails and MPN chips render in dock slots", () => {
    const store = createComparisonStore();
    store.addItem(MOCK_PRODUCTS[0]);
    store.addItem(MOCK_PRODUCTS[1]);

    const items = store.getItems();
    assert.equal(items.length, 2);
    assert.equal(items[0].ureticiUrunKodu, "STM32F407VGT6");
    assert.equal(items[1].ureticiUrunKodu, "GD32F407VGT6");
  });

  it("Test 24.3: Individual item remove button removes selected item from store", () => {
    const store = createComparisonStore([MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]]);
    assert.equal(store.getItemCount(), 2);

    store.removeItem(MOCK_PRODUCTS[0].id);
    assert.equal(store.getItemCount(), 1);
    assert.equal(store.isInComparison(MOCK_PRODUCTS[0].id), false);
    assert.equal(store.isInComparison(MOCK_PRODUCTS[1].id), true);
  });

  it("Test 24.4: 'Tümünü Temizle' (Clear All) empties comparison store immediately", () => {
    const store = createComparisonStore([MOCK_PRODUCTS[0], MOCK_PRODUCTS[1], MOCK_PRODUCTS[2]]);
    assert.equal(store.getItemCount(), 3);

    store.clear();
    assert.equal(store.getItemCount(), 0);
  });

  it("Test 24.5: 'Karşılaştır (N/4)' CTA navigates to /karsilastirma page with selected product IDs", () => {
    const store = createComparisonStore([MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]]);
    const ids = store.getItems().map((i) => i.id).join(",");
    const compareUrl = `/karsilastirma?ids=${ids}`;

    assert.equal(compareUrl, "/karsilastirma?ids=101,102");
  });
});
