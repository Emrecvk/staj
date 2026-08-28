"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Copy,
  Check,
  Trash2,
  Printer,
  FileSpreadsheet,
  ShoppingCart,
  FileText,
  X,
  Pin,
  Plus,
  Loader2,
} from "lucide-react";
import { useComparisonStore, type ComparisonItem } from "@/lib/stores/comparison-store";
import { addProductToCart } from "@/lib/cart-actions";
import { notifyCartUpdated } from "@/lib/stores/header-state";
import { bildir } from "@/components/ui/bildirim";
import { StokRozeti } from "@/components/ui/rozet";

interface DiffMatrixProps {
  initialProducts?: ComparisonItem[];
}

function fiyatBicimle(deger: number, paraBirimi: string = "USD") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: paraBirimi,
    maximumFractionDigits: 4,
  }).format(deger);
}

// Parametre gruplandırma kuralları
const ELEKTRIKSEL_KEYWORDS = [
  "çekirdek", "frekans", "flash", "ram", "gerilim", "voltaj", "kapasitans",
  "tolerans", "katsayı", "güç", "akım", "direnç", "frekansı", "bant", "ofset", "kanal"
];

const FIZIKSEL_KEYWORDS = [
  "kılıf", "paket", "pin", "g/ç", "montaj", "boyut", "ağırlık", "bacak", "gövde"
];

const CEVRESEL_KEYWORDS = [
  "sıcaklık", "rohs", "reach", "durumu", "nem", "standart", "sertifika"
];

function kategoriBelirle(anahtar: string): "Elektriksel" | "Fiziksel" | "Çevresel" | "Diğer" {
  const kucuk = anahtar.toLowerCase();
  if (ELEKTRIKSEL_KEYWORDS.some((kw) => kucuk.includes(kw))) return "Elektriksel";
  if (FIZIKSEL_KEYWORDS.some((kw) => kucuk.includes(kw))) return "Fiziksel";
  if (CEVRESEL_KEYWORDS.some((kw) => kucuk.includes(kw))) return "Çevresel";
  return "Diğer";
}

