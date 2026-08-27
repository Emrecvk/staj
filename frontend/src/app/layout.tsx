import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { Bildirimler } from "@/components/ui/bildirim";
import { KarsilastirmaDock } from "@/components/karsilastirma/karsilastirma-dock";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
    <html
      lang="tr"
      data-theme="light"
      className={`${instrumentSans.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        {/* Klavye kullanıcısı her sayfada gezinmeyi atlayabilsin. Odaklanana
            kadar görünmez, odaklanınca sol üstte belirir. */}
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                     focus:rounded-token-girdi focus:bg-marka focus:px-4 focus:py-2
                     focus:text-sm focus:font-semibold focus:text-dolgu-uzeri"
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
