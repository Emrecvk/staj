import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

/* ---------------------------------------------------------------------------
   Buton

   Hareket kararları:
   - :active üzerinde scale(0.97). Basıldığında arayüzün kullanıcıyı gerçekten
     duyduğunu anlatan tek şey bu. 160ms, ease-out.
   - transition ALL değil: yalnızca transform, background ve border animasyonlu.
     `all` yazmak yazı tipi ve gölge gibi pahalı özellikleri de animasyona sokar.
   - Hover, (hover: hover) arkasına alındı. Dokunmatik cihazlarda hover dokunuşla
     tetikleniyor ve buton parmağın altında takılı kalıyor.
   --------------------------------------------------------------------------- */

type Gorunum = "birincil" | "vurgu" | "anahat" | "sessiz" | "tehlike";
type Boyut = "kucuk" | "orta" | "buyuk";

const gorunumler: Record<Gorunum, string> = {
  // Lacivert: sayfa başına bir ana eylem.
  birincil:
    "bg-marka text-dolgu-uzeri hover:bg-marka-hover disabled:bg-notr-300 disabled:text-notr-500",
  // Camgöbeği: dönüşüm eylemleri (sepete ekle, teklif iste).
  vurgu:
    "bg-vurgu text-white hover:bg-vurgu-guclu disabled:bg-notr-300 disabled:text-notr-500",
  anahat:
    "border border-kenar-guclu bg-yuzey-kart text-metin hover:bg-yuzey-gomulu disabled:text-metin-ucuncul",
  sessiz:
    "text-metin-ikincil hover:bg-yuzey-gomulu hover:text-metin disabled:text-metin-ucuncul",
  tehlike:
    "border border-hata-500/30 bg-hata-50 text-hata-600 hover:bg-hata-500 hover:text-white disabled:opacity-50",
};

const boyutlar: Record<Boyut, string> = {
  kucuk: "h-8 gap-1.5 px-3 text-xs",
  orta: "h-10 gap-2 px-4 text-sm",
  buyuk: "h-12 gap-2 px-6 text-base",
};

const temel = [
  "inline-flex items-center justify-center rounded-[var(--radius-girdi)] font-semibold",
  "whitespace-nowrap select-none",
  "transition-[transform,background-color,border-color,color]",
  "duration-[var(--sure-basma)] ease-[var(--ease-cikis)]",
  "active:scale-[0.97]",
  "disabled:pointer-events-none disabled:active:scale-100",
].join(" ");

export type ButonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  gorunum?: Gorunum;
  boyut?: Boyut;
  yukleniyor?: boolean;
  ikon?: ReactNode;
  tamGenislik?: boolean;
};

export const Buton = forwardRef<HTMLButtonElement, ButonProps>(function Buton(
  {
    gorunum = "birincil",
    boyut = "orta",
    yukleniyor = false,
    ikon,
    tamGenislik = false,
    className = "",
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || yukleniyor}
      // Ekran okuyucu yükleme durumunu duysun.
      aria-busy={yukleniyor || undefined}
      className={`${temel} ${gorunumler[gorunum]} ${boyutlar[boyut]} ${
        tamGenislik ? "w-full" : ""
      } ${className}`}
      {...rest}
    >
      {yukleniyor ? (
        <Loader2 size={boyut === "kucuk" ? 14 : 16} className="animate-spin" aria-hidden />
      ) : (
        ikon
      )}
      {children}
    </button>
  );
});

/* Link olarak davranan buton. Gezinme <a> olmalı: Ctrl+tık, orta tık ve
   "yeni sekmede aç" davranışları button ile çalışmıyor. */
export function ButonLink({
  href,
  gorunum = "birincil",
  boyut = "orta",
  ikon,
  tamGenislik = false,
  className = "",
  children,
}: {
  href: string;
  gorunum?: Gorunum;
  boyut?: Boyut;
  ikon?: ReactNode;
  tamGenislik?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${temel} ${gorunumler[gorunum]} ${boyutlar[boyut]} ${
        tamGenislik ? "w-full" : ""
      } ${className}`}
    >
      {ikon}
      {children}
    </Link>
  );
}
