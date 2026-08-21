import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  yukariYuvarla,
  miktariDogrula,
  kademeSec,
  kademeUlasilabilirMi,
  hesaplaB2BFiyat,
  paraBicimle,
} from "../test-helpers.mjs";

describe("Adversarial Domain Stress: B2B Pricing Rules & Extreme Boundary Hardening", () => {
  // --------------------------------------------------------------------------
  // 1. MOQ BOUNDARIES & EXTREME NUMERICAL INPUTS
  // --------------------------------------------------------------------------
  describe("1. MOQ Boundaries, Zero, Negative, and Non-Finite Inputs", () => {
    it("1.1. Zero input (0) must fail validation and recommend MOQ", () => {
      const res = miktariDogrula(0, 100, 50);
      assert.equal(res.gecerliMi, false);
      assert.equal(res.onerilenMiktar, 100);
      assert.ok(res.hata?.includes("sıfırdan büyük"));
    });

    it("1.2. Negative quantities (-1, -100, -999999) must fail validation and recommend MOQ", () => {
      [-1, -10, -100, -999999, -0.001].forEach((neg) => {
        const res = miktariDogrula(neg, 250, 50);
        assert.equal(res.gecerliMi, false);
        assert.equal(res.onerilenMiktar, 250);
        assert.ok(res.hata?.includes("sıfırdan büyük"));
      });
    });

    it("1.3. Non-finite values (NaN, Infinity, -Infinity) must fail safely without throwing", () => {
      [NaN, Infinity, -Infinity].forEach((val) => {
        const res = miktariDogrula(val, 500, 100);
        assert.equal(res.gecerliMi, false);
        assert.equal(res.onerilenMiktar, 500);
        assert.ok(res.hata?.includes("sıfırdan büyük"));
      });
    });

    it("1.4. Sub-MOQ boundaries: quantity strictly less than MOQ must fail and recommend rounded MOQ", () => {
      const moq = 1000;
      const step = 250;

      // 1 unit
      const res1 = miktariDogrula(1, moq, step);
      assert.equal(res1.gecerliMi, false);
      assert.equal(res1.onerilenMiktar, 1000);
      assert.ok(res1.hata?.includes("Minimum sipariş miktarı 1.000"));

      // 999 units (MOQ - 1)
      const res999 = miktariDogrula(999, moq, step);
      assert.equal(res999.gecerliMi, false);
      assert.equal(res999.onerilenMiktar, 1000);

      // Sub-MOQ where MOQ is not multiple of step: MOQ=350, Step=200 -> rounds up to 400
      const resMisaligned = miktariDogrula(100, 350, 200);
      assert.equal(resMisaligned.gecerliMi, false);
      assert.equal(resMisaligned.onerilenMiktar, 400);
    });

    it("1.5. Exact MOQ boundary passes when MOQ is a valid multiple of step", () => {
      const res = miktariDogrula(1000, 1000, 250);
      assert.equal(res.gecerliMi, true);
      assert.equal(res.hata, null);
      assert.equal(res.onerilenMiktar, 1000);
    });

    it("1.6. Extreme large quantities (1M, 10M, 100M units) maintain exact integer precision", () => {
      const largeQty = 10_000_000;
      const res = miktariDogrula(largeQty, 5000, 2500);
      assert.equal(res.gecerliMi, true);
      assert.equal(res.hata, null);
      assert.equal(res.onerilenMiktar, 10_000_000);

      // Large quantity + 1 with step 2500
      const resUnaligned = miktariDogrula(10_000_001, 5000, 2500);
      assert.equal(resUnaligned.gecerliMi, false);
      assert.equal(resUnaligned.onerilenMiktar, 10_002_500);
    });

    it("1.7. Corrupt/adversarial packaging config (MOQ <= 0, Step <= 0) defaults safely to 1", () => {
      const resZeroMoq = miktariDogrula(5, 0, 0);
      assert.equal(resZeroMoq.gecerliMi, true);
      assert.equal(resZeroMoq.onerilenMiktar, 5);

      const resNegConfig = miktariDogrula(10, -50, -10);
      assert.equal(resNegConfig.gecerliMi, true);
      assert.equal(resNegConfig.onerilenMiktar, 10);
    });
  });

  // --------------------------------------------------------------------------
  // 2. STEP MULTIPLIER (KATLAMA) & yukariYuvarla Function
  // --------------------------------------------------------------------------
  describe("2. Step Multiplier (Katlama) & yukariYuvarla Function", () => {
    it("2.1. yukariYuvarla returns exact value when already a multiple", () => {
      assert.equal(yukariYuvarla(90, 90), 90);
      assert.equal(yukariYuvarla(180, 90), 180);
      assert.equal(yukariYuvarla(4000, 4000), 4000);
      assert.equal(yukariYuvarla(12000, 4000), 12000);
      assert.equal(yukariYuvarla(0, 90), 0);
    });

    it("2.2. yukariYuvarla rounds UP strictly on all intermediate values", () => {
      const step = 90;
      assert.equal(yukariYuvarla(1, step), 90);
      assert.equal(yukariYuvarla(89, step), 90);
      assert.equal(yukariYuvarla(91, step), 180);
      assert.equal(yukariYuvarla(179, step), 180);
      assert.equal(yukariYuvarla(181, step), 270);
    });

    it("2.3. yukariYuvarla handles step <= 1 safely", () => {
      assert.equal(yukariYuvarla(42, 1), 42);
      assert.equal(yukariYuvarla(42, 0), 42);
      assert.equal(yukariYuvarla(42, -5), 42);
    });

    it("2.4. Step multiple validation error messages match Turkish localization", () => {
      const res = miktariDogrula(125, 100, 50);
      assert.equal(res.gecerliMi, false);
      assert.ok(res.hata?.includes("50 adedin katı olmalıdır"));
      assert.equal(res.onerilenMiktar, 150);
    });
  });

  // --------------------------------------------------------------------------
  // 3. TIER SELECTION (kademeSec) & ACCESSIBILITY RULES
  // --------------------------------------------------------------------------
  describe("3. Tier Selection (kademeSec) & Accessibility Rules", () => {
    const sampleTiers = [
      { minMiktar: 1, maxMiktar: 89, birimFiyat: 12.50, paraBirimi: "USD" },
      { minMiktar: 90, maxMiktar: 269, birimFiyat: 11.20, paraBirimi: "USD" },
      { minMiktar: 270, maxMiktar: 899, birimFiyat: 9.80, paraBirimi: "USD" },
      { minMiktar: 900, maxMiktar: null, birimFiyat: 7.95, paraBirimi: "USD" },
    ];

    it("3.1. Correctly selects tier across all internal boundary points", () => {
      // Lower bound tier 1
      assert.equal(kademeSec(sampleTiers, 1)?.birimFiyat, 12.50);
      // Upper bound tier 1
      assert.equal(kademeSec(sampleTiers, 89)?.birimFiyat, 12.50);
      // Lower bound tier 2
      assert.equal(kademeSec(sampleTiers, 90)?.birimFiyat, 11.20);
      // Mid tier 2
      assert.equal(kademeSec(sampleTiers, 150)?.birimFiyat, 11.20);
      // Upper bound tier 2
      assert.equal(kademeSec(sampleTiers, 269)?.birimFiyat, 11.20);
      // Lower bound tier 3
      assert.equal(kademeSec(sampleTiers, 270)?.birimFiyat, 9.80);
      // Upper bound tier 3
      assert.equal(kademeSec(sampleTiers, 899)?.birimFiyat, 9.80);
      // Lower bound open tier 4
      assert.equal(kademeSec(sampleTiers, 900)?.birimFiyat, 7.95);
      // High volume open tier 4
      assert.equal(kademeSec(sampleTiers, 1_000_000)?.birimFiyat, 7.95);
    });

    it("3.2. Out-of-order tier arrays resolve identically (order-independent robustness)", () => {
      const shuffledTiers = [
        sampleTiers[3],
        sampleTiers[0],
        sampleTiers[2],
        sampleTiers[1],
      ];

      assert.equal(kademeSec(shuffledTiers, 50)?.birimFiyat, 12.50);
      assert.equal(kademeSec(shuffledTiers, 180)?.birimFiyat, 11.20);
      assert.equal(kademeSec(shuffledTiers, 500)?.birimFiyat, 9.80);
      assert.equal(kademeSec(shuffledTiers, 5000)?.birimFiyat, 7.95);
    });

    it("3.3. Overlapping tiers resolve deterministically to the lowest unit price", () => {
      const overlappingTiers = [
        { minMiktar: 1, maxMiktar: 100, birimFiyat: 10.0, paraBirimi: "USD" },
        { minMiktar: 50, maxMiktar: 150, birimFiyat: 8.5, paraBirimi: "USD" },
      ];

      const chosen = kademeSec(overlappingTiers, 75);
      assert.equal(chosen?.birimFiyat, 8.5);
    });

    it("3.4. Tier gap fallback: quantity falling between non-contiguous tiers falls back to highest valid minMiktar", () => {
      const gappedTiers = [
        { minMiktar: 1, maxMiktar: 50, birimFiyat: 10.0, paraBirimi: "USD" },
        { minMiktar: 100, maxMiktar: null, birimFiyat: 5.0, paraBirimi: "USD" },
      ];

      const chosen = kademeSec(gappedTiers, 75);
      assert.equal(chosen?.birimFiyat, 10.0);
    });

    it("3.5. Quantity below all tier minimums returns null", () => {
      const highMinimumTiers = [
        { minMiktar: 500, maxMiktar: null, birimFiyat: 2.0, paraBirimi: "USD" },
      ];

      assert.equal(kademeSec(highMinimumTiers, 100), null);
    });

    it("3.6. Empty tier list returns null safely", () => {
      assert.equal(kademeSec([], 100), null);
    });

    it("3.7. kademeUlasilabilirMi correctly flags tiers blocked by packaging MOQ", () => {
      const reelMoq = 4000;
      const tier1 = { minMiktar: 1, maxMiktar: 99, birimFiyat: 0.05, paraBirimi: "USD" };
      const tier2 = { minMiktar: 100, maxMiktar: 3999, birimFiyat: 0.02, paraBirimi: "USD" };
      const tier3 = { minMiktar: 4000, maxMiktar: 19999, birimFiyat: 0.0085, paraBirimi: "USD" };
      const tier4 = { minMiktar: 20000, maxMiktar: null, birimFiyat: 0.0062, paraBirimi: "USD" };

      assert.equal(kademeUlasilabilirMi(tier1, reelMoq), false);
      assert.equal(kademeUlasilabilirMi(tier2, reelMoq), false);
      assert.equal(kademeUlasilabilirMi(tier3, reelMoq), true);
      assert.equal(kademeUlasilabilirMi(tier4, reelMoq), true);
    });
  });

  // --------------------------------------------------------------------------
  // 4. FULL B2B PRICING CALCULATION (hesaplaB2BFiyat) & PRECISION
  // --------------------------------------------------------------------------
  describe("4. End-to-End B2B Price & Total Calculation", () => {
    const mockPackaging = {
      ambalajId: 101,
      ad: "Tepsi (Tray)",
      ambalajTipi: 2,
      mpq: 90,
      moq: 90,
      katlamaMiktari: 90,
      stokMiktari: 5000,
      gelecekStokMiktari: 0,
      gelecekStokTarihi: null,
      fiyatlar: [
        { minMiktar: 1, maxMiktar: 89, birimFiyat: 12.50, paraBirimi: "USD" },
        { minMiktar: 90, maxMiktar: 269, birimFiyat: 11.20, paraBirimi: "USD" },
        { minMiktar: 270, maxMiktar: 899, birimFiyat: 9.80, paraBirimi: "USD" },
        { minMiktar: 900, maxMiktar: null, birimFiyat: 7.95, paraBirimi: "USD" },
      ],
    };

    it("4.1. Valid order quantity calculates exact unit price, quantity, and total amount", () => {
      const calc = hesaplaB2BFiyat(270, mockPackaging);
      assert.equal(calc.yuvarlanmisMiktar, 270);
      assert.equal(calc.gecerliBirimFiyat, 9.80);
      assert.equal(calc.toplamTutar, 270 * 9.80);
      assert.equal(calc.hataMesaji, null);
      assert.equal(calc.uyariMesaji, null);
    });

    it("4.2. Invalid quantity automatically calculates with rounded-up quantity and warning message", () => {
      const calc = hesaplaB2BFiyat(100, mockPackaging);
      assert.equal(calc.yuvarlanmisMiktar, 180);
      assert.equal(calc.gecerliBirimFiyat, 11.20);
      assert.equal(calc.toplamTutar, 180 * 11.20);
      assert.ok(calc.hataMesaji?.includes("90 adedin katı olmalıdır"));
      assert.equal(calc.uyariMesaji, "Miktar 180 adede yuvarlandı.");
    });

    it("4.3. High-volume micro-fraction precision: 500,000 capacitors at $0.0048 computes exact total", () => {
      const capacitorPkg = {
        ambalajId: 201,
        ad: "Reel",
        ambalajTipi: 1,
        mpq: 4000,
        moq: 4000,
        katlamaMiktari: 4000,
        stokMiktari: 1000000,
        gelecekStokMiktari: 0,
        gelecekStokTarihi: null,
        fiyatlar: [
          { minMiktar: 4000, maxMiktar: 19999, birimFiyat: 0.0085, paraBirimi: "USD" },
          { minMiktar: 20000, maxMiktar: null, birimFiyat: 0.0048, paraBirimi: "USD" },
        ],
      };

      const calc = hesaplaB2BFiyat(500000, capacitorPkg);
      assert.equal(calc.yuvarlanmisMiktar, 500000);
      assert.equal(calc.gecerliBirimFiyat, 0.0048);
      assert.equal(calc.toplamTutar, 2400);
    });
  });
});
