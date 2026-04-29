import { Brain, BriefcaseBusiness, Newspaper, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";

const modules: Array<{ title: string; text: string; icon: LucideIcon }> = [
  { title: "Content", text: "Управление новостями, страницами, документами и медиа.", icon: Newspaper },
  { title: "Psych tests", text: "Управление демо-тестами, подсказками и справочными материалами для кандидатов.", icon: Brain },
  { title: "Vacancies", text: "Публикация вакансий и управление кандидатскими заявками.", icon: BriefcaseBusiness },
  { title: "Moderation", text: "RBAC, журнал действий, контроль публикаций и проверка изменений.", icon: ShieldCheck }
];

export default function AdminPage() {
  return (
    <Section eyebrow="Admin panel" title="Операционная панель редакторов" description="Концепт интерфейса для ролей Admin, Editor, HR и Moderator. Полноценный login/CRUD UI подключается следующим этапом." className="bg-white">
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
