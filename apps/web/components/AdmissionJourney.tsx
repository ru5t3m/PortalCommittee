"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Dumbbell, FileText, HeartPulse, SearchCheck, ShieldCheck, Trophy, UserCheck, UsersRound } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

const journeyStepsRu = [
  {
    title: "Заявление",
    label: "Первичное обращение",
    icon: ClipboardList,
    summary: "Подать заявление с необходимыми документами в территориальный орган КНБ или территориальные подразделения Пограничной службы КНБ.",
    details: [
      "Кандидат обращается в территориальный орган КНБ или подразделение Пограничной службы КНБ.",
      "В заявлении указываются контактные данные, образование, опыт и выбранное направление службы.",
      "На этом этапе важно предоставить достоверные сведения и полный первичный пакет документов."
    ],
    checks: ["заявление", "территориальный орган", "первичный пакет"],
    accent: "from-state-gold/28 via-white/10 to-state-teal/16"
  },
  {
    title: "Необходимые документы",
    label: "Пакет кандидата",
    icon: FileText,
    summary: "Кандидат готовит документы, подтверждающие личность, образование, семейное положение, воинский учет, трудовой опыт и сведения о близких родственниках.",
    details: [
      "Удостоверение личности, свидетельство о рождении, аттестат или диплом о среднем/техническом образовании.",
      "Диплом о высшем образовании, свидетельство о заключении брака при наличии, военный билет или приписное свидетельство при наличии.",
      "Трудовая книжка при наличии, цветные фотографии 9х12 - 2 шт., 3х4 - 4 шт., копии документов близких родственников."
    ],
    checks: ["личные документы", "образование", "родственники"],
    accent: "from-state-teal/28 via-white/10 to-state-blue/18"
  },
  {
    title: "Собеседование",
    label: "Оценка мотивации",
    icon: UsersRound,
    summary: "Классическое собеседование с руководством и уполномоченными сотрудниками помогает оценить мотивацию, зрелость решений и понимание требований службы.",
    details: [
      "Обсуждаются образование, опыт, профессиональные интересы, дисциплина и готовность соблюдать ограничения службы.",
      "Руководство оценивает мотивацию кандидата, коммуникативность, ответственность и понимание будущих обязанностей.",
      "По итогам собеседования уточняется дальнейшее прохождение этапов отбора."
    ],
    checks: ["мотивация", "ответственность", "готовность к службе"],
    accent: "from-cyan-300/24 via-white/10 to-state-teal/18"
  },
  {
    title: "Специальная проверка",
    label: "Сведения о кандидате",
    icon: SearchCheck,
    summary: "В отношении кандидата и близких родственников проводится специальная проверка сведений, влияющих на допуск к службе.",
    details: [
      "Уточняются биографические данные, документы, правовые ограничения и обстоятельства, имеющие значение для службы.",
      "Проверка охватывает сведения о кандидате и близких родственниках в рамках установленных процедур.",
      "Полнота и достоверность предоставленной информации снижает риск задержек на этом этапе."
    ],
    checks: ["биография", "родственники", "ограничения"],
    accent: "from-state-blue/22 via-white/10 to-state-gold/18"
  },
  {
    title: "Медицинское и психофизиологическое освидетельствование",
    label: "Здоровье и устойчивость",
    icon: HeartPulse,
    summary: "Оценивается состояние здоровья, психофизиологическая устойчивость и соответствие кандидата требованиям службы.",
    details: [
      "Кандидат проходит медицинские осмотры, обследования и предоставляет сведения по запросу комиссии.",
      "Психофизиологическое освидетельствование помогает оценить устойчивость к нагрузкам, внимательность и надежность поведения.",
      "Заключение рассматривается вместе с результатами остальных этапов отбора."
    ],
    checks: ["здоровье", "нагрузки", "заключение"],
    accent: "from-cyan-300/18 via-white/10 to-state-teal/18"
  },
  {
    title: "Полиграфологическое исследование",
    label: "Проверка достоверности",
    icon: ShieldCheck,
    summary: "Полиграфологическое исследование проводится для уточнения достоверности значимых сведений и выявления факторов риска.",
    details: [
      "Перед процедурой кандидату разъясняют порядок прохождения и перечень тем, связанных с требованиями службы.",
      "Внимание уделяется достоверности анкеты, возможным конфликтам интересов, нарушениям закона и факторам риска.",
      "Результаты рассматриваются в совокупности с материалами проверки и не заменяют решение комиссии."
    ],
    checks: ["достоверность анкеты", "факторы риска", "служебная надежность"],
    accent: "from-white/18 via-state-teal/16 to-state-blue/20"
  },
  {
    title: "Оценка профессиональных компетенций",
    label: "Деловые качества",
    icon: UserCheck,
    summary: "Проверяются знания, навыки, аналитическое мышление, дисциплина и способность выполнять задачи по выбранному направлению службы.",
    details: [
      "Кандидату могут предложить ситуационные вопросы, практические задания или оценку профильных знаний.",
      "Учитываются образование, опыт, способность работать с информацией, точность решений и служебная дисциплина.",
      "Результат помогает определить соответствие кандидата конкретной должности или направлению."
    ],
    checks: ["знания", "аналитика", "профиль должности"],
    accent: "from-state-teal/24 via-white/10 to-state-gold/22"
  },
  {
    title: "Проверка физической подготовленности",
    label: "Нормативы",
    icon: Dumbbell,
    summary: "Кандидат подтверждает уровень физической подготовленности, необходимый для прохождения службы и выполнения служебных задач.",
    details: [
      "Проверяются базовые физические качества: выносливость, сила, скорость и общая готовность к нагрузкам.",
      "Нормативы зависят от требований службы и оцениваются уполномоченными специалистами.",
      "Результаты фиксируются и учитываются при дальнейшем конкурсном рассмотрении."
    ],
    checks: ["выносливость", "сила", "нормативы"],
    accent: "from-state-blue/22 via-white/10 to-state-gold/18"
  },
  {
    title: "Конкурсный отбор",
    label: "Итоговое решение",
    icon: Trophy,
    summary: "На конкурсном этапе сравниваются результаты кандидатов и принимается решение о дальнейшем оформлении на службу.",
    details: [
      "Комиссия рассматривает документы, собеседование, проверки, освидетельствование, полиграф, компетенции и физическую подготовку.",
      "Преимущество получают кандидаты, лучше соответствующие требованиям конкретной должности и направления службы.",
      "По итогам кандидату сообщают дальнейший порядок оформления или разъясняют решение в допустимом объеме."
    ],
    checks: ["итоги этапов", "конкурс", "решение комиссии"],
    accent: "from-state-gold/28 via-white/10 to-state-teal/16"
  }
];

