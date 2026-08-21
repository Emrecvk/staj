# Çevik Elektronik — Comprehensive E2E & Integration Test Infrastructure

**Project:** Çevik Elektronik Comprehensive Frontend Revision  
**Reference Architecture:** `www.ozdisan.com` B2B Component Distributor Layout & UX  
**Design System:** Çevik Design System (Navy `#0F2740`, Cyan `#00B4D8` / `#0389B0`, Geist Typography)  
**Test Engine:** Native Node.js Test Runner (`node:test` + `node:assert/strict`)  
**Execution Command:** `npm test` (or `node tests/run-all-tests.mjs` inside `frontend/`)  
**Version:** 1.0.0  
**Status:** 100% Passing (33 Suites, 166 Test Cases)

---

## 1. Test Architecture & Runner Design

### 1.1. Core Principles
1. **Zero External Flakiness:** Built directly on Node.js 24 native test runner (`node:test`), eliminating heavy, flaky headless browser crashes on restricted environments while executing deterministic, ultra-fast test runs (<2.0s total runtime).
2. **Strict Verification Integrity:** Real logic validation covering B2B electronic component quantity rules (MOQ, MPQ, step multipliers), volume pricing tiers, parametric multi-facet filter sync, comparison spec diff engine, BOM CSV parsing, and static source code brand token auditing.
3. **Multi-Tiered Layering:**
   - **Tier 1 (Feature Coverage):** Minimum 5 targeted tests for each of the 28 features in `PROJECT.md` (144 tests).
   - **Tier 2 (Boundary & Corner Cases):** Extreme bounds, sub-MOQ values, non-multiples, empty/malicious search queries, 0-result facet combinations, 4-product comparison limit, invalid MPNs (13 tests).
   - **Tier 3 (Cross-Feature Interactions):** Multi-step end-to-end B2B buyer journeys across header, parametric catalog, comparison dock, matrix diff, cart, and RFQ conversion (3 multi-step journeys).
   - **Tier 4 (Real-World B2B Workloads & Brand Audit):** High-volume 150-line BOM parsing and pricing stress, 500-iteration tiered pricing calculation, multi-warehouse lead time routing, and static code analysis scanning all source files for brand compliance (6 workload & audit tests).

---

## 2. Directory Layout

