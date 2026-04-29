import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Timeline({ steps, activeIndex = 0 }: { steps: string[]; activeIndex?: number }) {
  return (
    <ol className="relative grid gap-5 md:grid-cols-7 md:gap-3">
      {steps.map((step, index) => {
        const active = index === activeIndex;
        return (
          <li key={step} className="relative">
            {index < steps.length - 1 ? <div className="absolute left-6 top-12 h-full w-px bg-state-gold/35 md:left-1/2 md:top-6 md:h-px md:w-full" /> : null}
            <div className={cn("relative rounded-[1.25rem] border bg-white p-5 shadow-sm transition-all duration-300", active ? "border-state-gold shadow-lift ring-4 ring-state-gold/10" : "border-white/15 bg-white/[0.92]")}>
              <span className={cn("grid h-12 w-12 place-items-center rounded-2xl font-bold", active ? "bg-state-gold text-state-navy" : "bg-state-teal/10 text-state-tealDark")}>
                {index < activeIndex ? <CheckCircle2 className="h-6 w-6" /> : index + 1}
              </span>
              <p className="mt-4 text-sm font-semibold leading-5 text-state-navy">{step}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
