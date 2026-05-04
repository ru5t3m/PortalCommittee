import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Поиск",
    title: "Поиск по порталу",
    description: "Единая точка доступа к новостям, документам, контактам, памяткам и разделам службы.",
    placeholder: "Введите запрос",
    find: "Найти",
    popular: ["Направления деятельности", "Поступление на службу", "Психотестирование"],
    popularText: "Популярный раздел для быстрого перехода и поиска официальной информации."
  },
  kk: {
    eyebrow: "Іздеу",
    title: "Порталдан іздеу",
    description: "Жаңалықтарға, құжаттарға, байланыстарға, жадынамаларға және қызмет бөлімдеріне қол жеткізудің бірыңғай нүктесі.",
    placeholder: "Сұрау енгізіңіз",
    find: "Табу",
    popular: ["Қызмет бағыттары", "Қызметке қабылдау", "Психотестілеу"],
    popularText: "Ресми ақпаратты жылдам табуға және бөлімге өтуге арналған танымал бөлім."
  }
};

export default async function SearchPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  return (
    <Section eyebrow={t.eyebrow} title={t.title} description={t.description} className="bg-white">
      <form className="flex max-w-3xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-premium">
        <input className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-state-surface/60 p-4 outline-none focus:border-state-teal" placeholder={t.placeholder} />
        <Button type="submit"><Search size={18} /> {t.find}</Button>
      </form>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {t.popular.map((title) => (
          <PremiumCard key={title}>
            <h3 className="text-lg font-bold text-state-navy">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.popularText}</p>
          </PremiumCard>
        ))}
      </div>
    </Section>
  );
}
