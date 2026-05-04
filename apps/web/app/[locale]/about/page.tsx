import { Building2, Flag, Landmark, Network, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "О Комитете",
    title: "Миссия, структура и официальная информация",
    description: "Раздел раскрывает публичную информацию о задачах, истории, руководстве и символике Комитета.",
    items: [
      { title: "Миссия и задачи", text: "Защита национальной безопасности, прав граждан и конституционного строя в рамках законодательства.", icon: Landmark },
      { title: "История", text: "Справочный раздел о развитии органов безопасности и ключевых этапах институционального становления.", icon: ScrollText },
      { title: "Руководство", text: "Официальная информация о руководстве и публично раскрываемых направлениях ответственности.", icon: Building2 },
      { title: "Структура", text: "Общее представление о системе подразделений, территориальном контуре и функциональных направлениях.", icon: Network },
      { title: "Символика", text: "Описание официальной символики, эмблем и стандартов визуального представления.", icon: Flag }
    ]
  },
  kk: {
    eyebrow: "Комитет туралы",
    title: "Миссия, құрылым және ресми ақпарат",
    description: "Бөлім Комитеттің міндеттері, тарихы, басшылығы және символикасы туралы ашық ақпаратты көрсетеді.",
    items: [
      { title: "Миссия және міндеттер", text: "Заңнама аясында ұлттық қауіпсіздікті, азаматтардың құқықтарын және конституциялық құрылысты қорғау.", icon: Landmark },
      { title: "Тарих", text: "Қауіпсіздік органдарының дамуы және институционалдық қалыптасудың негізгі кезеңдері туралы анықтамалық бөлім.", icon: ScrollText },
      { title: "Басшылық", text: "Басшылық және ашық жарияланатын жауапкершілік бағыттары туралы ресми ақпарат.", icon: Building2 },
      { title: "Құрылым", text: "Бөлімшелер жүйесі, аумақтық контур және функционалдық бағыттар туралы жалпы түсінік.", icon: Network },
      { title: "Рәміздер", text: "Ресми символика, эмблемалар және визуалды ұсыну стандарттары туралы сипаттама.", icon: Flag }
    ]
  }
};

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  const items = t.items as Array<{ title: string; text: string; icon: LucideIcon }>;
  return (
    <Section eyebrow={t.eyebrow} title={t.title} description={t.description} className="bg-white">
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
