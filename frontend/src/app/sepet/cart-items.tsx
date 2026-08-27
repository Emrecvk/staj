"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { clearCart, getCart, removeCartItem, updateCartItem } from "@/lib/cart-actions";
import type { Sepet } from "@/lib/sepet-tipler";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";
import { bildir } from "@/components/ui/bildirim";
import { paraBicimle } from "@/lib/miktar-kurali";
import { notifyCartUpdated } from "@/lib/stores/header-state";
import { UrunGorseli } from "@/components/urun-gorseli";

export function CartItems({ initialCart, girisYapildiMi }: { initialCart: Sepet; girisYapildiMi: boolean }) {
  const [cart, setCart] = useState(initialCart);
  const [loadingItems, setLoadingItems] = useState<Record<number, boolean>>({});
  const [isClearing, setIsClearing] = useState(false);
  const [bosaltOnayi, setBosaltOnayi] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const sepetiYenile = async () => {
    const guncel = await getCart();
    if (guncel) setCart(guncel);
    // Başlıktaki sepet rozeti ayrı bir bileşen; olay gönderilmezse sayfada
    // miktar değişse bile rozet eski değerde kalır.
    notifyCartUpdated();
  };

  const miktariGuncelle = async (kalemId: number, miktar: number) => {
    if (miktar < 1) return;
    setLoadingItems((onceki) => ({ ...onceki, [kalemId]: true }));
    setHata(null);
    try {
      const sonuc = await updateCartItem(kalemId, miktar);
      if (sonuc.success) await sepetiYenile();
      else setHata(sonuc.message ?? "Miktar güncellenemedi.");
    } finally {
      setLoadingItems((onceki) => ({ ...onceki, [kalemId]: false }));
    }
  };

  const kalemiKaldir = async (kalemId: number) => {
    setLoadingItems((onceki) => ({ ...onceki, [kalemId]: true }));
    setHata(null);
    try {
      const sonuc = await removeCartItem(kalemId);
      if (sonuc.success) {
        await sepetiYenile();
        bildir.bilgi("Ürün sepetten kaldırıldı.");
      } else setHata(sonuc.message ?? "Ürün sepetten çıkarılamadı.");
    } finally {
      setLoadingItems((onceki) => ({ ...onceki, [kalemId]: false }));
    }
  };

  const sepetiBosalt = async () => {
    setIsClearing(true);
    setHata(null);
    try {
      const sonuc = await clearCart();
      if (sonuc.success) {
        await sepetiYenile();
        bildir.bilgi("Sepet boşaltıldı.");
      } else setHata(sonuc.message ?? "Sepet boşaltılamadı.");
    } finally {
      setIsClearing(false);
      setBosaltOnayi(false);
    }
  };

  const bosMu = cart.kalemler.length === 0;
  const araToplam = cart.genelToplam || 0;
  const vergiTutari = Math.round(araToplam * 0.2 * 100) / 100;
  const toplam = Math.round((araToplam + vergiTutari) * 100) / 100;

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-start">
      <section aria-label="Sepet içeriği" className="min-w-0">
        {hata && (
          <div role="alert" className="mb-4 flex items-center gap-2 rounded-token-girdi border border-hata-500/30 bg-hata-50 p-4 text-sm text-hata-600">
            <AlertCircle size={18} className="shrink-0" aria-hidden="true" />
            {hata}
          </div>
        )}

        {bosMu ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center px-5 py-12 text-center">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-vurgu-zemin text-vurgu sm:h-40 sm:w-40">
              <ShoppingCart size={72} strokeWidth={1.25} aria-hidden="true" />
              <span className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-marka text-lg font-bold text-dolgu-uzeri">0</span>
            </div>
            <h2 className="mt-8 text-xl font-bold text-metin-marka">Sepetinizde ürün bulunmamaktadır.</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-metin-ikincil">Kataloğumuzdaki ürünleri inceleyerek alışverişe başlayabilirsiniz.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-token-panel border border-kenar bg-yuzey-kart shadow-token-hafif">
            <div className="flex items-center justify-between gap-4 border-b border-kenar px-4 py-4 sm:px-5">
              <h2 className="font-bold text-metin-marka">Sepetim <span className="ml-1 text-sm font-medium text-metin-ucuncul">({cart.kalemler.length} ürün)</span></h2>
              <button type="button" onClick={() => setBosaltOnayi(true)} disabled={isClearing} className="flex min-h-11 items-center gap-2 rounded-token-girdi px-3 text-sm font-semibold text-hata-600 transition-colors hover:bg-hata-50 disabled:opacity-50">
                {isClearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Sepeti Boşalt
              </button>
            </div>

            <div className="divide-y divide-kenar">
              {cart.kalemler.map((item) => {
                const adim = item.satistakiKatsayi || 1;
                const yukleniyor = Boolean(loadingItems[item.kalemId]);
                return (
                  <article key={item.kalemId} className={`grid gap-4 p-4 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:p-5 ${yukleniyor ? "pointer-events-none opacity-55" : ""}`}>
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-token-girdi border border-kenar bg-yuzey-gomulu text-metin-ucuncul">
                      <UrunGorseli src={item.anaGorselUrl} urunKodu={item.urunKodu} className="p-2 [&>span]:hidden" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/urunler/${item.urunId}`} className="font-mono text-sm font-bold text-metin-marka hover:text-vurgu sm:text-base">{item.urunKodu}</Link>
                      <p className="mt-1 line-clamp-2 text-sm text-metin-ikincil">{item.kisaAciklama || "Elektronik komponent"}</p>
                      <p className="mt-2 text-xs text-metin-ucuncul">Minimum ve artış miktarı: {adim} adet</p>
                      <div className="mt-4 inline-flex min-h-11 items-center overflow-hidden rounded-token-girdi border border-kenar-guclu bg-yuzey-kart">
                        <button type="button" onClick={() => miktariGuncelle(item.kalemId, Math.max(adim, item.miktar - adim))} disabled={item.miktar <= adim} aria-label="Miktarı azalt" className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-yuzey-gomulu disabled:opacity-35"><Minus size={15} /></button>
                        <span className="flex h-11 min-w-16 items-center justify-center border-x border-kenar-guclu px-3 font-mono text-sm font-bold tabular-nums">{item.miktar}</span>
                        <button type="button" onClick={() => miktariGuncelle(item.kalemId, item.miktar + adim)} aria-label="Miktarı artır" className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-yuzey-gomulu"><Plus size={15} /></button>
                      </div>
                    </div>
                    <div className="flex min-w-36 flex-row items-end justify-between gap-4 border-t border-kenar pt-4 sm:flex-col sm:border-0 sm:pt-0 sm:text-right">
                      <div>
                        <p className="font-mono text-lg font-bold tabular-nums text-metin-marka">{paraBicimle(item.toplamFiyat, cart.paraBirimi)}</p>
                        <p className="mt-1 text-xs text-metin-ucuncul">Birim: {paraBicimle(item.birimFiyat, cart.paraBirimi, 4)}</p>
                      </div>
                      <button type="button" onClick={() => kalemiKaldir(item.kalemId)} aria-label={`${item.urunKodu} ürününü sepetten kaldır`} className="flex min-h-11 items-center gap-2 rounded-token-girdi px-3 text-sm font-semibold text-hata-600 transition-colors hover:bg-hata-50"><Trash2 size={16} /> Kaldır</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <aside className="rounded-token-panel border border-kenar bg-yuzey-gomulu p-5 shadow-token-hafif lg:sticky lg:top-24 sm:p-6" aria-labelledby="sepet-ozeti-baslik">
        <h2 id="sepet-ozeti-baslik" className="border-b border-kenar pb-5 text-xl font-bold text-metin-marka">Sepet Özeti</h2>
        <dl className="space-y-5 py-5">
          <div className="flex items-start justify-between gap-4"><dt className="text-metin-ikincil">Ara Toplam</dt><dd className="font-mono text-lg font-semibold tabular-nums text-metin">{paraBicimle(araToplam, cart.paraBirimi)}</dd></div>
          <div className="flex items-start justify-between gap-4"><dt className="text-metin-ikincil">Vergi Tutarı</dt><dd className="font-mono text-lg font-semibold tabular-nums text-metin">{paraBicimle(vergiTutari, cart.paraBirimi)}</dd></div>
          <div className="flex items-start justify-between gap-4"><dt className="text-metin-ikincil">Kargo</dt><dd className={`text-sm font-bold ${araToplam >= 1500 ? "text-basari-600" : "text-metin"}`}>{araToplam >= 1500 ? "Ücretsiz" : "Ödeme adımında"}</dd></div>
        </dl>
        <div className="flex items-end justify-between gap-4 border-y border-kenar py-5"><span className="text-lg text-metin-ikincil">Toplam</span><span className="font-mono text-2xl font-extrabold tabular-nums text-metin-marka">{paraBicimle(toplam, cart.paraBirimi)}</span></div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <Link href="/urunler" className="flex min-h-12 items-center justify-center gap-2 rounded-token-girdi border border-kenar-guclu bg-yuzey-kart px-4 text-center text-sm font-bold text-metin transition-colors hover:border-vurgu hover:text-vurgu"><ArrowLeft size={16} /> Alışverişe Dön</Link>
          {bosMu ? (
            <button type="button" disabled className="flex min-h-12 items-center justify-center gap-2 rounded-token-girdi bg-navy-300 px-4 text-sm font-bold text-white opacity-65">Ödeme Yap <ArrowRight size={16} /></button>
          ) : (
            <Link href="/odeme" className="flex min-h-12 items-center justify-center gap-2 rounded-token-girdi bg-marka px-4 text-center text-sm font-bold text-dolgu-uzeri transition-colors hover:bg-marka-hover">Ödeme Yap <ArrowRight size={16} /></Link>
          )}
        </div>

        {!girisYapildiMi && <p className="mt-8 text-center text-sm leading-6 text-metin-ikincil">Zaten kayıtlı mısınız? <Link href="/giris" className="font-bold text-vurgu hover:text-vurgu-guclu">Giriş yapmak için tıklayın</Link></p>}
      </aside>

      <OnayPenceresi acik={bosaltOnayi} yikici baslik="Sepeti Boşalt" mesaj="Sepetinizdeki tüm ürünler kaldırılacak. Bu işlem geri alınamaz." onayMetni="Sepeti Boşalt" islemSuruyor={isClearing} onOnayla={sepetiBosalt} onIptal={() => setBosaltOnayi(false)} />
    </div>
  );
}
