import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { teklifDetayGetir } from "@/lib/profil-api";
import { TEKLIF_DURUMLARI } from "@/lib/admin-tipler";
import { ApiHatasi, DurumRozeti } from "@/components/admin/durum-bildirimi";
import { TeklifIslemleri } from "./teklif-islemleri";

export const dynamic = "force-dynamic";

function durumTonu(durum: number) {
  if (durum === 5 || durum === 8) return "yesil" as const;
  if (durum === 6 || durum === 7) return "kirmizi" as const;
  if (durum === 4) return "sari" as const;
  return "mavi" as const;
}

function paraFormatla(tutar: number | null, paraBirimi: string | null) {
  if (tutar === null) return "—";
  return `${tutar.toLocaleString("tr-TR", { minimumFractionDigits: 4 })} ${paraBirimi ?? ""}`.trim();
}

export default async function TeklifDetayPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teklifId = Number(id);

  if (!Number.isFinite(teklifId)) notFound();

  const sonuc = await teklifDetayGetir(teklifId);

  if (!sonuc.success) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-metin">Teklif Detayı</h1>
        <ApiHatasi mesaj={sonuc.message} />
      </div>
    );
  }

  const teklif = sonuc.data;

  // Kalem toplamları — teklif edilen miktar × teklif edilen birim fiyat.
  const toplam = teklif.kalemler.reduce((t, k) => {
    const miktar = k.teklifEdilenMiktar ?? k.miktar;
    return t + (k.teklifEdilenBirimFiyat ?? 0) * miktar;
  }, 0);

  const paraBirimi = teklif.kalemler.find(k => k.paraBirimi)?.paraBirimi ?? "";

  return (
    <div>
      <Link
        href="/profil/teklifler"
        className="mb-4 inline-flex items-center gap-1 text-sm text-metin-ucuncul hover:text-vurgu"
      >
        <ChevronLeft size={16} /> Tekliflerime dön
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-metin">{teklif.talepNo}</h1>
          <p className="mt-1 text-sm text-metin-ucuncul">
            Geçerlilik:{" "}
            {teklif.gecerlilikTarihi
              ? new Date(teklif.gecerlilikTarihi).toLocaleDateString("tr-TR")
              : "Henüz fiyatlandırılmadı"}
          </p>
        </div>
        <DurumRozeti
          metin={TEKLIF_DURUMLARI[teklif.durum] ?? `#${teklif.durum}`}
          ton={durumTonu(teklif.durum)}
        />
      </div>

      {teklif.musteriNotu && (
        <div className="mb-4 rounded-lg border border-kenar bg-yuzey p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-metin-ucuncul">Notunuz</p>
          <p className="text-sm text-metin-ikincil">{teklif.musteriNotu}</p>
        </div>
      )}

      {teklif.temsilciNotu && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-700">
            Satış Temsilcisi Notu
          </p>
          <p className="text-sm italic text-blue-900">&ldquo;{teklif.temsilciNotu}&rdquo;</p>
        </div>
      )}

      <div className="mb-6 overflow-hidden rounded-xl border border-kenar">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-yuzey text-left text-xs uppercase tracking-wide text-metin-ucuncul">
              <tr>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">İstenen</th>
                <th className="px-4 py-3">Teklif Miktarı</th>
                <th className="px-4 py-3">Birim Fiyat</th>
                <th className="px-4 py-3">Teslim</th>
                <th className="px-4 py-3">Not</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kenar">
              {teklif.kalemler.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-4 font-medium text-metin">
                    {k.serbestUrunKodu ?? `Ürün #${k.urunId}`}
                  </td>
                  <td className="px-4 py-4 text-metin-ikincil">{k.miktar}</td>
                  <td className="px-4 py-4 text-metin">{k.teklifEdilenMiktar ?? "—"}</td>
                  <td className="px-4 py-4 font-medium text-metin">
                    {paraFormatla(k.teklifEdilenBirimFiyat, k.paraBirimi)}
                  </td>
                  <td className="px-4 py-4 text-metin-ikincil">
                    {k.teklifEdilenTeslimSuresiGun != null
                      ? `${k.teklifEdilenTeslimSuresiGun} gün`
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-metin-ikincil">{k.satisTemsilcisiNotu ?? "—"}</td>
                </tr>
              ))}
            </tbody>
            {toplam > 0 && (
              <tfoot className="bg-yuzey">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right font-bold text-metin-ikincil">
                    Teklif Toplamı
                  </td>
                  <td className="px-4 py-3 font-bold text-metin">
                    {toplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {paraBirimi}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <TeklifIslemleri
        teklifId={teklif.id}
        talepNo={teklif.talepNo}
        durum={teklif.durum}
        gecerlilikTarihi={teklif.gecerlilikTarihi}
      />
    </div>
  );
}
