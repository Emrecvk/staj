import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-posta Doğrulama",
  robots: { index: false, follow: false },
};

export default function EpostaDogrulamaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
