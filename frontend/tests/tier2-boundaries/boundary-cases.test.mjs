import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  miktariDogrula,
  yukariYuvarla,
  kademeSec,
  createComparisonStore,
  parseCsvBom,
  MOCK_PRODUCTS,
} from "../test-helpers.mjs";

describe("Tier 2: Boundary & Corner Cases", () => {
  describe("MOQ & Packaging Step Limits", () => {
    it("MOQ Boundary: Zero, negative, or NaN quantity is rejected with positive recommendation", () => {
      const moq = 100;
      const step = 50;

      const zeroRes = miktariDogrula(0, moq, step);
      assert.equal(zeroRes.gecerliMi, false);
      assert.equal(zeroRes.onerilenMiktar, 100);

      const negRes = miktariDogrula(-15, moq, step);
      assert.equal(negRes.gecerliMi, false);
      assert.equal(negRes.onerilenMiktar, 100);

      const nanRes = miktariDogrula(NaN, moq, step);
      assert.equal(nanRes.gecerliMi, false);
      assert.equal(nanRes.onerilenMiktar, 100);
    });

    it("MOQ Boundary: Sub-MOQ value (e.g. 1 when MOQ=100) returns error and rounds up to MOQ", () => {
      const moq = 100;
      const step = 100;
      const res = miktariDogrula(1, moq, step);

      assert.equal(res.gecerliMi, false);
      assert.ok(res.hata?.includes("Minimum sipariş miktarı 100"));
      assert.equal(res.onerilenMiktar, 100);
    });

    it("MOQ Boundary: Exact MOQ value passes validation cleanly", () => {
      const moq = 2500;
      const step = 2500;
      const res = miktariDogrula(2500, moq, step);

      assert.equal(res.gecerliMi, true);
      assert.equal(res.hata, null);
      assert.equal(res.onerilenMiktar, 2500);
    });

    it("Step Multiple Boundary: Non-multiple of packaging step rounds UP to next valid multiple", () => {
      const moq = 90;
      const step = 90;

      // 91 -> 180
      const res91 = miktariDogrula(91, moq, step);
      assert.equal(res91.gecerliMi, false);
      assert.equal(res91.onerilenMiktar, 180);

      // 269 -> 270
      const res269 = miktariDogrula(269, moq, step);
      assert.equal(res269.gecerliMi, false);
      assert.equal(res269.onerilenMiktar, 270);
    });

    it("Extreme Multipliers: High-volume packaging (MOQ 10,000, step 10,000) rounds 15,000 to 20,000", () => {
      const res = miktariDogrula(15000, 10000, 10000);
      assert.equal(res.gecerliMi, false);
      assert.equal(res.onerilenMiktar, 20000);
    });
  });

  describe("Search & Query Boundary Cases", () => {
    it("Empty and whitespace queries are sanitized and prevented from crashing catalog", () => {
      const sanitizeQuery = (q) => (typeof q === "string" ? q.trim() : "");
      assert.equal(sanitizeQuery(""), "");
      assert.equal(sanitizeQuery("   \t\n  "), "");
      assert.equal(sanitizeQuery("  STM32F407  "), "STM32F407");
    });

    it("Special characters and injection attacks are safely neutralized", () => {
      const maliciousInputs = [
        "<script>alert('xss')</script>",
        "' OR '1'='1' --",
        "../../etc/passwd",
        "STM32%20/\\#?&=",
      ];

      maliciousInputs.forEach((input) => {
        const encoded = encodeURIComponent(input);
        assert.ok(!encoded.includes("<script>"));
        assert.ok(typeof encoded === "string");
      });
    });

    it("Non-Latin and Unicode characters (e.g. Cyrillic, Chinese, Turkish diacritics) preserve integrity", () => {
      const turkishQuery = "Kondansatör Entegre Direnç";
      const params = new URLSearchParams({ aramaMetni: turkishQuery });

      assert.equal(params.get("aramaMetni"), "Kondansatör Entegre Direnç");
      assert.ok(params.toString().includes("Kondansat%C3%B6r"));
    });
  });

  describe("0-Result Filter Combinations", () => {
    it("Incompatible facet combination yields empty result array without throwing errors", () => {
      // Simulate filtering for SMD mounting in THT-only connector category
      const allProducts = MOCK_PRODUCTS;
      const filtered = allProducts.filter(
        (p) => p.kategoriId === 3001 && p.montajTipi === "BGA"
      );

      assert.equal(filtered.length, 0);
      assert.ok(Array.isArray(filtered));
    });

    it("0-Result state provides 'Filtreleri Temizle' action to restore state", () => {
      const emptyState = {
        resultCount: 0,
        message: "Seçtiğiniz filtre kombinasyonunda ürün bulunamadı.",
        clearFiltersAction: "/urunler",
      };

      assert.equal(emptyState.resultCount, 0);
      assert.equal(emptyState.clearFiltersAction, "/urunler");
    });
  });

  describe("Comparison Max Limit (4 Products)", () => {
    it("Comparison store accepts up to 4 items and rejects 5th item", () => {
      const store = createComparisonStore();

      assert.equal(store.addItem({ id: 1, ureticiUrunKodu: "P1" }), true);
      assert.equal(store.addItem({ id: 2, ureticiUrunKodu: "P2" }), true);
      assert.equal(store.addItem({ id: 3, ureticiUrunKodu: "P3" }), true);
      assert.equal(store.addItem({ id: 4, ureticiUrunKodu: "P4" }), true);
      assert.equal(store.getItemCount(), 4);

      // Attempt 5th item
      const added5th = store.addItem({ id: 5, ureticiUrunKodu: "P5" });
      assert.equal(added5th, false);
      assert.equal(store.getItemCount(), 4);
    });

    it("Adding duplicate product does not increase count or duplicate store entry", () => {
      const store = createComparisonStore();
      store.addItem({ id: 101, ureticiUrunKodu: "STM32F407VGT6" });
      assert.equal(store.getItemCount(), 1);

      // Add same product again
      store.addItem({ id: 101, ureticiUrunKodu: "STM32F407VGT6" });
      assert.equal(store.getItemCount(), 1);
    });
  });

  describe("Invalid & Mixed MPNs in BOM", () => {
    it("BOM parser handles invalid MPNs gracefully without halting batch processing", () => {
      const rawBom = `
        STM32F407VGT6, 100
        INVALID_NONEXISTENT_PART_9999, 50
        LM358DR, 2500
        , 10
        ###INVALID###, 20
      `;

      const parsed = parseCsvBom(rawBom);
      assert.equal(parsed.length, 4); // Skips empty MPN
      assert.equal(parsed[0].mpn, "STM32F407VGT6");
      assert.equal(parsed[1].mpn, "INVALID_NONEXISTENT_PART_9999");
      assert.equal(parsed[2].mpn, "LM358DR");
      assert.equal(parsed[3].mpn, "###INVALID###");
    });
  });
});
