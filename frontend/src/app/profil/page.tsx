import Link from "next/link";
import { Package, Heart, FileText, Building2 } from "lucide-react";
import {
  siparisleriGetir, favorileriGetirTam, teklifleriGetir, firmaBilgisiGetir,
} from "@/lib/profil-api";
import { SIPARIS_DURUMLARI, TEKLIF_DURUMLARI, FIRMA_ONAY_DURUMLARI } from "@/lib/admin-tipler";

export const dynamic = "force-dynamic";

function OzetKutusu({ ikon, renk, deger, etiket, link }: {
  ikon: React.ReactNode; renk: string; deger: string; etiket: string; link: string;
}) {
  return (
    <Link
      href={link}
      className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-brand-cyan"
    >
      <div className={`rounded-full p-3 ${renk}`}>{ikon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{deger}</div>
        <div className="text-xs uppercase tracking-wide text-gray-500">{etiket}</div>
      </div>
    </Link>
  );
}

export default async function ProfileDashboard() {
  // Paralel çekiliyor; biri boş dönerse diğerleri yine gösterilir.
  const [siparisler, favoriler, teklifler, firma] = await Promise.all([
    siparisleriGetir(),
    favorileriGetirTam(),
    teklifleriGetir(),
    firmaBilgisiGetir(),
  ]);

  const sonSiparisler = siparisler.slice(0, 5);
  const acikTeklifler = teklifler.filter(t => ![5, 6, 7, 8].includes(t.durum));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Hesap Özeti</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OzetKutusu
          ikon={<Package size={24} />} renk="bg-blue-100 text-blue-600"
          deger={String(siparisler.length)} etiket="Siparişler" link="/profil/siparisler"
        />
        <OzetKutusu
          ikon={<Heart size={24} />} renk="bg-red-100 text-red-600"
          deger={String(favoriler.length)} etiket="Favoriler" link="/profil/favoriler"
        />
        <OzetKutusu
          ikon={<FileText size={24} />} renk="bg-purple-100 text-purple-600"
          deger={String(acikTeklifler.length)} etiket="Açık Teklifler" link="/profil/teklifler"
        />
        <OzetKutusu
          ikon={<Building2 size={24} />} renk="bg-green-100 text-green-600"
          deger={firma ? (FIRMA_ONAY_DURUMLARI[firma.onayDurumu] ?? "—") : "Bireysel"}
          etiket="Firma Durumu" link="/profil/firma"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
            <h2 className="font-bold text-gray-900">Son Siparişler</h2>
            <Link href="/profil/siparisler" className="text-xs font-medium text-brand-cyan hover:underline">
              Tümü
            </Link>
          </div>
          {sonSiparisler.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">Henüz siparişiniz yok.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sonSiparisler.map((s) => (
                <li key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold text-gray-900">{s.siparisNo}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(s.tarih).toLocaleDateString("tr-TR")} · {SIPARIS_DURUMLARI[s.durum] ?? "—"}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {s.genelToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {s.paraBirimi}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
            <h2 className="font-bold text-gray-900">Açık Teklifler</h2>
            <Link href="/profil/teklifler" className="text-xs font-medium text-brand-cyan hover:underline">
              Tümü
            </Link>
          </div>
          {acikTeklifler.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">Bekleyen teklifiniz yok.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {acikTeklifler.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between p-4">
                  <Link href={`/profil/teklifler/${t.id}`} className="font-bold text-brand-navy hover:underline">
                    {t.talepNo}
                  </Link>
                  <span className="text-xs text-gray-500">{TEKLIF_DURUMLARI[t.durum] ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
