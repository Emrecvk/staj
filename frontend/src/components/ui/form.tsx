import { forwardRef, useId } from "react";
import type {
  InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode,
} from "react";
import { AlertCircle } from "lucide-react";

/* ---------------------------------------------------------------------------
   Form alanları

   Kurallar:
   - Etiket HER ZAMAN girdinin ÜSTÜNDE. Placeholder etiket yerine kullanılmaz:
     kullanıcı yazmaya başladığında alanın ne olduğunu unutur ve ekran
     okuyucular placeholder'ı güvenilir biçimde okumaz.
   - Hata metni girdinin ALTINDA ve aria-describedby ile bağlı.
   - Girdi kimliği useId ile üretilir; aynı form iki kez render edilse bile
     etiket doğru alana bağlı kalır.
   --------------------------------------------------------------------------- */

const girdiTemel = [
  "w-full rounded-[var(--radius-girdi)] border bg-yuzey-kart px-3 text-sm text-metin",
  "placeholder:text-metin-ucuncul",
  "transition-[border-color,box-shadow] duration-[var(--sure-ipucu)] ease-[var(--ease-cikis)]",
  "disabled:cursor-not-allowed disabled:bg-yuzey-gomulu disabled:text-metin-ucuncul",
].join(" ");

function kenarSinifi(hataliMi: boolean) {
  return hataliMi
    ? "border-hata-500 focus:border-hata-500"
    : "border-kenar hover:border-kenar-guclu focus:border-vurgu";
}

function Sarmalayici({
  etiket, ipucu, hata, alanId, gerekli, children,
}: {
  etiket: string;
  ipucu?: string;
  hata?: string;
  alanId: string;
  gerekli?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={alanId} className="text-sm font-medium text-metin">
        {etiket}
        {gerekli && (
          <span className="ml-1 text-hata-500" aria-label="zorunlu alan">
            *
          </span>
        )}
      </label>

      {children}

      {ipucu && !hata && (
        <p id={`${alanId}-ipucu`} className="text-xs text-metin-ucuncul">
          {ipucu}
        </p>
      )}

      {hata && (
        <p
          id={`${alanId}-hata`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-hata-600"
        >
          <AlertCircle size={13} aria-hidden />
          {hata}
        </p>
      )}
    </div>
  );
}

export type GirdiProps = InputHTMLAttributes<HTMLInputElement> & {
  etiket: string;
  ipucu?: string;
  hata?: string;
  /** Ürün kodu, miktar, fiyat gibi alanlarda mono ve hizalı rakam. */
  sayisalMi?: boolean;
};

export const Girdi = forwardRef<HTMLInputElement, GirdiProps>(function Girdi(
  { etiket, ipucu, hata, sayisalMi, className = "", required, id, ...rest },
  ref,
) {
  const uretilenId = useId();
  const alanId = id ?? uretilenId;

  return (
    <Sarmalayici etiket={etiket} ipucu={ipucu} hata={hata} alanId={alanId} gerekli={required}>
      <input
        ref={ref}
        id={alanId}
        required={required}
        aria-invalid={hata ? true : undefined}
        aria-describedby={hata ? `${alanId}-hata` : ipucu ? `${alanId}-ipucu` : undefined}
        className={`${girdiTemel} ${kenarSinifi(!!hata)} h-10 ${
          sayisalMi ? "font-mono tabular-nums" : ""
        } ${className}`}
        {...rest}
      />
    </Sarmalayici>
  );
});

export type SecimProps = SelectHTMLAttributes<HTMLSelectElement> & {
  etiket: string;
  ipucu?: string;
  hata?: string;
};

export const Secim = forwardRef<HTMLSelectElement, SecimProps>(function Secim(
  { etiket, ipucu, hata, className = "", required, id, children, ...rest },
  ref,
) {
  const uretilenId = useId();
  const alanId = id ?? uretilenId;

  return (
    <Sarmalayici etiket={etiket} ipucu={ipucu} hata={hata} alanId={alanId} gerekli={required}>
      <select
        ref={ref}
        id={alanId}
        required={required}
        aria-invalid={hata ? true : undefined}
        aria-describedby={hata ? `${alanId}-hata` : ipucu ? `${alanId}-ipucu` : undefined}
        className={`${girdiTemel} ${kenarSinifi(!!hata)} h-10 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </Sarmalayici>
  );
});

export type AlanProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  etiket: string;
  ipucu?: string;
  hata?: string;
};

export const MetinAlani = forwardRef<HTMLTextAreaElement, AlanProps>(function MetinAlani(
  { etiket, ipucu, hata, className = "", required, id, rows = 4, ...rest },
  ref,
) {
  const uretilenId = useId();
  const alanId = id ?? uretilenId;

  return (
    <Sarmalayici etiket={etiket} ipucu={ipucu} hata={hata} alanId={alanId} gerekli={required}>
      <textarea
        ref={ref}
        id={alanId}
        rows={rows}
        required={required}
        aria-invalid={hata ? true : undefined}
        aria-describedby={hata ? `${alanId}-hata` : ipucu ? `${alanId}-ipucu` : undefined}
        className={`${girdiTemel} ${kenarSinifi(!!hata)} resize-y py-2 ${className}`}
        {...rest}
      />
    </Sarmalayici>
  );
});

/* Onay kutusu. Katalog filtrelerinde yüzlerce kez görünüyor; bu yüzden
   animasyonu yok, yalnızca anlık renk geçişi var. Filtre tıklaması oturumda
   40+ kez tekrarlanan bir eylem ve her tıklamada oynayan bir animasyon
   üçüncü tıklamada yorucu hale gelir. */
export const OnayKutusu = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { etiket: ReactNode; sayac?: number }
>(function OnayKutusu({ etiket, sayac, className = "", id, ...rest }, ref) {
  const uretilenId = useId();
  const alanId = id ?? uretilenId;

  return (
    <label
      htmlFor={alanId}
      className="group flex cursor-pointer items-center gap-2.5 py-0.5 text-sm"
    >
      <input
        ref={ref}
        id={alanId}
        type="checkbox"
        className={`size-4 shrink-0 cursor-pointer rounded-[3px] border-kenar-guclu text-vurgu
                    transition-colors duration-[var(--sure-ipucu)]
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vurgu
                    ${className}`}
        {...rest}
      />
      <span className="flex-grow text-metin-ikincil group-hover:text-metin">{etiket}</span>
      {sayac !== undefined && (
        <span className="shrink-0 rounded bg-yuzey-gomulu px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-metin-ucuncul">
          {sayac}
        </span>
      )}
    </label>
  );
});
