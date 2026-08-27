/**
 * Eksik, bozuk veya bitmesine belirtilen süreden az kalmış JWT yenilenmelidir.
 * İmzayı doğrulamaz; bu yardımcı yalnızca istemci yönlendirmesini iyileştirir.
 * Yetkilendirme ve imza doğrulama her zaman API tarafındadır.
 */
export function tokenYenilenmeliMi(
  token: string | undefined,
  erkenYenilemeSaniyesi = 30,
  simdiMs = Date.now(),
): boolean {
  if (!token) return true;

  try {
    const govde = token.split('.')[1];
    if (!govde) return true;

    const base64 = govde.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    const claims = JSON.parse(json) as { exp?: unknown };
    return typeof claims.exp !== 'number' ||
      claims.exp <= Math.floor(simdiMs / 1000) + erkenYenilemeSaniyesi;
  } catch {
    return true;
  }
}
