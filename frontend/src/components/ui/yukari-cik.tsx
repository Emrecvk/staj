"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function YukariCik() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Sayfanın başına çık"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#d7e0f3] text-white shadow-sm transition-all duration-200 hover:bg-[#c4d2ed] hover:shadow-md ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
    >
      <ChevronUp size={29} strokeWidth={2.2} />
    </button>
  );
}
