import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { cn } from "@/lib/utils";

export function ActionCard({ icon: Icon, title, text, href, dark = false }: { icon: LucideIcon; title: string; text: string; href: string; dark?: boolean }) {
  return (
    <Link href={href}>
      <PremiumCard className={cn("relative h-full overflow-hidden", dark ? "border-white/12 bg-white/[0.08] text-white hover:border-state-gold/45 hover:bg-white/[0.12]" : "bg-gradient-to-br from-white via-white to-[#eef8f4]")}>
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#00a99b,#f8b133)]" />
        <div className={cn("absolute -right-10 -top-10 h-28 w-28 rounded-full border", dark ? "border-white/12" : "border-state-teal/15")} />
        <div className="flex items-start justify-between gap-4">
          <span className={cn("grid h-14 w-14 place-items-center rounded-2xl transition-colors group-hover:bg-state-teal group-hover:text-white", dark ? "bg-white/10 text-state-gold" : "bg-state-teal/10 text-state-tealDark")}>
            <Icon className="h-6 w-6" />
          </span>
          <ArrowUpRight className={cn("h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1", dark ? "text-white/42 group-hover:text-state-gold" : "text-slate-400 group-hover:text-state-teal")} />
        </div>
        <h3 className={cn("mt-6 text-xl font-bold", dark ? "text-white" : "text-state-navy")}>{title}</h3>
        <p className={cn("mt-3 text-sm leading-6", dark ? "text-white/64" : "text-slate-600")}>{text}</p>
      </PremiumCard>
    </Link>
  );
}
