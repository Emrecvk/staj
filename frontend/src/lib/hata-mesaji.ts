/**
 * API hata gövdesinden kullanıcıya gösterilebilir bir mesaj çıkarır.
 *
 * İki gövde biçimi dolaşımda:
 *   - ProblemDetails  → { title, detail, status }
 *   - Kimlik uçları   → { mesaj }
 *
 * DİKKAT: Geliştirme ortamında `Program.cs` içindeki `UseExceptionHandler`,
 * `detail` alanına istisnanın TAMAMINI (`ToString()` — yığın izi dahil) yazar.
 * Bu değeri olduğu gibi ekrana basmak kullanıcıya C# yığın izi göstermek
 * demektir. Bu yüzden yalnızca ilk satır alınır ve baştaki
 * "Ad.Alani.TipAdiException: " öneki atılır.
 */
export function problemMesaji(govde: unknown, varsayilan: string): string {
  const p = govde as { detail?: unknown; title?: unknown; mesaj?: unknown } | null | undefined;

  const ham = [p?.detail, p?.mesaj, p?.title].find(
    (deger): deger is string => typeof deger === "string" && deger.trim().length > 0,
  );

  if (!ham) return varsayilan;

  const ilkSatir = ham.split("\n")[0].trim();
  const temiz = ilkSatir.replace(/^[\w.+]*Exception:\s*/, "").trim();

  return temiz.length > 0 ? temiz : varsayilan;
}

/**
 * FluentValidation, alan adlarını DTO'daki gibi PascalCase döndürür
 * ("Sifre", "Eposta", "FirmaAdi"). Formlardaki `name` öznitelikleri ise
 * camelCase. Eşleşme kurulmazsa doğrulama hataları HİÇ görünmez —
 * kullanıcı hangi alanı düzelteceğini bilmeden formla baş başa kalır.
 */
export function dogrulamaHatalariniEsle(errors: unknown): Record<string, string[]> | undefined {
  if (!errors || typeof errors !== "object") return undefined;

  const eslenmis: Record<string, string[]> = {};
  for (const [alan, mesajlar] of Object.entries(errors as Record<string, unknown>)) {
    if (!Array.isArray(mesajlar)) continue;
    const anahtar = alan.charAt(0).toLowerCase() + alan.slice(1);
    eslenmis[anahtar] = mesajlar.map(String);
  }

  return Object.keys(eslenmis).length > 0 ? eslenmis : undefined;
}
