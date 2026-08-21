import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText, Download, Heart, ArrowLeftRight, CheckCircle2, ShieldCheck, Box, Package, Truck, Search, Info } from "lucide-react";
import { getProduct, getCategories } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const [product, categories] = await Promise.all([
    getProduct(resolvedParams.id),
    getCategories()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader categories={categories} />
      
      <main className="flex-grow pb-16">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-brand-cyan">Ana Sayfa</Link>
            <ChevronRight size={14} />
            <Link href="/urunler" className="hover:text-brand-cyan">Ürünler</Link>
            <ChevronRight size={14} />
            <Link href={`/urunler?aramaMetni=${product.ureticiAd}`} className="hover:text-brand-cyan">{product.ureticiAd}</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">{product.ureticiUrunKodu}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Main Product Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="flex flex-col lg:flex-row">
              {/* Product Visuals */}
              <div className="w-full lg:w-2/5 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-8 mb-4 relative">
                  {product.gorselTemsiliMi && (
                    <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                      <Info size={12} /> Görsel temsilidir
                    </div>
                  )}
                  {/* Placeholder image */}
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                    <Box size={64} className="mb-4 opacity-50" />
                    <span className="font-mono text-center break-all">{product.ureticiUrunKodu}</span>
                  </div>
                </div>
                
                {product.gorselUrlleri && product.gorselUrlleri.length > 0 && (
                  <div className="flex gap-2 w-full overflow-x-auto pb-2 custom-scrollbar">
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-50 border-2 border-brand-cyan rounded-md"></div>
                    {product.gorselUrlleri.slice(1).map((_, i) => (
                      <div key={i} className="w-20 h-20 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-md"></div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Product Details & Actions */}
              <div className="w-full lg:w-3/5 p-6 lg:p-8 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/urunler?aramaMetni=${product.ureticiAd}`} className="text-brand-cyan font-bold uppercase tracking-wider text-sm hover:underline">
                    {product.ureticiAd}
                  </Link>
                  
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors tooltip-trigger" title="Favorilere Ekle">
                      <Heart size={20} />
                    </button>
                    <button className="text-gray-400 hover:text-brand-cyan bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors tooltip-trigger" title="Karşılaştırmaya Ekle">
                      <ArrowLeftRight size={20} />
                    </button>
                  </div>
                </div>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.ureticiUrunKodu}</h1>
                <p className="text-lg text-gray-600 mb-6">{product.kisaAciklama}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Üretici / Marka</div>
                    <div className="font-semibold">{product.ureticiAd}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">MPN</div>
                    <div className="font-semibold break-all">{product.ureticiUrunKodu}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Stok Durumu</div>
                    <div className="font-semibold text-green-600 flex items-center gap-1.5">
                      <CheckCircle2 size={16} /> Stokta
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Tahmini Teslimat</div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <Truck size={16} className="text-gray-400" /> Aynı Gün Kargo
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={18} className="text-brand-cyan" /> 
                    Ambalaj ve Fiyatlandırma
                  </h3>
                  
                  <div className="space-y-6">
                    {product.ambalajlarVeFiyatlar?.map(ambalaj => (
                      <div key={ambalaj.ambalajId} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex flex-wrap justify-between items-center border-b border-gray-200 gap-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-brand-navy">{ambalaj.ad}</span>
                            <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">MOQ: {ambalaj.moq}</span>
                            <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">SPQ: {ambalaj.mpq}</span>
                            <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Adım: {ambalaj.katlamaMiktari}</span>
                          </div>
                          
                          <div className="text-sm font-medium">
                            <span className="text-gray-500">Stok: </span>
                            <span className={ambalaj.stokMiktari > 0 ? "text-green-600" : "text-red-500"}>
                              {ambalaj.stokMiktari.toLocaleString('tr-TR')} adet
                            </span>
                            {ambalaj.gelecekStokMiktari > 0 && (
                              <span className="text-gray-500 ml-2 text-xs block sm:inline">
                                (+{ambalaj.gelecekStokMiktari} yolda)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          <div className="overflow-x-auto custom-scrollbar pb-2">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-100">
                                  <th className="font-medium pb-2 pr-4">Miktar (Adet)</th>
                                  <th className="font-medium pb-2 text-right">Birim Fiyat</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ambalaj.fiyatlar.map((fiyat, i) => (
                                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-2 pr-4">
                                      {fiyat.minMiktar.toLocaleString('tr-TR')} 
                                      {fiyat.maxMiktar ? ` - ${fiyat.maxMiktar.toLocaleString('tr-TR')}` : '+'}
                                    </td>
                                    <td className="py-2 text-right font-semibold text-brand-navy">
                                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: fiyat.paraBirimi, maximumFractionDigits: 4 }).format(fiyat.birimFiyat)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3">
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                min={ambalaj.moq} 
                                step={ambalaj.katlamaMiktari}
                                defaultValue={ambalaj.moq}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-cyan text-center font-medium"
                              />
                            </div>
                            <button className="w-full bg-brand-cyan hover:bg-opacity-90 text-white font-bold py-3 rounded-md transition-colors">
                              Sepete Ekle
                            </button>
                            <p className="text-[10px] text-gray-500 text-center">En az {ambalaj.moq} adet, {ambalaj.katlamaMiktari} ve katları eklenebilir.</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!product.ambalajlarVeFiyatlar || product.ambalajlarVeFiyatlar.length === 0) && (
                       <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-sm">
                         Bu ürün için fiyatlandırma bilgisi bulunmamaktadır. Lütfen teklif isteyiniz.
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Teknik Özellikler */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Search size={20} className="text-brand-cyan" /> Teknik Özellikler
                </h2>
                
                {product.ozellikler && Object.keys(product.ozellikler).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(product.ozellikler).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 md:last:border-b-0">
                        <span className="text-gray-500 text-sm">{key}</span>
                        <span className="font-medium text-gray-900 text-sm text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Teknik özellik bilgisi bulunamadı.</p>
                )}
                
                {product.detayliAciklama && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Ürün Detayı</h3>
                    <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.detayliAciklama }} />
                  </div>
                )}
              </section>

              {/* Dokümanlar */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText size={20} className="text-brand-cyan" /> Dokümanlar
                </h2>
                
                {product.dokumanlar && product.dokumanlar.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.dokumanlar.map((doc, i) => (
                      <a 
                        key={i} 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-brand-cyan hover:bg-cyan-50 transition-colors group"
                      >
                        <div className="bg-red-100 text-red-600 p-2 rounded">
                          <FileText size={24} />
                        </div>
                        <div className="flex-grow">
                          <div className="font-semibold text-sm group-hover:text-brand-cyan transition-colors line-clamp-1">{doc.baslik}</div>
                          <div className="text-xs text-gray-500">PDF Document</div>
                        </div>
                        <Download size={18} className="text-gray-400 group-hover:text-brand-cyan" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Bu ürün için doküman bulunmamaktadır.</p>
                )}
              </section>
            </div>
            
            {/* Sağ Sütun */}
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <ShieldCheck size={20} /> %100 Orijinal Ürün
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Çevik Elektronik yetkili distribütör kanalından tedarik edilmiştir. Ürünler izlenebilirlik sertifikasına sahiptir.
                </p>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">Sertifikaları görüntüle</a>
              </div>
              
              {/* Benzer Ürünler vs - Sadece var olanları göster (mock olarak) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-bold text-brand-navy">Popüler Alternatifler</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {/* Mock alternatives data - normally this comes from product.muadiller */}
                  {[1, 2, 3].map(i => (
                    <Link key={i} href="#" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 bg-white border border-gray-200 rounded flex items-center justify-center text-xs text-gray-400 flex-shrink-0">IMG</div>
                      <div>
                        <div className="text-xs text-brand-cyan font-bold">{product.ureticiAd}</div>
                        <div className="font-semibold text-sm text-gray-900">{product.ureticiUrunKodu}-ALT{i}</div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 ml-auto" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
