"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { updateCartItem, removeCartItem, clearCart, getCart } from "@/lib/cart-actions";
import type { Sepet } from "@/lib/sepet-tipler";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";

export function CartItems({ initialCart }: { initialCart: Sepet }) {
  const [cart, setCart] = useState<Sepet>(initialCart);
  const [loadingItems, setLoadingItems] = useState<Record<number, boolean>>({});
  const [isClearing, setIsClearing] = useState(false);
  const [bosaltOnayi, setBosaltOnayi] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  /**
   * Sepeti sunucudan yeniden okur.
   *
   * Toplamlar yerelde HESAPLANMAZ: fiyat kademeli (miktar arttıkça birim fiyat
   * düşer) ve KDV/kargo sunucuda uygulanır. "miktar × birimFiyat" ile yapılan
   * yerel hesap, miktar bir kademe sınırını geçtiğinde yanlış toplam gösteriyordu.
   */
  const sepetiYenile = async () => {
    const guncel = await getCart();
    if (guncel) setCart(guncel);
  };

  const handleQuantityChange = async (kalemId: number, newMiktar: number) => {
    if (newMiktar < 1) return;

    setLoadingItems(prev => ({ ...prev, [kalemId]: true }));
    setHata(null);
    try {
      const res = await updateCartItem(kalemId, newMiktar);
      if (res.success) await sepetiYenile();
      else setHata(res.message ?? "Miktar güncellenemedi.");
    } finally {
      setLoadingItems(prev => ({ ...prev, [kalemId]: false }));
    }
  };

  const handleRemove = async (kalemId: number) => {
    setLoadingItems(prev => ({ ...prev, [kalemId]: true }));
    setHata(null);
    try {
      const res = await removeCartItem(kalemId);
      if (res.success) await sepetiYenile();
      else setHata("Ürün sepetten çıkarılamadı.");
    } finally {
      setLoadingItems(prev => ({ ...prev, [kalemId]: false }));
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    setHata(null);
    try {
      const res = await clearCart();
      if (res.success) await sepetiYenile();
      else setHata("Sepet boşaltılamadı.");
    } finally {
      setIsClearing(false);
      setBosaltOnayi(false);
    }
  };

  if (!cart.kalemler || cart.kalemler.length === 0) {
    return (
      <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar p-8 text-center text-metin-ucuncul">
        Sepetinizde ürün kalmadı.
      </div>
    );
  }

  return (
    <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar overflow-hidden">
      {hata && (
        <p role="alert" className="border-b border-hata-500 bg-hata-50 p-4 text-sm text-hata-900">{hata}</p>
      )}
      <div className="p-4 border-b border-kenar flex justify-between items-center bg-yuzey">
        <h3 className="font-bold text-metin">Ürünler ({cart.kalemler.length})</h3>
        <button 
          onClick={() => setBosaltOnayi(true)}
          disabled={isClearing}
          className="text-sm text-hata-500 hover:text-hata-600 flex items-center gap-1 font-medium disabled:opacity-50"
        >
          {isClearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Sepeti Boşalt
        </button>
      </div>
      
      <div className="divide-y divide-gray-100">
        {cart.kalemler.map((item) => (
          <div key={item.kalemId} className={`p-6 flex flex-col sm:flex-row gap-6 ${loadingItems[item.kalemId] ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="w-24 h-24 bg-yuzey border border-kenar rounded-md flex-shrink-0 flex items-center justify-center text-xs text-metin-ucuncul font-mono text-center break-all p-2">
              {item.urunKodu}
            </div>
            
            <div className="flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Link href={`/urunler/${item.urunId}`} className="text-lg font-bold text-marka hover:text-vurgu transition-colors">
                    {item.urunKodu}
                  </Link>
                  <p className="text-sm text-metin-ikincil line-clamp-2 mt-1">{item.kisaAciklama}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-metin">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi }).format(item.toplamFiyat)}
                  </div>
                  <div className="text-sm text-metin-ucuncul">
                    Birim: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cart.paraBirimi, maximumFractionDigits: 4 }).format(item.birimFiyat)}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-kenar-guclu rounded-md overflow-hidden bg-yuzey-kart">
                    <button 
                      type="button"
                      onClick={() => handleQuantityChange(item.kalemId, Math.max(item.satistakiKatsayi, item.miktar - item.satistakiKatsayi))}
                      disabled={item.miktar <= item.satistakiKatsayi}
                      className="px-3 py-1 bg-yuzey hover:bg-yuzey-gomulu text-metin-ikincil font-bold disabled:opacity-50"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      readOnly
                      value={item.miktar}
                      className="w-20 text-center text-sm font-bold border-x border-kenar-guclu py-1 focus:outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => handleQuantityChange(item.kalemId, item.miktar + item.satistakiKatsayi)}
                      className="px-3 py-1 bg-yuzey hover:bg-yuzey-gomulu text-metin-ikincil font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-xs text-metin-ucuncul">
                    Adım: <span className="font-semibold text-metin">{item.satistakiKatsayi}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRemove(item.kalemId)}
                  className="text-metin-ucuncul hover:text-hata-500 p-2 transition-colors tooltip-trigger"
                  title="Ürünü Sil"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              {loadingItems[item.kalemId] && (
                 <div className="mt-2 text-xs text-vurgu flex items-center gap-1">
                   <Loader2 size={12} className="animate-spin" /> Güncelleniyor...
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <OnayPenceresi
        acik={bosaltOnayi}
        yikici
        baslik="Sepeti boşalt"
        mesaj="Sepetinizdeki tüm ürünler kaldırılacak. Bu işlem geri alınamaz."
        onayMetni="Sepeti boşalt"
        islemSuruyor={isClearing}
        onOnayla={handleClear}
        onIptal={() => setBosaltOnayi(false)}
      />
    </div>
  );
}
