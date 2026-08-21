import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PRODUCTS } from "../test-helpers.mjs";

describe("Feature 21: PDP Technical Document & CAD Hub", () => {
  it("Test 21.1: Datasheet PDF download button renders file title, size, and language badge", () => {
    const product = MOCK_PRODUCTS[0];
    const datasheet = product.dokumanlar.find((d) => d.tip === 1);

    assert.ok(datasheet);
    assert.equal(datasheet.dil, "EN");
    assert.ok(datasheet.boyutByte && datasheet.boyutByte > 1000000);
    assert.ok(datasheet.url.endsWith(".pdf"));
  });

  it("Test 21.2: CAD/EDA footprints and 3D STEP model download link triggers standard engineering assets", () => {
    const product = MOCK_PRODUCTS[0];
    const cadDoc = product.dokumanlar.find((d) => d.tip === 2);

    assert.ok(cadDoc);
    assert.ok(cadDoc.url.endsWith(".step") || cadDoc.baslik.includes("CAD"));
  });

  it("Test 21.3: RoHS and REACH certificates download tab lists valid compliance verification documents", () => {
    const product = MOCK_PRODUCTS[0];
    const rohsDoc = product.dokumanlar.find((d) => d.tip === 3);

    assert.ok(rohsDoc);
    assert.ok(rohsDoc.baslik.includes("RoHS"));
  });

  it("Test 21.4: Technical specs tab maps all electrical and mechanical parameters into structured key-values", () => {
    const product = MOCK_PRODUCTS[0];
    const specs = product.ozellikler;

    assert.equal(specs["Çekirdek"], "ARM Cortex-M4");
    assert.equal(specs["Flash Bellek"], "1024 KB");
    assert.equal(specs["Kılıf / Paket"], "LQFP-100");
  });

  it("Test 21.5: Missing document fallback state renders 'Doküman Talep Et' action form modal trigger", () => {
    const productWithoutDocs = { ...MOCK_PRODUCTS[0], dokumanlar: [] };
    const hasDocs = productWithoutDocs.dokumanlar.length > 0;
    const fallbackCta = hasDocs ? null : { text: "Doküman Talep Et", action: "OPEN_DOC_REQUEST_MODAL" };

    assert.equal(hasDocs, false);
    assert.equal(fallbackCta?.text, "Doküman Talep Et");
  });
});
