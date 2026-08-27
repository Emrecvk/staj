"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, AlertTriangle, Check } from "lucide-react";
import { addToCart } from "@/lib/cart-actions";
import { notifyCartUpdated } from "@/lib/stores/header-state";
import { bildir } from "@/components/ui/bildirim";
import { Buton } from "@/components/ui/buton";
import { Kisaltma } from "@/components/ui/ipucu";
import { StokRozeti } from "@/components/ui/rozet";
import {
  kademeSec, kademeUlasilabilirMi, miktariDogrulaAmbalaj, paraBicimle,
} from "@/lib/miktar-kurali";
import type { PackagingOption } from "@/lib/api";

/**
 * Ambalaj seçimi, kademeli fiyat tablosu ve sepete ekleme.
 *
 * Önceki sürümde her ambalaj kendi kartını, kendi fiyat tablosunu ve kendi
 * formunu basıyordu; üç ambalajlı bir üründe sayfa üç kez tekrar ediyor ve
 * kullanıcı hangisini seçtiğini kaybediyordu. Artık tek seçim, tek tablo,
 * tek miktar kontrolü.
 *
 * Sayfanın asıl işi şu soruya cevap vermek: "bu miktarda birim fiyatım ne
 * olacak?" Bu yüzden geçerli kademe canlı olarak vurgulanıyor ve satır
 * toplamı miktarla birlikte güncelleniyor.
 */
