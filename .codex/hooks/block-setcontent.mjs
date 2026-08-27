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

  const KAYNAK = "cs|csproj|tsx|ts|jsx|mjs|json|md|razor|cshtml";

  // İfade sınırı: komut başı ya da ; | & { ( \n sonrası. Salt "bahis"leri
  // (commit mesajı, echo, yorum) elemek için cmdlet'in GERÇEK bir çağrı
  // konumunda olması gerekir; bir sonraki sınıra kadarki argüman parçasında
  // da kaynak-dosya yolu bulunmalı.
  const SINIR = "(?:^|[;|&{(\\n])";
  const ARG = "[^;|&}\\n]*";
  const cmdletYazma = new RegExp(
    `${SINIR}\\s*(?:Set-Content|Add-Content|Out-File|sc|ac)\\b${ARG}\\.(?:${KAYNAK})\\b`,
    "i"
  );

  // Yönlendirme ile kaynak dosyaya yazma: ... > foo.cs / >> bar.tsx
  const yonlendirmeYazma = new RegExp(`>>?\\s*['"]?[^'"\\s|;&<>]*\\.(?:${KAYNAK})\\b`, "i");

  if (!cmdletYazma.test(cmd) && !yonlendirmeYazma.test(cmd)) process.exit(0);

  process.stderr.write(
    "ENGELLENDI: PowerShell Set-Content/Out-File/Add-Content, Türkçe karakter " +
      "içeren kaynak dosyalarda mojibake'e yol açar (CLAUDE.md encoding hazard). " +
      "Bu dosyayı UTF-8 yazan Write/Edit araçlarıyla düzenle; kabuk yönlendirmesi kullanma.\n"
  );
  process.exit(2);
});
