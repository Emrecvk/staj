# B2B Frontend Architecture & Technical Build Specification Report
**Project:** Çevik Elektronik — Comprehensive Frontend Revision (Özdisan-Inspired B2B UX/UI)  
**Target Environment:** Next.js 16.3.1 (App Router), React 19.2.8, Tailwind CSS v4, TypeScript 5  
**Author:** B2B Architecture & Build Analyst  
**Date:** 2026-08-21  

---

## 1. Executive Summary

This report establishes the technical architecture, state management design, TypeScript domain models, and zero-error build strategies for overhauling Çevik Elektronik's frontend to deliver an Özdisan-grade B2B distributor experience.

### Key Architectural Pillars
1. **Preserve Brand Identity:** Preserve Çevik design tokens (Navy `#0F2740`, Cyan `#00B4D8`, Geist sans/mono typography, semantic `@theme` tokens in `globals.css`) while integrating Özdisan's high-density B2B component layout.
2. **Unified State Architecture:** Hybrid approach combining Server Actions / Next.js URL SearchParams for deep-linkable catalog state, alongside lightweight client stores (Zustand + LocalStorage) for multi-product comparison, mega menu navigation, and fast order / cart optimization.
3. **Strict B2B Electronic Component Domain:** Full support for MPN, MPQ, MOQ, step multipliers (katlama miktarı), parametric technical spec dictionaries, tiered volume pricing, and multi-document / datasheet distribution.
4. **Zero Build Error Guarantee:** Strict compliance with React 19 and Next.js 16 async route params, SSR/CSR Suspense boundaries, hydration safety, and Server Action isolation.

---

## 2. State Management Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 APPLICATION STATE MAPPING                               │
├────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│ Domain / Feature           │ State Mechanism             │ Persistence / Scope         │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ Mega Menu & Navigation     │ React State / Motion / Vaul │ Transient UI state          │
│ Product Comparison Store   │ Zustand Store (persist)     │ LocalStorage + Server Sync  │
│ Catalog Parametric Filters │ URLSearchParams + Transit.  │ URL Query (Bookmarkable)    │
│ Cart & Fast Order          │ Server Actions + Zustand    │ PostgreSQL + LocalStorage   │
└────────────────────────────┴─────────────────────────────┴─────────────────────────────┘
```

---

### 2.1. Multi-Level Mega Menu Architecture

Özdisan’s mega menu features a multi-tiered hierarchy with categories, sub-categories, leaf categories, popular brands, and promotional banners.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                MEGA MENU INTERACTION MODEL                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ Header Bar: "Tüm Kategoriler" ]                                                     │
│        │ (Hover Intent: 150ms delay / Click Toggle)                                    │
│        ▼                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Level 1: Main Categories (e.g. Yarı İletkenler, Pasif Komponentler, Konnektörler)│  │
│  │ (Active hover highlights & loads corresponding Level 2 sub-grid)                 │  │
│  ├────────────────────────────────────────┬─────────────────────────────────────────┤  │
│  │ Level 2: Subcategory Columns           │ Level 3: Leaf Items / Quick Links       │  │
│  │ ├─ Entegre Devreler (ICs)              │ ├─ Mikrodenetleyiciler (ARM, RISC-V)    │  │
│  │ ├─ Güç Yönetimi (Power Management)     │ ├─ LDO & Lineer Regülatörler            │  │
│  │ └─ Ayrık Yarı İletkenler (Discretes)   │ └─ MOSFET, Transistör, Diyot            │  │
│  ├────────────────────────────────────────┴─────────────────────────────────────────┤  │
│  │ Featured Manufacturers in Category (e.g., STMicroelectronics, Texas Instruments) │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  [ Mobile View: Drawer Slide-Over (Vaul) with Multi-Level Drill-Down ]                 │
│        Root -> Category Click -> Slide to Subcategories with Back Button               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Technical Implementation Strategy:
1. **Server Pre-fetch & SSR:** Root layout / Header fetches category tree (`Category[]` via `getCategories()`) at server level, providing zero layout shifts and SEO indexing.
2. **Hover Intent & Debounce:** Prevent jitter when mouse moves diagonally across menus using a 150ms activation buffer and 200ms close buffer.
3. **Keyboard Accessibility:** Full ARIA compliance (`aria-expanded`, `aria-controls`, `role="menu"`, `role="menuitem"`), handling `Escape` to close and arrow keys for spatial navigation.
4. **Mobile Drawer (Vaul/Motion):** Slide-over drawer with stack navigation. Selecting a category transitions to level-2 view with a "← Geri" (Back) button.

---

### 2.2. Product Comparison Store & Spec Diff Engine

B2B electronics buyers compare multiple MPNs side-by-side to evaluate voltage tolerances, package footprint, pinouts, and volume price tiers.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCT COMPARISON ARCHITECTURE                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  1. Zustand Persisted Store (`useComparisonStore`)                                     │
│     - Selected Product IDs (max 4)                                                     │
│     - Cached Product Summaries (MPN, Manufacturer, Image, Base Price, Stock)           │
│     - Background sync with `/Katalog/karsilastirma/{urunId}` server endpoint          │
│                                                                                        │
│  2. Floating Sticky Bottom Bar (Dock)                                                  │
│     - Renders when `items.length > 0`                                                  │
│     - Displays thumbnails, MPN badges, and "Karşılaştır (N/4)" CTA                     │
│     - Action: Clear all or remove individual items                                     │
│                                                                                        │
│  3. Spec Diff Engine (`/karsilastirma`)                                                │
│     - Matrix generator: Extracts all keys across `ozellikler` JSON                     │
│     - Row categorization:                                                              │
│       • Identical Values (e.g. Package: SOIC-8)                                        │
│       • Differing Values (e.g. Supply Voltage: 3.3V vs 5.0V) [Highlighted]             │
│       • Exclusive Specs (present in only subset of products)                           │
│     - User Toggle: "Sadece Farklılıkları Göster" (Filter only diff rows)               │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Spec Diff Algorithm Definition:
```typescript
export interface ComparisonMatrixRow {
  groupName: string;
  specKey: string;
  isDifferent: boolean;
  values: Record<number, string | null>; // productId -> formatted spec value
}

