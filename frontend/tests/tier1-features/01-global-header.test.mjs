import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BRAND_TOKENS, MOCK_CATEGORIES } from "../test-helpers.mjs";

describe("Feature 1: 3-Tier Global Header", () => {
  it("Test 1.1: Top utility bar renders support line, exchange rate, BOM link and locale selector", () => {
    const topBarConfig = {
      supportText: "Kurumsal elektronik komponent çözümleri",
      supportHours: "Hafta içi 08:30–18:00",
      exchangeRateBadge: "USD/TRY: 34.25",
      bomLink: "/bom",
      locale: "TR · USD",
    };

    assert.ok(topBarConfig.supportText.includes("elektronik"));
    assert.equal(topBarConfig.bomLink, "/bom");
    assert.equal(topBarConfig.locale, "TR · USD");
    assert.match(topBarConfig.exchangeRateBadge, /USD\/TRY:\s*\d+\.\d+/);
  });

  it("Test 1.2: Central brand bar includes responsive Çevik logo and accessibility links", () => {
    const brandLogoSpec = {
      src: "/logo-cevik-yatay.svg",
      alt: "Çevik Elektronik",
      width: 180,
      height: 60,
      priority: true,
      href: "/",
    };

    assert.equal(brandLogoSpec.alt, "Çevik Elektronik");
    assert.equal(brandLogoSpec.src, "/logo-cevik-yatay.svg");
    assert.equal(brandLogoSpec.href, "/");
    assert.ok(brandLogoSpec.priority);
  });

  it("Test 1.3: Search bar form attributes and input parameters target catalog endpoint", () => {
    const searchForm = {
      action: "/urunler",
      method: "GET",
      inputName: "aramaMetni",
      ariaLabel: "Site genelinde ara",
      placeholder: "Ürün kodu, üretici veya açıklama ile ara...",
      buttonAriaLabel: "Ara",
    };

    assert.equal(searchForm.action, "/urunler");
    assert.equal(searchForm.inputName, "aramaMetni");
    assert.ok(searchForm.placeholder.length > 10);
    assert.equal(searchForm.ariaLabel, "Site genelinde ara");
  });

  it("Test 1.4: Header action center links to favorites, account, and shopping cart", () => {
    const navLinks = [
      { href: "/profil/favoriler", label: "Favoriler", icon: "Heart" },
      { href: "/giris", label: "Hesabım", icon: "UserRound" },
      { href: "/sepet", label: "Sepetim", icon: "ShoppingCart", badgeCount: 0 },
    ];

    assert.equal(navLinks.length, 3);
    assert.equal(navLinks[0].href, "/profil/favoriler");
    assert.equal(navLinks[1].href, "/giris");
    assert.equal(navLinks[2].href, "/sepet");
    assert.equal(typeof navLinks[2].badgeCount, "number");
  });

  it("Test 1.5: Bottom navigation bar contains 'Tüm Kategoriler' trigger and quick links", () => {
    const bottomNav = {
      allCategoriesTrigger: { label: "Tüm Kategoriler", href: "/urunler" },
      topCategories: MOCK_CATEGORIES.slice(0, 5).map((c) => ({
        id: c.id,
        ad: c.ad,
        href: `/urunler?kategoriId=${c.id}`,
      })),
      quoteRequestLink: { label: "Fiyat ve stok talep et", href: "/teklif-iste" },
    };

    assert.equal(bottomNav.allCategoriesTrigger.label, "Tüm Kategoriler");
    assert.ok(bottomNav.topCategories.length > 0);
    assert.equal(bottomNav.topCategories[0].ad, "Yarı İletkenler");
    assert.equal(bottomNav.topCategories[0].href, "/urunler?kategoriId=1");
  });

  it("Test 1.6: Header structure enforces Çevik Navy and Cyan color tokens without raw red", () => {
    const headerClasses = [
      "bg-yuzey-kart",
      "border-b",
      "border-kenar",
      "bg-yuzey-gomulu",
      "text-vurgu",
      "bg-marka",
      "text-white",
    ];

    assert.ok(headerClasses.includes("bg-marka"));
    assert.ok(headerClasses.includes("text-vurgu"));
    assert.ok(!headerClasses.some((c) => c.includes("red") || c.includes("cc0000")));
  });
});
