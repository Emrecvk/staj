import Link from "next/link";
import { Package, Building2, ShoppingCart, AlertTriangle, FileText } from "lucide-react";
import { getGostergeVerisi } from "@/lib/admin-api";
import { SIPARIS_DURUMLARI, TEKLIF_DURUMLARI } from "@/lib/admin-tipler";
import { ApiHatasi, BosDurum } from "@/components/admin/durum-bildirimi";

export const dynamic = "force-dynamic";

function OzetKart({ etiket, deger, ikon, renk, link, linkMetni }: {
  etiket: string; deger: number; ikon: React.ReactNode;
  renk: string; link?: string; linkMetni?: string;
}) {
  return (
    <div className="rounded-xl border border-kenar bg-yuzey-kart p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-metin-ucuncul">{etiket}</p>
          <h3 className="text-3xl font-bold text-metin">{deger.toLocaleString("tr-TR")}</h3>
        </div>
        <div className={`rounded-lg p-2 ${renk}`}>{ikon}</div>
      </div>
      {link && (
        <Link href={link} className="text-xs font-medium text-vurgu hover:underline">
          {linkMetni}
        </Link>
      )}
    </div>
  );
}

function DurumListesi({ baslik, dagilim, adlar, link }: {
  baslik: string;
  dagilim: { durum: number; adet: number }[];
  adlar: Record<number, string>;
  link: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-kenar bg-yuzey-kart shadow-sm">
      <div className="flex items-center justify-between border-b border-kenar p-5">
        <h3 className="font-bold text-metin">{baslik}</h3>
        <Link href={link} className="text-xs font-medium text-vurgu hover:underline">
          Tümünü gör
        </Link>
      </div>
      {dagilim.length === 0 ? (
        <BosDurum mesaj="Kayıt yok." />
      ) : (
        <ul className="divide-y divide-kenar">
          {dagilim.map(({ durum, adet }) => (
            <li key={durum} className="flex items-center justify-between p-4">
              <span className="text-sm text-metin-ikincil">{adlar[durum] ?? `Durum ${durum}`}</span>
              <span className="text-sm font-bold text-metin">{adet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const veri = await getGostergeVerisi();

  const siparisToplam = veri.siparisDurumDagilimi.reduce((t, d) => t + d.adet, 0);
  const teklifToplam = veri.teklifDurumDagilimi.reduce((t, d) => t + d.adet, 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-metin">Genel Bakış</h1>

      {/* Bir uç düşse bile panelin kalanı çalışsın; ne düştüğü açıkça yazsın. */}
      {veri.hatalar.length > 0 && (
        <div className="mb-6 space-y-2">
          {veri.hatalar.map((hata) => <ApiHatasi key={hata} mesaj={hata} />)}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <OzetKart
          etiket="Toplam Ürün" deger={veri.urunSayisi}
          ikon={<Package size={24} />} renk="bg-blue-50 text-blue-600"
          link="/yonetim/urunler" linkMetni="Ürün yönetimine git"
        />
        <OzetKart
          etiket="Bekleyen Firma" deger={veri.bekleyenFirmaSayisi}
          ikon={<Building2 size={24} />} renk="bg-uyari-50 text-uyari-600"
          link="/yonetim/firmalar" linkMetni="Onay bekleyen başvuruları incele"
        />
        <OzetKart
          etiket="Toplam Sipariş" deger={siparisToplam}
          ikon={<ShoppingCart size={24} />} renk="bg-basari-50 text-basari-600"
          link="/yonetim/siparisler" linkMetni="Sipariş yönetimine git"
        />
        <OzetKart
          etiket="Toplam Teklif" deger={teklifToplam}
          ikon={<FileText size={24} />} renk="bg-purple-50 text-purple-600"
          link="/yonetim/teklifler" linkMetni="Teklif taleplerini fiyatlandır"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DurumListesi
          baslik="Sipariş Durumları" dagilim={veri.siparisDurumDagilimi}
          adlar={SIPARIS_DURUMLARI} link="/yonetim/siparisler"
        />
        <DurumListesi
          baslik="Teklif Durumları" dagilim={veri.teklifDurumDagilimi}
          adlar={TEKLIF_DURUMLARI} link="/yonetim/teklifler"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-kenar bg-yuzey-kart shadow-sm">
        <div className="flex items-center justify-between border-b border-kenar bg-hata-50 p-5">
          <h3 className="flex items-center gap-2 font-bold text-hata-900">
            <AlertTriangle size={18} /> Kritik Stok Uyarıları
          </h3>
          <span className="text-xs text-hata-600">100 adetin altındaki aktif ürünler</span>
        </div>

        {veri.stokUyarilari.length === 0 ? (
          <BosDurum mesaj="Kritik stok seviyesinde ürün yok." />
        ) : (
          <ul className="divide-y divide-kenar">
            {veri.stokUyarilari.map((u) => (
              <li key={u.id} className="flex items-center justify-between p-4 hover:bg-yuzey">
                <div>
                  <p className="text-sm font-bold text-metin">{u.kod}</p>
                  <p className="text-xs text-metin-ucuncul">{u.aciklama}</p>
                </div>
                <p className={`text-sm font-bold ${u.stok === 0 ? "text-hata-600" : "text-amber-600"}`}>
                  {u.stok} adet
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