export function generateComparisonMatrix(
  products: ProductDetail[]
): ComparisonMatrixRow[] {
  const allKeys = new Set<string>();
  products.forEach((p) => {
    Object.keys(p.ozellikler || {}).forEach((k) => allKeys.add(k));
  });

  return Array.from(allKeys).map((key) => {
    const values: Record<number, string | null> = {};
    const distinctValues = new Set<string>();

    products.forEach((p) => {
      const val = p.ozellikler?.[key] ?? null;
      values[p.id] = val;
      if (val !== null) distinctValues.add(val);
    });

    return {
      groupName: "Teknik Özellikler",
      specKey: key,
      isDifferent: distinctValues.size > 1,
      values,
    };
  });
}
```

---

### 2.3. Catalog Parametric Filters & Search Synchronization

Özdisan’s core power is its high-density parametric facet grid. Filter changes must instantly update the URL query string, supporting sharing, bookmarking, and browser history (back/forward).

#### URL Query Parameter Architecture:
* `kategoriId`: `12`
* `aramaMetni`: `STM32`
* `sadeceStoktakiler`: `true`
* `siralama`: `fiyat_artan` | `fiyat_azalan` | `stok` | `populer` | `yeni`
* `sayfaNo`: `1`
* `sayfaBoyutu`: `24` | `48` | `96`
* `gorunum`: `liste` | `izgara`
* Multi-value Facets: `kilif=LQFP-48&kilif=QFN-32&montajTipi=SMD`

#### React 19 / Next.js 16 Transition Strategy:
* Use `useTransition` for non-blocking filter updates:
  ```typescript
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const applyFilters = (newParams: URLSearchParams) => {
    startTransition(() => {
      router.push(`/urunler?${newParams.toString()}`, { scroll: false });
    });
  };
  ```
* Visual state during transition: The catalog grid dims (`opacity-60`) rather than being unmounted, preserving the user's scroll position and layout context.
* Facet count badges (`FacetOption.urunSayisi`) update with each server response to prevent dead-end filter combinations.

---

### 2.4. B2B Cart, Fast Order & Tiered Pricing Store

B2B electronic procurement differs fundamentally from B2C:
1. **MOQ (Minimum Order Quantity):** Strict enforcement (e.g. Reels of 3,000 units).
2. **MPQ / Katlama Miktarı (Package Step):** Orders must increment in multiples of package quantity (e.g. 500, 1000, 1500).
3. **Volume Tiered Pricing:** Dynamic unit price calculation based on quantity bracket (1-9, 10-49, 50-99, 100-499, 500+).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             FAST ORDER (HIZLI SİPARİŞ) FLOW                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   [ Rapid Entry Interface ]                                                            │
│   - Multi-row direct entry: MPN + Quantity                                             │
│   - Bulk Paste Input: "STM32F103C8T6, 1000\nLM358DR, 2500\n1N4148, 10000"             │
│   - Excel / CSV Drag & Drop (Instant client parser)                                    │
│        │                                                                               │
│        ▼                                                                               │
│   [ Validation & Price Calculation Engine ]                                            │
│   - Client verifies MOQ & Katlama via `lib/miktar-kurali.ts`                           │
│   - Server Action `bomEslestir` / `batchValidate` verifies live stock & active pricing  │
│        │                                                                               │
│        ▼                                                                               │
│   [ 1-Click Batch Add to Cart ]                                                        │
│   - Executes batch insertion to `/Sepet`                                               │
│   - Provides itemized error feedback if any stock / packaging constraint fails         │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. TypeScript Domain Models for Electronic Components

The domain model must accommodate electronic components with parametric attributes, multiple packaging variants, price tiers, and warehouse stock.

```typescript
// ============================================================================
// ÇEVİK ELEKTRONİK — B2B COMPONENT DOMAIN MODELS
// ============================================================================

