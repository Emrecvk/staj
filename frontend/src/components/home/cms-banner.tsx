import Image from "next/image";
import Link from "next/link";
import type { PublicBanner } from "@/lib/api";
import { Kapsayici } from "@/components/ui/yuzey";

export function CmsBanner({ bannerlar }: { bannerlar: PublicBanner[] }) {
  if (bannerlar.length === 0) return null;

  return (
    <section className="bg-yuzey py-4" aria-label="Kampanyalar">
      <Kapsayici>
        <div className="grid gap-4 md:grid-cols-2">
          {bannerlar.map((banner) => {
            const icerik = (
              <Image
                src={banner.gorselUrl}
                alt="Çevik Elektronik kampanyası"
                width={1200}
                height={300}
                className="h-auto w-full rounded-token-panel border border-kenar object-cover"
              />
            );
            return banner.linkUrl ? <Link key={banner.id} href={banner.linkUrl}>{icerik}</Link> : <div key={banner.id}>{icerik}</div>;
          })}
        </div>
      </Kapsayici>
    </section>
  );
}
