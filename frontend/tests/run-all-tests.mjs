#!/usr/bin/env node

/**
 * Çevik Elektronik - Master E2E & Integration Test Runner
 * Executes all test tiers (T1-T4) and outputs structured test results.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testsDir = __dirname;

const TEST_TIERS = [
  {
    id: "Tier 1",
    name: "Feature Coverage (Features 1-28)",
    dir: path.join(testsDir, "tier1-features"),
  },
  {
    id: "Tier 2",
    name: "Boundary & Corner Cases",
    dir: path.join(testsDir, "tier2-boundaries"),
  },
  {
    id: "Tier 3",
    name: "Cross-Feature Interactions & User Journeys",
    dir: path.join(testsDir, "tier3-interactions"),
  },
  {
    id: "Tier 4",
    name: "Real-World B2B Workloads & Brand Audit",
    dir: path.join(testsDir, "tier4-workloads"),
  },
];

async function runTestFile(filePath) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const child = spawn(process.execPath, [filePath], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    child.on("close", (code) => {
      const durationMs = performance.now() - startTime;

      // Extract test count and pass count from node:test output
      const testsMatch = stdout.match(/ℹ tests\s+(\d+)/);
      const passMatch = stdout.match(/ℹ pass\s+(\d+)/);
      const failMatch = stdout.match(/ℹ fail\s+(\d+)/);

      const totalTests = testsMatch ? parseInt(testsMatch[1], 10) : 0;
      const passedTests = passMatch ? parseInt(passMatch[1], 10) : (code === 0 ? totalTests : 0);
      const failedTests = failMatch ? parseInt(failMatch[1], 10) : (code !== 0 ? 1 : 0);

      resolve({
        file: path.basename(filePath),
        relPath: path.relative(testsDir, filePath),
        code,
        durationMs,
        totalTests,
        passedTests,
        failedTests,
        stdout,
        stderr,
      });
    });
  });
}

async function main() {
  console.log("================================================================================");
  console.log("  ÇEVİK ELEKTRONİK FRONTEND - E2E & INTEGRATION TEST SUITE RUNNER");
  console.log("================================================================================\n");

  const overallStartTime = performance.now();
  let totalSuites = 0;
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  const tierResults = [];

  for (const tier of TEST_TIERS) {
    if (!fs.existsSync(tier.dir)) continue;

    console.log(`\n▶ [${tier.id}] ${tier.name}`);
    console.log("--------------------------------------------------------------------------------");

    const files = fs
      .readdirSync(tier.dir)
      .filter((f) => f.endsWith(".test.mjs") || f.endsWith(".test.js"))
      .sort();

    const currentTierResults = [];

    for (const file of files) {
      const fullPath = path.join(tier.dir, file);
      const result = await runTestFile(fullPath);

      totalSuites++;
      totalTests += result.totalTests;
      totalPassed += result.passedTests;
      totalFailed += result.failedTests;

      currentTierResults.push(result);

      const statusSymbol = result.code === 0 ? "✔" : "✖";
      const statusText = result.code === 0 ? "PASS" : "FAIL";
      const durationStr = `${result.durationMs.toFixed(1)}ms`;

      console.log(
        `  ${statusSymbol} [${statusText}] ${result.file.padEnd(35)} (${result.passedTests}/${result.totalTests} passed, ${durationStr})`
      );

      if (result.code !== 0) {
        console.error("\n--- Failure Details ---");
        console.error(result.stdout || result.stderr);
        console.error("-----------------------\n");
      }
    }

    tierResults.push({ ...tier, results: currentTierResults });
  }

  const totalDurationMs = performance.now() - overallStartTime;

  console.log("\n================================================================================");
  console.log("  TEST EXECUTION SUMMARY");
  console.log("================================================================================");
  console.log(`  Total Test Suites  : ${totalSuites}`);
  console.log(`  Total Test Cases   : ${totalTests}`);
  console.log(`  Total Passed (✔)   : ${totalPassed}`);
  console.log(`  Total Failed (✖)   : ${totalFailed}`);
  console.log(`  Success Rate       : ${((totalPassed / (totalTests || 1)) * 100).toFixed(1)}%`);
  console.log(`  Total Time         : ${totalDurationMs.toFixed(2)}ms`);
  console.log("================================================================================\n");

  if (totalFailed === 0) {
    console.log("🎉 ALL TESTS PASSED! E2E & Integration Test Suite Verification Complete.\n");
    process.exit(0);
  } else {
    console.error(`💥 ${totalFailed} TEST(S) FAILED. Please review output above.\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
