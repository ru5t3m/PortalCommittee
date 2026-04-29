"use client";

import { ArrowLeft, ArrowRight, ClipboardList, Eye, Radar, ShieldCheck, Siren, Wrench } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ActivitySlideDeckProps = {
  activityTitle: string;
  theme: string;
  slides: string[][];
};

export function ActivitySlideDeck({ activityTitle, theme, slides }: ActivitySlideDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const slideIcons = [ClipboardList, Eye, Wrench, Siren];
  const SlideIcon = slideIcons[activeIndex] ?? ShieldCheck;

  function goToPrevious() {
    setActiveIndex((index) => (index === 0 ? slides.length - 1 : index - 1));
  }

  function goToNext() {
    setActiveIndex((index) => (index === slides.length - 1 ? 0 : index + 1));
  }

  return (
    <div className="w-full overflow-hidden rounded-[1.6rem] border border-white/14 bg-white/[0.08] p-4 shadow-premium backdrop-blur-xl">
      <div className="grid min-h-14 grid-cols-[1fr_auto] items-start gap-4 pb-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-state-gold">{theme}</p>
          <h3 className="mt-1 text-xl font-bold md:text-2xl">Контент-бар направления</h3>
        </div>
        <Radar className="h-6 w-6 text-state-gold" />
      </div>

      <div className="relative h-[20rem] overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#06182d]/62 p-5 md:h-[21rem]">
        <div className="absolute right-6 top-5 text-6xl font-black leading-none text-white/[0.04] md:text-7xl">
          {String(activeIndex + 1).padStart(2, "0")}
        </div>
        <div className="relative grid h-full grid-rows-[1fr_auto] gap-4">
          <div className="grid min-h-0 gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
            <div className="min-w-0 self-start">
              <div className="flex items-center justify-between gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-state-gold text-base font-bold text-state-navy">
                  {activeIndex + 1}
                </span>
                <ShieldCheck className="h-5 w-5 text-state-teal" />
              </div>
              <h4 className="mt-6 text-3xl font-bold md:text-4xl">{activeSlide[0]}</h4>
              <p className="mt-4 max-w-2xl whitespace-normal break-words text-sm leading-6 text-white/74 md:text-base md:leading-7">{activeSlide[1]}</p>
            </div>

            <div className="hidden h-40 place-items-center lg:grid">
              <SlideIcon className="h-20 w-20 text-state-gold" />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-white/10 pt-3">
            <div className="flex h-10 items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide[0]}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Показать слайд ${index + 1}: ${slide[0]}`}
                  className={cn("h-2 w-8 rounded-full transition-colors", index === activeIndex ? "bg-state-gold" : "bg-white/22 hover:bg-white/42")}
                />
              ))}
            </div>

            <div className="flex h-10 items-center gap-2">
              <button
                type="button"
                onClick={goToPrevious}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/16 bg-white/10 text-white transition hover:border-state-gold/50 hover:bg-white/16"
                aria-label="Предыдущий слайд"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="inline-flex h-10 w-28 items-center justify-center gap-2 rounded-xl bg-state-gold px-4 text-xs font-bold text-state-navy transition hover:bg-[#e5bd55]"
              >
                Далее <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-1 pt-3 text-xs text-white/52">
        <span>{activeIndex + 1} из {slides.length}</span>
        <span>{activityTitle}</span>
      </div>
    </div>
  );
}
