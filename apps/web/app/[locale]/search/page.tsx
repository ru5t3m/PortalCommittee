import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";

export default function SearchPage() {
  return (
    <Section eyebrow="Поиск" title="Поиск по порталу" description="Единая точка доступа к новостям, документам, контактам, памяткам и разделам службы." className="bg-white">
      <form className="flex max-w-3xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-premium">
        <input className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-state-surface/60 p-4 outline-none focus:border-state-teal" placeholder="Введите запрос" />
        <Button type="submit"><Search size={18} /> Найти</Button>
      </form>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {["Направления деятельности", "Поступление на службу", "Психотестирование"].map((title) => (
          <PremiumCard key={title}>
            <h3 className="text-lg font-bold text-state-navy">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Популярный раздел для быстрого перехода и поиска официальной информации.</p>
          </PremiumCard>
        ))}
      </div>
    </Section>
  );
}
