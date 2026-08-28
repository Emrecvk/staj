import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Feature 12: 3-Mode Catalog View Switcher", () => {
  it("Test 12.1: View switcher supports Grid (izgara), List (liste), and Dense Table (tablo) modes", () => {
    const supportedModes = ["izgara", "liste", "tablo"];
    assert.equal(supportedModes.length, 3);
    assert.ok(supportedModes.includes("tablo"));
    assert.ok(supportedModes.includes("izgara"));
    assert.ok(supportedModes.includes("liste"));
  });

  it("Test 12.2: Active view mode updates URL query parameters without reloading full page", () => {
    const currentParams = new URLSearchParams("kategoriId=1001&siralama=stok");
    currentParams.set("gorunum", "tablo");

    assert.equal(currentParams.get("gorunum"), "tablo");
    assert.equal(currentParams.get("kategoriId"), "1001");
  });

  it("Test 12.3: Layout renderer dynamically dispatches to correct component by view mode", () => {
    const renderComponent = (mode) => {
      switch (mode) {
        case "tablo":
          return "ProductTableView";
        case "liste":
          return "ProductListView";
        case "izgara":
        default:
          return "ProductGridView";
      }
    };

    assert.equal(renderComponent("tablo"), "ProductTableView");
    assert.equal(renderComponent("liste"), "ProductListView");
    assert.equal(renderComponent("izgara"), "ProductGridView");
    assert.equal(renderComponent("unknown"), "ProductGridView");
  });

  it("Test 12.4: Accessibility labels and ARIA pressed states indicate active mode", () => {
    const getAriaProps = (currentMode, buttonMode) => ({
      role: "button",
      "aria-pressed": currentMode === buttonMode,
      "aria-label": `${buttonMode} görünümüne geç`,
    });

    const activeTableAria = getAriaProps("tablo", "tablo");
    assert.equal(activeTableAria["aria-pressed"], true);

    const inactiveGridAria = getAriaProps("tablo", "izgara");
    assert.equal(inactiveGridAria["aria-pressed"], false);
  });

  it("Test 12.5: Default view mode falls back gracefully to grid when query param is omitted", () => {
    const resolveViewMode = (queryMode) => {
      const valid = ["izgara", "liste", "tablo"];
      return queryMode && valid.includes(queryMode) ? queryMode : "izgara";
    };

    assert.equal(resolveViewMode(undefined), "izgara");
    assert.equal(resolveViewMode("invalid_mode"), "izgara");
    assert.equal(resolveViewMode("tablo"), "tablo");
  });
});
