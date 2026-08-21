"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FileUp, CheckCircle, AlertTriangle, XCircle, ShoppingCart, FileText, Loader2, ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/api";
import { addToCart } from "@/lib/cart-actions";
import { useRouter } from "next/navigation";

export default function BomPage() {
  const [bomText, setBomText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();

  const handleProcessBom = async () => {
    if (!bomText.trim()) return;
    
    setIsProcessing(true);
    setResults([]);
    
    // Parse naive CSV/TSV
    const lines = bomText.split('\n').map(l => l.trim()).filter(l => l);
    
    const parsedItems = lines.map(line => {
      // split by tab or comma
      const parts = line.split(/[\t,]/);
      return {
        mpn: parts[0]?.trim(),
        qty: parseInt(parts[1]?.trim()) || 1
      };
    }).filter(item => item.mpn);

    // Fetch matches
    const newResults = [];
    for (const item of parsedItems) {
      try {
        const res = await getProducts({ aramaMetni: item.mpn });
        const matches = res.urunler?.kayitlar || [];
        
        let status = 'unmatched';
        let selectedProduct = null;
        
        if (matches.length === 1 || (matches.length > 0 && matches[0].ureticiUrunKodu.toLowerCase() === item.mpn.toLowerCase())) {
          status = 'matched';
          selectedProduct = matches[0];
        } else if (matches.length > 1) {
          status = 'multiple';
        }

        newResults.push({
          ...item,
          status,
          matches,
          selectedProduct
        });
      } catch (err) {
        newResults.push({
          ...item,
          status: 'error',
          matches: [],
          selectedProduct: null
        });
      }
    }
    
    setResults(newResults);
    setIsProcessing(false);
  };

  const handleSelectMatch = (index: number, product: any) => {
    const updated = [...results];
    updated[index].selectedProduct = product;
    updated[index].status = 'matched';
    setResults(updated);
  };

  const handleBulkAddToCart = async () => {
    setIsAddingToCart(true);
    const matched = results.filter(r => r.status === 'matched' && r.selectedProduct);
    
    for (const item of matched) {
      // In a real app we'd need the specific packaging ID. Here we mock using product ID.
      // Usually product details need to be fetched to get packages. 
      // For BOM bulk add, we assume a default package ID = item.selectedProduct.id * 10 
      try {
        await addToCart(item.selectedProduct.id * 10, item.qty);
      } catch (e) {
        // ignore individual failures for this demo
      }
    }
    
    setIsAddingToCart(false);
    router.push("/sepet");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader categories={[]} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-brand-navy mb-2 flex items-center gap-3">
          <FileUp size={32} /> BOM Yükleme ve Eşleştirme
        </h1>
        <p className="text-gray-600 mb-8 max-w-3xl">
          Malzeme listenizi (Bill of Materials) buraya yapıştırın. Sistemimiz ürünleri otomatik eşleştirerek sepetinize veya teklif sepetinize eklemenizi sağlar. Her satırda <strong>Ürün Kodu, Miktar</strong> formatını kullanın.
        </p>

        {results.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan mb-4"
              rows={10}
              placeholder="1N4148, 1000&#10;LM358, 500&#10;BilinmeyenUrun, 100"
              value={bomText}
              onChange={(e) => setBomText(e.target.value)}
            ></textarea>
            
            <button
              onClick={handleProcessBom}
              disabled={isProcessing || !bomText.trim()}
              className="bg-brand-navy hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              Eşleştirmeyi Başlat
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-4">
               <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 text-center">
                  <div className="text-2xl font-bold text-green-600">{results.filter(r => r.status === 'matched').length}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Eşleşen</div>
               </div>
               <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{results.filter(r => r.status === 'multiple').length}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Çoklu Sonuç</div>
               </div>
               <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 text-center">
                  <div className="text-2xl font-bold text-red-600">{results.filter(r => r.status === 'unmatched').length}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Bulunamayan</div>
               </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">BOM Satırı (MPN)</th>
                    <th className="px-4 py-3 text-center font-medium">Miktar</th>
                    <th className="px-4 py-3 text-left font-medium">Durum & Seçim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-bold text-gray-900">{r.mpn}</td>
                      <td className="px-4 py-4 text-center">{r.qty}</td>
                      <td className="px-4 py-4">
                        {r.status === 'matched' && (
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle size={18} />
                            <span>{r.selectedProduct?.ureticiUrunKodu} ({r.selectedProduct?.ureticiAd})</span>
                          </div>
                        )}
                        {r.status === 'unmatched' && (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle size={18} />
                            <span>Eşleşme bulunamadı.</span>
                          </div>
                        )}
                        {r.status === 'multiple' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-yellow-600 mb-2">
                              <AlertTriangle size={18} />
                              <span>Birden fazla sonuç bulundu. Doğru ürünü seçin:</span>
                            </div>
                            <select 
                              className="border border-gray-300 rounded p-2 text-sm w-full outline-none focus:ring-1 focus:ring-brand-cyan"
                              onChange={(e) => handleSelectMatch(i, r.matches[parseInt(e.target.value)])}
                              defaultValue=""
                            >
                              <option value="" disabled>Ürün Seçiniz...</option>
                              {r.matches.map((m: any, idx: number) => (
                                <option key={m.id} value={idx}>{m.ureticiUrunKodu} - {m.ureticiAd}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-4 justify-end mt-6">
              <button
                onClick={() => setResults([])}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Yeni BOM Yükle
              </button>
              
              <button
                onClick={handleBulkAddToCart}
                disabled={isAddingToCart || results.filter(r => r.status === 'matched').length === 0}
                className="bg-brand-cyan hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isAddingToCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                Eşleşenleri Sepete Ekle
              </button>

              <button
                disabled={results.filter(r => r.status === 'unmatched').length === 0}
                className="bg-brand-navy hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                <FileText size={18} /> Eşleşmeyenler İçin Teklif İste
              </button>
            </div>
          </div>
        )}
      </main>
      
      <SiteFooter />
    </div>
  );
}
