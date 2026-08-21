import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

// ============================================================================
// SIMULATED ENVIRONMENT FOR ADVERSARIAL TESTING
// ============================================================================

class MockLocalStorage {
  constructor() {
    this.store = new Map();
    this.quotaExceeded = false;
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    if (this.quotaExceeded) {
      const err = new Error("QuotaExceededError: DOM Exception 22");
      err.name = "QuotaExceededError";
      throw err;
    }
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

class MockEventTarget {
  constructor() {
    this.listeners = new Map();
  }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(listener);
    }
  }
  dispatchEvent(event) {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (e) {
          // ignore
        }
      });
    }
    return true;
  }
}

class MockCustomEvent {
  constructor(type, eventInitDict = {}) {
    this.type = type;
    this.detail = eventInitDict.detail ?? null;
  }
}

class MockStorageEvent {
  constructor(type, eventInitDict = {}) {
    this.type = type;
    this.key = eventInitDict.key ?? null;
    this.newValue = eventInitDict.newValue ?? null;
    this.oldValue = eventInitDict.oldValue ?? null;
  }
}

// ============================================================================
// 1. COMPARISON STORE ADVERSARIAL ENGINE
// (Implements exact logic of src/lib/stores/comparison-store.ts)
// ============================================================================

function createComparisonStoreInstance(rawStorage = null) {
  const mockStorage = new MockLocalStorage();
  if (rawStorage !== null) {
    mockStorage.setItem("cevik_karsilastirma_listesi", rawStorage);
  }
  const mockWindow = new MockEventTarget();
  mockWindow.localStorage = mockStorage;
  mockWindow.CustomEvent = MockCustomEvent;
  mockWindow.StorageEvent = MockStorageEvent;

  const STORAGE_KEY = "cevik_karsilastirma_listesi";
  const MAX_COMPARISON_ITEMS = 4;
  const EVENT_NAME = "cevik_comparison_state_change";

  let cachedItems = [];
  let isInitialized = false;

  // Implementation as in src/lib/stores/comparison-store.ts line 32-44
  function getStoredItems() {
    if (typeof mockWindow === "undefined") return [];
    if (!isInitialized) {
      try {
        const raw = mockStorage.getItem(STORAGE_KEY);
        cachedItems = raw ? JSON.parse(raw) : [];
      } catch {
        cachedItems = [];
      }
      isInitialized = true;
    }
    return cachedItems;
  }

  function setStoredItems(items) {
    cachedItems = items;
    if (typeof mockWindow !== "undefined") {
      try {
        mockStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        mockWindow.dispatchEvent(new MockCustomEvent(EVENT_NAME, { detail: items }));
      } catch {
        // ignore storage errors
      }
    }
  }

  const comparisonStore = {
    getItems() {
      return getStoredItems();
    },

    addItem(item) {
      const current = getStoredItems();
      if (Array.isArray(current) && current.some((x) => x.id === item.id)) {
        return true;
      }
      if (Array.isArray(current) && current.length >= MAX_COMPARISON_ITEMS) {
        return false;
      }
      const updated = Array.isArray(current) ? [...current, item] : [item];
      setStoredItems(updated);
      return true;
    },

    removeItem(id) {
      const current = getStoredItems();
      const updated = Array.isArray(current) ? current.filter((x) => x.id !== id) : [];
      setStoredItems(updated);
    },

    clear() {
      setStoredItems([]);
    },

    isInComparison(id) {
      const current = getStoredItems();
      return Array.isArray(current) ? current.some((x) => x.id === id) : false;
    },
  };

  function subscribe(callback) {
    if (typeof mockWindow === "undefined") return () => {};

    const handleCustomEvent = () => callback();
    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEY) {
        isInitialized = false;
        callback();
      }
    };

    mockWindow.addEventListener(EVENT_NAME, handleCustomEvent);
    mockWindow.addEventListener("storage", handleStorageEvent);

    return () => {
      mockWindow.removeEventListener(EVENT_NAME, handleCustomEvent);
      mockWindow.removeEventListener("storage", handleStorageEvent);
    };
  }

  const emptyItems = [];

  return {
    mockStorage,
    mockWindow,
    comparisonStore,
    subscribe,
    getStoredItems,
    setStoredItems,
    getServerSnapshot: () => emptyItems,
    resetCache: () => {
      cachedItems = [];
      isInitialized = false;
    },
    STORAGE_KEY,
    EVENT_NAME,
    MAX_COMPARISON_ITEMS,
  };
}

