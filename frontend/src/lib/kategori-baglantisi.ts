import type { Category } from "@/lib/api";

function kategoriAgaciniDuzlestir(dallar: Category[]): Category[] {
  return dallar.flatMap((dal) => [
    dal,
    ...kategoriAgaciniDuzlestir(dal.altKategoriler ?? []),
  ]);
}

function kategoriAdiniNormallestir(deger: string) {
  return deger
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9çğıöşü]/g, "");
}

/** Vitrin ağacındaki bir adı gerçek katalog kategorisine veya aramaya bağlar. */
export function kategoriBaglantisiniKur(kategoriler: Category[], ad: string) {
  const aranan = kategoriAdiniNormallestir(ad);
  const eslesen = kategoriAgaciniDuzlestir(kategoriler).find(
    (kategori) => kategoriAdiniNormallestir(kategori.ad) === aranan,
  );

  return eslesen
    ? `/urunler?kategoriId=${eslesen.id}`
    : `/urunler?aramaMetni=${encodeURIComponent(ad)}`;
}
