"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { bildir } from "@/components/ui/bildirim";

export function StokBildirimModal({
  isOpen,
  onClose,
  mpn,
  ambalajId,
}: {
  isOpen: boolean;
  onClose: () => void;
  mpn: string;
  ambalajId: number | null;
}) {
  const [email, setEmail] = useState("");
  const [istenenMiktar, setIstenenMiktar] = useState(1);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambalajId || !email || gonderiliyor) return;

    setGonderiliyor(true);
    try {
      const response = await fetch(`/api/Katalog/urunler/ambalajlar/${ambalajId}/stok-bildirimi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: email, istenenMiktar }),
      });

      if (!response.ok) {
        const mesaj = await response.text();
        bildir.hata("Bildirim oluşturulamadı", mesaj || "Lütfen tekrar deneyin.");
        return;
      }

      bildir.basarili("Stok bildirimi oluşturuldu", `${mpn} stoğa girdiğinde size e-posta göndereceğiz.`);
      setEmail("");
      setIstenenMiktar(1);
      onClose();
    } catch {
      bildir.hata("Bildirim oluşturulamadı", "Bağlantı kurulamadı. Lütfen tekrar deneyin.");
    } finally {
      setGonderiliyor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-token-panel border border-kenar bg-yuzey-kart p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-metin-ucuncul hover:text-metin" aria-label="Kapat">
          <X size={18} />
        </button>
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-vurgu-zemin p-2.5 text-vurgu-guclu"><Bell size={20} /></div>
          <div>
            <h3 className="font-bold text-base text-metin">Gelince haber ver</h3>
            <p className="text-xs text-metin-ucuncul font-mono">{mpn}</p>
          </div>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-metin-ikincil">
          Bu ambalaj yeniden stoklandığında e-posta adresinize otomatik bildirim gönderelim.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-metin">
            E-posta adresiniz
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@sirket.com"
              className="mt-1 w-full rounded-token-girdi border border-kenar bg-yuzey px-3 py-2 text-xs text-metin focus:border-vurgu focus:outline-hidden"
            />
          </label>
          <label className="block text-xs font-semibold text-metin">
            İhtiyaç duyduğunuz miktar
            <input
              type="number"
              min={1}
              value={istenenMiktar}
              onChange={(e) => setIstenenMiktar(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-token-girdi border border-kenar bg-yuzey px-3 py-2 text-xs text-metin focus:border-vurgu focus:outline-hidden"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-token-girdi border border-kenar px-3 py-2 text-xs font-semibold text-metin hover:bg-yuzey-gomulu">İptal</button>
            <button type="submit" disabled={gonderiliyor || !ambalajId} className="rounded-token-girdi bg-vurgu px-4 py-2 text-xs font-bold text-white hover:bg-vurgu-guclu disabled:opacity-50">
              {gonderiliyor ? "Gönderiliyor..." : "Bildirim iste"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
