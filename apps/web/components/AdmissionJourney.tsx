"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ClipboardList, FileText, HeartPulse, SearchCheck, ShieldCheck, UserCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

const journeySteps = [
  {
    title: "Заявка",
    label: "Подать документы",
    icon: ClipboardList,
    summary: "Первичный вход кандидата: заполнение анкеты, передача базовых сведений и подтверждение готовности пройти отбор.",
    details: [
      "Заявка подается через раздел поступления или при личном обращении в уполномоченное подразделение.",
      "Кандидат указывает контактные данные, образование, опыт, желаемое направление службы и прикладывает первичные документы.",
      "На этом этапе важно не оставлять пустых полей и указывать только достоверные сведения."
    ],
    checks: ["анкета кандидата", "удостоверение личности", "диплом или справка об обучении"],
    accent: "from-state-gold/28 via-white/10 to-state-teal/16"
  },
  {
    title: "Отбор",
    label: "Оценка соответствия",
    icon: SearchCheck,
    summary: "Специалисты оценивают, подходит ли кандидат по базовым требованиям должности и службы.",
    details: [
      "Проверяются образование, возрастные условия, физическая готовность, мотивация и соответствие профилю выбранного направления.",
      "С кандидатами могут проводить собеседование, уточнять опыт, служебную дисциплину и готовность к ограничениям государственной службы.",
      "Итог этапа определяет, допускается ли кандидат к медицинским, психологическим и специальным проверкам."
    ],
    checks: ["квалификация", "мотивация", "физическая готовность"],
    accent: "from-state-teal/28 via-white/10 to-state-blue/18"
  },
  {
    title: "Медкомиссия",
    label: "Проверка здоровья",
    icon: HeartPulse,
    summary: "Медицинская комиссия определяет, позволяет ли состояние здоровья проходить службу с учетом нагрузки и режима.",
    details: [
      "Кандидат проходит врачебные осмотры, лабораторные обследования и предоставляет медицинские сведения по запросу комиссии.",
      "Оцениваются общие показатели здоровья, противопоказания, устойчивость к нагрузкам и соответствие требованиям конкретной должности.",
      "При необходимости комиссия может запросить дополнительные обследования или уточняющие документы."
    ],
    checks: ["осмотры врачей", "анализы", "заключение комиссии"],
    accent: "from-cyan-300/24 via-white/10 to-state-teal/18"
  },
  {
    title: "Психотест",
    label: "Профиль кандидата",
    icon: UserCheck,
    summary: "Психологическое тестирование помогает оценить внимание, память, устойчивость к стрессу и надежность решений.",
    details: [
      "Кандидат выполняет задания на концентрацию, логику, память, эмоциональную устойчивость и работу в условиях давления.",
      "Результаты рассматриваются вместе с собеседованием и другими этапами, а не как единственный критерий допуска.",
      "До официального этапа можно пройти демо-самопроверку на портале, чтобы понять формат задач."
    ],
    checks: ["внимание", "логика", "стрессоустойчивость"],
    accent: "from-state-blue/22 via-white/10 to-state-gold/18"
  },
  {
    title: "Полиграф",
    label: "Уточнение данных",
    icon: ShieldCheck,
    summary: "Полиграф применяется для проверки достоверности значимых сведений и снижения рисков для службы.",
    details: [
      "Перед процедурой кандидату разъясняют порядок прохождения и перечень тем, связанных с требованиями службы.",
      "Внимание уделяется достоверности анкеты, возможным конфликтам интересов, нарушениям закона и факторам риска.",
      "Результаты рассматриваются в совокупности с материалами проверки и не заменяют решение комиссии."
    ],
    checks: ["достоверность анкеты", "факторы риска", "служебная надежность"],
    accent: "from-state-gold/20 via-white/10 to-state-navy/24"
  },
  {
    title: "Проверка",
    label: "Специальные сведения",
    icon: FileText,
    summary: "Проводится специальная проверка документов, биографии и сведений, влияющих на допуск к службе.",
    details: [
      "Уточняются документы, образование, трудовая биография, соблюдение законодательства и отсутствие ограничений для службы.",
      "Могут запрашиваться дополнительные сведения в рамках полномочий и действующих процедур.",
      "Чем полнее и точнее документы кандидата, тем меньше задержек возникает на этом этапе."
    ],
    checks: ["документы", "биография", "правовые ограничения"],
    accent: "from-white/18 via-state-teal/16 to-state-blue/20"
  },
  {
    title: "Решение",
    label: "Итог комиссии",
    icon: CheckCircle2,
    summary: "После завершения этапов комиссия принимает решение о дальнейшем оформлении или отказе.",
    details: [
      "Комиссия рассматривает результаты всех этапов: заявку, отбор, медицинское заключение, тестирование и проверки.",
      "При положительном решении кандидату сообщают дальнейший порядок оформления, сроки и необходимые действия.",
      "При отказе кандидат получает разъяснение в допустимом объеме и может повторно обратиться после устранения причин, если это возможно."
    ],
    checks: ["итоги этапов", "решение комиссии", "следующие действия"],
    accent: "from-state-teal/24 via-white/10 to-state-gold/22"
  }
];

