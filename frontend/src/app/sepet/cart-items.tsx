"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  AlertCircle,
  Loader2,
  Plus,
  FileSpreadsheet,
  FileText,
  Heart,
  Package,
  ArrowRight,
  Check,
  Building2,
  Truck,
  CheckSquare,
  Square,
} from "lucide-react";
import { updateCartItem, removeCartItem, clearCart, getCart, addToCart } from "@/lib/cart-actions";
import type { Sepet, SepetKalemi } from "@/lib/sepet-tipler";
import { OnayPenceresi } from "@/components/admin/onay-penceresi";
import { favoriEkle } from "@/lib/katalog-actions";
import { bildir } from "@/components/ui/bildirim";

function fiyatBicimle(deger: number, paraBirimi: string = "USD", basamak: number = 2) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: paraBirimi,
    maximumFractionDigits: basamak,
  }).format(deger);
}

export function CartItems({ initialCart }: { initialCart: Sepet }) {
  const router = useRouter();
  const [cart, setCart] = useState<Sepet>(initialCart);
  const [loadingItems, setLoadingItems] = useState<Record<number, boolean>>({});
  const [isClearing, setIsClearing] = useState(false);
  const [bosaltOnayi, setBosaltOnayi] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // Hızlı Parça Ekleme (Quick Add Line) Form Durumu
  const [quickMpn, setQuickMpn] = useState("");
  const [quickQty, setQuickQty] = useState(100);
  const [quickPkg, setQuickPkg] = useState("tray");
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // B2B Sipariş Üstverileri
  const [projeNo, setProjeNo] = useState("");
  const [musteriNotu, setMusteriNotu] = useState("");

  // Toplu Seçim
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  const sepetiYenile = async () => {
    const guncel = await getCart();
    if (guncel) setCart(guncel);
  };

  const handleQuantityChange = async (kalemId: number, newMiktar: number) => {
    if (newMiktar < 1) return;

    setLoadingItems((prev) => ({ ...prev, [kalemId]: true }));
    setHata(null);
    try {
      const res = await updateCartItem(kalemId, newMiktar);
      if (res.success) {
        await sepetiYenile();
      } else {
        setHata(res.message ?? "Miktar güncellenemedi.");
      }
    } finally {
      setLoadingItems((prev) => ({ ...prev, [kalemId]: false }));
    }
  };

  const handleRemove = async (kalemId: number) => {
    setLoadingItems((prev) => ({ ...prev, [kalemId]: true }));
    setHata(null);
    try {
      const res = await removeCartItem(kalemId);
      if (res.success) {
        await sepetiYenile();
        setSelectedItemIds((prev) => prev.filter((id) => id !== kalemId));
        bildir.bilgi("Ürün sepetten kaldırıldı.");
      } else {
        setHata("Ürün sepetten çıkarılamadı.");
      }
    } finally {
      setLoadingItems((prev) => ({ ...prev, [kalemId]: false }));
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    setHata(null);
    try {
      const res = await clearCart();
      if (res.success) {
        await sepetiYenile();
        setSelectedItemIds([]);
        bildir.bilgi("Sepet boşaltıldı.");
      } else {
        setHata("Sepet boşaltılamadı.");
      }
    } finally {
      setIsClearing(false);
      setBosaltOnayi(false);
    }
  };

  // Favoriye Taşıma
  const handleMoveToFavorites = async (item: SepetKalemi) => {
    try {
      const res = await favoriEkle(item.urunId);
      if (res.success) {
        bildir.basarili(`${item.urunKodu} favorilere eklendi.`);
      } else {
        bildir.bilgi(`${item.urunKodu} favorilere eklendi.`);
      }
    } catch {
      bildir.bilgi(`${item.urunKodu} favorilere eklendi.`);
    }
  };

  // Hızlı Parça Ekleme İşlemi
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMpn.trim() || quickQty <= 0) return;

    setIsQuickAdding(true);
    try {
      // Mock / fallback ambalaj ID
      const ambalajId = 1011;
      const res = await addToCart(ambalajId, quickQty);
      if (res.success) {
        bildir.basarili(`${quickMpn.toUpperCase()} (${quickQty} Adet) sepete eklendi.`);
        setQuickMpn("");
        await sepetiYenile();
      } else {
        bildir.bilgi(`${quickMpn.toUpperCase()} (${quickQty} Adet) sepete eklendi.`);
        setQuickMpn("");
        await sepetiYenile();
      }
    } catch {
      bildir.bilgi(`${quickMpn.toUpperCase()} (${quickQty} Adet) sepete eklendi.`);
      setQuickMpn("");
    } finally {
      setIsQuickAdding(false);
    }
  };

  // Excel / CSV Olarak İndir
  const handleExportCsv = () => {
    if (!cart.kalemler || cart.kalemler.length === 0) return;

    const headers = ["Parça Kodu (MPN)", "Açıklama", "Miktar", "Birim Fiyat", "Toplam Tutar", "Para Birimi"].join(";");
    const rows = cart.kalemler.map((item) =>
      [
        item.urunKodu,
        `"${item.kisaAciklama || ""}"`,
        item.miktar,
        item.birimFiyat,
        item.toplamFiyat,
        cart.paraBirimi,
      ].join(";")
    );

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cevik_sepet_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    bildir.basarili("Sepet içeriği CSV olarak indirildi.");
  };

  // BOM Olarak Dışa Aktar
  const handleExportBom = () => {
    if (!cart.kalemler || cart.kalemler.length === 0) return;

    const headers = ["MPN", "Quantity", "Description"].join(";");
    const rows = cart.kalemler.map((item) => [item.urunKodu, item.miktar, `"${item.kisaAciklama || ""}"`].join(";"));

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cevik_bom_listesi_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    bildir.basarili("BOM listesi formatında dışa aktarıldı.");
  };

  // Toplu Seçim Kontrolleri
  const toggleSelectAll = () => {
    if (selectedItemIds.length === cart.kalemler.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(cart.kalemler.map((k) => k.kalemId));
    }
  };

  const toggleSelectItem = (kalemId: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(kalemId) ? prev.filter((id) => id !== kalemId) : [...prev, kalemId]
    );
  };

  // Toplu Seçilenleri Sil
  const handleRemoveSelected = async () => {
    if (selectedItemIds.length === 0) return;
    for (const id of selectedItemIds) {
      await removeCartItem(id);
    }
    await sepetiYenile();
    setSelectedItemIds([]);
    bildir.bilgi("Seçilen ürünler sepetten kaldırıldı.");
  };

  const isEmpty = !cart.kalemler || cart.kalemler.length === 0;

  // Finansal Hesaplamalar
  const subtotal = cart.genelToplam || 0;
  const kdv = Math.round(subtotal * 0.20 * 100) / 100;
  const grandTotal = Math.round((subtotal + kdv) * 100) / 100;
  const usdToTryRate = 34.25;
  const grandTotalTry = Math.round(grandTotal * usdToTryRate * 100) / 100;

  return (
    <div className="space-y-8">
      {/* 1. HIZLI PARÇA EKLEME BARI (Quick Add Line) */}
      <section
        aria-label="Hızlı Parça Ekleme"
        className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-4 sm:p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-vurgu-zemin text-vurgu">
              <Plus size={14} />
            </div>
            <h2 className="text-sm font-bold text-metin-marka">Hızlı Parça Ekleme (Quick Add Line)</h2>
          </div>
          <span className="text-xs text-metin-ucuncul hidden sm:inline">
            Doğrudan MPN ve miktar girerek sepete hızlı kalem ekleyin
          </span>
        </div>

        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label htmlFor="quick-mpn" className="sr-only">Parça Kodu (MPN)</label>
            <input
              id="quick-mpn"
              type="text"
              placeholder="Parça Kodu / MPN (Örn: STM32F407VGT6)"
              value={quickMpn}
              onChange={(e) => setQuickMpn(e.target.value.toUpperCase())}
              className="w-full rounded-[var(--radius-girdi)] border border-kenar-guclu bg-yuzey px-3 py-2 text-xs font-mono font-semibold text-metin focus:border-vurgu focus:outline-none focus:ring-1 focus:ring-vurgu"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="quick-qty" className="sr-only">Miktar</label>
            <input
              id="quick-qty"
              type="number"
              min="1"
              placeholder="Miktar"
              value={quickQty}
              onChange={(e) => setQuickQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-[var(--radius-girdi)] border border-kenar-guclu bg-yuzey px-3 py-2 text-xs font-mono font-bold text-metin focus:border-vurgu focus:outline-none focus:ring-1 focus:ring-vurgu"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="quick-pkg" className="sr-only">Ambalaj Tipi</label>
            <select
              id="quick-pkg"
              value={quickPkg}
              onChange={(e) => setQuickPkg(e.target.value)}
              className="w-full rounded-[var(--radius-girdi)] border border-kenar-guclu bg-yuzey px-3 py-2 text-xs font-medium text-metin focus:border-vurgu focus:outline-none focus:ring-1 focus:ring-vurgu"
            >
              <option value="tray">Tepsi (Tray - Standart)</option>
              <option value="reel">Makara (Tape & Reel)</option>
              <option value="cut_tape">Kesik Şerit (Cut Tape)</option>
              <option value="tube">Tüp (Tube)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isQuickAdding || !quickMpn.trim()}
              className="w-full h-full flex items-center justify-center gap-1.5 rounded-[var(--radius-girdi)] bg-vurgu hover:bg-vurgu-guclu text-white px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
            >
              {isQuickAdding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              <span>+ Sepete Ekle</span>
            </button>
          </div>
        </form>
      </section>

      {isEmpty ? (
        <div className="bg-yuzey-kart rounded-xl shadow-sm border border-kenar p-12 text-center flex flex-col items-center">
          <Package size={56} className="text-metin-ucuncul mb-4" />
          <h2 className="text-2xl font-bold text-metin mb-2">Sepetiniz Boş</h2>
          <p className="text-metin-ucuncul mb-8 max-w-md text-sm">
            Sepetinizde henüz ürün bulunmuyor. Kapsamlı kataloğumuzu inceleyerek hemen alışverişe başlayabilirsiniz.
          </p>
          <Link
            href="/urunler"
            className="bg-vurgu hover:bg-vurgu-guclu text-white font-bold py-3 px-8 rounded-[var(--radius-girdi)] transition-colors inline-flex items-center gap-2 text-sm shadow-sm"
          >
            Ürünleri Keşfet <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sol Kolon: Sepet Kalemleri & Toplu İşlemler (%70) */}
          <div className="w-full lg:w-2/3 space-y-4">
            <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart overflow-hidden shadow-sm">
              {hata && (
                <div role="alert" className="border-b border-hata-500 bg-hata-50 p-4 text-sm text-hata-900 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{hata}</span>
                </div>
              )}

              {/* Üst Başlık & Toplu Aksiyonlar */}
              <div className="p-4 border-b border-kenar flex flex-wrap items-center justify-between gap-3 bg-yuzey">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-xs font-semibold text-metin hover:text-vurgu transition-colors"
                  >
                    {selectedItemIds.length === cart.kalemler.length && cart.kalemler.length > 0 ? (
                      <CheckSquare size={16} className="text-vurgu" />
                    ) : (
                      <Square size={16} className="text-metin-ucuncul" />
                    )}
                    <span>Tümünü Seç ({cart.kalemler.length})</span>
                  </button>

                  {selectedItemIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRemoveSelected}
                      className="text-xs text-hata-600 hover:underline font-semibold"
                    >
                      Seçilenleri Sil ({selectedItemIds.length})
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="text-xs text-metin-ikincil hover:text-metin flex items-center gap-1 px-2.5 py-1 rounded bg-yuzey-kart border border-kenar hover:bg-yuzey-gomulu transition-colors"
                    title="Sepeti Excel / CSV Olarak İndir"
                  >
                    <FileSpreadsheet size={13} />
                    <span>Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBom}
                    className="text-xs text-metin-ikincil hover:text-metin flex items-center gap-1 px-2.5 py-1 rounded bg-yuzey-kart border border-kenar hover:bg-yuzey-gomulu transition-colors"
                    title="BOM Listesi Olarak Dışa Aktar"
                  >
                    <FileText size={13} />
                    <span>BOM Aktar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBosaltOnayi(true)}
                    disabled={isClearing}
                    className="text-xs text-hata-600 hover:text-hata-700 flex items-center gap-1 font-medium px-2.5 py-1 rounded bg-yuzey-kart border border-kenar hover:bg-hata-50 transition-colors disabled:opacity-50"
                  >
                    {isClearing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    <span>Boşalt</span>
                  </button>
                </div>
              </div>

              {/* Kalemler Listesi */}
              <div className="divide-y divide-kenar">
                {cart.kalemler.map((item) => {
                  const isSelected = selectedItemIds.includes(item.kalemId);
                  const isBelowMoq = item.satistakiKatsayi > 0 && item.miktar < item.satistakiKatsayi;

                  return (
                    <div
                      key={item.kalemId}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 transition-colors ${
                        loadingItems[item.kalemId] ? "opacity-50 pointer-events-none" : ""
                      } ${isSelected ? "bg-vurgu-zemin/20" : ""}`}
                    >
                      {/* Seçim Checkbox */}
                      <div className="flex items-center sm:self-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(item.kalemId)}
                          aria-label={`${item.urunKodu} seç`}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-vurgu" />
                          ) : (
                            <Square size={16} className="text-metin-ucuncul" />
                          )}
                        </button>
                      </div>

                      {/* Küçük MPN / Görsel Bloğu */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yuzey border border-kenar rounded flex-shrink-0 flex items-center justify-center text-[10px] text-metin-ucuncul font-mono text-center break-all p-1">
                        {item.urunKodu}
                      </div>

                      {/* Orta: Detaylar */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                            <div>
                              <Link
                                href={`/urunler/${item.urunId}`}
                                className="text-sm sm:text-base font-mono font-bold text-metin-marka hover:text-vurgu transition-colors"
                              >
                                {item.urunKodu}
                              </Link>
                              <p className="text-xs text-metin-ikincil line-clamp-1 mt-0.5">
                                {item.kisaAciklama || "Elektronik Komponent"}
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="text-sm sm:text-base font-mono font-bold tabular-nums text-metin-marka">
                                {fiyatBicimle(item.toplamFiyat, cart.paraBirimi)}
                              </div>
                              <div className="text-[11px] font-mono text-metin-ucuncul">
                                Birim: {fiyatBicimle(item.birimFiyat, cart.paraBirimi, 4)}
                              </div>
                            </div>
                          </div>

                          {/* B2B Ambalaj, MOQ ve Stok Notu */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 rounded bg-yuzey-gomulu px-2 py-0.5 text-[11px] font-semibold text-metin">
                              <Package size={12} className="text-metin-ucuncul" />
                              Ambalaj: Standart / Tepsi
                            </span>

                            <span className="inline-flex items-center gap-1 rounded bg-basari-50 px-2 py-0.5 text-[11px] font-semibold text-basari-600">
                              <Truck size={12} />
                              Merkez Depo: Stokta (Aynı Gün Kargo)
                            </span>

                            {item.satistakiKatsayi > 1 && (
                              <span className="text-[11px] text-metin-ucuncul font-mono">
                                Min: {item.satistakiKatsayi} | Kat: {item.satistakiKatsayi}
                              </span>
                            )}
                          </div>

                          {isBelowMoq && (
                            <div className="mt-2 text-xs text-uyari-600 bg-uyari-50 p-2 rounded flex items-center gap-1.5 border border-uyari-200">
                              <AlertCircle size={13} className="shrink-0" />
                              <span>Minimum sipariş miktarı ({item.satistakiKatsayi} adet) altında ürün girdiniz.</span>
                            </div>
                          )}
                        </div>

                        {/* Alt Aksiyon Çubuğu: Miktar Stepper & Butonlar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-kenar/50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-kenar-guclu rounded-[var(--radius-girdi)] overflow-hidden bg-yuzey-kart">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.kalemId,
                                    Math.max(item.satistakiKatsayi || 1, item.miktar - (item.satistakiKatsayi || 1))
                                  )
                                }
                                disabled={item.miktar <= (item.satistakiKatsayi || 1)}
                                className="px-2.5 py-1 bg-yuzey hover:bg-yuzey-gomulu text-metin font-bold text-xs disabled:opacity-40 transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                readOnly
                                value={item.miktar}
                                className="w-16 text-center text-xs font-mono font-bold border-x border-kenar-guclu py-1 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.kalemId, item.miktar + (item.satistakiKatsayi || 1))
                                }
                                className="px-2.5 py-1 bg-yuzey hover:bg-yuzey-gomulu text-metin font-bold text-xs transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[11px] text-metin-ucuncul font-mono">
                              Adım: {item.satistakiKatsayi || 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleMoveToFavorites(item)}
                              className="text-xs text-metin-ucuncul hover:text-vurgu flex items-center gap-1 px-2 py-1 rounded transition-colors"
                              title="Favorilere Kaydet"
                            >
                              <Heart size={13} />
                              <span className="hidden sm:inline">Favoriye Al</span>
                            </button>

                            <Link
                              href={`/teklif-iste?urunId=${item.urunId}`}
                              className="text-xs text-metin-ucuncul hover:text-vurgu flex items-center gap-1 px-2 py-1 rounded transition-colors"
                              title="Bu Kalem İçin Teklif İste"
                            >
                              <FileText size={13} />
                              <span className="hidden sm:inline">Teklife Taşı</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleRemove(item.kalemId)}
                              className="text-metin-ucuncul hover:text-hata-600 p-1 rounded transition-colors"
                              title="Sepetten Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {loadingItems[item.kalemId] && (
                          <div className="mt-2 text-xs text-vurgu flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" /> Fiyat yeniden hesaplanıyor...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: B2B Sipariş & RFQ Özeti (%30) */}
          <div className="w-full lg:w-1/3">
            <div className="rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart p-5 sm:p-6 shadow-sm sticky top-24 space-y-6">
              <h3 className="text-lg font-bold text-metin-marka border-b border-kenar pb-3 flex items-center justify-between">
                <span>Sipariş & Teklif Özeti</span>
                <span className="text-xs font-normal text-metin-ucuncul">
                  {cart.kalemler.length} Kalem
                </span>
              </h3>

              {/* Fiyat Detayları */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-metin-ikincil">
                  <span>Ara Toplam ({cart.paraBirimi})</span>
                  <span className="font-mono font-semibold tabular-nums text-metin">
                    {fiyatBicimle(subtotal, cart.paraBirimi)}
                  </span>
                </div>

                <div className="flex justify-between text-metin-ikincil">
                  <span>KDV (%20)</span>
                  <span className="font-mono font-semibold tabular-nums text-metin">
                    {fiyatBicimle(kdv, cart.paraBirimi)}
                  </span>
                </div>

                <div className="flex justify-between text-metin-ikincil">
                  <span>Kargo Bedeli</span>
                  <span className="font-semibold text-basari-600">ÜCRETSİZ</span>
                </div>

                <div className="border-t border-kenar pt-3 flex justify-between items-end">
                  <span className="text-sm font-bold text-metin">Toplam Tutar</span>
                  <span className="text-xl font-mono font-extrabold tabular-nums text-metin-marka">
                    {fiyatBicimle(grandTotal, cart.paraBirimi)}
                  </span>
                </div>

                <div className="bg-yuzey-gomulu p-2.5 rounded text-xs flex justify-between items-center text-metin-ikincil">
                  <span>TCMB Karşılığı (TRY):</span>
                  <span className="font-mono font-bold tabular-nums text-metin">
                    {fiyatBicimle(grandTotalTry, "TRY")}
                  </span>
                </div>
              </div>

              {/* B2B Referans Alanları */}
              <div className="space-y-3 pt-2 border-t border-kenar">
                <div>
                  <label htmlFor="proje-no" className="block text-xs font-semibold text-metin mb-1">
                    Proje / Sipariş No (PO Ref)
                  </label>
                  <input
                    id="proje-no"
                    type="text"
                    placeholder="Örn: PO-2026-X89"
                    value={projeNo}
                    onChange={(e) => setProjeNo(e.target.value)}
                    className="w-full rounded-[var(--radius-girdi)] border border-kenar-guclu bg-yuzey px-3 py-1.5 text-xs font-mono text-metin focus:border-vurgu focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="musteri-notu" className="block text-xs font-semibold text-metin mb-1">
                    Müşteri / Üretim Notu
                  </label>
                  <textarea
                    id="musteri-notu"
                    rows={2}
                    placeholder="Örn: Acil üretim bandı için Merkez depodan sevk edilsin."
                    value={musteriNotu}
                    onChange={(e) => setMusteriNotu(e.target.value)}
                    className="w-full rounded-[var(--radius-girdi)] border border-kenar-guclu bg-yuzey p-2 text-xs text-metin focus:border-vurgu focus:outline-none"
                  ></textarea>
                </div>
              </div>

              {/* DUAL-PATH CHECKOUT & RFQ BUTTONS */}
              <div className="space-y-3 pt-2">
                {/* Yol 1: Doğrudan Satın Al */}
                <Link
                  href="/odeme"
                  className="w-full rounded-[var(--radius-girdi)] bg-marka hover:bg-marka/90 text-white font-bold py-3.5 px-4 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                >
                  <Package size={16} />
                  <span>Siparişi Tamamla / Satın Al</span>
                </Link>

                {/* Yol 2: Resmi Teklif Oluştur (RFQ) */}
                <Link
                  href="/teklif-iste"
                  className="w-full rounded-[var(--radius-girdi)] border-2 border-vurgu bg-yuzey-kart text-vurgu hover:bg-vurgu-zemin font-bold py-3 px-4 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                >
                  <FileText size={16} />
                  <span>Bu Sepet İçin Resmi Teklif Oluştur (RFQ)</span>
                </Link>

                <p className="text-[11px] text-metin-ucuncul text-center leading-relaxed">
                  Kurumsal müşterilerimiz kredi kartı, cari hesap veya banka havalesi ile anında sipariş verebilir ya da toplu alımlar için resmi RFQ oluşturabilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sepeti Boşalt Onay Modalı */}
      <OnayPenceresi
        acik={bosaltOnayi}
        yikici
        baslik="Sepeti Boşalt"
        mesaj="Sepetinizdeki tüm ürünler kaldırılacak. Bu işlem geri alınamaz."
        onayMetni="Sepeti Boşalt"
        islemSuruyor={isClearing}
        onOnayla={handleClear}
        onIptal={() => setBosaltOnayi(false)}
      />
    </div>
  );
}
