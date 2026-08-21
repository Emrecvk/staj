import { getAdminSiparisler } from "@/lib/admin-api";
import { ApiHatasi } from "@/components/admin/durum-bildirimi";
import { SiparisYonetimi } from "./siparis-yonetimi";

export const dynamic = "force-dynamic";

export default async function AdminSiparislerPage({ searchParams }: {
  searchParams: Promise<{ durum?: string }>;
}) {
  const params = await searchParams;
  const durum = params.durum ? Number(params.durum) : undefined;

  const sonuc = await getAdminSiparisler(durum);

  if (!sonuc.success) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
        <ApiHatasi mesaj={sonuc.message} />
      </div>
    );
  }

  return <SiparisYonetimi siparisler={sonuc.data} seciliDurum={durum} />;
}
