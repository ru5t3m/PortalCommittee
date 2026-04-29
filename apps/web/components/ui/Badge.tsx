import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-state-teal/20 bg-state-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-state-tealDark", className)}>
      {children}
    </span>
  );
}
