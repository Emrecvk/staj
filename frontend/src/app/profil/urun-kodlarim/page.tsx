import { musteriUrunKodlariniGetir } from "@/lib/profil-api";
import { MusteriUrunKodlari } from "./urun-kodlari";

export const dynamic = "force-dynamic";

export default async function MusteriUrunKodlariPage() {
  const kodlar = await musteriUrunKodlariniGetir();
  return <MusteriUrunKodlari kodlar={kodlar} />;
}
