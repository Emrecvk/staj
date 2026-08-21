import { adresleriGetir } from "@/lib/profil-api";
import { AdresYonetimi } from "./adres-yonetimi";

export const dynamic = "force-dynamic";

export default async function AdreslerPage() {
  const adresler = await adresleriGetir();
  return <AdresYonetimi adresler={adresler} />;
}
