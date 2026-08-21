"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type PackagingOption } from "@/lib/api";
import { addToCart } from "@/lib/cart-actions";
import { Loader2 } from "lucide-react";

export function AddToCartForm({ ambalaj }: { ambalaj: PackagingOption }) {
  const [miktar, setMiktar] = useState(ambalaj.moq);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddToCart = async () => {
    // Validate rules
    if (miktar < ambalaj.moq) {
      setError(`En az MOQ miktarı (${ambalaj.moq}) kadar ekleyebilirsiniz.`);
      return;
    }
    
    // Check katlama miktarı
    // miktar - moq must be divisible by katlamaMiktari, or just miktar divisible by katlamaMiktari depending on rule.
    // Usually it's: miktar must be a multiple of katlamaMiktari, and >= moq.
    if (miktar % ambalaj.katlamaMiktari !== 0) {
      setError(`Miktar, katlama miktarının (${ambalaj.katlamaMiktari}) katları olmalıdır.`);
      return;
    }

    if (miktar > ambalaj.stokMiktari + ambalaj.gelecekStokMiktari) {
       // Just a warning or we can allow if backorder is allowed, assuming we check stock
       // For this task, we will just proceed and let the server handle or allow it if no strict limit on frontend.
    }

    setError(null);
    setIsPending(true);

    try {
      const res = await addToCart(ambalaj.ambalajId, miktar);
      if (res.success) {
        router.push("/sepet");
        router.refresh();
      } else {
        setError(res.message || "Sepete eklenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3">
      {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{error}</div>}
      <div className="flex gap-2">
        <input 
          type="number" 
          min={ambalaj.moq} 
          step={ambalaj.katlamaMiktari}
          value={miktar}
          onChange={(e) => setMiktar(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-cyan text-center font-medium"
        />
      </div>
      <button 
        onClick={handleAddToCart}
        disabled={isPending}
        className="w-full bg-brand-cyan hover:bg-opacity-90 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        Sepete Ekle
      </button>
      <p className="text-[10px] text-gray-500 text-center">
        En az {ambalaj.moq} adet, {ambalaj.katlamaMiktari} ve katları eklenebilir.
      </p>
    </div>
  );
}
