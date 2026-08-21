## 2026-08-21T11:42:00Z
You are the Implementation Worker for Milestone 1 (M1: Global Shell, Header, Mega Menu, Smart Search & Header Action Center).
Read ORIGINAL_REQUEST.md at `C:\Users\ASUS\.gemini\antigravity\brain\b67411ce-4c55-4193-b404-b9ad1318b060\ORIGINAL_REQUEST.md` and PROJECT.md at `C:\Users\ASUS\.gemini\antigravity\brain\b67411ce-4c55-4193-b404-b9ad1318b060\PROJECT.md`.
Read Explorer findings at `c:\Users\ASUS\Desktop\Staj\.agents\explorer_ux\survey_ozdisan_ux_report.md` and `.agents/explorer_codebase/survey_codebase_report.md`.
Your working directory for reports is `.agents/worker_m1/`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your objective:
Implement the complete Milestone 1 frontend components in `c:\Users\ASUS\Desktop\Staj\frontend`:
1. **3-Tier Global Header** (`src/components/site-header.tsx`):
   - Top utility bar: B2B support hotline, live USD/EUR exchange rate ticker, fast BOM/quote link, language/currency selector.
   - Main action bar: Çevik brand logo, centralized smart search combobox, and header action center (RFQ badge, Favorites badge, Compare count badge, User account menu popover, Mini-cart dropdown preview).
   - Bottom navigation & mega menu bar: "TÜM KATEGORİLER" button, popular category links, and quick RFQ button.
2. **Multi-Level Mega Menu** (`src/components/mega-menu/mega-menu.tsx`):
   - Desktop 3-tier flyout panel with 150ms hover-intent: Level 1 main categories, Level 2 subcategory columns, Level 3 leaf items, and featured brand spotlight.
   - Mobile hierarchical drawer (`src/components/mega-menu/mobil-menu.tsx`) using Vaul with category stack navigation.
3. **Smart Search Combobox** (`src/components/mega-menu/smart-search.tsx`):
   - Category prefix selector dropdown, debounced live search, autocomplete popup grouping matching products (MPN, image, price, stock), matching categories, and matching brands.
4. **Design Token & Footer Verification**:
   - Ensure all components use semantic tokens (`bg-marka`, `bg-vurgu`, `text-vurgu`, `border-kenar`, Geist fonts).
   - Verify zero usage of Özdisan red `#cc0000`.
   - Polish `src/components/site-footer.tsx` with Çevik semantic design tokens and B2B sitemap.
5. **Build & Type Verification**:
   - Run `npm run build` in `frontend` to ensure 0 build errors.

Output requirement:
Deliver complete code changes, verify with build, write `handoff.md` in `.agents/worker_m1/`, and send a completion message.
