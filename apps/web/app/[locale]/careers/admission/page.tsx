import { Award, BadgeCheck, Ban, ClipboardCheck, FileText, HeartPulse, ShieldCheck, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { AdmissionJourney } from "@/components/AdmissionJourney";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getAdmissionFaq } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    badge: "Вакансии и служба",
    title: "Поступление на службу",
    description: "Понятный маршрут кандидата: от первичной заявки до решения комиссии. Страница снижает барьер входа и помогает заранее подготовить документы.",
    apply: "Подать заявку",
    checkAbilities: "Проверить способности",
    viewSteps: "Посмотреть этапы",
    highlights: ["Прозрачный процесс", "Единые требования", "Проверка документов", "Поддержка кандидата"],
    candidateEyebrow: "Кандидаты",
    candidateTitle: "Кто может поступить",
    candidateDescription: "Базовые критерии помогают кандидатам заранее оценить готовность к службе.",
    candidate: [
      { title: "Гражданство РК", text: "Кандидат должен быть гражданином Республики Казахстан.", icon: ShieldCheck },
      { title: "Возраст", text: "Возрастные требования зависят от должности и формы службы.", icon: UserCheck },
      { title: "Образование", text: "Среднее специальное или высшее образование по профилю вакансии.", icon: Award },
      { title: "Здоровье", text: "Соответствие медицинским требованиям к службе.", icon: HeartPulse },
      { title: "Репутация", text: "Законопослушность, устойчивые моральные качества и дисциплина.", icon: BadgeCheck }
    ],
    requirementsEyebrow: "Требования",
    requirementsTitle: "Что оценивается при отборе",
    requirementsDescription: "Проверки проводятся в рамках законодательства Республики Казахстан и внутренних регламентов.",
    requirements: ["Собеседование", "Специальная проверка", "Медицинское и психофизиологическое освидетельствование", "Полиграфологическое исследование", "Оценка профессиональных компетенций", "Проверка физической подготовленности"],
    requirementText: "Критерий проверяется уполномоченными специалистами на соответствующем этапе.",
    processEyebrow: "Процесс",
    processTitle: "Этапы отбора",
    processDescription: "Маршрут отбора показывает основные действия кандидата и комиссии.",
    physicalEyebrow: "Физическая подготовка",
    physicalTitle: "Готовность к служебным нагрузкам",
    physicalDescription: "Физическая подготовленность проверяется как отдельный этап отбора. Конкретный состав упражнений и нормативов определяется требованиями выбранного направления службы и доводится кандидату уполномоченным подразделением.",
    physicalPoints: [
      "Выносливость — способность сохранять работоспособность при продолжительной нагрузке.",
      "Сила и общая подготовка — готовность безопасно выполнять установленные упражнения.",
      "Скорость и координация — качество выполнения заданий в заданном темпе."
    ],
    docsEyebrow: "Пакет кандидата",
    docsTitle: "Документы",
    documents: ["Удостоверение личности", "Свидетельство о рождении", "Аттестат или диплом", "Военный билет или приписное", "Фото и документы родственников"],
    refusalsEyebrow: "Ограничения",
    refusalsTitle: "Причины отказа",
    refusals: ["Недостоверные данные", "Несоответствие по здоровью", "Невыполнение квалификационных требований"],
    refusalText: "Решение принимается комиссией с учетом требований службы и результатов проверки.",
    answers: "Ответы",
    prepareTitle: "Подготовьтесь заранее",
    prepareText: "Соберите документы, проверьте актуальность контактных данных и внимательно заполните анкету кандидата.",
    selfCheck: "Пройти самопроверку"
  },
  kk: {
    badge: "Бос орындар және қызмет",
    title: "Қызметке қабылдау",
    description: "Кандидаттың түсінікті маршруты: өтініштен комиссия шешіміне дейін. Бет құжаттарды алдын ала дайындауға көмектеседі.",
    apply: "Өтінім беру",
    checkAbilities: "Қабілетті тексеру",
    viewSteps: "Кезеңдерді қарау",
    highlights: ["Ашық процесс", "Бірыңғай талаптар", "Құжаттарды тексеру", "Кандидатты қолдау"],
    candidateEyebrow: "Кандидаттар",
    candidateTitle: "Кім түсе алады",
    candidateDescription: "Негізгі өлшемдер кандидатқа қызметке дайындығын алдын ала бағалауға көмектеседі.",
    candidate: [
      { title: "ҚР азаматтығы", text: "Кандидат Қазақстан Республикасының азаматы болуы тиіс.", icon: ShieldCheck },
      { title: "Жасы", text: "Жас талаптары лауазымға және қызмет нысанына байланысты.", icon: UserCheck },
      { title: "Білімі", text: "Вакансия бейініне сай орта арнаулы немесе жоғары білім.", icon: Award },
      { title: "Денсаулығы", text: "Қызметке қойылатын медициналық талаптарға сәйкестік.", icon: HeartPulse },
      { title: "Беделі", text: "Заңға бағыну, тұрақты моральдық қасиеттер және тәртіп.", icon: BadgeCheck }
    ],
    requirementsEyebrow: "Талаптар",
    requirementsTitle: "Іріктеу кезінде не бағаланады",
    requirementsDescription: "Тексерулер Қазақстан Республикасының заңнамасы және ішкі регламенттер аясында жүргізіледі.",
    requirements: ["Әңгімелесу", "Арнайы тексеру", "Медициналық және психофизиологиялық куәландыру", "Полиграфологиялық зерттеу", "Кәсіби құзыреттерді бағалау", "Дене даярлығын тексеру"],
    requirementText: "Өлшемді тиісті кезеңде уәкілетті мамандар тексереді.",
    processEyebrow: "Процесс",
    processTitle: "Іріктеу кезеңдері",
    processDescription: "Іріктеу маршруты кандидат пен комиссияның негізгі әрекеттерін көрсетеді.",
    physicalEyebrow: "Дене даярлығы",
    physicalTitle: "Қызметтік жүктемелерге дайындық",
    physicalDescription: "Дене даярлығы іріктеудің жеке кезеңі ретінде тексеріледі. Жаттығулар мен нормативтердің нақты құрамы таңдалған қызмет бағытының талаптарына байланысты айқындалады және кандидатқа уәкілетті бөлімше хабарлайды.",
    physicalPoints: [
      "Төзімділік — ұзақ жүктеме кезінде жұмыс қабілетін сақтау.",
      "Күш және жалпы даярлық — белгіленген жаттығуларды қауіпсіз орындауға дайындық.",
      "Жылдамдық пен үйлесімділік — тапсырмаларды белгіленген қарқында сапалы орындау."
    ],
    docsEyebrow: "Кандидат пакеті",
    docsTitle: "Құжаттар",
    documents: ["Жеке куәлік", "Туу туралы куәлік", "Аттестат немесе диплом", "Әскери билет немесе тіркеу куәлігі", "Фото және туыстар құжаттары"],
    refusalsEyebrow: "Шектеулер",
    refusalsTitle: "Бас тарту себептері",
    refusals: ["Дұрыс емес деректер", "Денсаулық бойынша сәйкес келмеу", "Біліктілік талаптарын орындамау"],
    refusalText: "Шешімді комиссия қызмет талаптары мен тексеру нәтижелерін ескере отырып қабылдайды.",
    answers: "Жауаптар",
    prepareTitle: "Алдын ала дайындалыңыз",
    prepareText: "Құжаттарды жинап, байланыс деректерінің өзектілігін тексеріп, кандидат анкетасын мұқият толтырыңыз.",
    selfCheck: "Өзін-өзі тексеруден өту"
  }
};

