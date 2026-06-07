import { BarChart3, Brain, CheckCircle2, Eye, Hourglass, ListChecks, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { primaryPsychologicalSections } from "@/lib/primary-psychological-test";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    badge: "Психологический отбор",
    title: "Первичный психологический тест",
    description:
      "Тестирование состоит из последовательных секций. Сначала кандидат проходит числовые задания, затем наглядно-образные задания с фигурами, после этого будут добавлены задания на память и итоговая интерпретация.",
    start: "Начать тестирование",
    available: "Доступно сейчас",
    planned: "Будет добавлено",
    overviewEyebrow: "Структура",
    overviewTitle: "Что входит в тестирование",
    overviewText:
      "Секции идут по очереди. После завершения одной части появится переход к следующей, чтобы кандидат не смешивал разные типы заданий.",
    numericLabel: "50 вопросов",
    visualLabel: "50 вопросов",
    memoryLabel: "секция готовится",
    interpretationLabel: "после ключей оценки",
    processEyebrow: "Прохождение",
    processTitle: "Как будет идти тест",
    steps: [
      "На стартовой странице кандидат видит описание секций и начинает тестирование.",
      "Внутри теста задания открываются последовательно в рамках текущей секции.",
      "После последнего вопроса секции кандидат переходит к следующей части.",
      "Итоговая оценка будет включена после внесения официальных ключей и шкал."
    ],
    noteTitle: "Сейчас это тренировочный режим",
    noteText:
      "Ответы собираются в интерфейсе, но автоматическая оценка отключена до добавления ключей ответов. Это сделано намеренно, чтобы не показывать неподтвержденные результаты.",
    back: "Вернуться к поступлению"
  },
  kk: {
    badge: "Психологиялық іріктеу",
    title: "Бастапқы психологиялық тест",
    description:
      "Тестілеу бірізді бөлімдерден тұрады. Алдымен кандидат сандық тапсырмаларды, кейін фигуралармен көрнекі-бейнелік тапсырмаларды орындайды, одан соң жад тапсырмалары мен қорытынды интерпретация қосылады.",
    start: "Тестілеуді бастау",
    available: "Қазір қолжетімді",
    planned: "Кейін қосылады",
    overviewEyebrow: "Құрылым",
    overviewTitle: "Тестілеуге не кіреді",
    overviewText:
      "Бөлімдер кезекпен өтеді. Бір бөлік аяқталғаннан кейін кандидат келесі бөлімге өтеді, сондықтан әртүрлі тапсырма түрлері араласпайды.",
    numericLabel: "50 сұрақ",
    visualLabel: "50 сұрақ",
    memoryLabel: "бөлім дайындалуда",
    interpretationLabel: "бағалау кілттерінен кейін",
    processEyebrow: "Өту тәртібі",
    processTitle: "Тест қалай өтеді",
    steps: [
      "Бастапқы бетте кандидат бөлімдердің сипаттамасын көріп, тестілеуді бастайды.",
      "Тест ішінде тапсырмалар ағымдағы бөлім бойынша бірізді ашылады.",
      "Бөлімнің соңғы сұрағынан кейін кандидат келесі бөлікке өтеді.",
      "Қорытынды бағалау ресми жауап кілттері мен шкалалар енгізілгеннен кейін қосылады."
    ],
    noteTitle: "Қазір бұл жаттығу режимі",
    noteText:
      "Жауаптар интерфейсте жиналады, бірақ автоматты бағалау жауап кілттері қосылғанға дейін өшірілген. Бұл расталмаған нәтижелерді көрсетпеу үшін әдейі жасалды.",
    back: "Қабылдауға оралу"
  }
};

const sectionIcons = {
  numeric: Brain,
  visual: Eye,
  memory: Hourglass,
  interpretation: BarChart3
};

export default async function PsychologicalTestingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];

  const sectionLabels = {
    numeric: t.numericLabel,
    visual: t.visualLabel,
    memory: t.memoryLabel,
    interpretation: t.interpretationLabel
  };

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_25rem),radial-gradient(circle_at_80%_60%,rgba(214,168,58,0.22),transparent_24rem)]" />
        <Container className="relative pb-20 pt-12 md:pb-24 md:pt-16">
          <Reveal>
            <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">{t.badge}</Badge>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-balance text-4xl font-bold leading-tight md:text-6xl">{t.title}</h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">{t.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href={`/${locale}/psychological-testing/primary-selection`} variant="primary">
                    {t.start}
                  </Button>
                  <Button href={`/${locale}/careers/admission`} variant="ghost">
                    {t.back}
                  </Button>
                </div>
              </div>
              <div className="glass grid gap-3 rounded-[2rem] p-6 text-state-navy shadow-premium">
                {primaryPsychologicalSections.map((section) => {
                  const Icon = sectionIcons[section.id];
                  const isReady = section.status === "ready";
                  return (
                    <div className="flex items-center gap-3 rounded-2xl bg-white/76 p-4" key={section.id}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-state-teal/10">
                        <Icon className="h-5 w-5 text-state-tealDark" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-state-navy">{section.title}</p>
                        <p className="text-xs font-medium text-slate-600">{sectionLabels[section.id]}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isReady ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {isReady ? t.available : t.planned}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section eyebrow={t.overviewEyebrow} title={t.overviewTitle} description={t.overviewText} className="bg-white">
        <div className="grid gap-5 md:grid-cols-2">
          {primaryPsychologicalSections.map((section, index) => {
            const Icon = sectionIcons[section.id];
            const isReady = section.status === "ready";
            return (
              <PremiumCard className="h-full" key={section.id}>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-state-teal/10">
                    <Icon className="h-5 w-5 text-state-tealDark" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-state-navy">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{section.description}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-sm font-semibold text-state-tealDark">{sectionLabels[section.id]}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isReady ? "text-emerald-700" : "text-slate-500"}`}>
                    {isReady ? <CheckCircle2 className="h-4 w-4" /> : <Hourglass className="h-4 w-4" />}
                    {isReady ? t.available : t.planned}
                  </span>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      </Section>

      <Section eyebrow={t.processEyebrow} title={t.processTitle}>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <PremiumCard className="border-state-teal/20 bg-state-teal/5">
            <ShieldCheck className="h-9 w-9 text-state-tealDark" />
            <h2 className="mt-5 text-xl font-bold text-state-navy">{t.noteTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{t.noteText}</p>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-center gap-3">
              <ListChecks className="h-7 w-7 text-state-teal" />
              <h2 className="text-xl font-bold text-state-navy">{t.processTitle}</h2>
            </div>
            <div className="mt-6 grid gap-4">
              {t.steps.map((step, index) => (
                <div className="flex gap-4" key={step}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-state-navy text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <Button href={`/${locale}/psychological-testing/primary-selection`} variant="primary">
                {t.start}
              </Button>
            </div>
          </PremiumCard>
        </div>
      </Section>
    </>
  );
}