const journeyStepsKk = [
  {
    title: "Өтініш",
    label: "Алғашқы жүгіну",
    icon: ClipboardList,
    summary: "Қажетті құжаттармен бірге ҰҚК аумақтық органына немесе ҰҚК Шекара қызметінің аумақтық бөлімшелеріне өтініш беру.",
    details: [
      "Кандидат ҰҚК аумақтық органына немесе Шекара қызметінің бөлімшесіне жүгінеді.",
      "Өтініште байланыс деректері, білім, тәжірибе және таңдалған қызмет бағыты көрсетіледі.",
      "Бұл кезеңде толық әрі шынайы бастапқы құжаттар пакетін ұсыну маңызды."
    ],
    checks: ["өтініш", "аумақтық орган", "бастапқы пакет"],
    accent: "from-state-gold/28 via-white/10 to-state-teal/16"
  },
  {
    title: "Қажетті құжаттар",
    label: "Кандидат пакеті",
    icon: FileText,
    summary: "Кандидат жеке басын, білімін, отбасылық жағдайын, әскери есебін, еңбек тәжірибесін және жақын туыстары туралы мәліметтерді растайтын құжаттарды дайындайды.",
    details: [
      "Жеке куәлік, туу туралы куәлік, орта немесе техникалық білім туралы аттестат не диплом.",
      "Жоғары білім туралы диплом, некеге тұру туралы куәлік болса, әскери билет немесе тіркеу куәлігі болса.",
      "Еңбек кітапшасы болса, 9х12 - 2 дана, 3х4 - 4 дана түрлі түсті фото, жақын туыстар құжаттарының көшірмелері."
    ],
    checks: ["жеке құжаттар", "білім", "туыстар"],
    accent: "from-state-teal/28 via-white/10 to-state-blue/18"
  },
  {
    title: "Әңгімелесу",
    label: "Уәжді бағалау",
    icon: UsersRound,
    summary: "Басшылықпен және уәкілетті қызметкерлермен әңгімелесу кандидаттың уәжін, шешім қабылдау жетіктігін және қызмет талаптарын түсінуін бағалауға көмектеседі.",
    details: [
      "Білім, тәжірибе, кәсіби қызығушылық, тәртіп және қызмет шектеулерін сақтауға дайындық талқыланады.",
      "Басшылық кандидаттың уәжін, жауапкершілігін және болашақ міндеттерді түсінуін бағалайды.",
      "Әңгімелесу қорытындысы бойынша іріктеудің келесі кезеңдері нақтыланады."
    ],
    checks: ["уәж", "жауапкершілік", "қызметке дайындық"],
    accent: "from-cyan-300/24 via-white/10 to-state-teal/18"
  },
  {
    title: "Арнайы тексеру",
    label: "Кандидат туралы мәліметтер",
    icon: SearchCheck,
    summary: "Кандидат пен жақын туыстарына қатысты қызметке жіберілуге әсер ететін мәліметтер бойынша арнайы тексеру жүргізіледі.",
    details: [
      "Өмірбаян деректері, құжаттар, құқықтық шектеулер және қызмет үшін маңызды мән-жайлар нақтыланады.",
      "Тексеру белгіленген рәсімдер аясында кандидат пен жақын туыстары туралы мәліметтерді қамтиды.",
      "Ақпараттың толықтығы мен дұрыстығы осы кезеңдегі кідірістерді азайтады."
    ],
    checks: ["өмірбаян", "туыстар", "шектеулер"],
    accent: "from-state-blue/22 via-white/10 to-state-gold/18"
  },
  {
    title: "Медициналық және психофизиологиялық куәландыру",
    label: "Денсаулық және тұрақтылық",
    icon: HeartPulse,
    summary: "Кандидаттың денсаулық жағдайы, психофизиологиялық тұрақтылығы және қызмет талаптарына сәйкестігі бағаланады.",
    details: [
      "Кандидат медициналық тексерулерден өтіп, комиссия сұраған мәліметтерді ұсынады.",
      "Психофизиологиялық куәландыру жүктемеге төзімділікті, зейінді және мінез-құлық сенімділігін бағалауға көмектеседі.",
      "Қорытынды іріктеудің басқа кезеңдерімен бірге қаралады."
    ],
    checks: ["денсаулық", "жүктеме", "қорытынды"],
    accent: "from-cyan-300/18 via-white/10 to-state-teal/18"
  },
  {
    title: "Полиграфологиялық зерттеу",
    label: "Мәліметтердің дұрыстығы",
    icon: ShieldCheck,
    summary: "Полиграфологиялық зерттеу маңызды мәліметтердің дұрыстығын нақтылау және тәуекел факторларын анықтау үшін жүргізіледі.",
    details: [
      "Процедура алдында кандидатқа өту тәртібі және қызмет талаптарына байланысты тақырыптар түсіндіріледі.",
      "Анкетаның дұрыстығына, ықтимал мүдделер қақтығысына, заң бұзушылықтар мен тәуекел факторларына назар аударылады.",
      "Нәтижелер тексеру материалдарымен бірге қаралады және комиссия шешімін алмастырмайды."
    ],
    checks: ["анкета дұрыстығы", "тәуекелдер", "қызметтік сенімділік"],
    accent: "from-white/18 via-state-teal/16 to-state-blue/20"
  },
  {
    title: "Кәсіби құзыреттерді бағалау",
    label: "Іскерлік қасиеттер",
    icon: UserCheck,
    summary: "Білім, дағды, аналитикалық ойлау, тәртіп және таңдалған бағыт бойынша міндеттерді орындау қабілеті тексеріледі.",
    details: [
      "Кандидатқа жағдайлық сұрақтар, практикалық тапсырмалар немесе бейіндік білімді бағалау ұсынылуы мүмкін.",
      "Білім, тәжірибе, ақпаратпен жұмыс істеу қабілеті, шешім дәлдігі және қызметтік тәртіп ескеріледі.",
      "Нәтиже кандидаттың нақты лауазымға немесе бағытқа сәйкестігін анықтауға көмектеседі."
    ],
    checks: ["білім", "талдау", "лауазым бейіні"],
    accent: "from-state-teal/24 via-white/10 to-state-gold/22"
  },
  {
    title: "Дене даярлығы деңгейін тексеру",
    label: "Нормативтер",
    icon: Dumbbell,
    summary: "Кандидат қызметті өткеру және қызметтік міндеттерді орындау үшін қажетті дене даярлығы деңгейін растайды.",
    details: [
      "Төзімділік, күш, жылдамдық және жалпы жүктемеге дайындық сияқты негізгі физикалық қасиеттер тексеріледі.",
      "Нормативтер қызмет талаптарына байланысты және уәкілетті мамандармен бағаланады.",
      "Нәтижелер тіркеліп, конкурстық қарау кезінде ескеріледі."
    ],
    checks: ["төзімділік", "күш", "нормативтер"],
    accent: "from-state-blue/22 via-white/10 to-state-gold/18"
  },
  {
    title: "Конкурстық іріктеу",
    label: "Қорытынды шешім",
    icon: Trophy,
    summary: "Конкурстық кезеңде кандидаттардың нәтижелері салыстырылып, қызметке одан әрі ресімдеу туралы шешім қабылданады.",
    details: [
      "Комиссия құжаттарды, әңгімелесуді, тексерулерді, куәландыруды, полиграфты, құзыреттерді және дене даярлығын қарайды.",
      "Нақты лауазым мен қызмет бағыты талаптарына көбірек сәйкес келетін кандидаттарға басымдық беріледі.",
      "Қорытынды бойынша кандидатқа одан әрі ресімдеу тәртібі хабарланады немесе шешім рұқсат етілген көлемде түсіндіріледі."
    ],
    checks: ["кезең қорытындысы", "конкурс", "комиссия шешімі"],
    accent: "from-state-gold/28 via-white/10 to-state-teal/16"
  }
];

