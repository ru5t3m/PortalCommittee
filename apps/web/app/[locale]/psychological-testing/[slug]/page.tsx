import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Target } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";
import { psychologicalTests } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

const examples = {
  attention: ["Найдите отличающийся символ в матрице", "Отметьте повторяющиеся последовательности", "Сравните две группы чисел на точность"],
  memory: ["Запомните последовательность слов", "Восстановите порядок объектов", "Сопоставьте пары после короткой паузы"],
  logic: ["Определите закономерность ряда", "Выберите недостающий элемент схемы", "Сравните условия и сделайте вывод"],
  "stress-resilience": ["Оцените реакцию на дефицит времени", "Выберите действие в конфликтной ситуации", "Определите приоритеты при перегрузке"]
};

export default async function PsychologicalTestPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const test = psychologicalTests.find((item) => item.slug === slug);
  if (!test) notFound();
  const testExamples = examples[test.slug as keyof typeof examples];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <Container className="relative py-20">
          <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">Психотестирование</Badge>
          <test.icon className="mt-8 h-12 w-12" />
          <h1 className="mt-5 max-w-4xl text-balance text-5xl font-bold leading-tight md:text-6xl">{test.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">{test.text}</p>
        </Container>
      </section>

      <Section eyebrow="Параметры" title="Что проверяется" className="bg-white">
        <div className="grid gap-5 md:grid-cols-3">
          <PremiumCard>
            <Clock className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Время</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{test.duration}. Рекомендуется проходить без отвлечений.</p>
          </PremiumCard>
          <PremiumCard>
            <Target className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Навык</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Основная зона самопроверки: {test.metric}.</p>
          </PremiumCard>
          <PremiumCard>
            <CheckCircle2 className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Формат</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Демо-задания, рекомендации и примерная шкала самооценки.</p>
          </PremiumCard>
        </div>
      </Section>

      <Section eyebrow="Примеры" title="Типы заданий">
        <div className="grid gap-5 md:grid-cols-3">
          {testExamples.map((item, index) => (
            <PremiumCard key={item}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-state-teal text-white font-bold">{index + 1}</span>
              <h3 className="mt-5 text-lg font-bold text-state-navy">{item}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">В полной версии здесь будет интерактивное задание с таймером и автоматическим подсчетом результата.</p>
            </PremiumCard>
          ))}
        </div>
        <div className="mt-8">
          <Button href={`/${locale}/psychological-testing`}>К списку тестов</Button>
        </div>
      </Section>
    </>
  );
}
