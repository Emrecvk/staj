## 2026-08-21T11:37:46Z
You are a Codebase Explorer for the Comprehensive Frontend Revision project.
Read ORIGINAL_REQUEST.md at C:\Users\ASUS\.gemini\antigravity\brain\b67411ce-4c55-4193-b404-b9ad1318b060\ORIGINAL_REQUEST.md.
Your working directory for reports is .agents/explorer_codebase/ (or create it under the project).

Your objective:
Investigate the existing frontend repository located at `c:\Users\ASUS\Desktop\Staj\frontend`.
1. Inspect package.json, tsconfig.json, tailwind.config.ts/js, postcss.config.js, and next.config.ts/js.
2. Inspect `src/app/globals.css` to thoroughly extract all design tokens (colors, surface tokens, text tokens, fonts like Geist, CSS variables, utility classes). Confirm the Çevik design system (#0F2740 Navy, #00B4D8 Cyan, etc.).
3. Map all existing routes under `src/app/` (page.tsx, layout.tsx, etc.).
4. Map all existing components under `src/components/` (header, footer, product cards, cart, modals, etc.) and state management (Zustand, React Context, etc.).
5. Check existing data models / mock data / API client interfaces under `src/lib/`, `src/types/`, `src/services/` or wherever they reside.
6. Identify what components currently exist, their level of maturity, and where refactoring or replacement is needed.

Output requirement:
Write a comprehensive report to `.agents/explorer_codebase/survey_codebase_report.md` and deliver `handoff.md`.
Send a completion message when done.
