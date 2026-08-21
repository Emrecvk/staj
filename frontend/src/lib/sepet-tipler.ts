/** Sepet ve sipariş tipleri. cart-actions.ts "use server" olduğu için ayrı dosyada. */

export type SepetKalemi = {
  kalemId: number;
  urunId: number;
  urunKodu: string;
  kisaAciklama: string;
  urunAmbalajId: number;
  /** MOQ/katlama kuralında kullanılan satış katsayısı. */
  satistakiKatsayi: number;
  miktar: number;
  birimFiyat: number;
  toplamFiyat: number;
};

export type Sepet = {
  sepetId: number;
  oturumAnahtari: string | null;
  kalemler: SepetKalemi[];
  genelToplam: number;
  paraBirimi: string;
};

export type SiparisOlusturIstegi = {
  faturaAdresiId: number;
  teslimatAdresiId: number;
  musteriNotu?: string;
};

export type TeklifOlusturIstegi = {
  musteriNotu?: string;
};
