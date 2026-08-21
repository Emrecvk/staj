import { getAdminTeklifler } from "@/lib/admin-api";
import { ApiHatasi } from "@/components/admin/durum-bildirimi";
import { TeklifYonetimi } from "./teklif-yonetimi";

export const dynamic = "force-dynamic";

export default async function AdminTekliflerPage() {
  const sonuc = await getAdminTeklifler();

  if (!sonuc.success) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-metin">Teklif Talepleri</h1>
        <ApiHatasi mesaj={sonuc.message} />
      </div>
    );
  }

  return <TeklifYonetimi teklifler={sonuc.data} />;
}
