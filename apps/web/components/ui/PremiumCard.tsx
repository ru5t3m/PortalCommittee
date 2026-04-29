import { cn } from "@/lib/utils";

export function PremiumCard({ children, className, as: Comp = "article" }: { children: React.ReactNode; className?: string; as?: React.ElementType }) {
  return (
    <Comp className={cn("group rounded-[1.35rem] border border-slate-200/80 bg-white/[0.92] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-state-teal/45 hover:shadow-lift", className)}>
      {children}
    </Comp>
  );
}
