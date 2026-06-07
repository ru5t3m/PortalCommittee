import { Shield } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Поступление на учебу",
    title: "Пограничная академия КНБ",
    description: "Страница предусмотрена для дальнейшего наполнения: условия поступления, направления подготовки, этапы отбора и необходимые документы.",
    placeholder: "Информация будет добавлена",
    text: "Здесь можно разместить отдельный маршрут поступления в Пограничную академию КНБ.",
    apply: "Подать заявку на поступление"
  },
  kk: {
    eyebrow: "Оқуға қабылдау",
    title: "ҰҚК Шекара академиясы",
    description: "Бет кейін толықтыру үшін қарастырылған: қабылдау шарттары, даярлық бағыттары, іріктеу кезеңдері және қажетті құжаттар.",
    placeholder: "Ақпарат қосылады",
    text: "Мұнда ҰҚК Шекара академиясына түсудің жеке маршрутын орналастыруға болады.",
    apply: "Оқуға өтінім беру"
  }
};

export default async function BorderAcademyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  return (
    <>
      <PageHero badge={t.eyebrow} title={t.title} description={t.description} />
      <section className="bg-white py-20 md:py-24">
        <Container>
          <PremiumCard className="max-w-3xl">
            <Shield className="h-9 w-9 text-state-teal" />
            <h3 className="mt-5 text-2xl font-bold text-state-navy">{t.placeholder}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t.text}
            </p>
            <Button href={`/${locale}/appeals`} variant="gold" className="mt-6">{t.apply}</Button>
          </PremiumCard>
        </Container>
      </section>
    </>
  );
}
