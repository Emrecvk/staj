import { getAdminUrunler, getAdminKategoriler, getAdminUreticiler } from "@/lib/admin-api";
import { ApiHatasi } from "@/components/admin/durum-bildirimi";
import { UrunYonetimi } from "./urun-yonetimi";

export const dynamic = "force-dynamic";

export default async function AdminUrunlerPage({ searchParams }: {
  searchParams: Promise<{ arama?: string; silinmisler?: string }>;
}) {
  const params = await searchParams;
  const arama = params.arama ?? "";
  const silinmisleriGoster = params.silinmisler === "1";

  const [urunler, kategoriler, ureticiler] = await Promise.all([
    getAdminUrunler({ arama, silinmisleriGoster, boyut: 100 }),
    getAdminKategoriler(),
    getAdminUreticiler(),
  ]);

  if (!urunler.success) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-metin">Ürün Yönetimi</h1>
        <ApiHatasi mesaj={urunler.message} />
      </div>
    );
  }

  return (
    <UrunYonetimi
      urunler={urunler.data.kayitlar}
      toplam={urunler.data.toplam}
      kategoriler={kategoriler.success ? kategoriler.data : []}
      ureticiler={ureticiler.success ? ureticiler.data : []}
      arama={arama}
      silinmisleriGoster={silinmisleriGoster}
    />
  );
}
