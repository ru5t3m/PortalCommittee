"use client";

import { KnbEmblem } from "@/components/KnbEmblem";

export function HeroEmblemParallax({ stats }: { stats: string[][] }) {
  return (
    <div className="group relative mx-auto grid w-full max-w-2xl gap-5">
      <div className="relative grid min-h-[27rem] place-items-center [perspective:1200px] md:min-h-[31rem]">
        <div className="absolute h-[25rem] w-[25rem] rounded-full border border-state-gold/20 md:h-[31rem] md:w-[31rem]" />
        <div className="absolute h-[33rem] w-[33rem] rounded-full border border-white/10 md:h-[40rem] md:w-[40rem]" />
        <div
          className="absolute left-8 top-12 h-2.5 w-2.5 rounded-full bg-state-gold/60 transition-transform duration-200 ease-out"
          style={{ transform: "translate3d(calc(var(--hero-shift-x, 0px) * -0.45), calc(var(--hero-shift-y, 0px) * -0.35), 0)" }}
        />
        <div
          className="absolute bottom-16 right-10 h-2 w-2 rounded-full bg-state-teal/60 transition-transform duration-200 ease-out"
          style={{ transform: "translate3d(calc(var(--hero-shift-x, 0px) * 0.55), calc(var(--hero-shift-y, 0px) * 0.42), 0)" }}
        />
        <div
          className="relative origin-center [transform-style:preserve-3d] transition-transform duration-200 ease-out will-change-transform"
          style={{
            transform:
              "translate3d(var(--hero-shift-x, 0px), var(--hero-shift-y, 0px), 0) rotateX(var(--hero-rotate-x, 0deg)) rotateY(var(--hero-rotate-y, 0deg)) translateZ(76px)"
          }}
        >
          <div className="absolute inset-5 translate-y-14 scale-95 rounded-full bg-black/42 blur-2xl [transform:translateZ(-120px)]" />
          <div className="absolute inset-0 rounded-full bg-[#03101f] opacity-80 shadow-[20px_28px_48px_rgba(0,0,0,0.34)] [transform:translate3d(18px,18px,-56px)]" />
          <div className="absolute inset-0 rounded-full bg-state-gold/30 [transform:translate3d(10px,10px,-36px)]" />
          <div className="absolute inset-0 rounded-full bg-[#08243f] [transform:translate3d(5px,5px,-18px)]" />
          <div className="relative overflow-hidden rounded-full ring-2 ring-state-gold/50 [transform:translateZ(86px)]">
            <KnbEmblem className="h-80 w-80 border border-state-gold/40 shadow-[0_38px_100px_rgba(0,0,0,0.46)] md:h-[24rem] md:w-[24rem] xl:h-[27rem] xl:w-[27rem]" imageClassName="drop-shadow-[0_20px_30px_rgba(0,0,0,0.34)]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stats.map(([value, label]) => {
          const isEmail = value.includes("@");

          return (
          <div className="group/card min-w-0 rounded-[1.05rem] border border-white/12 bg-white/[0.06] px-5 py-3.5 backdrop-blur transition hover:-translate-y-1 hover:border-state-gold/45 hover:bg-white/[0.1]" key={label}>
            <p className={`${isEmail ? "text-lg" : "text-2xl"} whitespace-nowrap font-bold leading-tight text-state-gold`}>{value}</p>
            <p className="mt-1.5 text-xs leading-5 text-white/58">{label}</p>
          </div>
          );
        })}
      </div>
    </div>
  );
}
