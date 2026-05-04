import { Brain, BriefcaseBusiness, Newspaper, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Admin panel",
    title: "Операционная панель редакторов",
    description: "Концепт интерфейса для ролей Admin, Editor, HR и Moderator. Полноценный login/CRUD UI подключается следующим этапом.",
    modules: [
      { title: "Content", text: "Управление новостями, страницами, документами и медиа.", icon: Newspaper },
      { title: "Psych tests", text: "Управление демо-тестами, подсказками и справочными материалами для кандидатов.", icon: Brain },
      { title: "Vacancies", text: "Публикация вакансий и управление кандидатскими заявками.", icon: BriefcaseBusiness },
      { title: "Moderation", text: "RBAC, журнал действий, контроль публикаций и проверка изменений.", icon: ShieldCheck }
    ]
  },
  kk: {
    eyebrow: "Admin panel",
    title: "Редакторлардың операциялық панелі",
    description: "Admin, Editor, HR және Moderator рөлдеріне арналған интерфейс тұжырымдамасы. Толық login/CRUD UI келесі кезеңде қосылады.",
    modules: [
      { title: "Content", text: "Жаңалықтарды, беттерді, құжаттарды және медианы басқару.", icon: Newspaper },
      { title: "Psych tests", text: "Кандидаттарға арналған демо-тесттерді, кеңестерді және анықтамалық материалдарды басқару.", icon: Brain },
      { title: "Vacancies", text: "Бос орындарды жариялау және кандидат өтінімдерін басқару.", icon: BriefcaseBusiness },
      { title: "Moderation", text: "RBAC, әрекеттер журналы, жарияланымдарды бақылау және өзгерістерді тексеру.", icon: ShieldCheck }
    ]
  }
};

export default async function AdminPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  const modules = t.modules as Array<{ title: string; text: string; icon: LucideIcon }>;
  return (
    <Section eyebrow={t.eyebrow} title={t.title} description={t.description} className="bg-white">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {modules.map((item) => (
          <PremiumCard key={item.title}>
            <item.icon className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
          </PremiumCard>
        ))}
      </div>
    </Section>
  );
}
