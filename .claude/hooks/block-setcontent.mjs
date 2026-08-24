#!/usr/bin/env node
// PreToolUse guard: Set-Content / Out-File Türkçe metin içeren kaynak dosyalarda
// mojibake'e yol açıyor (bkz. CLAUDE.md "encoding hazard"). Bu kabuk komutlarının
// .cs / .tsx / .ts / .csproj gibi kaynakları hedeflemesini engelle.
//
// stdin: PreToolUse hook JSON payload'ı ({ tool_name, tool_input: { command } })
// exit 2 + stderr => çağrıyı bloklar ve gerekçeyi Claude'a geri besler.

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    process.exit(0); // Payload çözülemiyorsa bloklama.
  }

  const cmd = payload?.tool_input?.command ?? "";
  if (typeof cmd !== "string" || cmd.length === 0) process.exit(0);

  // Set-Content / Out-File / Add-Content (alias: sc, ac) kullanımı.
  const cmdletHit = /\b(Set-Content|Add-Content|Out-File)\b|(^|[;|&\s])(sc|ac)\s+/i.test(cmd);
  if (!cmdletHit) process.exit(0);

  // Kaynak uzantılarını hedefliyor mu?
  const kaynakUzanti = /\.(cs|csproj|tsx|ts|jsx|mjs|json|md|razor|cshtml)\b/i.test(cmd);
  if (!kaynakUzanti) process.exit(0);

  process.stderr.write(
    "ENGELLENDI: PowerShell Set-Content/Out-File/Add-Content, Türkçe karakter " +
      "içeren kaynak dosyalarda mojibake'e yol açar (CLAUDE.md encoding hazard). " +
      "Bu dosyayı UTF-8 yazan Write/Edit araçlarıyla düzenle; kabuk yönlendirmesi kullanma.\n"
  );
  process.exit(2);
});
