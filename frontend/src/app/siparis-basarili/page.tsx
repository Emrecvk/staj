"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const siparisNo = searchParams.get("siparisNo") || "Bilinmiyor";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center max-w-2xl mx-auto">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle2 size={64} className="text-green-600" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Siparişiniz Alındı!</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Siparişiniz başarıyla oluşturuldu. Siparişinizin durumunu &ldquo;Siparişlerim&rdquo; sayfasından takip edebilirsiniz.
      </p>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 w-full mb-8">
        <div className="text-sm text-gray-500 mb-1">Sipariş Numarası</div>
        <div className="text-2xl font-bold text-brand-navy font-mono tracking-wider">{siparisNo}</div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link href="/profil/siparisler" className="bg-brand-navy hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-md transition-colors flex items-center justify-center gap-2">
          <Package size={18} /> Siparişlerimi Gör
        </Link>
        <Link href="/urunler" className="bg-white border border-brand-cyan text-brand-cyan hover:bg-cyan-50 font-bold py-3 px-8 rounded-md transition-colors flex items-center justify-center gap-2">
          Alışverişe Devam Et <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader categories={[]} />
      <main className="flex-grow container mx-auto px-4 py-16">
        <Suspense fallback={
          <div className="flex items-center justify-center p-24">
            <Loader2 size={48} className="text-brand-cyan animate-spin" />
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
