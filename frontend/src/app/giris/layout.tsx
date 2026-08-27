import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Çevik Elektronik B2B hesabınıza güvenli şekilde giriş yapın.",
};

/**
 * Giriş sayfası dinamik render edilir.
 *
 * Sayfa `useSearchParams()` kullanıyor (devam / kayit / basvuru parametreleri).
 * Statik render'da Next.js bu alt ağacı ISTEMCIYE bırakır: sunucudan gelen
 * HTML'de form HİÇ yoktur, yalnızca Suspense yedeği (dönen çark) bulunur.
 * Yani giriş formu tamamen hydration'a bağımlı hale gelir — JavaScript geç
 * gelirse veya hata alırsa kullanıcı sonsuza kadar dönen çarka bakar.
 *
 * Dinamik render'da arama parametreleri sunucuda çözülür, form HTML içinde
 * gelir ve hydration'dan önce de görünür. Kimlik sayfasının zaten
 * önbelleklenmemesi gerektiği için maliyeti yok.
 */
export const dynamic = "force-dynamic";

export default function GirisLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
