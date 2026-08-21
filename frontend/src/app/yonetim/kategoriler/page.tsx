import { getAdminKategoriler, getAdminUreticiler, getAdminOzellikler } from "@/lib/admin-api";
import { ApiHatasi } from "@/components/admin/durum-bildirimi";
import { TanimYonetimi } from "./tanim-yonetimi";

export const dynamic = "force-dynamic";

export default async function AdminTanimlarPage() {
  const [kategoriler, ureticiler, ozellikler] = await Promise.all([
    getAdminKategoriler(),
    getAdminUreticiler(),
    getAdminOzellikler(),
  ]);

  // Üçü de düştüyse gösterecek hiçbir şey yok; tek tek düşenler sekmede boş görünür.
  if (!kategoriler.success && !ureticiler.success && !ozellikler.success) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Kategori, Üretici ve Özellikler</h1>
        <ApiHatasi mesaj={kategoriler.message} />
      </div>
    );
  }

  return (
    <TanimYonetimi
      kategoriler={kategoriler.success ? kategoriler.data : []}
      ureticiler={ureticiler.success ? ureticiler.data : []}
      ozellikler={ozellikler.success ? ozellikler.data : []}
    />
  );
}
