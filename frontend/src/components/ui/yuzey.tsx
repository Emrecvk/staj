import type { ReactNode } from "react";
import { Inbox, AlertCircle, RotateCw } from "lucide-react";
import { Buton, ButonLink } from "./buton";

/* ---------------------------------------------------------------------------
   Yüzeyler: kart, bölüm başlığı, iskelet, boş ve hata durumları
   --------------------------------------------------------------------------- */

/**
 * Kart.
 *
 * Kart yalnızca yükselti GERÇEK bir hiyerarşi anlatıyorsa kullanılır.
 * Sadece gruplamak için kart açma; `border-t` veya boşluk çoğu zaman
 * daha temiz. Kart içinde kart hiç açma.
 */
export function Kart({
  className = "", tiklanabilir = false, children,
}: {
  className?: string;
  /** Tıklanabilir kartlar hover'da hafifçe yükselir. Statik kartlar kıpırdamaz. */
  tiklanabilir?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-[var(--radius-kart)] border border-kenar bg-yuzey-kart shadow-[var(--shadow-kart)]
        ${tiklanabilir
          ? "transition-[box-shadow,border-color] duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] hover:border-kenar-guclu hover:shadow-[var(--shadow-yukselti)]"
          : ""
        } ${className}`}
    >
      {children}
    </div>
  );
}

export function BolumBasligi({
  baslik, aciklama, eylem,
}: {
  baslik: string;
  aciklama?: string;
  eylem?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-metin">{baslik}</h2>
        {aciklama && (
          <p className="mt-1 max-w-[65ch] text-sm text-metin-ikincil">{aciklama}</p>
        )}
      </div>
      {eylem}
    </div>
  );
}

/**
 * İskelet yükleyici.
 *
 * Nihai içeriğin ŞEKLİNİ taklit eder; dönen çember değil. Kullanıcı ne
 * geleceğini görünce bekleyiş kısalmış hissettirir ve içerik yerleştiğinde
 * sayfa zıplamaz.
 *
 * Pulse animasyonu prefers-reduced-motion altında globals.css tarafından
 * zaten durduruluyor.
 */
export function Iskelet({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-[var(--radius-girdi)] bg-yuzey-gomulu ${className}`}
    />
  );
}

/** Ürün kartı iskeleti: gerçek kartla aynı ölçülerde, CLS üretmez. */
export function UrunKartiIskeleti() {
  return (
    <Kart className="p-4">
      <Iskelet className="mb-4 aspect-square w-full" />
      <Iskelet className="mb-2 h-3 w-1/3" />
      <Iskelet className="mb-2 h-4 w-3/4" />
      <Iskelet className="mb-4 h-3 w-full" />
      <Iskelet className="h-6 w-1/2" />
    </Kart>
  );
}

export function BosDurum({
  baslik, aciklama, ikon, eylemMetni, eylemHref,
}: {
  baslik: string;
  aciklama: string;
  ikon?: ReactNode;
  eylemMetni?: string;
  eylemHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 text-metin-ucuncul/50">{ikon ?? <Inbox size={36} strokeWidth={1.5} />}</div>
      <h3 className="mb-1.5 text-base font-bold text-metin">{baslik}</h3>
      <p className="mb-6 max-w-[42ch] text-sm text-metin-ikincil">{aciklama}</p>
      {eylemMetni && eylemHref && (
        <ButonLink href={eylemHref} gorunum="vurgu">
          {eylemMetni}
        </ButonLink>
      )}
    </div>
  );
}

/**
 * Hata durumu.
 *
 * Backend kapalıyken kullanıcı boş bir sayfa değil, ne olduğunu ve ne
 * yapabileceğini görmeli. `onTekrarDene` verilirse yeniden deneme sunulur.
 */
export function HataDurumu({
  baslik = "İçerik yüklenemedi",
  aciklama,
  onTekrarDene,
}: {
  baslik?: string;
  aciklama: string;
  onTekrarDene?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="mb-4 text-hata-500">
        <AlertCircle size={36} strokeWidth={1.5} />
      </div>
      <h3 className="mb-1.5 text-base font-bold text-metin">{baslik}</h3>
      <p className="mb-6 max-w-[46ch] text-sm text-metin-ikincil">{aciklama}</p>
      {onTekrarDene && (
        <Buton gorunum="anahat" onClick={onTekrarDene} ikon={<RotateCw size={15} />}>
          Tekrar dene
        </Buton>
      )}
    </div>
  );
}

/** Sayfa genişliğini sınırlayan kapsayıcı. Tüm sayfalar aynı ölçüyü kullanır. */
export function Kapsayici({
  className = "", children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
