# BRIEFING — 2026-08-21T15:01:00+03:00

## Mission
Implement Milestone 5: Comparison System (Global Comparison Floating Dock, Side-by-Side Spec Diff Matrix Page) & B2B Cart & Dual-Path RFQ Engine in `frontend`.

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: implementer, qa, specialist
- Working directory: c:\Users\ASUS\Desktop\Staj\.agents\worker_m5
- Original parent: b67411ce-4c55-4193-b404-b9ad1318b060
- Milestone: Milestone 5 (M5)

## 🔒 Key Constraints
- Strictly use Çevik design system tokens (`bg-marka`, `bg-vurgu`, `text-vurgu`, `border-kenar`, Geist fonts).
- Zero usage of Özdisan red `#cc0000`.
- Genuine implementation — no shortcuts or fake tests.
- 0 build errors, 0 test failures (`npm run build`, `npm test`).

## Current Parent
- Conversation ID: b67411ce-4c55-4193-b404-b9ad1318b060
- Updated: 2026-08-21T15:01:00+03:00

## Task Summary
- **What to build**:
  1. Global Comparison Floating Dock (`src/components/karsilastirma/karsilastirma-dock.tsx`) embedded in `src/app/layout.tsx`.
  2. Side-by-Side Spec Diff Matrix Page (`src/app/karsilastirma/page.tsx` & `src/components/karsilastirma/diff-matrix.tsx`).
  3. B2B Cart & Quick Add Line (`src/app/sepet/page.tsx` & `src/app/sepet/cart-items.tsx`).
  4. Dual-Path Checkout & RFQ Conversion flow (`/odeme` vs `/teklif-iste`).
- **Success criteria**: Full interactive comparison with diff highlighting, Excel/PDF export, global dock, B2B cart quick-add, MOQ check, RFQ conversion, 100% passing tests (166/166) and 0 build errors.
- **Interface contracts**: PROJECT.md / UX Report

## Change Tracker
- **Files modified**:
  - `src/components/karsilastirma/karsilastirma-dock.tsx` (new): Sticky bottom floating dock with 4 slots, remove, clear, and compare CTA.
  - `src/app/layout.tsx` (modified): Embedded `KarsilastirmaDock` globally across all pages.
  - `src/components/karsilastirma/diff-matrix.tsx` (new): Side-by-side spec comparison matrix with diff engine, filter differences toggle, PDF/Excel export, and action buttons.
  - `src/app/karsilastirma/page.tsx` (new): Server route for `/karsilastirma` supporting query params (`?ids=...`) and category loading.
  - `src/components/favori-karsilastirma-butonlari.tsx` (modified): Enhanced `KarsilastirmaButonu` with product metadata passing.
  - `src/components/product-card.tsx` (modified): Added `KarsilastirmaButonu` with product prop.
  - `src/components/product-list-card.tsx` (modified): Added `KarsilastirmaButonu` with product prop.
  - `src/app/urunler/[id]/page.tsx` (modified): Connected PDP comparison button with full product metadata.
  - `src/app/sepet/page.tsx` (modified): Integrated upgraded B2B Cart container.
  - `src/app/sepet/cart-items.tsx` (modified): Implemented Quick Add Line, batch actions (Excel/BOM export, clear), MOQ validation, tiered unit price update, and Dual-Path checkout.
  - `src/app/teklif-iste/quote-form.tsx` (modified): Upgraded RFQ form with target unit price, lead time date, PO ref, and tracking number.
  - `src/app/teklif-iste/page.tsx` (modified): Upgraded to Çevik tokens and detailed RFQ summary.
- **Build status**: PASS (`npm run build` 0 errors, 14 static/dynamic routes).
- **Pending issues**: None.

## Quality Status
- **Build/test result**: 166/166 tests passed (100%), 33 suites.
- **Lint status**: 0 errors.
- **Tests added/modified**: Covered under Tier 1 (Features 24, 25, 26, 27) and Tiers 2-4.

## Loaded Skills
- None
