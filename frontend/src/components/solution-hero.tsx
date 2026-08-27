type SolutionHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  variant?: "distributor" | "fae" | "thermal" | "led";
};

export function SolutionHero({ eyebrow, title, description, variant = "distributor" }: SolutionHeroProps) {
  const themes = {
    distributor: "bg-[linear-gradient(115deg,#21171f_0%,#452638_54%,#782b1c_100%)]",
    fae: "bg-[linear-gradient(135deg,#32202b_0%,#5f3247_52%,#963219_100%)]",
    thermal: "bg-[linear-gradient(115deg,#352d30_0%,#625853_52%,#32202b_100%)]",
    led: "bg-[linear-gradient(180deg,#21171f_0%,#452638_52%,#bd3f1c_100%)]",
  }[variant];
  return (
    <section className={`relative isolate mx-1 min-h-[390px] overflow-hidden rounded-token-panel px-5 py-20 text-center text-white sm:mx-4 sm:px-8 md:min-h-[520px] md:py-28 ${themes}`}>
      <div className={`absolute inset-x-[-10%] bottom-[-58%] -z-10 h-[90%] rounded-[50%] blur-3xl ${variant === "thermal" ? "bg-amber-200/25" : variant === "fae" ? "bg-violet-300/30" : variant === "distributor" ? "bg-cyan-300/25" : "bg-cyan-300/45"}`} />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[radial-gradient(ellipse_at_center_bottom,rgba(75,207,203,.45),transparent_68%)]" />
      {variant === "distributor" && <div className="absolute bottom-[-34px] right-[9%] hidden h-56 w-72 rotate-[-8deg] rounded-2xl border border-cyan-200/40 bg-navy-950/80 p-8 shadow-2xl lg:block"><div className="grid grid-cols-6 gap-4">{Array.from({ length: 24 }).map((_, index) => <span key={index} className={`h-3 w-3 rounded-full ${index % 4 === 0 ? "bg-cyan-300" : "bg-notr-500"}`} />)}</div><div className="mt-8 h-3 w-40 rounded-full bg-cyan-300/70" /><div className="mt-3 h-3 w-56 rounded-full bg-navy-300/45" /></div>}
      {variant === "thermal" && <div className="absolute bottom-[-25px] right-[8%] hidden h-48 w-72 rotate-[-12deg] rounded-md bg-gradient-to-b from-slate-100 to-slate-500 shadow-2xl before:absolute before:inset-x-3 before:top-[-38px] before:h-12 before:bg-[repeating-linear-gradient(90deg,#d9e0e8_0_9px,#718096_9px_14px)] lg:block" />}
      {variant === "fae" && <div className="absolute bottom-[-26px] right-[10%] hidden h-48 w-64 rounded-xl border-8 border-cyan-200/50 bg-notr-100/25 p-6 shadow-2xl lg:block"><div className="h-3 w-36 rounded bg-cyan-200/80" /><div className="mt-6 h-3 w-48 rounded bg-navy-200/50" /><div className="mt-7 flex gap-4"><span className="h-9 w-9 rounded-full bg-cyan-300" /><span className="h-9 w-9 rounded-full bg-notr-300" /></div></div>}
      {variant === "led" && <><div className="absolute bottom-[-45%] left-[20%] -z-10 h-72 w-[60%] rounded-[50%] border-[18px] border-cyan-200/25 blur-sm" /><div className="absolute bottom-[-18px] right-[14%] hidden h-28 w-20 rounded-t-[50%] rounded-b-xl bg-gradient-to-b from-yellow-100 via-yellow-300 to-amber-500 shadow-[0_0_70px_rgba(250,220,90,.8)] lg:block"><div className="absolute -bottom-6 left-2 h-8 w-16 rounded-b-lg bg-slate-200/80" /><div className="absolute -bottom-9 left-4 h-3 w-12 rounded-full bg-slate-400/70" /></div></>}
      <p className="relative text-xs font-bold uppercase tracking-[0.22em] text-cyan-200 md:text-sm">{eyebrow}</p>
      <h1 className="relative mx-auto mt-6 max-w-6xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">{title}</h1>
      <p className="relative mx-auto mt-7 max-w-3xl text-base leading-7 text-slate-100 sm:text-lg md:leading-8">{description}</p>
    </section>
  );
}