export default async function AdmissionPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ stage?: string | string[] }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const t = copy[locale];
  const candidate = t.candidate as Array<{ title: string; text: string; icon: LucideIcon }>;
  const admissionFaq = getAdmissionFaq(locale);
  const requestedStage = Number(Array.isArray(query.stage) ? query.stage[0] : query.stage);
  const initialStageIndex = Number.isInteger(requestedStage) && requestedStage >= 1 && requestedStage <= 9 ? requestedStage - 1 : 0;

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f5f8fb] text-state-navy">
        <div className="paper-grid absolute inset-0 opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,rgba(0,169,155,0.14),transparent_25rem),radial-gradient(circle_at_82%_60%,rgba(47,111,174,0.10),transparent_24rem)]" />
        <Container className="relative grid gap-10 py-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <Reveal>
            <Badge className="border-state-teal/20 bg-white text-state-tealDark shadow-sm">{t.badge}</Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.08] md:text-6xl">{t.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{t.description}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href={`/${locale}/appeals`} variant="gold">{t.apply}</Button>
              <Button href={`/${locale}/psychological-testing`}>{t.checkAbilities}</Button>
              <Button href="#timeline" variant="secondary">{t.viewSteps}</Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-state-navy shadow-[0_26px_74px_rgba(6,27,51,0.13)]">
              <div className="relative aspect-[16/8] overflow-hidden bg-slate-100">
                <Image src="/media/official/service-pin.jpg" alt="" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 48vw" />
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {t.highlights.map((item) => (
                  <div className="rounded-2xl bg-[#f5f8fa] p-4" key={item}>
                    <ClipboardCheck className="h-7 w-7 text-state-teal" />
                    <p className="mt-3 font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section eyebrow={t.candidateEyebrow} title={t.candidateTitle} description={t.candidateDescription} className="bg-white">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {candidate.map((item) => (
            <PremiumCard key={item.title}>
              <item.icon className="h-8 w-8 text-state-teal" />
              <h3 className="mt-5 font-bold text-state-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            </PremiumCard>
          ))}
        </div>
      </Section>

      <Section eyebrow={t.requirementsEyebrow} title={t.requirementsTitle} description={t.requirementsDescription}>
        <div className="grid gap-5 md:grid-cols-3">
          {t.requirements.map((title) => (
            <PremiumCard key={title} className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-state-teal/10 text-state-tealDark">
                <BadgeCheck />
              </span>
              <div>
                <h3 className="font-bold text-state-navy">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t.requirementText}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Section>

      <section id="timeline">
        <Section eyebrow={t.processEyebrow} title={t.processTitle} description={t.processDescription} dark className="!py-16 md:!py-20">
          <AdmissionJourney locale={locale} initialIndex={initialStageIndex} />
        </Section>
      </section>

      <Section eyebrow={t.physicalEyebrow} title={t.physicalTitle} description={t.physicalDescription} className="bg-white">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="grid min-h-[24rem] gap-4 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl bg-slate-100 sm:row-span-2">
              <Image src="/media/education/running-track.jpg" alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 38vw" />
            </div>
            <div className="relative min-h-44 overflow-hidden rounded-3xl bg-slate-100">
              <Image src="/media/education/sprint-training.jpg" alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 24vw" />
            </div>
            <div className="relative min-h-44 overflow-hidden rounded-3xl bg-slate-100">
              <Image src="/media/official/field-training.jpg" alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 24vw" />
            </div>
          </div>
          <div className="grid gap-3">
            {t.physicalPoints.map((point, index) => (
              <div key={point} className="flex gap-4 rounded-3xl border border-slate-200 bg-[#f7fafb] p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-state-navy text-sm font-bold text-white">{index + 1}</span>
                <p className="text-sm leading-7 text-slate-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section eyebrow={t.docsEyebrow} title={t.docsTitle}>
        <div className="grid gap-5 md:grid-cols-5">
          {t.documents.map((title) => (
            <PremiumCard key={title} className="text-center">
              <FileText className="mx-auto h-8 w-8 text-state-teal" />
              <h3 className="mt-5 font-bold text-state-navy">{title}</h3>
            </PremiumCard>
          ))}
        </div>
      </Section>

      <Section eyebrow={t.refusalsEyebrow} title={t.refusalsTitle} className="bg-white">
        <div className="grid gap-5 md:grid-cols-3">
          {t.refusals.map((title) => (
            <PremiumCard key={title} className="border-red-100 bg-red-50/60">
              <Ban className="h-8 w-8 text-red-600" />
              <h3 className="mt-5 font-bold text-state-navy">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t.refusalText}</p>
            </PremiumCard>
          ))}
        </div>
      </Section>

      <Section eyebrow={t.answers} title="FAQ">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <PremiumCard className="bg-state-navy text-white">
            <ShieldCheck className="h-10 w-10 text-state-teal" />
            <h3 className="mt-5 text-2xl font-bold">{t.prepareTitle}</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">{t.prepareText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={`/${locale}/appeals`} variant="gold">{t.apply}</Button>
              <Button href={`/${locale}/psychological-testing`}>{t.selfCheck}</Button>
            </div>
          </PremiumCard>
          <FAQAccordion items={admissionFaq} />
        </div>
      </Section>
    </>
  );
}