export type LifecycleStatus = 
  | "Aktif"                     // Active
  | "YeniTasarimaOnerilmez"     // Not Recommended for New Designs (NRND)
  | "OmruSonu"                  // End of Life (EOL)
  | "KullanimdanKalkti";        // Obsolete

export type MountingType = "SMD" | "THT" | "Chassis" | "Panel" | "Yok";
export type RohsStatus = "Belgeli" | "Belgesiz" | "Muaf" | "Bilinmiyor";

export interface DocumentInfo {
  tip: number;                  // 1: Datasheet, 2: 3D CAD / STEP, 3: RoHS, 4: App Note
  url: string;
  baslik: string;
  boyutByte?: number;
  dil?: "TR" | "EN";
}

export interface PriceTier {
  minMiktar: number;
  maxMiktar: number | null;
  birimFiyat: number;
  paraBirimi: "USD" | "EUR" | "TRY";
  musteriGrubuId?: number | null;
}

export interface PackagingOption {
  ambalajId: number;
  ad: string;                   // "Tape & Reel", "Tube", "Tray", "Bulk / Bag", "Cut Tape"
  ambalajTipi: number;
  mpq: number;                  // Minimum Package Quantity
  moq: number;                  // Minimum Order Quantity
  katlamaMiktari: number;       // Order Multiple Step
  stokMiktari: number;          // Available Warehouse Stock
  gelecekStokMiktari: number;   // Incoming Stock
  gelecekStokTarihi: string | null;
  fiyatlar: PriceTier[];
  varsayilanMi?: boolean;
}

export interface WarehouseStock {
  depoKodu: string;             // "MERKEZ-IST", "SERBEST-BOLGE"
  depoAdi: string;
  stokMiktari: number;
  teslimSuresiGun: number;
}

export interface ProductDetail {
  id: number;
  ureticiUrunKodu: string;       // MPN (Manufacturer Part Number)
  ureticiId: number;
  ureticiAd: string;
  ureticiLogoUrl?: string | null;
  yetkiliDistributorMu?: boolean;
  
