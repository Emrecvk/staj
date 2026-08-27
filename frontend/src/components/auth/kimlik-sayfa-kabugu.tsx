import Image from "next/image";
import Link from "next/link";
export function KimlikSayfaKabugu({
  baslik,
  children,
}: {
  baslik: string;
  children: React.ReactNode;
}) {
  return (
    <main id="icerik" className="min-h-[100dvh] bg-yuzey lg:grid lg:grid-cols-[minmax(340px,0.82fr)_minmax(560px,1.18fr)]">
      <aside className="relative hidden overflow-hidden bg-marka px-10 py-12 text-dolgu-uzeri lg:flex lg:flex-col xl:px-16">
        <div className="absolute -right-32 -top-24 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute -bottom-48 -left-24 h-96 w-96 rounded-full border border-cyan-300/15" aria-hidden="true" />
        <Link href="/" className="relative z-10 inline-flex w-fit rounded-token-girdi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          <Image src="/logo-cevik-mono-beyaz.svg" alt="Çevik Elektronik ana sayfa" width={240} height={80} priority className="h-16 w-auto" />
        </Link>
        <div className="relative z-10 my-auto max-w-md py-16">
          <h2 className="text-4xl font-bold leading-[1.08] tracking-[-0.035em] xl:text-5xl">
            Tedarik sürecinizi daha hızlı ve görünür yönetin.
          </h2>
        </div>
      </aside>

      <section className="flex min-h-[100dvh] items-center px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-[560px]">
          <Link href="/" className="mb-10 inline-flex rounded-token-girdi lg:hidden">
            <Image src="/logo-cevik-yatay.svg" alt="Çevik Elektronik ana sayfa" width={210} height={70} priority className="h-14 w-auto sm:h-16" />
          </Link>
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-metin-marka sm:text-4xl">{baslik}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}

export const kimlikGirdiSinifi = "mt-2 block min-h-12 w-full rounded-token-girdi border border-kenar-guclu bg-yuzey-kart px-3.5 text-sm text-metin shadow-token-hafif outline-none transition-[border-color,box-shadow] placeholder:text-metin-ucuncul focus:border-vurgu focus:ring-2 focus:ring-cyan-100";
