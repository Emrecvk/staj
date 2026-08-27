"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

export function YukariCik() {
  const [visible, setVisible] = useState(false);
  const esikRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const esik = esikRef.current;
    if (!esik) return;
    const gozlemci = new IntersectionObserver(([girdi]) => {
      setVisible(!girdi.isIntersecting && girdi.boundingClientRect.top < 0);
    });
    gozlemci.observe(esik);
    return () => gozlemci.disconnect();
  }, []);

  return (
    <>
    <span ref={esikRef} className="pointer-events-none absolute left-0 top-[360px] h-px w-px" aria-hidden="true" />
    <button
      type="button"
      aria-label="Sayfanın başına çık"
      onClick={() => window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })}
      className={`fixed bottom-28 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-marka text-white shadow-sm transition-[opacity,transform,background-color] duration-200 hover:bg-marka-hover hover:shadow-md md:bottom-6 md:right-6 ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
    >
      <ChevronUp size={24} strokeWidth={2.2} />
    </button>
    </>
  );
}
