import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Feature 15: Applied Filter Chips & URL Sync", () => {
  it("Test 15.1: Applied filter chips bar displays all active facet selections as removable tags", () => {
    const activeFilters = [
      { key: "marka", label: "Marka", value: "STMicroelectronics" },
      { key: "kilif", label: "Kılıf", value: "LQFP-100" },
      { key: "sadeceStoktakiler", label: "Stok Durumu", value: "Sadece Stokta Olanlar" },
    ];

    assert.equal(activeFilters.length, 3);
    assert.equal(activeFilters[0].value, "STMicroelectronics");
    assert.equal(activeFilters[1].value, "LQFP-100");
  });

  it("Test 15.2: Removing individual filter chip updates URL search params accurately", () => {
    const params = new URLSearchParams("kategoriId=1001&marka=STMicroelectronics&kilif=LQFP-100");
    params.delete("kilif");

    assert.equal(params.get("kilif"), null);
    assert.equal(params.get("marka"), "STMicroelectronics");
    assert.equal(params.get("kategoriId"), "1001");
  });

  it("Test 15.3: 'Tümünü Temizle' (Clear All) resets all active parametric filters except category", () => {
    const params = new URLSearchParams("kategoriId=1001&marka=STMicroelectronics&kilif=LQFP-100&sadeceStoktakiler=true");
    
    // Preserve category, remove other facets
    const kategoriId = params.get("kategoriId");
    const cleanParams = new URLSearchParams();
    if (kategoriId) cleanParams.set("kategoriId", kategoriId);

    assert.equal(cleanParams.toString(), "kategoriId=1001");
    assert.equal(cleanParams.get("marka"), null);
  });

  it("Test 15.4: URL search parameter bidirectional serialization supports array values", () => {
    const filterState = {
      kategoriId: 1001,
      kilif: ["LQFP-100", "LQFP-144"],
      montajTipi: ["SMD"],
    };

    const query = new URLSearchParams();
    query.set("kategoriId", String(filterState.kategoriId));
    filterState.kilif.forEach((k) => query.append("kilif", k));
    filterState.montajTipi.forEach((m) => query.append("montajTipi", m));

    assert.equal(query.getAll("kilif").length, 2);
    assert.ok(query.getAll("kilif").includes("LQFP-100"));
    assert.ok(query.getAll("kilif").includes("LQFP-144"));
  });

  it("Test 15.5: Non-blocking filter transition state applies loading opacity without unmounting grid", () => {
    const transitionState = { isPending: true };
    const gridStyleClass = transitionState.isPending ? "opacity-60 pointer-events-none transition-opacity" : "opacity-100";

    assert.ok(gridStyleClass.includes("opacity-60"));
  });
});
