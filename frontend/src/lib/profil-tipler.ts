/** Profil alanının tipleri. profil-api.ts "use server" olduğu için ayrı dosyada. */

export type Adres = {
  id: number;
  baslik: string;
  sehir: string;
  ilce: string;
  postaKodu: string;
  acikAdres: string;
  faturaAdresiMi: boolean;
};

export type Favori = {
  urunId: number;
  urunKodu: string;
  kisaAciklama: string;
  fiyat: number | null;
};

export type MusteriUrunKodu = {
  id: number;
  urunId: number;
  ureticiUrunKodu: string;
  musteriKodu: string;
  aciklama: string | null;
};

export type FirmaBilgisi = {
  id: number;
  unvan: string;
  vergiDairesi: string;
  vergiNo: string;
  kepAdresi: string | null;
  onayDurumu: number;
  krediLimiti: number;
  odemeVadesiGun: number;
  musteriGrubu: string | null;
  yetkiliMi: boolean;
};

export type SiparisOzeti = {
  id: number;
  siparisNo: string;
  durum: number;
  genelToplam: number;
  paraBirimi: string;
  tarih: string;
};

export type TeklifOzeti = {
  id: number;
  talepNo: string;
  durum: number;
  gecerlilikTarihi: string | null;
};

export type TeklifKalemi = {
  id: number;
  urunId: number | null;
  serbestUrunKodu: string | null;
  miktar: number;
  teklifEdilenMiktar: number | null;
  teklifEdilenBirimFiyat: number | null;
  paraBirimi: string | null;
  teklifEdilenTeslimSuresiGun: number | null;
  satisTemsilcisiNotu: string | null;
};

export type TeklifDetayi = TeklifOzeti & {
  musteriNotu: string | null;
  temsilciNotu: string | null;
  kalemler: TeklifKalemi[];
};

export type EylemSonucu<T = void> =
  | { success: true; data: T }
  | { success: false; message: string };