export function AdmissionJourney({ locale }: { locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const active = journeySteps[activeIndex];
  const ActiveIcon = active.icon;

  function selectStep(index: number) {
    startTransition(() => {
      setActiveIndex(index);
    });
  }

  return (
    <div className="grid gap-7">
      <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5 shadow-premium backdrop-blur">
        <div className="absolute inset-0 security-grid opacity-35" />
        <ol className="relative grid gap-5 md:grid-cols-7 md:gap-3">
          {journeySteps.map((step, index) => {
            const selected = index === activeIndex;
            const completed = index < activeIndex;
            return (
              <li key={step.title} className="relative">
                {index < journeySteps.length - 1 ? <div className="absolute left-6 top-12 h-full w-px bg-state-gold/35 md:left-1/2 md:top-6 md:h-px md:w-full" /> : null}
                <button
                  type="button"
                  onClick={() => selectStep(index)}
                  aria-pressed={selected}
                  className={cn(
                    "relative flex h-full w-full flex-col rounded-[1.25rem] border p-5 text-left shadow-sm transition-all duration-300 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-state-gold",
                    selected
                      ? "border-state-gold bg-white shadow-lift ring-4 ring-state-gold/10"
                      : "border-white/15 bg-white/[0.92] hover:-translate-y-1 hover:border-state-gold/50 hover:bg-white hover:shadow-lift"
                  )}
                >
                  <span className={cn("grid h-12 w-12 place-items-center rounded-2xl font-bold", selected ? "bg-state-gold text-state-navy" : "bg-state-teal/10 text-state-tealDark")}>
                    {completed ? <CheckCircle2 className="h-6 w-6" /> : index + 1}
                  </span>
                  <span className="mt-4 text-sm font-semibold leading-5 text-state-navy">{step.title}</span>
                  <span className="mt-1 text-xs leading-4 text-slate-500">{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={cn("relative overflow-hidden rounded-[1.8rem] border border-white/12 bg-white/[0.08] p-6 shadow-premium transition-opacity duration-200 backdrop-blur md:p-8", isPending ? "opacity-80" : "opacity-100")}>
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100", active.accent)} />
        <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-state-gold text-state-navy shadow-lg">
                <ActiveIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-state-gold">Выбранный этап</p>
                <h3 className="mt-1 text-3xl font-bold text-white md:text-4xl">{active.title}</h3>
              </div>
            </div>
            <p className="mt-6 text-lg leading-8 text-white/82">{active.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {active.checks.map((check) => (
                <span key={check} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/78">
                  {check}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-white/12 bg-[#06182d]/56 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-state-gold">Что происходит</p>
            <ul className="mt-4 grid gap-4">
              {active.details.map((detail) => (
                <li key={detail} className="flex gap-3 text-sm leading-6 text-white/72">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-state-gold" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
          <Button href={`/${locale}/careers/admission`} variant="gold">Открыть раздел поступления</Button>
          <Button href={`/${locale}/documents`} variant="ghost">Документы</Button>
          <Link href={`/${locale}/psychological-testing`} className="inline-flex items-center gap-2 text-sm font-semibold text-white/72 transition hover:text-state-gold">
            Демо-психотест <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
