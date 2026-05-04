import { GraduationCap } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Поступление на учебу",
    title: "Академия КНБ",
    description: "Страница предусмотрена для дальнейшего наполнения: условия поступления, образовательные программы, этапы отбора и перечень документов.",
    placeholder: "Информация будет добавлена",
    text: "Здесь можно разместить отдельный маршрут поступления в Академию КНБ."
  },
  kk: {
    eyebrow: "Оқуға қабылдау",
    title: "ҰҚК Академиясы",
    description: "Бет кейін толықтыру үшін қарастырылған: қабылдау шарттары, білім беру бағдарламалары, іріктеу кезеңдері және құжаттар тізімі.",
    placeholder: "Ақпарат қосылады",
    text: "Мұнда ҰҚК Академиясына түсудің жеке маршрутын орналастыруға болады."
  }
};

export default async function KnbAcademyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  return (
    <Section
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
      className="bg-white"
    >
      <PremiumCard className="max-w-3xl">
        <GraduationCap className="h-9 w-9 text-state-teal" />
        <h3 className="mt-5 text-2xl font-bold text-state-navy">{t.placeholder}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {t.text}
        </p>
      </PremiumCard>
    </Section>
  );
}