export function DiffMatrix({ initialProducts }: DiffMatrixProps) {
  const { items: storeItems, removeItem, clear } = useComparisonStore();
  const [sadeceFarklar, setSadeceFarklar] = useState(false);
  const [kopyalananMpn, setKopyalananMpn] = useState<string | null>(null);
  const [sepeteEkleniyorId, setSepeteEkleniyorId] = useState<number | null>(null);
  const [sabitlenenId, setSabitlenenId] = useState<number | null>(null);

  // Store doluysa o, değilse sunucudan gelen liste kullanılır.
  // useMemo şart: koşulun `[]` dalı her render'da yeni bir dizi üretiyordu ve
  // aşağıdaki spec-diff/sıralama memo'ları bu yüzden hiç önbelleğe girmiyordu.
  const products = useMemo(
    () => (storeItems.length > 0 ? storeItems : (initialProducts ?? [])),
    [storeItems, initialProducts],
  );

  // MPN Kopyalama
  const mpnKopyala = (mpn: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(mpn);
      setKopyalananMpn(mpn);
      setTimeout(() => setKopyalananMpn(null), 2000);
      bildir.basarili("MPN panoya kopyalandı", mpn);
    }
  };

  // Sepete Hızlı Ekleme
  const handleAddToCart = async (product: ComparisonItem) => {
    setSepeteEkleniyorId(product.id);
    try {
      // Karşılaştırma listesi ambalaj bilgisi tutmuyor; varsayılan ambalajı
      // sunucu çözer. Kimliği burada hesaplamak (eski hali: product.id * 10)
      // gerçek ambalajla ilgisi olmayan bir sayı üretiyordu.
      const res = await addProductToCart(product.id);
      if (res.success) {
        bildir.basarili(`${product.ureticiUrunKodu} sepete eklendi.`);
        notifyCartUpdated();
      } else {
        bildir.hata("Sepete eklenemedi", res.message);
      }
    } catch {
      bildir.hata("Sepete eklenemedi", "Beklenmeyen bir hata oluştu.");
    } finally {
      setSepeteEkleniyorId(null);
    }
  };

  // Excel / CSV İndirme
  const exportToCsv = () => {
    if (products.length === 0) return;

    const headers = ["Özellik", ...products.map((p) => p.ureticiUrunKodu)].join(";");
    
    // Temel Satırlar
    const basicRows = [
      ["Üretici", ...products.map((p) => p.ureticiAd || "-")].join(";"),
      ["Başlangıç Fiyatı", ...products.map((p) => fiyatBicimle(p.baslangicFiyati, p.paraBirimi))].join(";"),
      ["Toplam Stok", ...products.map((p) => `${p.toplamStok.toLocaleString("tr-TR")} Adet`)].join(";"),
    ];

    // Tüm Özellik Anahtarları
    const allKeys = new Set<string>();
    products.forEach((p) => {
      Object.keys(p.ozellikler || {}).forEach((k) => allKeys.add(k));
    });

    const specRows = Array.from(allKeys).map((key) => {
      const vals = products.map((p) => p.ozellikler?.[key] || "-");
      return [key, ...vals].join(";");
    });

    const csvContent = "\uFEFF" + [headers, ...basicRows, ...specRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cevik_urun_karsilastirma_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    bildir.basarili("Karşılaştırma tablosu CSV olarak indirildi.");
  };

  // Yazdır / PDF İndir
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Spec Diff Analizi
  const { groupedSpecs, diffCount } = useMemo(() => {
    const allKeys = new Set<string>();
    products.forEach((p) => {
      Object.keys(p.ozellikler || {}).forEach((k) => allKeys.add(k));
    });

    const groups: Record<string, Array<{ key: string; isDifferent: boolean; values: Record<number, string> }>> = {
      "Elektriksel": [],
      "Fiziksel": [],
      "Çevresel": [],
      "Diğer": [],
    };

    let diffs = 0;
    let total = 0;

    allKeys.forEach((key) => {
      total++;
      const values: Record<number, string> = {};
      const distinctVals = new Set<string>();

      products.forEach((p) => {
        const val = p.ozellikler?.[key] || "-";
        values[p.id] = val;
        distinctVals.add(val);
      });

      const isDifferent = distinctVals.size > 1;
      if (isDifferent) diffs++;

      const groupName = kategoriBelirle(key);
      groups[groupName].push({
        key,
        isDifferent,
        values,
      });
    });

    return {
      groupedSpecs: groups,
      diffCount: diffs,
      totalSpecsCount: total,
    };
  }, [products]);

  // Sıralanmış ürünler (Sabitlenen ürün en başa gelir)
  const orderedProducts = useMemo(() => {
    if (!sabitlenenId) return products;
    const pinned = products.find((p) => p.id === sabitlenenId);
    if (!pinned) return products;
    return [pinned, ...products.filter((p) => p.id !== sabitlenenId)];
  }, [products, sabitlenenId]);

  // Empty state: less than 2 products
  if (products.length < 2) {
    return (
      <div className="rounded-token-kart border border-kenar bg-yuzey-kart p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-vurgu-zemin text-vurgu">
          <ArrowLeftRight size={36} />
        </div>
        <h2 className="text-2xl font-bold text-metin-marka mb-2">
          {products.length === 1 ? "1 Ürün Seçili (En Az 2 Ürün Gereklidir)" : "Karşılaştırma Listeniz Boş"}
        </h2>
        <p className="text-metin-ikincil max-w-md mx-auto mb-8 text-sm leading-relaxed">
          {products.length === 1
            ? "Karşılaştırma tablosunu oluşturmak için kataloğumuzdan 1 ürün daha ekleyin. Tüm teknik parametreleri ve stok durumlarını yan yana inceleyebilirsiniz."
            : "Karşılaştırma yapmak için katalogdan en az 2, en fazla 4 ürün seçin. Teknik özellikler, kılıf tipleri, anlık stok ve fiyat kademeleri otomatik olarak eşleştirilir."}
        </p>
        
        {products.length === 1 && (
          <div className="max-w-sm mx-auto mb-8 p-3 bg-yuzey rounded-lg border border-kenar flex items-center justify-between">
            <span className="font-mono font-bold text-sm text-metin-marka">{products[0].ureticiUrunKodu}</span>
            <button
              onClick={() => removeItem(products[0].id)}
              className="text-xs text-hata-600 hover:underline flex items-center gap-1"
            >
              <X size={12} /> Çıkar
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 bg-vurgu hover:bg-vurgu-guclu text-white font-bold px-6 py-3 rounded-token-girdi transition-colors shadow-sm text-sm"
          >
            <Plus size={16} />
            Katalogdan Ürün Ekle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kontrol Çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-token-kart border border-kenar bg-yuzey-kart p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-metin select-none">
            <input
              type="checkbox"
              checked={sadeceFarklar}
              onChange={(e) => setSadeceFarklar(e.target.checked)}
              className="h-4 w-4 rounded border-kenar-guclu text-vurgu focus:ring-vurgu"
            />
            <span>Sadece Farklılıkları Göster</span>
            <span className="rounded-full bg-uyari-50 px-2 py-0.5 text-xs font-bold text-uyari-600 border border-uyari-200">
              {diffCount} Fark
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-token-girdi border border-kenar bg-yuzey px-3 py-2 text-xs font-medium text-metin hover:bg-kenar transition-colors"
            title="Yazdır / PDF Olarak Kaydet"
          >
            <Printer size={14} />
            <span>Yazdır / PDF</span>
          </button>

          <button
            type="button"
            onClick={exportToCsv}
            className="inline-flex items-center gap-1.5 rounded-token-girdi border border-kenar bg-yuzey px-3 py-2 text-xs font-medium text-metin hover:bg-kenar transition-colors"
            title="Excel / CSV Formatında İndir"
          >
            <FileSpreadsheet size={14} />
            <span>Excel İndir</span>
          </button>

          <button
            type="button"
            onClick={() => clear()}
            className="inline-flex items-center gap-1.5 rounded-token-girdi border border-kenar bg-yuzey px-3 py-2 text-xs font-medium text-hata-600 hover:bg-hata-50 transition-colors"
            title="Tüm Ürünleri Temizle"
          >
            <Trash2 size={14} />
            <span>Temizle</span>
          </button>
        </div>
      </div>

      {/* Karşılaştırma Matris Tablosu */}
      <div className="overflow-x-auto rounded-token-kart border border-kenar bg-yuzey-kart shadow-sm">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm" role="table">
          {/* Ürün Başlık Kartları (Sticky / Top Header) */}
          <thead>
            <tr className="border-b border-kenar bg-yuzey-gomulu">
              <th scope="col" className="w-1/4 p-4 align-top font-bold text-metin-marka">
                <div className="text-xs uppercase tracking-wider text-metin-ucuncul mb-1">
                  Özellik / Parametre
                </div>
                <div className="text-base">Ürün Karşılaştırma</div>
                <div className="text-xs text-metin-ikincil font-normal mt-1">
                  {orderedProducts.length} ürün yan yana
                </div>
              </th>

              {orderedProducts.map((product) => {
                const isPinned = sabitlenenId === product.id;

                return (
                  <th
                    key={product.id}
                    scope="col"
                    className={`p-4 align-top border-l border-kenar transition-colors ${
                      isPinned ? "bg-vurgu-zemin/40" : ""
                    }`}
                    style={{ width: `${75 / orderedProducts.length}%` }}
                  >
                    <div className="flex flex-col h-full">
                      {/* Üst İkonlar: Sabitle & Kaldır */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setSabitlenenId(isPinned ? null : product.id)}
                          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                            isPinned
                              ? "bg-vurgu text-white"
                              : "text-metin-ucuncul hover:text-vurgu hover:bg-yuzey"
                          }`}
                          title={isPinned ? "Sabitlemeyi Kaldır" : "Sola Sabitle"}
                        >
                          <Pin size={11} className={isPinned ? "rotate-45" : ""} />
                          <span>{isPinned ? "Sabitlendi" : "Sabitle"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="text-metin-ucuncul hover:text-hata-600 p-1 rounded transition-colors"
                          title="Karşılaştırmadan Kaldır"
                          aria-label={`${product.ureticiUrunKodu} kaldır`}
                        >
                          <X size={15} />
                        </button>
                      </div>

                      {/* Ürün Görseli */}
                      <div className="relative mb-3 flex h-24 w-full items-center justify-center rounded bg-yuzey border border-kenar overflow-hidden">
                        {product.anaGorselUrl ? (
                          // Panelden girilen dış host; next/image 400 döner.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.anaGorselUrl}
                            alt={product.ureticiUrunKodu}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <span className="font-mono text-xs font-bold text-metin-ucuncul">
                            {product.ureticiUrunKodu}
                          </span>
                        )}
                      </div>

                      {/* Üretici & MPN */}
                      <div className="text-xs font-medium text-metin-ucuncul mb-1">
                        {product.ureticiAd || "Distribütör"}
                      </div>
                      
                      <div className="flex items-center gap-1.5 mb-2">
                        <Link
                          href={`/urunler/${product.id}`}
                          className="font-mono text-sm font-bold text-metin-marka hover:text-vurgu transition-colors line-clamp-1"
                        >
                          {product.ureticiUrunKodu}
                        </Link>
                        <button
                          type="button"
                          onClick={() => mpnKopyala(product.ureticiUrunKodu)}
                          className="text-metin-ucuncul hover:text-vurgu p-0.5 transition-colors"
                          title="MPN Kopyala"
                        >
                          {kopyalananMpn === product.ureticiUrunKodu ? (
                            <Check size={13} className="text-basari-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>

                      {/* Stok & Fiyat Özeti */}
                      <div className="space-y-1 mb-4">
                        <div>
                          <StokRozeti miktar={product.toplamStok} />
                        </div>
                        <div className="text-xs text-metin-ikincil">
                          <span>Başlangıç: </span>
                          <span className="font-mono font-bold text-metin">
                            {fiyatBicimle(product.baslangicFiyati, product.paraBirimi)}
                          </span>
                        </div>
                      </div>

                      {/* Hızlı Aksiyon Butonları */}
                      <div className="mt-auto space-y-2 pt-2 border-t border-kenar">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={sepeteEkleniyorId === product.id}
                          className="w-full flex items-center justify-center gap-1.5 rounded-token-girdi bg-marka hover:bg-marka/90 text-white px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                        >
                          {sepeteEkleniyorId === product.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <ShoppingCart size={13} />
                          )}
                          <span>Sepete Ekle</span>
                        </button>

                        <Link
                          href={`/teklif-iste?urunId=${product.id}`}
                          className="w-full flex items-center justify-center gap-1.5 rounded-token-girdi border border-vurgu text-vurgu hover:bg-vurgu-zemin px-3 py-1.5 text-xs font-semibold transition-colors"
                        >
                          <FileText size={13} />
                          <span>Teklif İste</span>
                        </Link>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Gövde: Temel & Parametrik Satırlar */}
          <tbody className="divide-y divide-kenar">
            {/* Temel Bilgiler Bölümü */}
            <tr className="bg-yuzey font-bold text-xs text-metin-ucuncul uppercase tracking-wider">
              <td colSpan={orderedProducts.length + 1} className="px-4 py-2">
                Temel Bilgiler
              </td>
            </tr>

            {/* Üretici Satırı */}
            <tr className="hover:bg-yuzey/50 transition-colors">
              <td className="px-4 py-3 font-semibold text-metin-ikincil">Üretici Marka</td>
              {orderedProducts.map((p) => (
                <td key={`mfg-${p.id}`} className="px-4 py-3 border-l border-kenar font-medium text-metin">
                  {p.ureticiAd || "-"}
                </td>
              ))}
            </tr>

            {/* Stok Durumu Satırı */}
            <tr className="hover:bg-yuzey/50 transition-colors">
              <td className="px-4 py-3 font-semibold text-metin-ikincil">Toplam Envanter</td>
              {orderedProducts.map((p) => (
                <td key={`stok-${p.id}`} className="px-4 py-3 border-l border-kenar font-mono tabular-nums text-metin">
                  {p.toplamStok.toLocaleString("tr-TR")} Adet
                </td>
              ))}
            </tr>

            {/* Başlangıç Fiyatı Satırı */}
            <tr className="hover:bg-yuzey/50 transition-colors">
              <td className="px-4 py-3 font-semibold text-metin-ikincil">Liste Fiyatı (1+)</td>
              {orderedProducts.map((p) => (
                <td key={`fiyat-${p.id}`} className="px-4 py-3 border-l border-kenar font-mono font-bold tabular-nums text-metin">
                  {fiyatBicimle(p.baslangicFiyati, p.paraBirimi)}
                </td>
              ))}
            </tr>
          </tbody>

          {/* Parametrik Gruplar — her grup KENDİ <tbody>'si olur. Bunlar daha
              önce dış <tbody>'nin içine yuvalanıyordu; iç içe tbody geçersiz
              HTML ve React hidrasyon hatası veriyordu. Bir tablo birden çok
              kardeş tbody alabilir, grup başına divide-y de böyle korunur. */}
          {(["Elektriksel", "Fiziksel", "Çevresel", "Diğer"] as const).map((grupAdi) => {
              const itemsInGroup = groupedSpecs[grupAdi] || [];
              const visibleItems = sadeceFarklar ? itemsInGroup.filter((i) => i.isDifferent) : itemsInGroup;

              if (visibleItems.length === 0) return null;

              return (
                <tbody key={`grp-${grupAdi}`} className="divide-y divide-kenar">
                  <tr className="bg-yuzey font-bold text-xs text-metin-ucuncul uppercase tracking-wider">
                    <td colSpan={orderedProducts.length + 1} className="px-4 py-2">
                      {grupAdi} Özellikler
                    </td>
                  </tr>

                  {visibleItems.map(({ key, isDifferent, values }) => (
                    <tr
                      key={`spec-${key}`}
                      className={`transition-colors ${
                        isDifferent ? "bg-uyari-50/40 hover:bg-uyari-50/70" : "hover:bg-yuzey/50"
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium text-metin flex items-center justify-between gap-2">
                        <span>{key}</span>
                        {isDifferent && (
                          <span className="rounded bg-uyari-100 px-1.5 py-0.5 text-[10px] font-bold text-uyari-700">
                            Fark!
                          </span>
                        )}
                      </td>

                      {orderedProducts.map((p) => {
                        const cellVal = values[p.id] || "-";
                        const cellClass = isDifferent
                          ? "bg-uyari-50 font-semibold text-metin-marka"
                          : "bg-transparent text-metin";

                        return (
                          <td
                            key={`val-${p.id}-${key}`}
                            className={`px-4 py-2.5 border-l border-kenar font-mono text-xs tabular-nums ${cellClass}`}
                          >
                            {cellVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              );
            })}
        </table>
      </div>
    </div>
  );
}
