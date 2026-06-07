import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Target } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PsychologicalTestRunner } from "@/components/PsychologicalTestRunner";
import { Section } from "@/components/ui/Section";
import { getPsychologicalTests } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

const examples = {
  "primary-selection": ["Числовые ряды", "Пропущенные числа", "Задания с изображениями"],
  attention: ["Найдите отличающийся символ в матрице", "Отметьте повторяющиеся последовательности", "Сравните две группы чисел на точность"],
  memory: ["Запомните последовательность слов", "Восстановите порядок объектов", "Сопоставьте пары после короткой паузы"],
  logic: ["Определите закономерность ряда", "Выберите недостающий элемент схемы", "Сравните условия и сделайте вывод"],
  "stress-resilience": ["Оцените реакцию на дефицит времени", "Выберите действие в конфликтной ситуации", "Определите приоритеты при перегрузке"]
};

const examplesKk = {
  "primary-selection": ["Сандық қатарлар", "Жетпейтін сандар", "Суреті бар тапсырмалар"],
  attention: ["Матрицадағы өзгеше таңбаны табыңыз", "Қайталанатын реттіліктерді белгілеңіз", "Екі сан тобын дәлдікке салыстырыңыз"],
  memory: ["Сөздер реттілігін есте сақтаңыз", "Нысандар тәртібін қалпына келтіріңіз", "Қысқа үзілістен кейін жұптарды сәйкестендіріңіз"],
  logic: ["Қатар заңдылығын анықтаңыз", "Сызбадағы жетіспейтін элементті таңдаңыз", "Шарттарды салыстырып, қорытынды жасаңыз"],
  "stress-resilience": ["Уақыт тапшылығындағы реакцияны бағалаңыз", "Қақтығыс жағдайындағы әрекетті таңдаңыз", "Артық жүктеме кезіндегі басымдықтарды анықтаңыз"]
};

const copy = {
  ru: {
    badge: "Психотестирование",
    params: "Параметры",
    checks: "Что проверяется",
    time: "Время",
    timeText: "Рекомендуется проходить без отвлечений.",
    skill: "Навык",
    skillText: "Основная зона самопроверки:",
    format: "Формат",
    formatText: "Задания, рекомендации и шкала самооценки для доступных разделов.",
    examples: "Примеры",
    taskTypes: "Типы заданий",
    training: "Самопроверка",
    trainingTitle: "Пройдите тест",
    back: "К списку тестов"
  },
  kk: {
    badge: "Психотестілеу",
    params: "Параметрлер",
    checks: "Не тексеріледі",
    time: "Уақыт",
    timeText: "Алаңдамай өту ұсынылады.",
    skill: "Дағды",
    skillText: "Өзін-өзі тексерудің негізгі аймағы:",
    format: "Формат",
    formatText: "Қолжетімді бөлімдерге арналған тапсырмалар, ұсынымдар және өзін-өзі бағалау шкаласы.",
    examples: "Мысалдар",
    taskTypes: "Тапсырма түрлері",
    training: "Өзін-өзі тексеру",
    trainingTitle: "Тесттен өтіңіз",
    back: "Тесттер тізіміне"
  }
};

export default async function PsychologicalTestPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const psychologicalTests = getPsychologicalTests(locale);
  const test = psychologicalTests.find((item) => item.slug === slug);
  if (!test) notFound();

  if (slug === "primary-selection") {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: "body > header, body > footer { display: none !important; }"
          }}
        />
        <PsychologicalTestRunner locale={locale} slug={test.slug} />
      </>
    );
  }

  const t = copy[locale];
  const localizedExamples = locale === "kk" ? examplesKk : examples;
  const testExamples = localizedExamples[test.slug as keyof typeof localizedExamples];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <Container className="relative py-20">
          <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">{t.badge}</Badge>
          <test.icon className="mt-8 h-12 w-12" />
          <h1 className="mt-5 max-w-4xl text-balance text-5xl font-bold leading-tight md:text-6xl">{test.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">{test.text}</p>
        </Container>
      </section>

      <Section eyebrow={t.params} title={t.checks} className="bg-white">
        <div className="grid gap-5 md:grid-cols-3">
          <PremiumCard>
            <Clock className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.time}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{test.duration}. {t.timeText}</p>
          </PremiumCard>
          <PremiumCard>
            <Target className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.skill}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.skillText} {test.metric}.</p>
          </PremiumCard>
          <PremiumCard>
            <CheckCircle2 className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.format}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.formatText}</p>
          </PremiumCard>
        </div>
      </Section>

      <Section eyebrow={t.examples} title={t.taskTypes}>
        <div className="grid gap-5 md:grid-cols-3">
          {testExamples.map((item, index) => (
            <PremiumCard key={item}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-state-teal text-white font-bold">{index + 1}</span>
              <h3 className="mt-5 text-lg font-bold text-state-navy">{item}</h3>
            </PremiumCard>
          ))}
        </div>
      </Section>

      <Section eyebrow={t.training} title={t.trainingTitle} className="bg-white">
        <PsychologicalTestRunner locale={locale} slug={test.slug} />
        <div className="mt-8">
          <Button href={`/${locale}/psychological-testing`}>{t.back}</Button>
        </div>
      </Section>
    </>
  );
}
