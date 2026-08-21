## 2026-08-21T11:48:54Z
You are the Implementation Worker for Milestone 3 (M3: Parametric Catalog, High-Density Engineering Table & B2B Pagination).
Read ORIGINAL_REQUEST.md at `C:\Users\ASUS\.gemini\antigravity\brain\b67411ce-4c55-4193-b404-b9ad1318b060\ORIGINAL_REQUEST.md` and PROJECT.md at `C:\Users\ASUS\.gemini\antigravity\brain\b67411ce-4c55-4193-b404-b9ad1318b060\PROJECT.md`.
Read UX survey findings at `c:\Users\ASUS\Desktop\Staj\.agents\explorer_ux\survey_ozdisan_ux_report.md` and architecture report at `.agents/explorer_b2b_arch/survey_b2b_architecture_report.md`.
Your working directory for reports is `.agents/worker_m3/`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your objective:
Implement the complete Milestone 3 catalog components in `c:\Users\ASUS\Desktop\Staj\frontend`:
1. **3-Mode View Switcher & Controller** (`src/app/urunler/client.tsx`):
   - View switcher buttons for Grid (⊞), List (☰), and Dense Engineering Table (☷) with URL state synchronization.
   - Applied filter chips bar with removable badges and "Tümünü Temizle" button.
   - Non-blocking `useTransition` for filter and view updates.
2. **High-Density Engineering Table** (`src/app/urunler/parametrik-tablo.tsx`):
   - DigiKey/Özdisan style high-density 11-column table:
     - Checkbox for Comparison selection (wired to `useComparisonStore`).
     - Product thumbnail with hover zoom popover.
     - MPN (monospace font) with 1-click copy button and link to PDP.
     - Manufacturer logo and name.
     - Short description.
     - Datasheet PDF download icon button.
     - Real-time warehouse stock breakdown badge (Merkez, Şube).
     - Compact tiered pricing pill (e.g. `1+: $0.45`, `100+: $0.32`, `1K+: $0.21`).
     - Packaging & MOQ details.
     - Category-specific parametric specification columns.
     - Inline quantity input with MOQ validation and 1-click "Sepete Ekle" button.
3. **Collapsible Parametric Filter Accordion Sidebar** (`src/app/urunler/filtre-paneli.tsx`):
   - Facet groups with expand/collapse, in-filter search input for large option lists, count badges, and in-stock toggle.
4. **B2B Pagination Controls**:
   - Advanced pagination bar: First, Prev, Page numbers, Next, Last, Jump to page input, and Page size selector (24, 48, 96).
5. **Brand & Build Verification**:
   - Strictly use Çevik design system tokens (`bg-marka`, `bg-vurgu`, `text-vurgu`, `border-kenar`, Geist fonts).
   - Zero usage of Özdisan red `#cc0000`.
   - Run `npm run build` and `npm test` to verify 0 errors.
