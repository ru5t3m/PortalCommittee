import { cn } from "@/lib/utils";

export function PremiumCard({ children, className, as: Comp = "article" }: { children: React.ReactNode; className?: string; as?: React.ElementType }) {
  return (
    <Comp className={cn("group rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_12px_40px_rgba(6,27,51,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-state-teal/35 hover:shadow-[0_20px_54px_rgba(6,27,51,0.10)]", className)}>
      {children}
    </Comp>
  );
}
