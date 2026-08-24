#!/usr/bin/env node
// PostToolUse: frontend/ altındaki bir .ts/.tsx düzenlendiğinde ESLint çalıştır.
// Amaç: regresyonları CI yerine düzenleme anında yüzeye çıkarmak.
//
// stdin: PostToolUse hook JSON payload'ı ({ tool_input: { file_path } })
// exit 2 => lint çıktısını Claude'a geri besler (bloklamaz, uyarır).

import { spawnSync } from "node:child_process";
import path from "node:path";

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    process.exit(0);
  }

  const fp = payload?.tool_input?.file_path ?? "";
  if (typeof fp !== "string" || fp.length === 0) process.exit(0);

  const norm = fp.replace(/\\/g, "/");
  const isFrontend = norm.includes("/frontend/");
  const isLintable = /\.(ts|tsx|jsx|mjs)$/i.test(norm);
  if (!isFrontend || isLintable === false) process.exit(0);

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const frontendDir = path.join(projectDir, "frontend");

  const res = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "lint", "--", norm],
    { cwd: frontendDir, encoding: "utf8" }
  );

  const out = ((res.stdout || "") + (res.stderr || "")).trim();
  if (res.status && res.status !== 0) {
    process.stderr.write("ESLint uyarıları (" + norm + "):\n" + out + "\n");
    process.exit(2);
  }
  process.exit(0);
});