  kategoriId: number;
  kategoriYolu?: string[];       // Breadcrumb hierarchy: ["Yarı İletkenler", "MCU", "ARM Cortex"]
  
  kisaAciklama: string;
  detayliAciklama: string | null;
  
  anaGorselUrl: string | null;
  gorselUrlleri: string[];
  gorselTemsiliMi: boolean;      // B2B Disclaimer "*Görsel temsilidir"
  
  urunDurumu: LifecycleStatus | string | null;
  rohsDurumu: RohsStatus | string | null;
  montajTipi: MountingType | string | null;
  ureticiTeslimSuresi: string | null;
  
  dokumanlar: DocumentInfo[];
  ozellikler: Record<string, string>; // Technical Spec Dictionary (JSONB)
  ambalajlarVeFiyatlar: PackagingOption[];
  depoStoklari?: WarehouseStock[];
  
  muadiller: RelatedProductSummary[];
  benzerUrunler: RelatedProductSummary[];
  parametrikUrunler: RelatedProductSummary[];
  birlikteKullanilanlar: RelatedProductSummary[];
}

export interface ProductSummary {
  id: number;
  ureticiUrunKodu: string;
  ureticiAd: string;
  kisaAciklama: string;
  anaGorselUrl: string | null;
  gorselTemsiliMi: boolean;
  toplamStok: number;
  baslangicFiyati: number;
  paraBirimi: string;
  kampanyaliMi: boolean;
  kilif?: string;
  montajTipi?: string;
  rohsDurumu?: string;
}

export interface FacetOption {
  deger: string;
  hamDeger: string;
  urunSayisi: number;
}

export interface FacetGroup {
  kod: string;
  ad: string;
  gosterimTipi: number;         // 1: Checkbox list, 2: Range, 3: Color/Badge
  secenekler: FacetOption[];
}