export function AmbalajSecici({ ambalajlar }: { ambalajlar: PackagingOption[] }) {
  const router = useRouter();
  const [beklemede, gecisBaslat] = useTransition();

  const [seciliId, setSeciliId] = useState(ambalajlar[0]?.ambalajId ?? 0);
  const secili = ambalajlar.find((a) => a.ambalajId === seciliId) ?? ambalajlar[0];

  const [miktar, setMiktar] = useState(() => Math.max(secili?.moq ?? 1, 1));

  if (!secili) return null;

  const dogrulama = miktariDogrulaAmbalaj(miktar, secili);
  const etkinMiktar = dogrulama.gecerliMi ? miktar : dogrulama.onerilenMiktar;
  const aktifKademe = kademeSec(secili.fiyatlar, etkinMiktar);
  const satirToplami = aktifKademe ? aktifKademe.birimFiyat * etkinMiktar : null;

  const stokYetersiz = etkinMiktar > secili.stokMiktari;

  const ambalajDegistir = (ambalajId: number) => {
    const yeni = ambalajlar.find((a) => a.ambalajId === ambalajId);
    if (!yeni) return;
    setSeciliId(ambalajId);
    // Yeni ambalajin MOQ'su farkli olabilir; miktari ona gore sifirla.
    setMiktar(Math.max(yeni.moq, 1));
  };

  const sepeteEkle = () => {
    gecisBaslat(async () => {
      // Gecersiz miktarda onerilen degeri gonderiyoruz; sunucu ayrica dogruluyor.
      const sonuc = await addToCart(secili.ambalajId, etkinMiktar);

      if (sonuc.success) {
        bildir.eylemli(
          "Sepete eklendi",
          "Sepete git",
          () => router.push("/sepet"),
          `${etkinMiktar.toLocaleString("tr-TR")} adet · ${secili.ad}`,
        );
        notifyCartUpdated();
        router.refresh();
      } else {
        bildir.hata("Sepete eklenemedi", sonuc.message);
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Ambalaj seçimi. Tek ambalaj varsa sekme göstermek gereksiz gürültü. */}
      {ambalajlar.length > 1 && (
        <div>
          <span className="mb-2 block text-sm font-medium text-metin">Ambalaj</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ambalaj seçimi">
            {ambalajlar.map((a) => (
              <button
                key={a.ambalajId}
                type="button"
                onClick={() => ambalajDegistir(a.ambalajId)}
                aria-pressed={a.ambalajId === seciliId}
                className={`rounded-token-girdi border px-3 py-2 text-sm font-medium
                            transition-[background-color,border-color,color,transform]
                            duration-[var(--sure-basma)] ease-[var(--ease-cikis)] active:scale-[0.97]
                            ${a.ambalajId === seciliId
                              ? "border-vurgu bg-vurgu-zemin text-vurgu-guclu"
                              : "border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin"}`}
              >
                {a.ad}
                <span className="ml-2 font-mono text-xs tabular-nums opacity-70">
                  {a.stokMiktari.toLocaleString("tr-TR")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sipariş kuralları. Kısaltmalar ipucuyla açıklanıyor: satın almacı
          MOQ ile MPQ farkını bilmek zorunda değil. */}
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-token-kart border border-kenar bg-kenar">
        {[
          { kod: "MOQ", deger: secili.moq, aciklama: "Minimum sipariş" },
          { kod: "MPQ", deger: secili.mpq, aciklama: "Ambalaj içi adet" },
          { kod: "Katlama", deger: secili.katlamaMiktari, aciklama: "Artış adımı" },
        ].map((satir) => (
          <div key={satir.kod} className="bg-yuzey-kart p-3">
            <dt className="text-[11px] text-metin-ucuncul">
              {satir.kod === "Katlama" ? "Katlama" : <Kisaltma kod={satir.kod} />}
            </dt>
            <dd className="font-mono text-sm font-bold tabular-nums text-metin">
              {satir.deger.toLocaleString("tr-TR")}
            </dd>
            <dd className="text-[10px] text-metin-ucuncul">{satir.aciklama}</dd>
          </div>
        ))}
      </dl>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-metin">Kademeli fiyat</span>
          <StokRozeti miktar={secili.stokMiktari} gelecekStok={secili.gelecekStokMiktari} />
        </div>

        <div className="overflow-hidden rounded-token-kart border border-kenar">
          <table className="w-full text-sm">
            <thead className="bg-yuzey-gomulu text-left text-xs text-metin-ucuncul">
              <tr>
                <th className="px-3 py-2 font-medium">Miktar</th>
                <th className="px-3 py-2 text-right font-medium">Birim fiyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kenar">
              {secili.fiyatlar.map((kademe) => {
                const aktif = aktifKademe
                  && kademe.minMiktar === aktifKademe.minMiktar
                  && kademe.birimFiyat === aktifKademe.birimFiyat;
                const ulasilabilir = kademeUlasilabilirMi(kademe, secili.moq);

                return (
                  <tr
                    key={`${kademe.minMiktar}-${kademe.birimFiyat}`}
                    className={
                      aktif ? "bg-vurgu-zemin" : ulasilabilir ? "" : "opacity-45"
                    }
                  >
                    <td className="px-3 py-2 font-mono tabular-nums text-metin">
                      {kademe.minMiktar.toLocaleString("tr-TR")}
                      {kademe.maxMiktar
                        ? ` - ${kademe.maxMiktar.toLocaleString("tr-TR")}`
                        : "+"}
                      {aktif && (
                        <Check size={13} className="ml-1.5 inline text-vurgu-guclu" aria-label="Geçerli kademe" />
                      )}
                      {!ulasilabilir && (
                        <span className="ml-1.5 text-[10px] font-sans text-metin-ucuncul">
                          MOQ altı
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-mono tabular-nums ${
                        aktif ? "font-bold text-vurgu-guclu" : "text-metin-ikincil"
                      }`}
                    >
                      {paraBicimle(kademe.birimFiyat, kademe.paraBirimi)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Kademeler 1'den baslarken MOQ cok daha yuksekse kullanici tabloda
            asla ulasamayacagi fiyatlar goruyor. Bunu acikca soyluyoruz. */}
        {secili.fiyatlar.some((k) => !kademeUlasilabilirMi(k, secili.moq)) && (
          <p className="mt-2 text-xs leading-relaxed text-metin-ucuncul">
            Soluk satırlar bu ambalajın minimum sipariş miktarının altında kaldığı için
            sipariş edilemez.
          </p>
        )}
      </div>

      <div className="rounded-token-kart border border-kenar bg-yuzey-gomulu p-4">
        <label htmlFor="miktar-girdisi" className="mb-1.5 block text-sm font-medium text-metin">
          Miktar
        </label>

        <div className="flex gap-2">
          <input
            id="miktar-girdisi"
            type="number"
            inputMode="numeric"
            min={secili.moq}
            step={secili.katlamaMiktari}
            value={miktar}
            onChange={(olay) => setMiktar(parseInt(olay.target.value, 10) || 0)}
            aria-invalid={!dogrulama.gecerliMi}
            aria-describedby="miktar-yardim"
            className={`w-36 rounded-token-girdi border bg-yuzey-kart px-3 py-2
                        text-center font-mono tabular-nums text-metin
                        ${dogrulama.gecerliMi ? "border-kenar" : "border-uyari-500"}`}
          />

          <Buton
            gorunum="vurgu"
            onClick={sepeteEkle}
            yukleniyor={beklemede}
            ikon={<ShoppingCart size={16} />}
            className="flex-grow"
          >
            Sepete ekle
          </Buton>
        </div>

        <div id="miktar-yardim" className="mt-2 space-y-1.5 text-xs">
          {!dogrulama.gecerliMi && (
            <p className="flex items-start gap-1.5 text-uyari-600">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden />
              <span>
                {dogrulama.hata}{" "}
                <button
                  type="button"
                  onClick={() => setMiktar(dogrulama.onerilenMiktar)}
                  className="font-semibold underline underline-offset-2"
                >
                  {dogrulama.onerilenMiktar.toLocaleString("tr-TR")} adede yuvarla
                </button>
              </span>
            </p>
          )}

          {stokYetersiz && (
            <p className="text-metin-ucuncul">
              Stokta {secili.stokMiktari.toLocaleString("tr-TR")} adet var; kalanı için
              tedarik süresi uygulanır.
            </p>
          )}

          {aktifKademe && satirToplami !== null && (
            <p className="text-metin-ikincil">
              <span className="font-mono tabular-nums">
                {etkinMiktar.toLocaleString("tr-TR")}
              </span>{" "}
              adet ×{" "}
              <span className="font-mono tabular-nums">
                {paraBicimle(aktifKademe.birimFiyat, aktifKademe.paraBirimi)}
              </span>{" "}
              ={" "}
              <b className="font-mono tabular-nums text-metin">
                {paraBicimle(satirToplami, aktifKademe.paraBirimi, 2)}
              </b>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
