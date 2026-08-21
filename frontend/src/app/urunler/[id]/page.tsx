import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getCategories, type Category } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PdpClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) {
    return { title: "Ürün Bulunamadı | Çevik B2B" };
  }

  return {
    title: `${product.ureticiUrunKodu} - ${product.ureticiAd} | Çevik Elektronik B2B`,
    description: `${product.kisaAciklama || product.ureticiUrunKodu} - Çevik Elektronik B2B Komponent Tedarik ve Mühendislik Platformu.`,
    openGraph: {
      title: `${product.ureticiUrunKodu} | ${product.ureticiAd}`,
      description: product.kisaAciklama,
      images: product.anaGorselUrl ? [product.anaGorselUrl] : [],
    },
  };
}

function findCategoryPath(
  categories: Category[],
  targetId: number,
  currentPath: string[] = []
): string[] | null {
  for (const cat of categories) {
    const newPath = [...currentPath, cat.ad];
    if (cat.id === targetId) {
      return newPath;
    }
    if (cat.altKategoriler && cat.altKategoriler.length > 0) {
      const found = findCategoryPath(cat.altKategoriler, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  // Kategori ağacından kategori yolunu çıkar (Breadcrumb için)
  const kategoriYolu =
    product.kategoriYolu ||
    findCategoryPath(categories, product.kategoriId) ||
    undefined;

  return (
    <div className="flex min-h-screen flex-col bg-yuzey">
      <SiteHeader />
      <div className="flex-1">
        <PdpClient product={product} kategoriYolu={kategoriYolu} />
      </div>
      <SiteFooter />
    </div>
  );
}
