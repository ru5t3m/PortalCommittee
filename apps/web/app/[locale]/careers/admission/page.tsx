import { Award, BadgeCheck, Ban, ClipboardCheck, FileText, HeartPulse, ShieldCheck, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Timeline } from "@/components/ui/Timeline";
import { getAdmissionFaq, getAdmissionSteps } from "@/lib/data";
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

export default async function AdmissionPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  const candidate = t.candidate as Array<{ title: string; text: string; icon: LucideIcon }>;
  const admissionSteps = getAdmissionSteps(locale);
  const admissionFaq = getAdmissionFaq(locale);

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_25rem),radial-gradient(circle_at_80%_60%,rgba(214,168,58,0.22),transparent_24rem)]" />
        <Container className="relative grid gap-10 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <Reveal>
            <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">{t.badge}</Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-tight md:text-7xl">{t.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">{t.description}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href={`/${locale}/appeals`} variant="gold">{t.apply}</Button>
              <Button href={`/${locale}/psychological-testing`}>{t.checkAbilities}</Button>
              <Button href="#timeline" variant="ghost">{t.viewSteps}</Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass rounded-[2rem] p-6 text-state-navy shadow-premium">
              <div className="grid gap-4 sm:grid-cols-2">
                {t.highlights.map((item) => (
                  <div className="rounded-2xl bg-white/76 p-5" key={item}>
                    <ClipboardCheck className="h-7 w-7 text-state-teal" />
                    <p className="mt-4 font-semibold">{item}</p>
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
        <Section eyebrow={t.processEyebrow} title={t.processTitle} description={t.processDescription} className="bg-white">
          <Timeline steps={admissionSteps} activeIndex={0} />
        </Section>
      </section>

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
