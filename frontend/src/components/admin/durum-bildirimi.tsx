import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";

/** API'den dönen hata mesajını gösterir. Sessizce boş liste göstermek yerine. */
export function ApiHatasi({ mesaj }: { mesaj: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-bold">İşlem tamamlanamadı</p>
        <p className="mt-0.5">{mesaj}</p>
      </div>
    </div>
  );
}

export function BasariBildirimi({ mesaj }: { mesaj: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
    >
      <CheckCircle2 size={18} className="shrink-0" />
      <span className="font-medium">{mesaj}</span>
    </div>
  );
}

export function BosDurum({ mesaj }: { mesaj: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-12 text-center text-gray-500">
      <Inbox size={32} className="text-gray-300" />
      <p className="text-sm">{mesaj}</p>
    </div>
  );
}

/** Sipariş / teklif / firma durumları için renkli rozet. */
export function DurumRozeti({ metin, ton }: { metin: string; ton: "gri" | "mavi" | "yesil" | "sari" | "kirmizi" }) {
  const tonlar = {
    gri: "bg-gray-100 text-gray-700",
    mavi: "bg-blue-50 text-blue-700",
    yesil: "bg-green-50 text-green-700",
    sari: "bg-amber-50 text-amber-700",
    kirmizi: "bg-red-50 text-red-700",
  } as const;

  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${tonlar[ton]}`}>
      {metin}
    </span>
  );
}
