import { getBekleyenFirmalar } from "@/lib/admin-api";
import { ApiHatasi } from "@/components/admin/durum-bildirimi";
import { FirmaOnaylari } from "./firma-onaylari";

export const dynamic = "force-dynamic";

export default async function AdminFirmalarPage() {
  const sonuc = await getBekleyenFirmalar();

  if (!sonuc.success) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-metin">Firma Başvuruları</h1>
        <ApiHatasi mesaj={sonuc.message} />
      </div>
    );
  }

  return <FirmaOnaylari firmalar={sonuc.data} />;
}
