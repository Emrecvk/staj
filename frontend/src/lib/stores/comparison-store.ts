"use client";

import { useSyncExternalStore } from "react";

export interface ComparisonItem {
  id: number;
  ureticiUrunKodu: string;
  ureticiAd: string;
  anaGorselUrl: string | null;
  baslangicFiyati: number;
  paraBirimi: string;
  toplamStok: number;
  kategoriId: number;
  ozellikler?: Record<string, string>;
}

export interface ComparisonStore {
  items: ComparisonItem[];
  addItem: (item: ComparisonItem) => boolean; // returns false if max (4) reached
  removeItem: (id: number) => void;
  clear: () => void;
  isInComparison: (id: number) => boolean;
}

const STORAGE_KEY = "cevik_karsilastirma_listesi";
const MAX_COMPARISON_ITEMS = 4;
const EVENT_NAME = "cevik_comparison_state_change";

let cachedItems: ComparisonItem[] = [];
let isInitialized = false;

function getStoredItems(): ComparisonItem[] {
  if (typeof window === "undefined") return [];
  if (!isInitialized) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      cachedItems = raw ? JSON.parse(raw) : [];
    } catch {
      cachedItems = [];
    }
    isInitialized = true;
  }
  return cachedItems;
}

function setStoredItems(items: ComparisonItem[]) {
  cachedItems = items;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
    } catch {
      // ignore storage errors
    }
  }
}

export const comparisonStore = {
  getItems(): ComparisonItem[] {
    return getStoredItems();
  },

  addItem(item: ComparisonItem): boolean {
    const current = getStoredItems();
    if (current.some((x) => x.id === item.id)) {
      return true;
    }
    if (current.length >= MAX_COMPARISON_ITEMS) {
      return false;
    }
    const updated = [...current, item];
    setStoredItems(updated);
    return true;
  },

  removeItem(id: number): void {
    const current = getStoredItems();
    const updated = current.filter((x) => x.id !== id);
    setStoredItems(updated);
  },

  clear(): void {
    setStoredItems([]);
  },

  isInComparison(id: number): boolean {
    return getStoredItems().some((x) => x.id === id);
  },
};

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  
  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      isInitialized = false;
      callback();
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

const emptyItems: ComparisonItem[] = [];

export function useComparisonStore(): ComparisonStore {
  const items = useSyncExternalStore(
    subscribe,
    () => getStoredItems(),
    () => emptyItems
  );

  return {
    items,
    addItem: (item) => comparisonStore.addItem(item),
    removeItem: (id) => comparisonStore.removeItem(id),
    clear: () => comparisonStore.clear(),
    isInComparison: (id) => items.some((x) => x.id === id),
  };
}