```
frontend/tests/
├── run-all-tests.mjs                # Master test runner orchestrating all tiers with structured CLI output
├── test-helpers.mjs                 # Domain fixtures, comparison store, B2B pricing math, BOM parsers
├── tier1-features/                  # 28 Feature Test Suites (Features 1-28)
│   ├── 01-global-header.test.mjs    # Feature 1: 3-Tier Global Header
│   ├── 02-mega-menu.test.mjs        # Feature 2: Multi-Level Mega Menu
│   ├── 03-smart-search.test.mjs     # Feature 3: Smart Search Combobox
│   ├── 04-header-actions.test.mjs   # Feature 4: Header Action Center & Badges
│   ├── 05-mobile-drawer.test.mjs    # Feature 5: Mobile Navigation Drawer
│   ├── 06-split-hero.test.mjs       # Feature 6: Split B2B Hero Section
│   ├── 07-category-grid.test.mjs    # Feature 7: Category Icon Grid with SKU Counts
│   ├── 08-inventory-strip.test.mjs  # Feature 8: Live Inventory Metrics Strip
│   ├── 09-tabbed-showcase.test.mjs  # Feature 9: Tabbed Showcase Carousels
│   ├── 10-supplier-showcase.test.mjs# Feature 10: Authorized Supplier Showcase
│   ├── 11-b2b-solutions.test.mjs    # Feature 11: B2B Value & Solutions Section
│   ├── 12-view-switcher.test.mjs    # Feature 12: 3-Mode Catalog View Switcher
│   ├── 13-engineering-table.test.mjs# Feature 13: High-Density Engineering Table
│   ├── 14-filter-sidebar.test.mjs   # Feature 14: Collapsible Parametric Filter Sidebar
│   ├── 15-filter-chips-url.test.mjs # Feature 15: Applied Filter Chips & URL Sync
│   ├── 16-b2b-pagination.test.mjs   # Feature 16: B2B Pagination & Page Size Selector
│   ├── 17-pdp-layout.test.mjs       # Feature 17: PDP Layout & Summary Header
│   ├── 18-warehouse-stock.test.mjs  # Feature 18: Multi-Warehouse Stock Breakdown
│   ├── 19-tiered-pricing.test.mjs   # Feature 19: Interactive Tiered Pricing Matrix
│   ├── 20-packaging-moq.test.mjs    # Feature 20: Packaging Selector with MOQ/MPQ Rules
│   ├── 21-tech-docs-cad.test.mjs    # Feature 21: PDP Technical Document & CAD Hub
│   ├── 22-substitutes-tab.test.mjs  # Feature 22: Related & Substitute Components Tab
│   ├── 23-mobile-pdp-bar.test.mjs   # Feature 23: Sticky Mobile PDP Action Bar
│   ├── 24-comparison-dock.test.mjs  # Feature 24: Comparison Floating Dock
│   ├── 25-spec-diff-matrix.test.mjs # Feature 25: Side-by-Side Spec Diff Matrix Page
│   ├── 26-quick-add-cart.test.mjs   # Feature 26: B2B Quick Add Line & Cart Upgrades
│   ├── 27-rfq-conversion.test.mjs   # Feature 27: Dual-Path Checkout & RFQ Conversion
│   └── 28-e2e-build-audit.test.mjs  # Feature 28: Comprehensive E2E Verification & Build
├── tier2-boundaries/
│   └── boundary-cases.test.mjs      # MOQ limits, packaging step multiples, empty/malicious search, 0-results, 4-product limit, invalid MPNs
├── tier3-interactions/
│   └── cross-feature-flows.test.mjs # End-to-end B2B user journeys across multiple features
└── tier4-workloads/
    ├── bom-workload.test.mjs        # 150-line BOM upload & matching performance/accuracy
    ├── tiered-pricing-stress.test.mjs# High-volume tiered pricing & multi-warehouse calculations
    └── brand-token-audit.test.mjs   # Complete source code static analysis verifying zero #cc0000 and 100% Çevik brand compliance
```

---

## 3. Feature Coverage Mapping Matrix (Tiers 1-4)