export interface ProductResult {
  urunler: {
    sayfaNo: number;
    sayfaBoyutu: number;
    toplamKayit: number;
    toplamSayfa: number;
    kayitlar: ProductSummary[];
  };
  filtreler: FacetGroup[];
}
```

---

## 4. Dependency Ecosystem Evaluation

### Current `package.json` State:
```json
{
  "dependencies": {
    "lucide-react": "^1.33.0",
    "motion": "^13.1.1",
    "next": "16.3.1",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "sonner": "^2.0.8",
    "vaul": "^1.1.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### Analysis & Recommendations:

1. **`zustand` (`^5.0.3`):**
   * *Status:* **Recommended addition**.
   * *Reason:* Provides lightweight, reactive store with `persist` middleware for the Comparison Dock and Fast Order draft persistence. Zustand v5 has official React 19 support and zero runtime overhead.
2. **`clsx` & `tailwind-merge`:**
   * *Status:* **Recommended addition** or implement lightweight utility `cn(...classes)`.
   * *Reason:* Essential for dynamic Tailwind class resolution when composing high-density table and badge variants.
3. **Tailwind CSS v4 Compatibility:**
   * Tailwind 4 does not use `tailwind.config.js`. Everything is configured in `globals.css` with `@theme`.
   * *Rule:* Never use `@theme inline`. Ensure all custom colors use `var(--color-...)` to enable dark mode transitions seamlessly.
4. **Icons & Animation:**
   * `lucide-react` covers all required B2B icons (Microchip, CircuitBoard, Layers, ArrowLeftRight, Download, Filter, SlidersHorizontal, Package, ShieldCheck).
   * `motion` handles drawer transitions, accordion expansions, and floating dock entrance animations.

---

## 5. Next.js App Router Pitfalls & Zero Build Error Strategy

To guarantee **0 build errors** and **0 runtime hydration crashes** during implementation:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                            ZERO BUILD ERROR CHECKLIST & RULES                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  1. Next.js 16 Async Route Params:                                                     │
│     ❌ DO NOT: `export default function Page({ params }: { params: { id: string } })`  │
│     ✅ MUST: `export default async function Page({ params }: { params: Promise<...> })`│
│        and `const { id } = await params;`                                              │
│                                                                                        │
│  2. `useSearchParams()` Suspense Boundary Requirement:                                 │
│     ❌ DO NOT use `useSearchParams()` directly in an unsuspended Client Component.    │
│     ✅ MUST wrap any client search params consumer in `<Suspense fallback={...}>`     │
│        or mark page with `export const dynamic = "force-dynamic"`.                     │
│                                                                                        │
│  3. Server Actions Boundary Isolation:                                                 │
│     ❌ DO NOT export non-async items (interfaces, types, objects) from `"use server"`.│
│     ✅ MUST keep interfaces & types in `*-tipler.ts` and only export async functions.  │
│                                                                                        │
│  4. Hydration Protection for Persisted Client State:                                   │
│     ❌ DO NOT render `localStorage` data immediately during SSR.                       │
│     ✅ MUST use `useIsMounted()` hook or check `isHydrated` before rendering badge     │
│        counts or persisted comparison items.                                           │
│                                                                                        │
│  5. Design Token Integrity:                                                            │
│     ❌ DO NOT use arbitrary hardcoded colors like `#cc0000` or raw hex codes.          │
│     ✅ MUST use semantic classes: `text-vurgu`, `bg-marka`, `border-kenar`, etc.       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Blueprint & Module Structure

The recommended project directory architecture under `frontend/src/`:

```
frontend/src/
├── app/
│   ├── layout.tsx                     # Root HTML, Geist fonts, Toast container
│   ├── globals.css                    # Tailwind 4 theme & semantic tokens
│   ├── page.tsx                       # High-density B2B Home Page (Özdisan layout)
│   ├── urunler/
│   │   ├── page.tsx                   # Parametric catalog server page
│   │   ├── client.tsx                 # Catalog listing client controller
│   │   ├── filtre-paneli.tsx          # Left facet filter sidebar
│   │   ├── parametrik-tablo.tsx       # B2B high-density spec table view
│   │   └── [id]/page.tsx              # Deep product detail with tiered pricing
│   ├── karsilastirma/
│   │   └── page.tsx                   # Multi-product side-by-side spec diff table
│   ├── hizli-siparis/
│   │   └── page.tsx                   # Fast Order / Bulk MPN entry
│   ├── bom/
│   │   └── page.tsx                   # BOM matching & multi-item add to cart
│   └── sepet/
│       └── page.tsx                   # B2B cart with MOQ/tier calculation
├── components/
│   ├── site-header.tsx                # Header with mega menu & quick search
│   ├── mega-menu/
│   │   ├── mega-menu.tsx              # Desktop hover/click multi-level mega menu
│   │   └── mobil-menu.tsx             # Mobile hierarchical drawer
│   ├── karsilastirma/
│   │   ├── karsilastirma-dock.tsx     # Floating bottom comparison dock
│   │   └── diff-matrix.tsx            # Spec comparison matrix component
│   ├── product-card.tsx               # Grid view card
│   ├── product-table-row.tsx          # High-density parametric table row
│   ├── ambalaj-secici.tsx             # Packaging & Tiered price selector
│   └── ui/                            # Atomic primitives (button, drawer, badge)
└── lib/
    ├── api.ts                         # Catalog & Product API client
    ├── stores/
    │   ├── comparison-store.ts        # Persisted Zustand comparison store
    │   └── cart-store.ts              # Optimistic cart state & badge updater
    ├── miktar-kurali.ts               # MOQ, Katlama & Tier calculation engine
    ├── katalog-actions.ts             # Server actions for favorites/comparison
    └── cart-actions.ts                # Server actions for B2B cart operations
```

---

## 7. Conclusion & Next Steps

The frontend codebase is on a solid foundation with Next.js 16.3.1, React 19, and Tailwind v4. By adopting the structured state management patterns, strict electronic component typings, and zero-error Next.js App Router rules outlined in this report, the team can systematically transform Çevik Elektronik into an industry-leading B2B electronic component procurement platform matching Özdisan's functionality while upholding Çevik's brand excellence.
