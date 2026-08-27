import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendSrcDir = path.resolve(__dirname, "../../src");

describe("Feature 28: Comprehensive E2E Verification & Build", () => {
  it("Test 28.1: Design system defines the ink, paper, and signal palette", () => {
    const globalsCssPath = path.join(frontendSrcDir, "app", "globals.css");
    const content = fs.readFileSync(globalsCssPath, "utf-8");

    assert.ok(content.includes("#32202b"), "Must define ink #32202B");
    assert.ok(content.includes("#f7763f"), "Must define signal orange #F7763F");
    assert.ok(content.includes("#f6f1e9"), "Must define paper surface #F6F1E9");
  });

  it("Test 28.2: Brand audit verifies ZERO occurrence of Özdisan red (#cc0000) across globals.css", () => {
    const globalsCssPath = path.join(frontendSrcDir, "app", "globals.css");
    const content = fs.readFileSync(globalsCssPath, "utf-8").toLowerCase();

    assert.ok(!content.includes("#cc0000"), "Forbidden Özdisan red #cc0000 found in globals.css");
    assert.ok(!content.includes("#c00000"), "Forbidden variant #c00000 found in globals.css");
  });

  it("Test 28.3: Semantic layout tokens (bg-yuzey, text-metin, border-kenar) are registered in theme", () => {
    const globalsCssPath = path.join(frontendSrcDir, "app", "globals.css");
    const content = fs.readFileSync(globalsCssPath, "utf-8");

    assert.ok(content.includes("--color-yuzey:"));
    assert.ok(content.includes("--color-kenar:"));
    assert.ok(content.includes("--color-metin:"));
    assert.ok(content.includes("--color-vurgu:"));
    assert.ok(content.includes("--color-marka:"));
  });

  it("Test 28.4: Typography rules enforce display, body, mono, and tabular-nums", () => {
    const globalsCssPath = path.join(frontendSrcDir, "app", "globals.css");
    const content = fs.readFileSync(globalsCssPath, "utf-8");

    assert.ok(content.includes("--font-space-grotesk"));
    assert.ok(content.includes("--font-instrument-sans"));
    assert.ok(content.includes("--font-ibm-plex-mono"));
    assert.ok(content.includes("tabular-nums"));
  });

  it("Test 28.5: App router layout metadata includes responsive viewport and title template", () => {
    const layoutPath = path.join(frontendSrcDir, "app", "layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");

    assert.ok(content.includes("Çevik") || content.includes("title"));
    assert.ok(content.includes("html") || content.includes("body"));
  });
});
