## 2026-08-21T11:54:37Z

You are the Implementation Worker for Milestone 4 (M4: Product Detail Page & Engineering Hub).
Read ORIGINAL_REQUEST.md at C:\Users\ASUS\.gemini\antigravity\brain\b67411ce-4c55-4193-b404-b9ad1318b060\ORIGINAL_REQUEST.md and PROJECT.md at C:\Users\ASUS\.gemini\antigravity\brain\b67411ce-4c55-4193-b404-b9ad1318b060\PROJECT.md.
Read UX survey findings at c:\Users\ASUS\Desktop\Staj\.agents\explorer_ux\survey_ozdisan_ux_report.md (§4 PDP).
Your working directory for reports is .agents/worker_m4/.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your objective:
Implement the complete Milestone 4 product detail page components in c:\Users\ASUS\Desktop\Staj\frontend:
1. **PDP Layout & Summary Header** (src/app/urunler/[id]/page.tsx & client components):
   - Full breadcrumb hierarchy navigation with category tree links.
   - Manufacturer info with direct brand link, MPN monospace with 1-click clipboard copy, lifecycle status badges (Aktif / Yeni Tasarıma Önerilmez NRND / Ömrü Sonu EOL), RoHS & REACH badges, and representative image notice.
   - Multi-image zoom gallery with thumbnail switcher.
2. **Multi-Warehouse Stock Breakdown**:
   - Stock distribution across warehouses: Merkez Depo (İstanbul - Aynı Gün Kargo), Şube Depo (2-3 İş Günü), and Gelecek Stok with incoming date and quantity.
3. **Interactive Tiered Pricing Matrix**:
   - Volume pricing table (1-9, 10-99, 100-499, 500-999, 1.000+, 5.000+ Özel Fiyat / Teklif İste) with live active tier highlight based on entered quantity.
4. **Packaging Selector & Purchase Action Box**:
   - Packaging variant selection (Tape & Reel, Tube, Tray, Cut Tape) with MOQ and packaging multiple (katlama) step enforcement.
   - Dual actions: Sepete Ekle and Resmi Teklif İste (RFQ).
   - Quick action buttons: Favorilere Ekle, Karşılaştır (wired to useComparisonStore), and Stok Alarmı.
5. **Technical Document & CAD Hub Tabs**:
   - Tab 1: Parametric Technical Specifications Table (JSONB key-value specs with search & group filtering).
   - Tab 2: Documents & CAD Hub (Datasheet PDF viewer/download, Altium/KiCad EDA footprints, compliance certs).
   - Tab 3: Pin-to-pin Cross-Reference & Substitute Products.
   - Tab 4: Complementary / Frequently Bought Together components.
6. **Sticky Mobile Purchase Action Bar**:
   - Fixed bottom action bar on mobile screens with MPN, unit price, quantity stepper, and Sepete Ekle button.
7. **Brand & Build Verification**:
   - Strictly use Çevik design system tokens (g-marka, g-vurgu, 	ext-vurgu, order-kenar, Geist fonts).
   - Zero usage of Özdisan red #cc0000.
   - Run 
pm run build and 
pm test to verify 0 errors.

Output requirement:
Deliver complete code changes, verify with build and test runs, write handoff.md in .agents/worker_m4/, and send a completion message.
