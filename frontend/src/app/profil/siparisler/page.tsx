import { siparisleriGetir } from "@/lib/profil-api";
import { SIPARIS_DURUMLARI } from "@/lib/admin-tipler";
import { DurumRozeti } from "@/components/admin/durum-bildirimi";

export const dynamic = "force-dynamic";

function durumTonu(durum: number) {
  if (durum === 6) return "yesil" as const;
  if (durum === 7 || durum === 8) return "kirmizi" as const;
  if (durum === 1 || durum === 2) return "sari" as const;
  return "mavi" as const;
}

export default async function SiparislerPage() {
  const siparisler = await siparisleriGetir();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-metin">Siparişlerim</h1>

      {siparisler.length === 0 ? (
        <div className="rounded-xl border border-kenar p-12 text-center">
          <p className="text-metin-ucuncul">Henüz bir siparişiniz bulunmuyor.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-kenar">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-yuzey text-left text-xs uppercase tracking-wide text-metin-ucuncul">
                <tr>
                  <th className="px-4 py-3">Sipariş No</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kenar">
                {siparisler.map((s) => (
                  <tr key={s.id} className="hover:bg-yuzey">
                    <td className="px-4 py-4 font-bold text-marka">{s.siparisNo}</td>
                    <td className="px-4 py-4 text-metin-ikincil">
                      {new Date(s.tarih).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-4">
                      <DurumRozeti
                        metin={SIPARIS_DURUMLARI[s.durum] ?? `#${s.durum}`}
                        ton={durumTonu(s.durum)}
                      />
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-metin">
                      {s.genelToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {s.paraBirimi}
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
