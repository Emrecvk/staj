import Link from "next/link";
import { teklifleriGetir } from "@/lib/profil-api";
import { TEKLIF_DURUMLARI } from "@/lib/admin-tipler";
import { DurumRozeti } from "@/components/admin/durum-bildirimi";

export const dynamic = "force-dynamic";

function durumTonu(durum: number) {
  if (durum === 5 || durum === 8) return "yesil" as const;
  if (durum === 6 || durum === 7) return "kirmizi" as const;
  if (durum === 4) return "sari" as const;
  return "mavi" as const;
}

export default async function TekliflerPage() {
  const teklifler = await teklifleriGetir();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-metin">Tekliflerim</h1>
      <p className="mb-6 text-sm text-metin-ucuncul">
        Fiyatlandırılan teklifleri detay sayfasından kabul edebilir veya reddedebilirsiniz.
      </p>

      {teklifler.length === 0 ? (
        <div className="rounded-xl border border-kenar p-12 text-center">
          <p className="mb-4 text-metin-ucuncul">Henüz bir teklif talebiniz bulunmuyor.</p>
          <Link
            href="/teklif-iste"
            className="inline-block rounded-lg bg-vurgu px-5 py-2.5 text-sm font-bold text-white hover:bg-opacity-90"
          >
            Teklif İste
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-kenar">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-yuzey text-left text-xs uppercase tracking-wide text-metin-ucuncul">
                <tr>
                  <th className="px-4 py-3">Talep No</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Geçerlilik</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kenar">
                {teklifler.map((t) => (
                  <tr key={t.id} className="hover:bg-yuzey">
                    <td className="px-4 py-4 font-bold text-metin-marka">
                      <Link href={`/profil/teklifler/${t.id}`} className="hover:underline">
                        {t.talepNo}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <DurumRozeti
                        metin={TEKLIF_DURUMLARI[t.durum] ?? `#${t.durum}`}
                        ton={durumTonu(t.durum)}
                      />
                    </td>
                    <td className="px-4 py-4 text-metin-ikincil">
                      {t.gecerlilikTarihi
                        ? new Date(t.gecerlilikTarihi).toLocaleDateString("tr-TR")
                        : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/profil/teklifler/${t.id}`}
                        className="text-xs font-medium text-vurgu hover:underline"
                      >
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
