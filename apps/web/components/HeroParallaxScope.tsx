"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

const resetStyle = {
  "--hero-rotate-x": "0deg",
  "--hero-rotate-y": "0deg",
  "--hero-shift-x": "0px",
  "--hero-shift-y": "0px",
} as CSSProperties;

export function HeroParallaxScope({ children, className }: { children: ReactNode; className?: string }) {
  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    target.style.setProperty("--hero-rotate-x", `${(-y * 13).toFixed(2)}deg`);
    target.style.setProperty("--hero-rotate-y", `${(x * 15).toFixed(2)}deg`);
    target.style.setProperty("--hero-shift-x", "0px");
    target.style.setProperty("--hero-shift-y", "0px");
  }

  function handlePointerLeave(event: PointerEvent<HTMLElement>) {
    const target = event.currentTarget;
    target.style.setProperty("--hero-rotate-x", "0deg");
    target.style.setProperty("--hero-rotate-y", "0deg");
    target.style.setProperty("--hero-shift-x", "0px");
    target.style.setProperty("--hero-shift-y", "0px");
  }

  return (
    <section className={cn("relative", className)} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} style={resetStyle}>
      {children}
    </section>
  );
}
