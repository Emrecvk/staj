import { getAdminBlogYazilari } from "@/lib/admin-api";
import { ApiHatasi } from "@/components/admin/durum-bildirimi";
import { IcerikYonetimi } from "./icerik-yonetimi";

export const dynamic = "force-dynamic";

export default async function AdminIceriklerPage() {
  const sonuc = await getAdminBlogYazilari();

  if (!sonuc.success) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">İçerik Yönetimi</h1>
        <ApiHatasi mesaj={sonuc.message} />
      </div>
    );
  }

  return <IcerikYonetimi yazilar={sonuc.data} />;
}
