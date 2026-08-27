import {
  Boxes,
  Cable,
  CircuitBoard,
  Cpu,
  Fan,
  Layers,
  Lightbulb,
  PlugZap,
  Radar,
  ShieldCheck,
  SquareTerminal,
  ToggleRight,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Backend katalogundaki kök slug'lar için ortak ikon eşlemesi. */
export const KATEGORI_IKONLARI: Record<string, LucideIcon> = {
  "yari-iletkenler": Cpu,
  "guc-yonetimi": Zap,
  "ayrik-yari-iletkenler": CircuitBoard,
  "pasif-komponentler": Layers,
  optoelektronik: Lightbulb,
  elektromekanik: ToggleRight,
  sensorler: Radar,
  "kablosuz-rf": Wifi,
  "devre-koruma": ShieldCheck,
  "guc-kaynaklari": PlugZap,
  "gelistirme-kartlari": SquareTerminal,
  "termal-mekanik": Fan,
  "kablo-baglanti": Cable,
};

export function kategoriIkonunuGetir(slug: string): LucideIcon {
  return KATEGORI_IKONLARI[slug] ?? Boxes;
}
