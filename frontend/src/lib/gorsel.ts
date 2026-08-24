/**
 * Bir ürün görsel URL'inin GERÇEK bir dosyaya işaret edip etmediğini söyler.
 *
 * `/gorseller/komponent/*.svg` seed yolları hiçbir ortamda servis edilmiyor
 * (hepsi 404); bunlar temsili yer tutuculardır, gerçek görsel değildir.
 * Ana sayfa vitrini yalnızca gerçek görseli olan ürünleri göstermeli.
 */
export function gercekGorselVarMi(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("/gorseller/komponent/")) return false;
  return true;
}
