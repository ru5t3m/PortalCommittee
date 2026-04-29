import { Building2, Flag, Landmark, Network, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";

const items: Array<{ title: string; text: string; icon: LucideIcon }> = [
  { title: "Миссия и задачи", text: "Защита национальной безопасности, прав граждан и конституционного строя в рамках законодательства.", icon: Landmark },
  { title: "История", text: "Справочный раздел о развитии органов безопасности и ключевых этапах институционального становления.", icon: ScrollText },
  { title: "Руководство", text: "Официальная информация о руководстве и публично раскрываемых направлениях ответственности.", icon: Building2 },
  { title: "Структура", text: "Общее представление о системе подразделений, территориальном контуре и функциональных направлениях.", icon: Network },
  { title: "Символика", text: "Описание официальной символики, эмблем и стандартов визуального представления.", icon: Flag }
];

export default function AboutPage() {
  return (
    <Section eyebrow="О Комитете" title="Миссия, структура и официальная информация" description="Раздел раскрывает публичную информацию о задачах, истории, руководстве и символике Комитета." className="bg-white">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
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
