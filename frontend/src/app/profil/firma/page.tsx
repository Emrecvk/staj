import Link from "next/link";
import { Building2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { firmaBilgisiGetir } from "@/lib/profil-api";
import { FIRMA_ONAY_DURUMLARI } from "@/lib/admin-tipler";

export const dynamic = "force-dynamic";

const BEKLEMEDE = 1, ONAYLANDI = 2, REDDEDILDI = 3;

function DurumSatiri({ durum }: { durum: number }) {
  if (durum === ONAYLANDI) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-green-700">
        <CheckCircle2 size={18} /> Firmanız onaylandı. Kurumsal fiyatlara ve teklif akışına erişebilirsiniz.
      </p>
    );
  }
  if (durum === REDDEDILDI) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-red-700">
        <XCircle size={18} /> Başvurunuz reddedildi. Bilgilerinizi gözden geçirip tekrar başvurabilirsiniz.
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-amber-700">
      <Clock size={18} /> Başvurunuz inceleniyor. Onaylanana kadar bireysel fiyatlarla alışveriş yapabilirsiniz.
    </p>
  );
}

function Alan({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{etiket}</dt>
      <dd className="mt-0.5 font-medium text-gray-900">{deger}</dd>
    </div>
  );
}

export default async function FirmaPage() {
  const firma = await firmaBilgisiGetir();

  if (!firma) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 py-20 text-center">
        <Building2 size={40} className="mb-4 text-gray-300" />
        <h3 className="mb-2 text-lg font-bold text-gray-700">Firma Hesabınız Yok</h3>
        <p className="mb-6 max-w-md text-gray-500">
          Kurumsal fiyatlar, vadeli ödeme ve teklif isteme akışı için firma başvurusu yapın.
        </p>
        <Link
          href="/kayit/kurumsal"
          className="rounded-lg bg-brand-cyan px-6 py-3 font-bold text-white hover:bg-opacity-90"
        >
          Firma Başvurusu Yap
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Firma Bilgileri</h1>

      <div className="mb-6 rounded-xl border border-gray-200 p-5">
        <DurumSatiri durum={firma.onayDurumu} />
      </div>

      <dl className="grid grid-cols-1 gap-5 rounded-xl border border-gray-200 p-5 sm:grid-cols-2">
        <Alan etiket="Unvan" deger={firma.unvan} />
        <Alan etiket="Onay Durumu" deger={FIRMA_ONAY_DURUMLARI[firma.onayDurumu] ?? "—"} />
        <Alan etiket="Vergi Dairesi" deger={firma.vergiDairesi} />
        <Alan etiket="Vergi No" deger={firma.vergiNo} />
        <Alan etiket="KEP Adresi" deger={firma.kepAdresi ?? "—"} />
        <Alan etiket="Müşteri Grubu" deger={firma.musteriGrubu ?? "Tanımlı değil"} />

        {/* Ticari koşullar yalnızca onaylı firmada anlamlı. */}
        {firma.onayDurumu === ONAYLANDI && (
          <>
            <Alan
              etiket="Kredi Limiti"
              deger={firma.krediLimiti.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            />
            <Alan etiket="Ödeme Vadesi" deger={`${firma.odemeVadesiGun} gün`} />
          </>
        )}

        <Alan etiket="Yetki" deger={firma.yetkiliMi ? "Firma yetkilisi" : "Firma kullanıcısı"} />
      </dl>

      {firma.onayDurumu === BEKLEMEDE && (
        <p className="mt-4 text-sm text-gray-500">
          Onay süreci genellikle 1 iş günü sürer. Sorularınız için satış temsilcinizle iletişime geçebilirsiniz.
        </p>
      )}
    </div>
  );
}
