import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PremiumCard } from "@/components/ui/PremiumCard";

export function NewsCard({ title, text, tag, date, gradient }: { title: string; text: string; tag: string; date: string; gradient: string }) {
  return (
    <PremiumCard className="overflow-hidden p-0">
      <div className={`h-44 ${gradient} relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_30%),linear-gradient(135deg,rgba(6,27,51,0.18),rgba(6,27,51,0.46))]" />
        <div className="absolute bottom-4 left-4">
          <Badge className="border-white/20 bg-white/20 text-white backdrop-blur">{tag}</Badge>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays className="h-4 w-4 text-state-teal" />
          {date}
        </div>
        <h3 className="mt-4 text-xl font-bold text-state-navy">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </PremiumCard>
  );
}
