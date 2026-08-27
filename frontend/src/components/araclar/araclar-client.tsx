"use client";

import { useMemo, useState } from "react";
import { Calculator, Palette, Zap, CircuitBoard, Lightbulb } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Ortak yardımcılar                                                  */
/* ------------------------------------------------------------------ */

/** SI ön ekiyle biçimler: 1500 → "1.5 kΩ", 0.001 → "1 mΩ". */
function siBicim(deger: number, birim: string): string {
  if (!isFinite(deger) || isNaN(deger)) return "—";
  if (deger === 0) return `0 ${birim}`;
  const negatif = deger < 0;
  const d = Math.abs(deger);
  const onekler: [number, string][] = [
    [1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""],
    [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"],
  ];
  for (const [carpan, onek] of onekler) {
    if (d >= carpan) {
      const v = d / carpan;
      const yazi = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
      return `${negatif ? "-" : ""}${parseFloat(yazi)} ${onek}${birim}`;
    }
  }
  return `${negatif ? "-" : ""}${d.toPrecision(3)} ${birim}`;
}

const alanStil =
  "w-full rounded-token-girdi border border-kenar bg-yuzey px-3 py-2 text-sm text-metin outline-none focus:border-vurgu focus:ring-2 focus:ring-vurgu/20";
const etiketStil = "mb-1 block text-xs font-semibold text-metin-ikincil";
const sonucStil =
  "rounded-token-kart border border-vurgu/30 bg-vurgu-zemin/40 p-4 text-center";

/* ------------------------------------------------------------------ */
/*  1) Direnç renk kodu                                                */
/* ------------------------------------------------------------------ */

const RENKLER: { ad: string; hex: string; deger: number; carpan: number; tolerans?: number }[] = [
  { ad: "Siyah", hex: "#000000", deger: 0, carpan: 1 },
  { ad: "Kahve", hex: "#7B3F00", deger: 1, carpan: 10, tolerans: 1 },
  { ad: "Kırmızı", hex: "#D32F2F", deger: 2, carpan: 100, tolerans: 2 },
  { ad: "Turuncu", hex: "#EF6C00", deger: 3, carpan: 1e3 },
  { ad: "Sarı", hex: "#FBC02D", deger: 4, carpan: 1e4 },
  { ad: "Yeşil", hex: "#388E3C", deger: 5, carpan: 1e5, tolerans: 0.5 },
  { ad: "Mavi", hex: "#1976D2", deger: 6, carpan: 1e6, tolerans: 0.25 },
  { ad: "Mor", hex: "#7B1FA2", deger: 7, carpan: 1e7, tolerans: 0.1 },
  { ad: "Gri", hex: "#616161", deger: 8, carpan: 1e8, tolerans: 0.05 },
  { ad: "Beyaz", hex: "#E0E0E0", deger: 9, carpan: 1e9 },
  { ad: "Altın", hex: "#C9A227", deger: -1, carpan: 0.1, tolerans: 5 },
  { ad: "Gümüş", hex: "#9E9E9E", deger: -2, carpan: 0.01, tolerans: 10 },
];

function RenkSecici({
  deger,
  onChange,
  tip,
}: {
  deger: number;
  onChange: (i: number) => void;
  tip: "rakam" | "carpan" | "tolerans";
}) {
  const secenekler = RENKLER.map((r, i) => ({ r, i })).filter(({ r }) => {
    if (tip === "rakam") return r.deger >= 0;
    if (tip === "carpan") return true;
    return r.tolerans !== undefined;
  });
  return (
    <select
      value={deger}
      onChange={(e) => onChange(Number(e.target.value))}
      className={alanStil}
      style={{ borderLeft: `6px solid ${RENKLER[deger].hex}` }}
    >
      {secenekler.map(({ r, i }) => (
        <option key={i} value={i}>
          {r.ad}
          {tip === "carpan" ? ` (×${siBicim(r.carpan, "").trim()})` : ""}
          {tip === "tolerans" ? ` (±%${r.tolerans})` : ""}
        </option>
      ))}
    </select>
  );
}

function DirencRenkKodu() {
  const [bant, setBant] = useState(4); // 4 veya 5 bant
  const [b1, setB1] = useState(1); // kahve
  const [b2, setB2] = useState(0); // siyah
  const [b3, setB3] = useState(0); // 5 bant 3. rakam
  const [carpan, setCarpan] = useState(2); // kırmızı ×100
  const [tol, setTol] = useState(1); // kahve ±1%

  const { direnc, toleransYuzde } = useMemo(() => {
    const rakamlar = bant === 5 ? [b1, b2, b3] : [b1, b2];
    const taban = rakamlar.reduce((acc, i) => acc * 10 + RENKLER[i].deger, 0);
    return {
      direnc: taban * RENKLER[carpan].carpan,
      toleransYuzde: RENKLER[tol].tolerans ?? 0,
    };
  }, [bant, b1, b2, b3, carpan, tol]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <div>
          <span className={etiketStil}>Bant sayısı</span>
          <div className="flex gap-2">
            {[4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setBant(n)}
                className={`flex-1 rounded-token-girdi border px-3 py-2 text-sm font-semibold transition-colors ${
                  bant === n
                    ? "border-vurgu bg-vurgu text-white"
                    : "border-kenar bg-yuzey text-metin-ikincil hover:border-vurgu"
                }`}
              >
                {n} Bant
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={etiketStil}>1. Rakam</span>
            <RenkSecici deger={b1} onChange={setB1} tip="rakam" />
          </div>
          <div>
            <span className={etiketStil}>2. Rakam</span>
            <RenkSecici deger={b2} onChange={setB2} tip="rakam" />
          </div>
          {bant === 5 && (
            <div>
              <span className={etiketStil}>3. Rakam</span>
              <RenkSecici deger={b3} onChange={setB3} tip="rakam" />
            </div>
          )}
          <div>
            <span className={etiketStil}>Çarpan</span>
            <RenkSecici deger={carpan} onChange={setCarpan} tip="carpan" />
          </div>
          <div>
            <span className={etiketStil}>Tolerans</span>
            <RenkSecici deger={tol} onChange={setTol} tip="tolerans" />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <div className={sonucStil}>
          <div className="text-xs font-semibold uppercase tracking-wider text-metin-ikincil">
            Direnç Değeri
          </div>
          <div className="mt-1 text-3xl font-bold text-vurgu-guclu">{siBicim(direnc, "Ω")}</div>
          <div className="mt-1 text-sm text-metin-ikincil">±%{toleransYuzde} tolerans</div>
          <div className="mt-2 text-xs text-metin-ucuncul">
            {siBicim(direnc * (1 - toleransYuzde / 100), "Ω")} –{" "}
            {siBicim(direnc * (1 + toleransYuzde / 100), "Ω")}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2) Ohm yasası                                                      */
/* ------------------------------------------------------------------ */

function OhmYasasi() {
  const [v, setV] = useState("");
  const [i, setI] = useState("");
  const [r, setR] = useState("");

  const sonuc = useMemo(() => {
    const V = parseFloat(v), I = parseFloat(i), R = parseFloat(r);
    const bilinen = [!isNaN(V), !isNaN(I), !isNaN(R)].filter(Boolean).length;
    if (bilinen < 2) return null;
    let eV = V, eI = I, eR = R;
    if (isNaN(V) && !isNaN(I) && !isNaN(R)) eV = I * R;
    else if (isNaN(I) && !isNaN(V) && !isNaN(R)) eI = R === 0 ? NaN : V / R;
    else if (isNaN(R) && !isNaN(V) && !isNaN(I)) eR = I === 0 ? NaN : V / I;
    return { V: eV, I: eI, R: eR, P: eV * eI };
  }, [v, i, r]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <p className="text-xs text-metin-ucuncul">
          Herhangi iki değeri girin, kalanları hesaplayalım.
        </p>
        <div>
          <label className={etiketStil}>Gerilim — V (Volt)</label>
          <input type="number" value={v} onChange={(e) => setV(e.target.value)} className={alanStil} placeholder="örn. 5" />
        </div>
        <div>
          <label className={etiketStil}>Akım — I (Amper)</label>
          <input type="number" value={i} onChange={(e) => setI(e.target.value)} className={alanStil} placeholder="örn. 0.02" />
        </div>
        <div>
          <label className={etiketStil}>Direnç — R (Ohm)</label>
          <input type="number" value={r} onChange={(e) => setR(e.target.value)} className={alanStil} placeholder="örn. 220" />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        {sonuc ? (
          <div className="grid grid-cols-2 gap-3">
            <div className={sonucStil}>
              <div className="text-xs text-metin-ikincil">Gerilim</div>
              <div className="text-xl font-bold text-vurgu-guclu">{siBicim(sonuc.V, "V")}</div>
            </div>
            <div className={sonucStil}>
              <div className="text-xs text-metin-ikincil">Akım</div>
              <div className="text-xl font-bold text-vurgu-guclu">{siBicim(sonuc.I, "A")}</div>
            </div>
            <div className={sonucStil}>
              <div className="text-xs text-metin-ikincil">Direnç</div>
              <div className="text-xl font-bold text-vurgu-guclu">{siBicim(sonuc.R, "Ω")}</div>
            </div>
            <div className={sonucStil}>
              <div className="text-xs text-metin-ikincil">Güç</div>
              <div className="text-xl font-bold text-vurgu-guclu">{siBicim(sonuc.P, "W")}</div>
            </div>
          </div>
        ) : (
          <div className="rounded-token-kart border border-dashed border-kenar p-6 text-center text-sm text-metin-ucuncul">
            En az iki değer girin.
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3) Kondansatör kod çözücü                                          */
/* ------------------------------------------------------------------ */

function KondansatorKodu() {
  const [kod, setKod] = useState("104");

  const sonuc = useMemo(() => {
    const temiz = kod.trim().replace(/\s/g, "");
    // 3 rakamlı kod: ilk iki rakam + çarpan (pF). Örn 104 = 10 × 10^4 pF = 100nF.
    if (/^\d{3}$/.test(temiz)) {
      const taban = parseInt(temiz.slice(0, 2), 10);
      const us = parseInt(temiz[2], 10);
      const pF = taban * Math.pow(10, us);
      return { pF, gecerli: true };
    }
    // 2 rakamlı: doğrudan pF.
    if (/^\d{1,2}$/.test(temiz)) return { pF: parseInt(temiz, 10), gecerli: true };
    return { pF: 0, gecerli: false };
  }, [kod]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <p className="text-xs text-metin-ucuncul">
          Seramik kondansatör üzerindeki 3 haneli kodu girin (örn. 104, 223, 471).
        </p>
        <div>
          <label className={etiketStil}>Kondansatör kodu</label>
          <input
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            className={`${alanStil} font-mono text-lg tracking-widest`}
            placeholder="104"
            inputMode="numeric"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center">
        {sonuc.gecerli ? (
          <div className={sonucStil}>
            <div className="text-xs font-semibold uppercase tracking-wider text-metin-ikincil">
              Kapasitans
            </div>
            <div className="mt-1 text-3xl font-bold text-vurgu-guclu">{siBicim(sonuc.pF * 1e-12, "F")}</div>
            <div className="mt-2 space-x-3 text-xs text-metin-ucuncul">
              <span>{siBicim(sonuc.pF, "pF")}</span>
              <span>{siBicim(sonuc.pF / 1000, "nF")}</span>
              <span>{siBicim(sonuc.pF / 1e6, "µF")}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-token-kart border border-dashed border-kenar p-6 text-center text-sm text-metin-ucuncul">
            Geçerli bir kod girin (1–3 rakam).
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  4) LED seri direnci                                                */
/* ------------------------------------------------------------------ */

function LedDirenci() {
  const [vKaynak, setVKaynak] = useState("5");
  const [vLed, setVLed] = useState("2.0");
  const [iLed, setILed] = useState("20"); // mA

  const sonuc = useMemo(() => {
    const Vs = parseFloat(vKaynak), Vf = parseFloat(vLed), If = parseFloat(iLed) / 1000;
    if (isNaN(Vs) || isNaN(Vf) || isNaN(If) || If <= 0) return null;
    if (Vs <= Vf) return { hata: "Kaynak gerilimi LED ileri geriliminden büyük olmalı." };
    const R = (Vs - Vf) / If;
    const P = (Vs - Vf) * If;
    return { R, P };
  }, [vKaynak, vLed, iLed]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <div>
          <label className={etiketStil}>Kaynak gerilimi (V)</label>
          <input type="number" value={vKaynak} onChange={(e) => setVKaynak(e.target.value)} className={alanStil} />
        </div>
        <div>
          <label className={etiketStil}>LED ileri gerilimi Vf (V)</label>
          <input type="number" value={vLed} onChange={(e) => setVLed(e.target.value)} className={alanStil} />
        </div>
        <div>
          <label className={etiketStil}>LED akımı If (mA)</label>
          <input type="number" value={iLed} onChange={(e) => setILed(e.target.value)} className={alanStil} />
        </div>
      </div>
      <div className="flex flex-col justify-center">
        {sonuc && !sonuc.hata ? (
          <div className="space-y-3">
            <div className={sonucStil}>
              <div className="text-xs font-semibold uppercase tracking-wider text-metin-ikincil">
                Gerekli Seri Direnç
              </div>
              <div className="mt-1 text-3xl font-bold text-vurgu-guclu">{siBicim(sonuc.R!, "Ω")}</div>
            </div>
            <div className="rounded-token-kart border border-kenar bg-yuzey p-3 text-center text-xs text-metin-ucuncul">
              Direnç üzerindeki güç kaybı: <strong className="text-metin">{siBicim(sonuc.P!, "W")}</strong>
              {" — "}en az {siBicim(sonuc.P! * 2, "W")} dereceli direnç seçin.
            </div>
          </div>
        ) : (
          <div className="rounded-token-kart border border-dashed border-uyari/50 p-6 text-center text-sm text-uyari-600">
            {sonuc?.hata ?? "Değerleri girin."}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sekmeli kapsayıcı                                                  */
/* ------------------------------------------------------------------ */

const ARACLAR = [
  { anahtar: "direnc", ad: "Direnç Renk Kodu", ikon: Palette, bilesen: <DirencRenkKodu /> },
  { anahtar: "ohm", ad: "Ohm Yasası", ikon: Zap, bilesen: <OhmYasasi /> },
  { anahtar: "kondansator", ad: "Kondansatör Kodu", ikon: CircuitBoard, bilesen: <KondansatorKodu /> },
  { anahtar: "led", ad: "LED Seri Direnci", ikon: Lightbulb, bilesen: <LedDirenci /> },
] as const;

export function AraclarClient() {
  const [aktif, setAktif] = useState<string>(ARACLAR[0].anahtar);
  const aktifArac = ARACLAR.find((a) => a.anahtar === aktif) ?? ARACLAR[0];

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-token-girdi bg-vurgu text-white">
          <Calculator size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-metin">Mühendis Araçları</h1>
          <p className="text-sm text-metin-ikincil">
            Tasarım sırasında sık gereken hızlı hesaplayıcılar — hepsi tarayıcıda çalışır.
          </p>
        </div>
      </div>

      {/* Sekme başlıkları */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-kenar">
        {ARACLAR.map((a) => {
          const Ikon = a.ikon;
          const secili = a.anahtar === aktif;
          return (
            <button
              key={a.anahtar}
              type="button"
              onClick={() => setAktif(a.anahtar)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                secili
                  ? "border-vurgu text-vurgu-guclu"
                  : "border-transparent text-metin-ikincil hover:text-metin"
              }`}
            >
              <Ikon size={16} /> {a.ad}
            </button>
          );
        })}
      </div>

      {/* Aktif araç */}
      <div className="rounded-token-panel border border-kenar bg-yuzey-kart p-5 md:p-6">
        {aktifArac.bilesen}
      </div>
    </div>
  );
}
