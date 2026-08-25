import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Kapsayici } from "@/components/ui/yuzey";
import { AraclarClient } from "@/components/araclar/araclar-client";
import { getCategories } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mühendis Araçları",
  description:
    "Direnç renk kodu, Ohm yasası, kondansatör kodu ve LED seri direnci hesaplayıcıları — elektronik tasarım için hızlı araçlar.",
};

export default async function AraclarPage() {
  const cookieStore = await cookies();
  const seciliParaBirimi = cookieStore.get("site_para_birimi")?.value === "USD" ? "USD" : "TRY";
  const kategoriler = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader categories={kategoriler} initialCurrency={seciliParaBirimi} />

      <main id="icerik" className="flex-grow py-8">
        <Kapsayici>
          <AraclarClient />
        </Kapsayici>
      </main>

      <SiteFooter />
    </div>
  );
}