// ============================================================================
// 2. SPEC DIFF ENGINE
// (Implements exact logic of src/components/karsilastirma/diff-matrix.tsx)
// ============================================================================

const ELEKTRIKSEL_KEYWORDS = [
  "çekirdek", "frekans", "flash", "ram", "gerilim", "voltaj", "kapasitans",
  "tolerans", "katsayı", "güç", "akım", "direnç", "frekansı", "bant", "ofset", "kanal"
];

const FIZIKSEL_KEYWORDS = [
  "kılıf", "paket", "pin", "g/ç", "montaj", "boyut", "ağırlık", "bacak", "gövde"
];

const CEVRESEL_KEYWORDS = [
  "sıcaklık", "rohs", "reach", "durumu", "nem", "standart", "sertifika"
];

function kategoriBelirle(anahtar) {
  const kucuk = anahtar.toLowerCase();
  if (ELEKTRIKSEL_KEYWORDS.some((kw) => kucuk.includes(kw))) return "Elektriksel";
  if (FIZIKSEL_KEYWORDS.some((kw) => kucuk.includes(kw))) return "Fiziksel";
  if (CEVRESEL_KEYWORDS.some((kw) => kucuk.includes(kw))) return "Çevresel";
  return "Diğer";
}

function calculateSpecDiff(products) {
  const allKeys = new Set();
  products.forEach((p) => {
    Object.keys(p.ozellikler || {}).forEach((k) => allKeys.add(k));
  });

  const groups = {
    Elektriksel: [],
    Fiziksel: [],
    Çevresel: [],
    Diğer: [],
  };

  let diffs = 0;
  let total = 0;

  allKeys.forEach((key) => {
    total++;
    const values = {};
    const distinctVals = new Set();

    products.forEach((p) => {
      const val = p.ozellikler?.[key] || "-";
      values[p.id] = val;
      distinctVals.add(val);
    });

    const isDifferent = distinctVals.size > 1;
    if (isDifferent) diffs++;

    const groupName = kategoriBelirle(key);
    groups[groupName].push({
      key,
      isDifferent,
      values,
    });
  });

  return {
    groupedSpecs: groups,
    diffCount: diffs,
    totalSpecsCount: total,
  };
}

function calculateOrderedProducts(products, sabitlenenId) {
  if (!sabitlenenId) return products;
  const pinned = products.find((p) => p.id === sabitlenenId);
  if (!pinned) return products;
  return [pinned, ...products.filter((p) => p.id !== sabitlenenId)];
}

function formatComparisonCsv(products) {
  if (products.length === 0) return "";

  const headers = ["Özellik", ...products.map((p) => p.ureticiUrunKodu)].join(";");

  const basicRows = [
    ["Üretici", ...products.map((p) => p.ureticiAd || "-")].join(";"),
    ["Başlangıç Fiyatı", ...products.map((p) => `${p.baslangicFiyati} ${p.paraBirimi}`)].join(";"),
    ["Toplam Stok", ...products.map((p) => `${p.toplamStok} Adet`)].join(";"),
  ];

  const allKeys = new Set();
  products.forEach((p) => {
    Object.keys(p.ozellikler || {}).forEach((k) => allKeys.add(k));
  });

  const specRows = Array.from(allKeys).map((key) => {
    const vals = products.map((p) => p.ozellikler?.[key] || "-");
    return [key, ...vals].join(";");
  });

  return "\uFEFF" + [headers, ...basicRows, ...specRows].join("\n");
}

// ============================================================================
// 3. HEADER STATE ADVERSARIAL ENGINE
// (Implements exact logic of src/lib/stores/header-state.ts)
// ============================================================================

