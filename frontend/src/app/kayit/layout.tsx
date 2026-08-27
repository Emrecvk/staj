import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hesap Oluştur",
  description: "Çevik Elektronik B2B platformunda bireysel hesap oluşturun veya firma başvurusu yapın.",
};

export default function KayitLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
