"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getCart } from "@/lib/cart-actions";
import type { Sepet } from "@/lib/sepet-tipler";

const CART_EVENT = "cevik_cart_updated";
const RFQ_EVENT = "cevik_rfq_updated";
const FAVORITES_EVENT = "cevik_favorites_updated";

export function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_EVENT));
  }
}

export function notifyRfqUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(RFQ_EVENT));
  }
}

export function notifyFavoritesUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
  }
}

export interface MiniCartItem {
  id: number;
  mpn: string;
  baslik: string;
  anaGorselUrl: string | null;
  miktar: number;
  birimFiyat: number;
  toplamFiyat: number;
  paraBirimi: string;
}

export interface CartSummaryState {
  itemCount: number;
  toplamTutar: number;
  paraBirimi: string;
  kalemler: MiniCartItem[];
  yukleniyor: boolean;
}

type SiteParaBirimi = "TRY" | "USD";

function bosSepetDurumu(paraBirimi: SiteParaBirimi): CartSummaryState {
  return {
    itemCount: 0,
    toplamTutar: 0,
    paraBirimi,
    kalemler: [],
    yukleniyor: false,
  };
}

export function useHeaderCart(varsayilanParaBirimi: SiteParaBirimi = "TRY") {
  const [cartState, setCartState] = useState<CartSummaryState>(() =>
    bosSepetDurumu(varsayilanParaBirimi),
  );

  useEffect(() => {
    let active = true;

    const fetchCart = async () => {
      try {
        const sepet: Sepet | null = await getCart();
        if (!active) return;

        if (sepet && sepet.kalemler) {
          const itemCount = sepet.kalemler.reduce((sum, item) => sum + item.miktar, 0);
          const kalemler: MiniCartItem[] = sepet.kalemler.map((item) => ({
            id: item.kalemId,
            mpn: item.urunKodu || `PARCA-${item.urunId}`,
            baslik: item.kisaAciklama || "Komponent",
            anaGorselUrl: item.anaGorselUrl,
            miktar: item.miktar,
            birimFiyat: item.birimFiyat,
            toplamFiyat: item.toplamFiyat,
            paraBirimi: sepet.paraBirimi || varsayilanParaBirimi,
          }));
          setCartState({
            itemCount,
            toplamTutar: sepet.genelToplam || 0,
            paraBirimi: sepet.paraBirimi || varsayilanParaBirimi,
            kalemler,
            yukleniyor: false,
          });
        } else {
          setCartState(bosSepetDurumu(varsayilanParaBirimi));
        }
      } catch {
        if (active) {
          setCartState(bosSepetDurumu(varsayilanParaBirimi));
        }
      }
    };

    fetchCart();
    window.addEventListener(CART_EVENT, fetchCart);
    return () => {
      active = false;
      window.removeEventListener(CART_EVENT, fetchCart);
    };
  }, [varsayilanParaBirimi]);

  return cartState;
}

// User External Store
export interface UserSession {
  ad: string;
  firmaMi?: boolean;
  firmaId?: number;
}

let cachedUserStr: string = "";
let cachedUser: UserSession | null = null;

function getUserSnapshot(): UserSession | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(/(?:^|;\s*)user=([^;]*)/);
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

function subscribeUser(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("focus", callback);
  return () => window.removeEventListener("focus", callback);
}

export function useHeaderUser() {
  const user = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    () => null
  );

  return {
    user,
    isLoggedIn: !!user,
  };
}

// Counters External Store
let cachedRfqCount = 0;
let cachedFavCount = 0;

function getRfqSnapshot(): number {
  if (typeof window === "undefined") return 0;
  try {
    const rfqRaw = localStorage.getItem("cevik_rfq_items");
    cachedRfqCount = rfqRaw ? (JSON.parse(rfqRaw)?.length || 0) : 0;
  } catch {
    cachedRfqCount = 0;
  }
  return cachedRfqCount;
}

function getFavSnapshot(): number {
  if (typeof window === "undefined") return 0;
  try {
    const favRaw = localStorage.getItem("cevik_favori_sayisi");
    cachedFavCount = favRaw ? parseInt(favRaw, 10) || 0 : 0;
  } catch {
    cachedFavCount = 0;
  }
  return cachedFavCount;
}

function subscribeRfq(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(RFQ_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(RFQ_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function subscribeFav(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(FAVORITES_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(FAVORITES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useHeaderCounters() {
  const rfqCount = useSyncExternalStore(subscribeRfq, getRfqSnapshot, () => 0);
  const favoritesCount = useSyncExternalStore(subscribeFav, getFavSnapshot, () => 0);

  return {
    rfqCount,
    favoritesCount,
  };
}
