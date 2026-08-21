import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Çevik Elektronik | Elektronik Komponent Tedariki",
  description: "Elektronik komponentlerde geniş ürün yelpazesi, parametrik arama, anlık stok ve kademeli fiyat avantajı.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`}><body>{children}</body></html>;
}
