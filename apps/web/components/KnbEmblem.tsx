import { cn } from "@/lib/utils";

export function KnbEmblem({ className, imageClassName }: { className?: string; imageClassName?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center rounded-full bg-[#06182d] shadow-[0_18px_45px_rgba(0,0,0,0.22)] ring-1 ring-state-gold/45", className)}>
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,rgba(214,168,58,0.22),transparent_48%)]" />
      <img src="/knb-emblem.svg" alt="Эмблема КНБ РК" className={cn("relative h-[78%] w-[78%] object-contain", imageClassName)} />
    </span>
  );
}
