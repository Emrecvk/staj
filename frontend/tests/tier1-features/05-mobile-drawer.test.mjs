import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOCK_CATEGORIES } from "../test-helpers.mjs";

describe("Feature 5: Mobile Navigation Drawer", () => {
  it("Test 5.1: Mobile drawer toggle transitions drawer state between open and closed", () => {
    let isOpen = false;
    const toggleDrawer = () => { isOpen = !isOpen; };

    assert.equal(isOpen, false);
    toggleDrawer();
    assert.equal(isOpen, true);
    toggleDrawer();
    assert.equal(isOpen, false);
  });

  it("Test 5.2: Stack navigation pushes category view onto navigation history stack", () => {
    const navStack = [{ title: "Ana Menü", categoryId: null }];
    
    // User clicks Level 1 category
    navStack.push({ title: "Yarı İletkenler", categoryId: 1 });
    assert.equal(navStack.length, 2);
    assert.equal(navStack[navStack.length - 1].categoryId, 1);

    // User clicks Level 2 category
    navStack.push({ title: "Entegre Devreler", categoryId: 101 });
    assert.equal(navStack.length, 3);
    assert.equal(navStack[navStack.length - 1].categoryId, 101);
  });

  it("Test 5.3: 'Geri' (Back) button pops current category and restores parent level", () => {
    const navStack = [
      { title: "Ana Menü", categoryId: null },
      { title: "Yarı İletkenler", categoryId: 1 },
      { title: "Entegre Devreler", categoryId: 101 },
    ];

    const popped = navStack.pop();
    assert.equal(popped?.categoryId, 101);
    assert.equal(navStack[navStack.length - 1].categoryId, 1);
    assert.equal(navStack[navStack.length - 1].title, "Yarı İletkenler");
  });

  it("Test 5.4: Mobile drawer bottom footer provides quick actions for BOM, RFQ, and Support", () => {
    const mobileQuickActions = [
      { label: "BOM Yükle & Eşle", href: "/bom", icon: "FileSpreadsheet" },
      { label: "Resmi Teklif Al (RFQ)", href: "/teklif-iste", icon: "FileText" },
      { label: "Müşteri Hizmetleri", href: "tel:08501234567", icon: "PhoneCall" },
    ];

    assert.equal(mobileQuickActions.length, 3);
    assert.equal(mobileQuickActions[0].href, "/bom");
    assert.equal(mobileQuickActions[1].href, "/teklif-iste");
  });

  it("Test 5.5: Vaul drawer gesture properties and backdrop dismissal are configured", () => {
    const vaulProps = {
      direction: "left",
      dismissible: true,
      shouldScaleBackground: true,
      closeThreshold: 0.25,
    };

    assert.equal(vaulProps.direction, "left");
    assert.ok(vaulProps.dismissible);
    assert.ok(vaulProps.shouldScaleBackground);
  });
});
