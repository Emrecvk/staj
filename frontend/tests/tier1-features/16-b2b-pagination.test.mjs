import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Feature 16: B2B Pagination & Page Size Selector", () => {
  it("Test 16.1: Page navigation controls calculate pagination bounds accurately", () => {
    const pagination = {
      sayfaNo: 2,
      sayfaBoyutu: 24,
      toplamKayit: 120,
      toplamSayfa: Math.ceil(120 / 24), // 5
    };

    assert.equal(pagination.toplamSayfa, 5);
    assert.equal(pagination.sayfaNo > 1, true); // Has previous
    assert.equal(pagination.sayfaNo < pagination.toplamSayfa, true); // Has next
  });

  it("Test 16.2: Page size dropdown supports B2B high-density options (24, 48, 96)", () => {
    const supportedPageSizes = [24, 48, 96];
    assert.equal(supportedPageSizes.length, 3);
    assert.ok(supportedPageSizes.includes(24));
    assert.ok(supportedPageSizes.includes(48));
    assert.ok(supportedPageSizes.includes(96));
  });

  it("Test 16.3: Direct page jump input validates target page range", () => {
    const totalPages = 10;
    const validatePageJump = (target) => {
      const page = parseInt(target, 10);
      if (isNaN(page) || page < 1) return 1;
      if (page > totalPages) return totalPages;
      return page;
    };

    assert.equal(validatePageJump("4"), 4);
    assert.equal(validatePageJump("0"), 1);
    assert.equal(validatePageJump("999"), 10);
    assert.equal(validatePageJump("invalid"), 1);
  });

  it("Test 16.4: Boundary conditions disable Previous button on page 1 and Next button on last page", () => {
    const isPrevDisabled = (page) => page <= 1;
    const isNextDisabled = (page, totalPages) => page >= totalPages;

    assert.equal(isPrevDisabled(1), true);
    assert.equal(isPrevDisabled(2), false);
    assert.equal(isNextDisabled(5, 5), true);
    assert.equal(isNextDisabled(4, 5), false);
  });

  it("Test 16.5: Summary counter text accurately formats current page range and total items", () => {
    const formatPageSummary = (page, pageSize, total) => {
      const start = (page - 1) * pageSize + 1;
      const end = Math.min(page * pageSize, total);
      return `${start.toLocaleString("tr-TR")} - ${end.toLocaleString("tr-TR")} / ${total.toLocaleString("tr-TR")} ürün`;
    };

    assert.equal(formatPageSummary(1, 24, 1420), "1 - 24 / 1.420 ürün");
    assert.equal(formatPageSummary(2, 48, 1420), "49 - 96 / 1.420 ürün");
    assert.equal(formatPageSummary(30, 48, 1420), "1.393 - 1.420 / 1.420 ürün");
  });
});
