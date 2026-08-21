import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  createComparisonStore,
  generateComparisonMatrix,
  hesaplaB2BFiyat,
  kademeSec,
  parseCsvBom,
  paraBicimle,
} from "../test-helpers.mjs";

describe("Tier 3: Cross-Feature Interactions & End-to-End User Journeys", () => {
  it("Journey 1: Mega Menu -> Category Filter -> Table View -> Compare Dock -> Diff Matrix -> Cart -> RFQ Conversion", () => {
    // Step 1: User navigates Mega Menu to Microcontrollers category
    const mcuCategory = MOCK_CATEGORIES[0].altKategoriler[0].altKategoriler[0];
    assert.equal(mcuCategory.ad, "Mikrokontrolcüler (ARM / RISC-V)");
    const catalogUrl = `/urunler?kategoriId=${mcuCategory.id}`;

    // Step 2: User switches view mode to High-Density Engineering Table
    const params = new URLSearchParams(catalogUrl.split("?")[1]);
    params.set("gorunum", "tablo");
    assert.equal(params.get("gorunum"), "tablo");

    // Step 3: User filters for LQFP-100 package
    params.append("kilif", "LQFP-100");
    const matchedProducts = MOCK_PRODUCTS.filter(
      (p) => p.kategoriId === 1001 && p.ozellikler["Kılıf / Paket"] === "LQFP-100"
    );
    assert.equal(matchedProducts.length, 2); // STM32F407 and GD32F407

    // Step 4: User selects both products for comparison via floating dock
    const comparisonStore = createComparisonStore();
    comparisonStore.addItem(matchedProducts[0]);
    comparisonStore.addItem(matchedProducts[1]);
    assert.equal(comparisonStore.getItemCount(), 2);

    // Step 5: User navigates to /karsilastirma and analyzes spec differences
    const diffMatrix = generateComparisonMatrix(comparisonStore.getItems());
    const voltageDiff = diffMatrix.find((r) => r.specKey === "Çalışma Gerilimi");
    assert.ok(voltageDiff);
    assert.equal(voltageDiff.isDifferent, true);

    // Step 6: User selects GD32F407 due to cost advantage ($6.40 vs $12.50) and adds 900 units to cart
    const selectedProduct = matchedProducts[1];
    const packaging = selectedProduct.ambalajlarVeFiyatlar[0];
    const priceCalculation = hesaplaB2BFiyat(900, packaging);
    assert.equal(priceCalculation.yuvarlanmisMiktar, 900);
    assert.equal(priceCalculation.gecerliBirimFiyat, 4.90);
    assert.equal(priceCalculation.toplamTutar, 900 * 4.90); // 4410.00

    // Step 7: In Cart, user converts order into formal RFQ request with target price $4.50
    const rfqPayload = {
      kalemler: [
        {
          ambalajId: packaging.ambalajId,
          mpn: selectedProduct.ureticiUrunKodu,
          miktar: priceCalculation.yuvarlanmisMiktar,
          listeFiyati: priceCalculation.gecerliBirimFiyat,
          hedefBirimFiyat: 4.50,
          talepTerminTarihi: "2026-12-01",
        },
      ],
      musteriNotu: "Yıllık 10.000 adetlik seri üretim projesi.",
    };

    assert.equal(rfqPayload.kalemler.length, 1);
    assert.equal(rfqPayload.kalemler[0].mpn, "GD32F407VGT6");
    assert.equal(rfqPayload.kalemler[0].hedefBirimFiyat, 4.50);
  });

  it("Journey 2: URL Facet Filtering -> PDP Navigation -> Packaging Change -> Dynamic Tier Update -> Mobile Action", () => {
    // Step 1: User arrives via bookmarked URL with mounting and voltage filters
    const url = new URL("https://cevik.com/urunler?kategoriId=1001&montajTipi=SMD&siralama=stok");
    assert.equal(url.searchParams.get("montajTipi"), "SMD");
    assert.equal(url.searchParams.get("siralama"), "stok");

    // Step 2: User clicks STM32F407 PDP link
    const product = MOCK_PRODUCTS[0];
    assert.equal(product.id, 101);

    // Step 3: User switches from default Tray (90 MOQ) to Tape & Reel (1000 MOQ)
    const tapeReelOption = product.ambalajlarVeFiyatlar.find((a) => a.ad.includes("Makara"));
    assert.ok(tapeReelOption);
    assert.equal(tapeReelOption.moq, 1000);

    // Step 4: User enters 3000 units -> active tier updates to $6.90 bracket
    const tierCalc = hesaplaB2BFiyat(3000, tapeReelOption);
    assert.equal(tierCalc.gecerliBirimFiyat, 6.90);
    assert.equal(tierCalc.toplamTutar, 3000 * 6.90); // 20,700.00

    // Step 5: Mobile action bar reflects updated unit price and total
    const mobileActionState = {
      mpn: product.ureticiUrunKodu,
      unitPrice: tierCalc.gecerliBirimFiyat,
      total: tierCalc.toplamTutar,
      currency: "USD",
    };

    assert.equal(mobileActionState.mpn, "STM32F407VGT6");
    assert.equal(mobileActionState.unitPrice, 6.90);
    assert.equal(mobileActionState.total, 20700);
  });

  it("Journey 3: Quick Paste BOM -> Auto Packaging Resolution -> MOQ Step Alignment -> Bulk Cart Calculation", () => {
    // Step 1: User pastes 3 raw lines in Hero BOM quick widget
    const rawPaste = `
      STM32F407VGT6, 50
      LM358DR, 1000
      GRM188R71C104KA01D, 2500
    `;

    const parsedLines = parseCsvBom(rawPaste);
    assert.equal(parsedLines.length, 3);

    // Step 2: Auto-resolve packaging and align with MOQ/Katlama rules
    const resolvedCartLines = parsedLines.map((line) => {
      const prod = MOCK_PRODUCTS.find((p) => p.ureticiUrunKodu === line.mpn);
      assert.ok(prod, `Product ${line.mpn} must exist`);
      const defaultPkg = prod.ambalajlarVeFiyatlar[0];
      const calc = hesaplaB2BFiyat(line.miktar, defaultPkg);
      return {
        mpn: line.mpn,
        requestedQty: line.miktar,
        effectiveQty: calc.yuvarlanmisMiktar,
        unitPrice: calc.gecerliBirimFiyat,
        lineTotal: calc.toplamTutar,
        wasRounded: calc.yuvarlanmisMiktar !== line.miktar,
      };
    });

    // Verify STM32: requested 50, rounded up to MOQ 90
    assert.equal(resolvedCartLines[0].mpn, "STM32F407VGT6");
    assert.equal(resolvedCartLines[0].effectiveQty, 90);
    assert.equal(resolvedCartLines[0].wasRounded, true);

    // Verify LM358: requested 1000, rounded up to Reel MOQ 2500
    assert.equal(resolvedCartLines[1].mpn, "LM358DR");
    assert.equal(resolvedCartLines[1].effectiveQty, 2500);
    assert.equal(resolvedCartLines[1].wasRounded, true);

    // Verify Capacitor: requested 2500, rounded up to Reel MOQ 4000
    assert.equal(resolvedCartLines[2].mpn, "GRM188R71C104KA01D");
    assert.equal(resolvedCartLines[2].effectiveQty, 4000);
    assert.equal(resolvedCartLines[2].wasRounded, true);

    // Step 3: Compute cart grand totals
    const grandSubtotal = resolvedCartLines.reduce((sum, line) => sum + line.lineTotal, 0);
    assert.ok(grandSubtotal > 1000);
  });
});
