import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sepet",
  robots: { index: false, follow: false },
};

export default function SepetLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
