import { getProducts } from "@/lib/api";
import { ProductListingClient } from "./client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCategories } from "@/lib/api";

export default async function UrunlerPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedParams = await searchParams;
  
  // Convert searchParams to a flat record for the API
  const apiParams: Record<string, string | string[]> = {};
  
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (value !== undefined) {
      apiParams[key] = value;
    }
  });

  // Default sayfaNo to 1 if not provided
  if (!apiParams.sayfaNo) apiParams.sayfaNo = "1";
  // Default sayfaBoyutu
  if (!apiParams.sayfaBoyutu) apiParams.sayfaBoyutu = "24";

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts(apiParams)
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader categories={categories} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-navy">Ürün Kataloğu</h1>
          {resolvedParams.aramaMetni && (
            <p className="text-gray-500 mt-1">"{resolvedParams.aramaMetni}" için sonuçlar gösteriliyor</p>
          )}
        </div>
        
        <ProductListingClient 
          initialData={result} 
          searchParams={resolvedParams}
        />
      </main>
      
      <SiteFooter />
    </div>
  );
}
