import Link from "next/link";
import {
  CreditCard,
  Code2,
  Cpu,
  ArrowRight,
  Sparkles,
  Building,
  Headphones,
} from "lucide-react";
import { Kapsayici } from "@/components/ui/yuzey";

interface CorporateSolution {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: typeof CreditCard;
  badge: string;
}

const B2B_SOLUTIONS: CorporateSolution[] = [
  {
    id: "credit",
    title: "Kurumsal Cari & Vadeli Ödeme",
    description:
      "Firma büyüklüğünüze özel vade ve kredi limitleri ile esnek tedarik.",
    cta: "Başvuru Yap",
    href: "/kayit/kurumsal",
    icon: CreditCard,
    badge: "30-90 Gün Vade",
  },
  {
    id: "edi",
    title: "API & EDI Sistem Entegrasyonu",
    description:
      "Sipariş ve envanter akışınız için API/EDI entegrasyon desteği talep edin.",
    cta: "Bilgi Al",
    href: "mailto:destek@cevik.com.tr?subject=API%20ve%20EDI%20entegrasyonu",
    icon: Code2,
    badge: "Talep Üzerine",
  },
  {
    id: "fae",
    title: "Saha Uygulama Mühendisliği (FAE)",
    description:
      "Devre tasarımı, parça seçimi ve muadil analizinde uzman mühendis desteği.",
    cta: "Mühendise Danış",
    href: "/teklif-iste?konu=fae_destegi",
    icon: Cpu,
    badge: "Uzman Donanım Ekibi",
  },
];

export function B2BDegerOnerisi() {
  return (
    <section
      className="border-t border-kenar bg-yuzey py-10 md:py-14"
      aria-label="Kurumsal B2B Çözümleri ve Değer Önerileri"
    >
      <Kapsayici>
        {/* Section Header */}
        <div className="mb-8 flex flex-col justify-between gap-3 border-b border-kenar pb-5 sm:flex-row sm:items-end">
          <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-vurgu">
            <Sparkles size={14} /> B2B Tedarik Çözümleri
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-metin sm:text-3xl">
            Mühendislik ve Üretim Şirketleri İçin B2B Çözümler
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-metin-ikincil">
            Ar-Ge aşamasından seri üretime kadar işletmenizin tüm elektronik komponent tedarik süreçlerini hızlandıran kurumsal altyapı.
          </p>
          </div>
        </div>

        {/* Corporate Solutions 3-Column Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {B2B_SOLUTIONS.map((solution) => {
            const Icon = solution.icon;
            return (
              <div
                key={solution.id}
                className="group relative flex min-h-[220px] flex-col justify-between rounded-2xl border border-kenar bg-white p-5 transition-all duration-[var(--sure-acilir)] ease-[var(--ease-cikis)] hover:border-vurgu hover:shadow-[var(--shadow-yukselti)]"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-girdi)] bg-vurgu-zemin text-vurgu-guclu transition-colors group-hover:bg-vurgu group-hover:text-white">
                      <Icon size={24} strokeWidth={1.8} />
                    </div>
                    <span className="rounded-full bg-yuzey-gomulu px-2.5 py-1 font-mono text-[11px] font-semibold text-metin-marka">
                      {solution.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-metin transition-colors group-hover:text-vurgu">
                    {solution.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-metin-ikincil">
                    {solution.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-kenar pt-4">
                  <Link
                    href={solution.href}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-vurgu transition-[transform,color] duration-[var(--sure-ipucu)] hover:text-vurgu-guclu group-hover:translate-x-0.5"
                  >
                    {solution.cta} <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast B2B Account CTA */}
        <div className="mt-6 rounded-2xl border border-[#183653] bg-[#0F2740] p-5 text-white sm:p-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <Building size={16} /> Kurumsal B2B Üyeliği
              </div>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                Firmanıza Özel İskontolu Fiyatlar ve Teklif Yönetimi
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                Kurumsal hesap açarak malzeme listeleriniz (BOM) için özel proje iskontosu talep edin, siparişlerinizi ve cari bakiyenizi tek ekrandan yönetin.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link
                href="/kayit/kurumsal"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-[#0F2740] transition-all hover:bg-cyan-300 active:scale-[0.98]"
              >
                Kurumsal Hesap Aç <ArrowRight size={16} />
              </Link>
              <Link
                href="/teklif-iste"
                className="inline-flex items-center gap-2 rounded-full border border-slate-500 bg-[#173552] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-300 hover:text-cyan-200"
              >
                <Headphones size={16} /> Teklif İste
              </Link>
            </div>
          </div>
        </div>
      </Kapsayici>
    </section>
  );
}