| # | Feature Name | Milestone | Test File | Test Count | Pass Rate | Key Verification Areas |
|---|---|---|---|---|---|---|
| 1 | 3-Tier Global Header | M1 | `01-global-header.test.mjs` | 6 | 100% | Utility bar, currency indicator, support hours, brand bar, bottom navigation, semantic token usage. |
| 2 | Multi-Level Mega Menu | M1 | `02-mega-menu.test.mjs` | 6 | 100% | Level 1 component families, Level 2 subcategories, Level 3 leaf items, brand spotlight, hover-intent buffering, ARIA roles. |
| 3 | Smart Search Combobox | M1 | `03-smart-search.test.mjs` | 6 | 100% | 250-300ms debounce, category prefix dropdown, MPN/brand autocomplete, empty state suggestions, keyboard shortcuts. |
| 4 | Header Action Center & Badges | M1 | `04-header-actions.test.mjs` | 5 | 100% | RFQ counter badge, favorites counter badge, comparison counter (N/4), user account popover, mini-cart preview. |
| 5 | Mobile Navigation Drawer | M1 | `05-mobile-drawer.test.mjs` | 5 | 100% | Vaul drawer transitions, hierarchical category stack navigation, "Geri" back button, mobile quick actions, backdrop dismissal. |
| 6 | Split B2B Hero Section | M2 | `06-split-hero.test.mjs` | 5 | 100% | Value proposition slider, drag-and-drop BOM upload, quick paste multi-format parser, direct action routing to `/bom`. |
| 7 | Category Icon Grid with SKU Counts | M2 | `07-category-grid.test.mjs` | 5 | 100% | 6x2 category icon grid, SVG family mapping, live Turkish locale SKU count formatting, category deep links, token styling. |
| 8 | Live Inventory Metrics Strip | M2 | `08-inventory-strip.test.mjs` | 5 | 100% | Total SKUs, in-stock count, authorized brands, same-day dispatch badge, tabular numeric alignment (`tabular-nums`). |
| 9 | Tabbed Showcase Carousels | M2 | `09-tabbed-showcase.test.mjs` | 5 | 100% | New Arrivals / Bestsellers / Deals tabs, ARIA tablist semantics, B2B card rendering, quick MOQ add, responsive slide count. |
| 10 | Authorized Supplier Showcase | M2 | `10-supplier-showcase.test.mjs` | 5 | 100% | Line-card manufacturer logos, alt text fallback, %100 original guarantee badge, brand catalog filter links, carousel scrolling. |
| 11 | B2B Value & Solutions Section | M2 | `11-b2b-solutions.test.mjs` | 5 | 100% | Corporate credit lines, API/EDI integration, FAE engineering support, ISO compliance certificates, responsive layout grid. |
| 12 | 3-Mode Catalog View Switcher | M3 | `12-view-switcher.test.mjs` | 5 | 100% | Grid (⊞), List (☰), Dense Table (☷) modes, URL param persistence (`gorunum`), component dispatcher, ARIA pressed states. |
| 13 | High-Density Engineering Table | M3 | `13-engineering-table.test.mjs` | 6 | 100% | 11-column parametric layout, monospace MPN with copy button, compact tiered price pills, dynamic specs, inline MOQ add, datasheet link. |
| 14 | Collapsible Parametric Filter Sidebar | M3 | `14-filter-sidebar.test.mjs` | 5 | 100% | Multi-facet accordions, in-filter search box for 50+ options, "Sadece Stoktakiler" toggle, live count badges, disabled 0-result state. |
| 15 | Applied Filter Chips & URL Sync | M3 | `15-filter-chips-url.test.mjs` | 5 | 100% | Active filter chips bar, individual chip removal, "Tümünü Temizle" reset, array-value query serialization, `useTransition` loading state. |
| 16 | B2B Pagination & Page Size Selector | M3 | `16-b2b-pagination.test.mjs` | 5 | 100% | First/Prev/Next/Last controls, 24/48/96 page sizes, direct page jump input, boundary disabled states, summary range text. |
| 17 | PDP Layout & Summary Header | M4 | `17-pdp-layout.test.mjs` | 5 | 100% | Full breadcrumb hierarchy, MPN copy button, manufacturer info, lifecycle badges (Aktif, NRND, EOL), RoHS/REACH compliance, gallery. |
| 18 | Multi-Warehouse Stock Breakdown | M4 | `18-warehouse-stock.test.mjs` | 5 | 100% | Merkez Depo same-day stock, Şube/Serbest Bölge transit lead times, Gelecek Stok arrival dates, physical total sum, stock alerts. |
| 19 | Interactive Tiered Pricing Matrix | M4 | `19-tiered-pricing.test.mjs` | 5 | 100% | 1+, 10+, 100+, 1000+ discount tiers, active tier highlighting, line total calculation, high-volume quote CTA, multi-currency formatting. |
| 20 | Packaging Selector with MOQ/MPQ Rules | M4 | `20-packaging-moq.test.mjs` | 5 | 100% | Tape & Reel / Tray / Cut Tape variants, MOQ enforcement, MPQ step multiplier rounding, inaccessible tier marking, upward rounding. |
| 21 | PDP Technical Document & CAD Hub | M4 | `21-tech-docs-cad.test.mjs` | 5 | 100% | Datasheet PDF direct download, 3D STEP / CAD footprints, RoHS certificates, structured technical spec dictionary, fallback modal. |
| 22 | Related & Substitute Components Tab | M4 | `22-substitutes-tab.test.mjs` | 5 | 100% | Pin-to-pin cross-reference substitutes, similar family parts, complementary components, 1-click comparison addition, cost savings. |
| 23 | Sticky Mobile PDP Action Bar | M4 | `23-mobile-pdp-bar.test.mjs` | 5 | 100% | Mobile fixed bottom bar, compact MPN & unit price, step multiplier stepper (+/-), "Sepete Ekle" & "Teklif İste" actions, safe-area inset. |
| 24 | Comparison Floating Dock | M5 | `24-comparison-dock.test.mjs` | 5 | 100% | Visibility on item addition, selected MPN chips, individual remove button, "Tümünü Temizle", "Karşılaştır (N/4)" CTA navigation. |
| 25 | Side-by-Side Spec Diff Matrix Page | M5 | `25-spec-diff-matrix.test.mjs` | 5 | 100% | Up to 4 side-by-side columns, spec diff engine extracting distinct keys, "Sadece Farklılıkları Göster" filter, diff cell highlight, CSV export. |
| 26 | B2B Quick Add Line & Cart Upgrades | M5 | `26-quick-add-cart.test.mjs` | 5 | 100% | Rapid MPN+Qty header bar, packaging & unit price breakdown, in-cart live tiered recalculation, subtotal / KDV %20 / TRY conversion, PO number. |
| 27 | Dual-Path Checkout & RFQ Conversion | M5 | `27-rfq-conversion.test.mjs` | 5 | 100% | Dual action paths (Checkout vs RFQ), 1-click cart-to-RFQ conversion payload, target unit price & lead time fields, tracking number generation. |
| 28 | Comprehensive E2E Verification & Build | M6 | `28-e2e-build-audit.test.mjs` | 5 | 100% | Design tokens in `globals.css`, ZERO `#cc0000` red brand audit, semantic layout tokens, typography rules, root layout metadata. |
| - | **Tier 2: Boundary & Corner Cases** | M1-M6 | `boundary-cases.test.mjs` | 13 | 100% | Sub-MOQ inputs, packaging step non-multiples, empty/whitespace queries, SQL/XSS injection sanitation, 0-result filters, 4-product limit, invalid MPNs. |
| - | **Tier 3: Cross-Feature Interactions** | M1-M6 | `cross-feature-flows.test.mjs` | 3 | 100% | End-to-end B2B buying journey, parametric filter to PDP transition, quick paste BOM to MOQ-aligned cart. |
| - | **Tier 4: Real-World B2B Workloads** | M1-M6 | `bom-workload.test.mjs`, `tiered-pricing-stress.test.mjs`, `brand-token-audit.test.mjs` | 6 | 100% | 150-line BOM parsing in <50ms, 500-bracket tiered pricing stress calculation in <100ms, multi-warehouse routing, static brand code scanner. |

---

## 4. Execution Instructions

### Run All Tests via npm
```bash
cd frontend
npm test
```

### Run All Tests via Standalone Node Script
```bash
cd frontend
node tests/run-all-tests.mjs
```

### Run Specific Test Tier
```bash
# Tier 1 Feature 1
node tests/tier1-features/01-global-header.test.mjs

# Tier 2 Boundary Cases
node tests/tier2-boundaries/boundary-cases.test.mjs

# Tier 3 Cross-Feature Interactions
node tests/tier3-interactions/cross-feature-flows.test.mjs

# Tier 4 Brand Token Audit
node tests/tier4-workloads/brand-token-audit.test.mjs
```

---

## 5. Pass / Fail Semantics

- **Success Criteria:** 100% pass across all 33 suites (166 test cases) with exit code `0`.
- **Failure Detection:** Any assertion failure halts the runner with exit code `1`, printing full stack traces and expected vs actual diffs.
- **Brand Compliance Enforced:** Static code scanner ensures that any introduction of forbidden red `#cc0000` or invalid hex colors fails the test suite automatically.
