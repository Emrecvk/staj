import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BOM Eşleştirme",
  description: "Malzeme listenizi yükleyin, katalog ürünleriyle eşleştirin ve teklif hazırlayın.",
};

export default function BomLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
