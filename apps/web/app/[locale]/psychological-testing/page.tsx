import { Brain, CheckCircle2, Eye, ListChecks, MessageSquareText, ShieldCheck } from "lucide-react";
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
      "Тестирование состоит из трех последовательных секций. Каждый вопрос открывается отдельно, на ответ дается 1 минута.",
    start: "Начать тестирование",
    available: "Доступно сейчас",
    overviewEyebrow: "Структура",
    overviewTitle: "Что входит в тестирование",
    overviewText:
      "Секции идут по очереди. Между разделами есть пауза без таймера, чтобы кандидат прочитал информацию о следующей части.",
    numericLabel: "50 вопросов",
    visualLabel: "50 вопросов",
    verbalLabel: "30 вопросов",
    processEyebrow: "Прохождение",
    processTitle: "Как будет идти тест",
    steps: [
      "Перед каждым разделом кандидат читает инструкцию. В это время таймер не идет.",
      "Вопросы открываются по одному. На каждый вопрос дается 1 минута.",
      "Если кандидат не успел ответить за минуту, вопрос отмечается как неотвеченный и автоматически открывается следующий.",
      "После завершения раздела можно сохранить прогресс и выйти, чтобы позже продолжить со следующего раздела.",
      "Итоговые результаты сохраняются и становятся доступными только после прохождения всего тестирования."
    ],
    noteTitle: "Результаты только после полного завершения",
    noteText:
      "Промежуточное сохранение нужно только для продолжения теста. Кандидат и администратор увидят итоговые данные после завершения всех разделов.",
    back: "Вернуться к поступлению"
  },
  kk: {
    badge: "Психологиялық іріктеу",
    title: "Бастапқы психологиялық тест",
    description:
      "Тестілеу үш бірізді бөлімнен тұрады. Әр сұрақ жеке ашылады, жауап беруге 1 минут беріледі.",
    start: "Тестілеуді бастау",
    available: "Қазір қолжетімді",
    overviewEyebrow: "Құрылым",
    overviewTitle: "Тестілеуге не кіреді",
    overviewText:
      "Бөлімдер кезекпен өтеді. Келесі бөлім туралы ақпаратты оқу үшін бөлімдер арасында таймерсіз үзіліс болады.",
    numericLabel: "50 сұрақ",
    visualLabel: "50 сұрақ",
    verbalLabel: "30 сұрақ",
    processEyebrow: "Өту тәртібі",
    processTitle: "Тест қалай өтеді",
    steps: [
      "Әр бөлімнің алдында кандидат нұсқаулықты оқиды. Бұл кезде таймер жүрмейді.",
      "Сұрақтар бір-бірден ашылады. Әр сұраққа 1 минут беріледі.",
      "Кандидат бір минут ішінде жауап бермесе, сұрақ жауапсыз деп белгіленіп, келесі сұрақ автоматты түрде ашылады.",
      "Бөлім аяқталғаннан кейін прогресті сақтап шығып, кейін келесі бөлімнен жалғастыруға болады.",
      "Қорытынды нәтижелер барлық тестілеу аяқталғаннан кейін ғана сақталып, қолжетімді болады."
    ],
    noteTitle: "Нәтижелер толық аяқталғаннан кейін ғана",
    noteText:
      "Аралық сақтау тек тестті кейін жалғастыру үшін қажет. Кандидат пен әкімші қорытынды деректерді барлық бөлімдер аяқталғаннан кейін көреді.",
    back: "Қабылдауға оралу"
  }
};

const sectionIcons = {
  numeric: Brain,
  visual: Eye,
  verbal: MessageSquareText
};

export default async function PsychologicalTestingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];

  const sectionLabels = {
    numeric: t.numericLabel,
    visual: t.visualLabel,
    verbal: t.verbalLabel
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
                  return (
                    <div className="flex items-center gap-3 rounded-2xl bg-white/76 p-4" key={section.id}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-state-teal/10">
                        <Icon className="h-5 w-5 text-state-tealDark" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-state-navy">{section.title}</p>
                        <p className="text-xs font-medium text-slate-600">{sectionLabels[section.id]}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {t.available}
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
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {t.available}
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
