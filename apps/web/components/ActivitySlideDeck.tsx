"use client";

import { ClipboardList, Eye, Siren, Wrench } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ActivitySlideDeckProps = {
  theme: string;
  slides: string[][];
};

export function ActivitySlideDeck({ theme, slides }: ActivitySlideDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const slideIcons = [ClipboardList, Eye, Wrench, Siren];
  const SlideIcon = slideIcons[activeIndex] ?? ClipboardList;

  return (
    <div className="w-full overflow-hidden text-state-navy">
      <div className="px-6 pb-2 pt-4 md:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-state-tealDark">{theme}</p>
        </div>
      </div>

      <div className="relative overflow-hidden px-6 pb-6 pt-3 md:px-8 md:pb-8">
        <div className="absolute right-6 top-5 text-6xl font-black leading-none text-state-navy/[0.04] md:text-7xl">
          {String(activeIndex + 1).padStart(2, "0")}
        </div>

        <div className="relative grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="grid gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide[0]}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                  index === activeIndex
                    ? "border-state-teal/35 bg-white text-state-navy shadow-sm"
                    : "border-transparent bg-transparent text-slate-500 hover:border-state-teal/15 hover:bg-white/70 hover:text-state-navy"
                )}
                aria-pressed={index === activeIndex}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-xl text-xs font-bold",
                    index === activeIndex ? "bg-state-gold text-state-navy" : "bg-state-teal/10 text-state-tealDark"
                  )}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 text-sm font-semibold leading-5">{slide[0]}</span>
              </button>
            ))}
          </div>

          <div className="relative min-h-[18rem] overflow-hidden rounded-[1.15rem] border border-state-teal/15 bg-white p-5 md:p-6">
            <div className="absolute bottom-0 right-0 h-36 w-36 rounded-tl-full bg-state-teal/[0.06]" />
            <div className="relative flex min-h-[15.5rem] flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-state-navy text-state-gold">
                  <SlideIcon className="h-6 w-6" />
                </span>
              </div>
              <h4 className="mt-7 text-3xl font-bold leading-tight md:text-4xl">{activeSlide[0]}</h4>
              <p className="mt-4 max-w-2xl whitespace-normal break-words text-sm leading-6 text-slate-600 md:text-base md:leading-7">{activeSlide[1]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
