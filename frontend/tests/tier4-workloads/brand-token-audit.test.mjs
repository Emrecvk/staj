import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../../src");

function getAllSourceFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        getAllSourceFiles(fullPath, fileList);
      }
    } else if (entry.isFile() && /\.(tsx|ts|css|jsx|js)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

describe("Tier 4: Brand Integrity & Static Token Compliance Scanner", () => {
  const sourceFiles = getAllSourceFiles(srcDir);

  it("Brand Audit 4.5: Scans all source files in frontend/src/ and verifies ZERO occurrences of Özdisan red #cc0000", () => {
    assert.ok(sourceFiles.length > 0, `Found ${sourceFiles.length} source files to scan`);

    const forbiddenPatterns = [
      /#cc0000/i,
      /#c00000/i,
      /rgb\(\s*204\s*,\s*0\s*,\s*0\s*\)/i,
      /rgba\(\s*204\s*,\s*0\s*,\s*0\s*,/i,
    ];

    const violations = [];

    sourceFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, "utf-8");
      forbiddenPatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          violations.push({
            file: path.relative(srcDir, filePath),
            pattern: pattern.toString(),
          });
        }
      });
    });

    assert.equal(
      violations.length,
      0,
      `Brand integrity violation: Found forbidden Özdisan red in files:\n${violations.map((v) => ` - ${v.file} (matches ${v.pattern})`).join("\n")}`
    );
  });

  it("Brand Audit 4.6: Confirms standard Çevik semantic design tokens are actively utilized", () => {
    const semanticTokenUsages = {
      bgMarka: 0,
      textVurgu: 0,
      bgYuzey: 0,
      borderKenar: 0,
    };

    sourceFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.includes("bg-marka") || content.includes("--color-marka")) semanticTokenUsages.bgMarka++;
      if (content.includes("text-vurgu") || content.includes("--color-vurgu")) semanticTokenUsages.textVurgu++;
      if (content.includes("bg-yuzey") || content.includes("--color-yuzey")) semanticTokenUsages.bgYuzey++;
      if (content.includes("border-kenar") || content.includes("--color-kenar")) semanticTokenUsages.borderKenar++;
    });

    assert.ok(semanticTokenUsages.bgMarka > 0, "Expected bg-marka usage in project");
    assert.ok(semanticTokenUsages.textVurgu > 0, "Expected text-vurgu usage in project");
    assert.ok(semanticTokenUsages.bgYuzey > 0, "Expected bg-yuzey usage in project");
    assert.ok(semanticTokenUsages.borderKenar > 0, "Expected border-kenar usage in project");
  });
});
