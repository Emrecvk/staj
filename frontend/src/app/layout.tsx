import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Bildirimler } from "@/components/ui/bildirim";
import { KarsilastirmaDock } from "@/components/karsilastirma/karsilastirma-dock";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Çevik Elektronik | Elektronik Komponent Tedariki",
    template: "%s | Çevik Elektronik",
  },
  description:
    "Elektronik komponentlerde geniş ürün yelpazesi, parametrik arama, anlık stok ve kademeli fiyat avantajı.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Çevik Elektronik",
    title: "Çevik Elektronik | Elektronik Komponent Tedariki",
    description:
      "Parametrik arama, anlık stok ve kademeli fiyatla elektronik komponent tedariki.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {/* Klavye kullanıcısı her sayfada gezinmeyi atlayabilsin. Odaklanana
            kadar görünmez, odaklanınca sol üstte belirir. */}
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                     focus:rounded-[var(--radius-girdi)] focus:bg-marka focus:px-4 focus:py-2
                     focus:text-sm focus:font-semibold focus:text-metin-ters"
        >
          İçeriğe geç
        </a>
        {children}
        <KarsilastirmaDock />
        <Bildirimler />
      </body>
    </html>
  );
}
