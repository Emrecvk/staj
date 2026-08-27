import type { CSSProperties } from "react";

export const SAYFALAMA_SURESI_MS = 6000;

type SayfalamaNoktasiProps = {
  secili: boolean;
};

export function SayfalamaNoktasi({ secili }: SayfalamaNoktasiProps) {
  return (
    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center" aria-hidden="true">
      {secili && (
        <svg
          viewBox="0 0 28 28"
          className="absolute inset-0 -rotate-90"
          style={{ "--sayfalama-suresi": `${SAYFALAMA_SURESI_MS}ms` } as CSSProperties}
        >
          <circle cx="14" cy="14" r="11" fill="none" stroke="var(--color-kenar)" strokeWidth="4" />
          <circle
            cx="14"
            cy="14"
            r="11"
            pathLength="1"
            fill="none"
            stroke="var(--color-vurgu)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="1"
            strokeDashoffset="1"
            className="sayfalama-dolum"
          />
        </svg>
      )}
      <span
        className={`h-2.5 w-2.5 rounded-full transition-colors duration-[var(--sure-acilir)] ${
          secili ? "bg-vurgu" : "bg-kenar-guclu"
        }`}
      />
    </span>
  );
}
