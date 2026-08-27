import type { Metadata } from "next";
import { getCategories } from "@/lib/api";
import { KvkkClient } from "./kvkk-client";

export const metadata: Metadata = {
  title: "KVKK Politikası",
  description: "Kişisel verilerin korunması ve işlenmesine ilişkin aydınlatma metni.",
};

export default async function KvkkPolitikasiPage() {
  const kategoriler = await getCategories();
  return <KvkkClient kategoriler={kategoriler} />;
}