const copy = {
  ru: {
    left: "Прокрутить этапы влево",
    right: "Прокрутить этапы вправо",
    selected: "Выбранный этап",
    happens: "Что происходит",
    openAdmission: "Открыть раздел поступления",
    register: "Регистрация кандидата",
    psych: "Демо-психотест"
  },
  kk: {
    left: "Кезеңдерді солға айналдыру",
    right: "Кезеңдерді оңға айналдыру",
    selected: "Таңдалған кезең",
    happens: "Не болады",
    openAdmission: "Қабылдау бөлімін ашу",
    register: "Кандидатты тіркеу",
    psych: "Демо-психотест"
  }
};

export function AdmissionJourney({ locale }: { locale: Locale }) {
  const scrollRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const journeySteps = locale === "kk" ? journeyStepsKk : journeyStepsRu;
  const t = copy[locale];
  const active = journeySteps[activeIndex];
  const ActiveIcon = active.icon;

  function selectStep(index: number) {
    startTransition(() => {
      setActiveIndex(index);
    });
  }

  function scrollSteps(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth"
    });
  }

  return (
    <div className="grid gap-7">
      <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5 shadow-premium backdrop-blur">
        <div className="absolute inset-0 security-grid opacity-35" />
        <button
          type="button"
          onClick={() => scrollSteps("left")}
          aria-label={t.left}
          className="absolute left-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-state-gold/45 bg-state-gold text-state-navy shadow-lg shadow-black/20 transition hover:bg-[#f0c65a] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-state-gold"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollSteps("right")}
          aria-label={t.right}
          className="absolute right-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-state-gold/45 bg-state-gold text-state-navy shadow-lg shadow-black/20 transition hover:bg-[#f0c65a] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-state-gold"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <ol
          ref={scrollRef}
          className="relative flex gap-3 overflow-x-scroll px-14 pb-5 pt-2 [scrollbar-color:#d6a83a_rgba(255,255,255,0.14)] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-state-gold [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/15"
        >
          {journeySteps.map((step, index) => {
            const selected = index === activeIndex;
            const completed = index < activeIndex;
            return (
              <li key={step.title} className="relative w-[15rem] shrink-0">
                {index < journeySteps.length - 1 ? <div className="absolute left-1/2 top-6 h-px w-full bg-state-gold/35" /> : null}
                <button
                  type="button"
                  onClick={() => selectStep(index)}
                  aria-pressed={selected}
                  className={cn(
                    "relative flex h-full min-h-[10.5rem] w-full flex-col rounded-[1.25rem] border p-4 text-left shadow-sm transition-all duration-300 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-state-gold",
                    selected
                      ? "border-state-gold bg-white shadow-lift ring-4 ring-state-gold/10"
                      : "border-white/15 bg-white/[0.92] hover:-translate-y-1 hover:border-state-gold/50 hover:bg-white hover:shadow-lift"
                  )}
                >
                  <span className={cn("grid h-11 w-11 place-items-center rounded-2xl font-bold", selected ? "bg-state-gold text-state-navy" : "bg-state-teal/10 text-state-tealDark")}>
                    {completed ? <CheckCircle2 className="h-6 w-6" /> : index + 1}
                  </span>
                  <span className="mt-3 text-sm font-semibold leading-5 text-state-navy">{step.title}</span>
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
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-state-gold text-state-navy shadow-lg">
                <ActiveIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-state-gold">{t.selected}</p>
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
            <p className="text-sm font-semibold uppercase tracking-wide text-state-gold">{t.happens}</p>
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
          <Button href={`/${locale}/careers/admission`} variant="gold">{t.openAdmission}</Button>
          <Button href={`/${locale}/register`} variant="ghost">{t.register}</Button>
          <Link href={`/${locale}/psychological-testing`} className="inline-flex items-center gap-2 text-sm font-semibold text-white/72 transition hover:text-state-gold">
            {t.psych} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