function createAdversarialHeaderEnvironment() {
  const mockStorage = new MockLocalStorage();
  const mockWindow = new MockEventTarget();
  let mockCookie = "";

  const CART_EVENT = "cevik_cart_updated";
  const RFQ_EVENT = "cevik_rfq_updated";
  const FAVORITES_EVENT = "cevik_favorites_updated";

  let cachedUserStr = "";
  let cachedUser = null;

  function getUserSnapshot() {
    try {
      const match = mockCookie.match(/(?:^|;\s*)user=([^;]*)/);
      const raw = match ? decodeURIComponent(match[1]) : "";
      if (raw !== cachedUserStr) {
        cachedUserStr = raw;
        cachedUser = raw ? JSON.parse(raw) : null;
      }
    } catch {
      cachedUser = null;
    }
    return cachedUser;
  }

  function getRfqSnapshot() {
    try {
      const rfqRaw = mockStorage.getItem("cevik_rfq_items");
      return rfqRaw ? (JSON.parse(rfqRaw)?.length || 0) : 0;
    } catch {
      return 0;
    }
  }

  function getFavSnapshot() {
    try {
      const favRaw = mockStorage.getItem("cevik_favori_sayisi");
      return favRaw ? parseInt(favRaw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  function subscribeRfq(callback) {
    mockWindow.addEventListener(RFQ_EVENT, callback);
    mockWindow.addEventListener("storage", callback);
    return () => {
      mockWindow.removeEventListener(RFQ_EVENT, callback);
      mockWindow.removeEventListener("storage", callback);
    };
  }

  function subscribeFav(callback) {
    mockWindow.addEventListener(FAVORITES_EVENT, callback);
    mockWindow.addEventListener("storage", callback);
    return () => {
      mockWindow.removeEventListener(FAVORITES_EVENT, callback);
      mockWindow.removeEventListener("storage", callback);
    };
  }

  return {
    mockStorage,
    mockWindow,
    setCookie: (c) => { mockCookie = c; },
    getUserSnapshot,
    getRfqSnapshot,
    getFavSnapshot,
    subscribeRfq,
    subscribeFav,
    notifyRfq: () => mockWindow.dispatchEvent(new MockCustomEvent(RFQ_EVENT)),
    notifyFav: () => mockWindow.dispatchEvent(new MockCustomEvent(FAVORITES_EVENT)),
  };
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe("Adversarial Challenger 2: State & Store Empirical Tests", () => {
  describe("1. Comparison Store Deep Invariant Testing", () => {
    it("CS-01: Hard Limit of 4 Items Enforced Under Sequential and Rapid Insertion", () => {
      const env = createComparisonStoreInstance();

      // Add 4 valid products
      for (let i = 1; i <= 4; i++) {
        const res = env.comparisonStore.addItem({
          id: i,
          ureticiUrunKodu: `PART-${i}`,
          ureticiAd: "Vendor",
          anaGorselUrl: null,
          baslangicFiyati: 10 * i,
          paraBirimi: "USD",
          toplamStok: 100,
          kategoriId: 1,
        });
        assert.equal(res, true, `Item ${i} should be added successfully`);
      }

      assert.equal(env.comparisonStore.getItems().length, 4);

      // Attempt 5th, 6th, 7th additions -> Must return false and not alter list
      for (let i = 5; i <= 7; i++) {
        const res = env.comparisonStore.addItem({
          id: i,
          ureticiUrunKodu: `PART-${i}`,
          ureticiAd: "Vendor",
          anaGorselUrl: null,
          baslangicFiyati: 100,
          paraBirimi: "USD",
          toplamStok: 50,
          kategoriId: 1,
        });
        assert.equal(res, false, `Item ${i} must be rejected when limit of 4 is reached`);
      }

      assert.equal(env.comparisonStore.getItems().length, 4);
      assert.deepEqual(
        env.comparisonStore.getItems().map((x) => x.id),
        [1, 2, 3, 4]
      );
    });

    it("CS-02: Deduplication: Duplicate ID Insertions are Idempotent and Count-Neutral", () => {
      const env = createComparisonStoreInstance();

      const item = {
        id: 101,
        ureticiUrunKodu: "STM32F407VGT6",
        ureticiAd: "STMicroelectronics",
        anaGorselUrl: null,
        baslangicFiyati: 12.5,
        paraBirimi: "USD",
        toplamStok: 1000,
        kategoriId: 1001,
      };

      // Add initially
      assert.equal(env.comparisonStore.addItem(item), true);
      assert.equal(env.comparisonStore.getItems().length, 1);
      assert.equal(env.comparisonStore.isInComparison(101), true);

      // Re-add duplicate
      const duplicateRes = env.comparisonStore.addItem(item);
      assert.equal(duplicateRes, true, "Duplicate addition should return true (already present)");
      assert.equal(env.comparisonStore.getItems().length, 1);

      // Re-add duplicate with altered properties but same ID
      const modifiedItem = { ...item, baslangicFiyati: 99.99 };
      assert.equal(env.comparisonStore.addItem(modifiedItem), true);
      assert.equal(env.comparisonStore.getItems().length, 1);
    });

    it("CS-03: Item Removal and Clear All Operations Preserve State Invariants", () => {
      const env = createComparisonStoreInstance();

      env.comparisonStore.addItem({ id: 10, ureticiUrunKodu: "P10", ureticiAd: "V", anaGorselUrl: null, baslangicFiyati: 1, paraBirimi: "USD", toplamStok: 1, kategoriId: 1 });
      env.comparisonStore.addItem({ id: 20, ureticiUrunKodu: "P20", ureticiAd: "V", anaGorselUrl: null, baslangicFiyati: 2, paraBirimi: "USD", toplamStok: 2, kategoriId: 1 });
      env.comparisonStore.addItem({ id: 30, ureticiUrunKodu: "P30", ureticiAd: "V", anaGorselUrl: null, baslangicFiyati: 3, paraBirimi: "USD", toplamStok: 3, kategoriId: 1 });

      assert.equal(env.comparisonStore.getItems().length, 3);

      // Remove middle item
      env.comparisonStore.removeItem(20);
      assert.equal(env.comparisonStore.getItems().length, 2);
      assert.equal(env.comparisonStore.isInComparison(20), false);
      assert.equal(env.comparisonStore.isInComparison(10), true);
      assert.equal(env.comparisonStore.isInComparison(30), true);

      // Remove non-existent item (should not crash or affect list)
      env.comparisonStore.removeItem(999);
      assert.equal(env.comparisonStore.getItems().length, 2);

      // Clear all
      env.comparisonStore.clear();
      assert.equal(env.comparisonStore.getItems().length, 0);
      assert.equal(env.comparisonStore.isInComparison(10), false);
    });

    it("CS-04: Cross-Component Custom Event Dispatch and Subscription Lifecycle", () => {
      const env = createComparisonStoreInstance();
      let notificationCount = 0;

      const unsubscribe = env.subscribe(() => {
        notificationCount++;
      });

      // Add item -> should notify
      env.comparisonStore.addItem({ id: 1, ureticiUrunKodu: "P1", ureticiAd: "V", anaGorselUrl: null, baslangicFiyati: 1, paraBirimi: "USD", toplamStok: 1, kategoriId: 1 });
      assert.equal(notificationCount, 1);

      // Remove item -> should notify
      env.comparisonStore.removeItem(1);
      assert.equal(notificationCount, 2);

      // Clear -> should notify
      env.comparisonStore.clear();
      assert.equal(notificationCount, 3);

      // Unsubscribe -> no further notifications
      unsubscribe();
      env.comparisonStore.addItem({ id: 2, ureticiUrunKodu: "P2", ureticiAd: "V", anaGorselUrl: null, baslangicFiyati: 2, paraBirimi: "USD", toplamStok: 2, kategoriId: 1 });
      assert.equal(notificationCount, 3, "Unsubscribed listener should not receive events");
    });

    it("CS-05: Multi-Tab StorageEvent Synchronization and Cache Invalidation", () => {
      const env = createComparisonStoreInstance();
      let subscriberNotified = false;

      env.subscribe(() => {
        subscriberNotified = true;
      });

      // Simulate external tab updating localStorage directly
      const externalItems = [{ id: 50, ureticiUrunKodu: "EXT-50", ureticiAd: "V", anaGorselUrl: null, baslangicFiyati: 5, paraBirimi: "USD", toplamStok: 50, kategoriId: 1 }];
      env.mockStorage.setItem(env.STORAGE_KEY, JSON.stringify(externalItems));

      // Dispatch StorageEvent
      env.mockWindow.dispatchEvent(new MockStorageEvent("storage", { key: env.STORAGE_KEY }));

      assert.equal(subscriberNotified, true, "StorageEvent should notify subscriber");

      // Next read must yield external items
      const current = env.comparisonStore.getItems();
      assert.equal(current.length, 1);
      assert.equal(current[0].id, 50);
    });

    it("CS-06: useSyncExternalStore Contract: Referential Stability & SSR Snapshot Safety", () => {
      const env = createComparisonStoreInstance();

      // SSR snapshot test
      const ssrSnapshot1 = env.getServerSnapshot();
      const ssrSnapshot2 = env.getServerSnapshot();
      assert.equal(ssrSnapshot1, ssrSnapshot2, "SSR snapshot must be referentially identical");
      assert.equal(Array.isArray(ssrSnapshot1), true);
      assert.equal(ssrSnapshot1.length, 0);

      // Client snapshot referential stability (no mutation between calls)
      env.comparisonStore.addItem({ id: 1, ureticiUrunKodu: "P1", ureticiAd: "V", anaGorselUrl: null, baslangicFiyati: 1, paraBirimi: "USD", toplamStok: 1, kategoriId: 1 });
      const snap1 = env.comparisonStore.getItems();
      const snap2 = env.comparisonStore.getItems();
      assert.equal(snap1, snap2, "Client snapshot must return identical reference when state is unchanged to prevent React 19 infinite re-render loops");
    });

    it("CS-07: Resilience Against Corrupted Storage & QuotaExceeded Errors", () => {
      const env = createComparisonStoreInstance();

      // Case A: Corrupted JSON in localStorage
      env.mockStorage.setItem(env.STORAGE_KEY, "INVALID_JSON_CORRUPTED{[[");
      env.resetCache();
      const itemsCorrupt = env.comparisonStore.getItems();
      assert.deepEqual(itemsCorrupt, [], "Corrupted JSON in localStorage must cleanly fallback to empty array without crashing");

      // Case B: QuotaExceededError when setting item
      env.mockStorage.quotaExceeded = true;
      assert.doesNotThrow(() => {
        env.comparisonStore.addItem({ id: 99, ureticiUrunKodu: "P99", ureticiAd: "V", anaGorselUrl: null, baslangicFiyati: 1, paraBirimi: "USD", toplamStok: 1, kategoriId: 1 });
      }, "Storage quota exceeded must be swallowed without breaking UI execution");
    });
  });

  describe("2. Spec Difference Engine (diff-matrix.tsx) Adversarial Testing", () => {
    it("SD-01: Correctly Identifies Identical vs Differing Specifications Across 2 Products", () => {
      const products = [
        {
          id: 1,
          ureticiUrunKodu: "MCU-A",
          ozellikler: {
            "Çekirdek": "ARM Cortex-M4",
            "Saat Frekansı": "168 MHz",
            "Çalışma Gerilimi": "1.8V ~ 3.6V",
          },
        },
        {
          id: 2,
          ureticiUrunKodu: "MCU-B",
          ozellikler: {
            "Çekirdek": "ARM Cortex-M4", // Identical
            "Saat Frekansı": "180 MHz", // Different
            "Çalışma Gerilimi": "1.8V ~ 3.6V", // Identical
          },
        },
      ];

      const { groupedSpecs, diffCount, totalSpecsCount } = calculateSpecDiff(products);

      assert.equal(totalSpecsCount, 3);
      assert.equal(diffCount, 1);

      const elekt = groupedSpecs["Elektriksel"];
      const coreSpec = elekt.find((s) => s.key === "Çekirdek");
      const freqSpec = elekt.find((s) => s.key === "Saat Frekansı");
      const voltSpec = elekt.find((s) => s.key === "Çalışma Gerilimi");

      assert.equal(coreSpec?.isDifferent, false);
      assert.equal(voltSpec?.isDifferent, false);
      assert.equal(freqSpec?.isDifferent, true);
    });

    it("SD-02: Missing Keys Across Products are Correctly Flagged as Differences with '-' Placeholder", () => {
      const products = [
        {
          id: 1,
          ureticiUrunKodu: "MCU-1",
          ozellikler: {
            "Çekirdek": "ARM Cortex-M4",
            "LCD Desteği": "Var", // Only in MCU-1
          },
        },
        {
          id: 2,
          ureticiUrunKodu: "MCU-2",
          ozellikler: {
            "Çekirdek": "ARM Cortex-M4",
            // "LCD Desteği" is missing
          },
        },
      ];

      const { groupedSpecs } = calculateSpecDiff(products);

      const lcdSpec = [...groupedSpecs["Elektriksel"], ...groupedSpecs["Diğer"]].find((s) => s.key === "LCD Desteği");
      assert.ok(lcdSpec, "LCD Desteği must be in the spec list");
      assert.equal(lcdSpec.isDifferent, true, "Missing key in one product MUST be flagged as a difference");
      assert.equal(lcdSpec.values[1], "Var");
      assert.equal(lcdSpec.values[2], "-");
    });

    it("SD-03: Partial Missing Keys Across 3 and 4 Products Handle Fallbacks Correctly", () => {
      const products = [
        { id: 1, ureticiUrunKodu: "P1", ozellikler: { "Bluetooth": "v5.2", "WiFi": "802.11ax" } },
        { id: 2, ureticiUrunKodu: "P2", ozellikler: { "Bluetooth": "v5.2", "WiFi": "802.11ax" } },
        { id: 3, ureticiUrunKodu: "P3", ozellikler: { "Bluetooth": "v5.2" } }, // Missing WiFi
        { id: 4, ureticiUrunKodu: "P4", ozellikler: {} }, // Missing all
      ];

      const { groupedSpecs, totalSpecsCount } = calculateSpecDiff(products);

      assert.equal(totalSpecsCount, 2);

      const allSpecs = Object.values(groupedSpecs).flat();
      const bt = allSpecs.find((s) => s.key === "Bluetooth");
      const wifi = allSpecs.find((s) => s.key === "WiFi");

      // BT: P1=v5.2, P2=v5.2, P3=v5.2, P4='-' -> diff!
      assert.equal(bt?.isDifferent, true);
      assert.equal(bt?.values[1], "v5.2");
      assert.equal(bt?.values[2], "v5.2");
      assert.equal(bt?.values[3], "v5.2");
      assert.equal(bt?.values[4], "-");

      // WiFi: P1=802.11ax, P2=802.11ax, P3='-', P4='-' -> diff!
      assert.equal(wifi?.isDifferent, true);
    });

    it("SD-04: 'Sadece Farklılıkları Göster' Filter Correctly Eliminates Identical Specs", () => {
      const products = [
        { id: 1, ureticiUrunKodu: "P1", ozellikler: { "Kılıf / Paket": "LQFP-100", "RoHS Durumu": "Belgeli", "Saat Frekansı": "100 MHz" } },
        { id: 2, ureticiUrunKodu: "P2", ozellikler: { "Kılıf / Paket": "LQFP-100", "RoHS Durumu": "Belgeli", "Saat Frekansı": "200 MHz" } },
      ];

      const { groupedSpecs, diffCount } = calculateSpecDiff(products);
      assert.equal(diffCount, 1);

      // Simulate 'sadeceFarklar' filter
      const filteredGroups = {};
      let filteredTotal = 0;

      for (const [groupName, items] of Object.entries(groupedSpecs)) {
        filteredGroups[groupName] = items.filter((i) => i.isDifferent);
        filteredTotal += filteredGroups[groupName].length;
      }

      assert.equal(filteredTotal, 1);
      assert.equal(filteredGroups["Elektriksel"].length, 1);
      assert.equal(filteredGroups["Elektriksel"][0].key, "Saat Frekansı");
      assert.equal(filteredGroups["Fiziksel"].length, 0);
      assert.equal(filteredGroups["Çevresel"].length, 0);
    });

    it("SD-05: Parametric Categorization (kategoriBelirle) Accurately Maps Diverse B2B Parameter Names", () => {
      const electricalKeys = ["Çekirdek", "Saat Frekansı", "Flash Bellek", "RAM Kapasitesi", "Çalışma Gerilimi", "Kapasitans", "Tolerans", "Güç Tüketimi", "Kanal Sayısı", "Direnç Değeri"];
      const physicalKeys = ["Kılıf / Paket", "Pin Sayısı", "G/Ç Sayısı (I/O)", "Montaj Tipi", "Gövde Boyutu", "Bacak Aralığı"];
      const environmentalKeys = ["RoHS Durumu", "REACH Sertifikası", "Nem Seviyesi (MSL)", "Sıcaklık Aralığı"];
      const otherKeys = ["Protokol", "Üretici Serisi", "Uygulama Alanı"];

      electricalKeys.forEach((k) => assert.equal(kategoriBelirle(k), "Elektriksel", `Key "${k}" should be Elektriksel`));
      physicalKeys.forEach((k) => assert.equal(kategoriBelirle(k), "Fiziksel", `Key "${k}" should be Fiziksel`));
      environmentalKeys.forEach((k) => assert.equal(kategoriBelirle(k), "Çevresel", `Key "${k}" should be Çevresel`));
      otherKeys.forEach((k) => assert.equal(kategoriBelirle(k), "Diğer", `Key "${k}" should be Diğer`));
    });

    it("SD-06: Product Pinning (sabitlenenId) Reorders Columns Reliably", () => {
      const products = [
        { id: 101, ureticiUrunKodu: "P101" },
        { id: 102, ureticiUrunKodu: "P102" },
        { id: 103, ureticiUrunKodu: "P103" },
      ];

      // No pin
      assert.deepEqual(
        calculateOrderedProducts(products, null).map((p) => p.id),
        [101, 102, 103]
      );

      // Pin middle product (102) -> 102 must become index 0
      assert.deepEqual(
        calculateOrderedProducts(products, 102).map((p) => p.id),
        [102, 101, 103]
      );

      // Pin last product (103) -> 103 must become index 0
      assert.deepEqual(
        calculateOrderedProducts(products, 103).map((p) => p.id),
        [103, 101, 102]
      );

      // Pin non-existent product -> returns untouched
      assert.deepEqual(
        calculateOrderedProducts(products, 999).map((p) => p.id),
        [101, 102, 103]
      );
    });

    it("SD-07: CSV Export Generator Adheres to UTF-8 BOM, Semicolon Delimiters and Clean Formatting", () => {
      const products = [
        { id: 1, ureticiUrunKodu: "STM32F407", ureticiAd: "ST", baslangicFiyati: 12.5, paraBirimi: "USD", toplamStok: 5000, ozellikler: { "Çekirdek": "ARM", "Frekans": "168MHz" } },
        { id: 2, ureticiUrunKodu: "GD32F407", ureticiAd: "Giga", baslangicFiyati: 6.4, paraBirimi: "USD", toplamStok: 15000, ozellikler: { "Çekirdek": "ARM", "Frekans": "168MHz" } },
      ];

      const csv = formatComparisonCsv(products);

      // Starts with UTF-8 BOM
      assert.ok(csv.startsWith("\uFEFF"), "CSV must start with UTF-8 BOM for Excel compatibility");

      // Checks header row
      assert.ok(csv.includes("Özellik;STM32F407;GD32F407"));

      // Checks basic rows
      assert.ok(csv.includes("Üretici;ST;Giga"));
      assert.ok(csv.includes("Başlangıç Fiyatı;12.5 USD;6.4 USD"));
      assert.ok(csv.includes("Toplam Stok;5000 Adet;15000 Adet"));

      // Checks spec rows
      assert.ok(csv.includes("Çekirdek;ARM;ARM"));
      assert.ok(csv.includes("Frekans;168MHz;168MHz"));
    });
  });

  describe("3. Header State & Concurrent Hydration Safety", () => {
    it("HS-01: Header User Store Snapshot Referential Stability and Malformed Cookie Handling", () => {
      const env = createAdversarialHeaderEnvironment();

      // Initially no cookie -> null
      assert.equal(env.getUserSnapshot(), null);

      // Valid cookie
      const validUser = { ad: "Ahmet Çevik", firmaMi: true, firmaId: 42 };
      env.setCookie(`user=${encodeURIComponent(JSON.stringify(validUser))}`);

      const user1 = env.getUserSnapshot();
      const user2 = env.getUserSnapshot();

      assert.deepEqual(user1, validUser);
      assert.equal(user1, user2, "Consecutive snapshot calls MUST return exact same reference for useSyncExternalStore");

      // Corrupted cookie
      env.setCookie("user=CORRUPTED_JSON_COOKIE");
      const corruptedUser = env.getUserSnapshot();
      assert.equal(corruptedUser, null, "Malformed user cookie must safely return null without throwing");
    });

    it("HS-02: Header Counters (RFQ & Fav) Storage Synchronization and Custom Event Triggers", () => {
      const env = createAdversarialHeaderEnvironment();

      // RFQ counter initial
      assert.equal(env.getRfqSnapshot(), 0);
      assert.equal(env.getFavSnapshot(), 0);

      // Update RFQ storage
      env.mockStorage.setItem("cevik_rfq_items", JSON.stringify([{ id: 1 }, { id: 2 }, { id: 3 }]));
      assert.equal(env.getRfqSnapshot(), 3);

      // Update Favorites storage
      env.mockStorage.setItem("cevik_favori_sayisi", "12");
      assert.equal(env.getFavSnapshot(), 12);

      // Corrupted storage values
      env.mockStorage.setItem("cevik_rfq_items", "{not_an_array");
      assert.equal(env.getRfqSnapshot(), 0);

      env.mockStorage.setItem("cevik_favori_sayisi", "invalid_number");
      assert.equal(env.getFavSnapshot(), 0);
    });

    it("HS-03: Counter Subscription Event Listener Cleanup and Memory Leak Prevention", () => {
      const env = createAdversarialHeaderEnvironment();
      let rfqNotified = 0;
      let favNotified = 0;

      const unsubRfq = env.subscribeRfq(() => rfqNotified++);
      const unsubFav = env.subscribeFav(() => favNotified++);

      env.notifyRfq();
      env.notifyFav();

      assert.equal(rfqNotified, 1);
      assert.equal(favNotified, 1);

      unsubRfq();
      unsubFav();

      env.notifyRfq();
      env.notifyFav();

      assert.equal(rfqNotified, 1, "Unsubscribed RFQ listener must not fire");
      assert.equal(favNotified, 1, "Unsubscribed Fav listener must not fire");
    });
  });

  describe("4. Edge-Case Vulnerability Probes (Empirically Demonstrated Failure Modes)", () => {
    it("VULN-01: Turkish Morphology Bug in Spec Keyword Categorization", () => {
      // In Turkish, "Sıcaklık" (Operating Temperature) inflects to "Sıcaklığı" (e.g. "Çalışma Sıcaklığı")
      // CEVRESEL_KEYWORDS only has "sıcaklık", so "Çalışma Sıcaklığı" fails to match and defaults to "Diğer"!
      const specName = "Çalışma Sıcaklığı";
      const category = kategoriBelirle(specName);
      
      // We empirically verify that current implementation puts it in "Diğer" instead of "Çevresel"
      assert.equal(category, "Diğer", "Demonstrates vulnerability: 'Çalışma Sıcaklığı' is misclassified into 'Diğer' because keyword list lacks 'sıcak' stem or 'sıcaklığı'");
    });

    it("VULN-02: CSV Injection & Semicolon Delimiter Corruption Vulnerability", () => {
      // When a product specification value contains a semicolon (e.g., "I2C; SPI; UART"),
      // the CSV row generated by naive `.join(";")` splits the cell into multiple columns, corrupting alignment.
      const unescapedVal = "I2C; SPI; UART";
      const products = [
        { id: 1, ureticiUrunKodu: "MCU-1", ureticiAd: "ST", baslangicFiyati: 10, paraBirimi: "USD", toplamStok: 100, ozellikler: { "Arayüz": unescapedVal } },
        { id: 2, ureticiUrunKodu: "MCU-2", ureticiAd: "TI", baslangicFiyati: 10, paraBirimi: "USD", toplamStok: 100, ozellikler: { "Arayüz": "SPI" } },
      ];

      const csv = formatComparisonCsv(products);
      const rows = csv.split("\n");
      const specRow = rows.find((r) => r.startsWith("Arayüz"));

      // In a 2-product table, there should be exactly 3 columns (Key, P1, P2) -> 2 semicolons.
      const semicolonCount = (specRow.match(/;/g) || []).length;
      assert.equal(semicolonCount, 4, "Demonstrates vulnerability: unquoted semicolon in spec value expands column count from 3 to 5");
    });
  });
});
