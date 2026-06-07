import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  MapPin,
  Sparkles,
  UsersRound
} from "lucide-react";
import { AdmissionJourney } from "@/components/AdmissionJourney";
import { HeroEmblemParallax } from "@/components/HeroEmblemParallax";
import { HeroParallaxScope } from "@/components/HeroParallaxScope";
import { KnbEmblem } from "@/components/KnbEmblem";
import { ActionCard } from "@/components/ui/ActionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getActivities, getPsychologicalTests, getQuickActions } from "@/lib/data";
import { getDictionary, type Locale } from "@/lib/i18n";

const trustStatsRu = [
  ["1992", "год образования"],
  ["6", "ведомств"],
  ["20", "территориальных органов КНБ"],
  ["1400", "единый контактный номер"]
];

const trustStatsKk = [
  ["1992", "құрылған жылы"],
  ["6", "ведомство"],
  ["20", "ҰҚК аумақтық органы"],
  ["1400", "бірыңғай байланыс нөмірі"]
];

const homeCopy = {
  ru: {
    heroTitle: "ПРИЕМ НА СЛУЖБУ В КОМИТЕТ НАЦИОНАЛЬНОЙ БЕЗОПАСНОСТИ РК",
    heroDescription: "Непосредственно подчиненный и подотчетный Президенту РК специальный государственный орган, осуществляющий руководство в пределах своих полномочий единой системой органов национальной безопасности РК",
    topShort: "КНБ РК",
    topFullLine1: "Комитет национальной безопасности",
    topFullLine2: "Республики Казахстан",
    register: "Регистрация кандидата",
    quickEyebrow: "Быстрая навигация",
    quickTitle: "Основные разделы портала",
    activitiesEyebrow: "Компетенции",
    careerEyebrow: "Карьера",
    careerTitle: "Поступление на службу",
    careerDescription: "Последовательность отбора вынесена в плотную визуальную линию, чтобы кандидат сразу видел весь маршрут.",
    psychEyebrow: "Самопроверка",
    psychTitle: "Психологическое тестирование",
    psychDescription: "Демо-разделы помогают кандидату оценить базовые навыки до официальных этапов отбора. Результаты не являются официальным заключением.",
    contactBadge: "Контактный центр",
    contactTitle: "Нужна официальная информация?",
    contactText: "Используйте разделы портала или региональные контакты, чтобы быстро найти официальную информацию.",
    location: "Астана, Республика Казахстан",
    audience: "гражданам и кандидатам",
    sources: "официальные источники",
    contacts: "Контакты"
  },
  kk: {
    heroTitle: "ҚР ҰЛТТЫҚ ҚАУІПСІЗДІК КОМИТЕТІНЕ ҚЫЗМЕТКЕ ҚАБЫЛДАУ",
    heroDescription: "ҚР Президентіне тікелей бағынатын және есеп беретін, өз өкілеттіктері шегінде ҚР ұлттық қауіпсіздік органдарының бірыңғай жүйесіне басшылықты жүзеге асыратын арнайы мемлекеттік орган",
    topShort: "ҚР ҰҚК",
    topFullLine1: "Ұлттық қауіпсіздік комитеті",
    topFullLine2: "Қазақстан Республикасы",
    register: "Кандидатты тіркеу",
    quickEyebrow: "Жылдам навигация",
    quickTitle: "Порталдың негізгі бөлімдері",
    activitiesEyebrow: "Құзыреттер",
    careerEyebrow: "Мансап",
    careerTitle: "Қызметке қабылдау",
    careerDescription: "Іріктеу кезеңдері кандидат бүкіл маршрутты бірден көруі үшін көрнекі желі түрінде берілген.",
    psychEyebrow: "Өзін-өзі тексеру",
    psychTitle: "Психологиялық тестілеу",
    psychDescription: "Демо-бөлімдер кандидатқа ресми іріктеу кезеңдеріне дейін базалық дағдыларын бағалауға көмектеседі. Нәтижелер ресми қорытынды болып табылмайды.",
    contactBadge: "Байланыс орталығы",
    contactTitle: "Ресми ақпарат қажет пе?",
    contactText: "Ресми ақпаратты жылдам табу үшін портал бөлімдерін немесе өңірлік байланыстарды пайдаланыңыз.",
    location: "Астана, Қазақстан Республикасы",
    audience: "азаматтар мен кандидаттарға",
    sources: "ресми дереккөздер",
    contacts: "Байланыс"
  }
};

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const copy = homeCopy[locale];
  const trustStats = locale === "kk" ? trustStatsKk : trustStatsRu;
  const activities = getActivities(locale);
  const psychologicalTests = getPsychologicalTests(locale);
  const quickActions = getQuickActions(locale);

  return (
    <>
      <HeroParallaxScope className="min-h-[calc(100vh-76px)] overflow-hidden bg-[#06182d] text-white">
        <div className="security-grid absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,169,155,0.35),transparent_30rem),radial-gradient(circle_at_80%_8%,rgba(248,177,51,0.18),transparent_28rem),linear-gradient(115deg,rgba(6,24,45,0.96),rgba(5,36,55,0.8)_48%,rgba(0,125,115,0.62))]" />
        <div className="absolute left-1/2 top-12 hidden h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-state-gold/15 lg:block" />

        <Container className="relative grid min-h-[calc(100vh-76px)] items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] xl:gap-14">
          <Reveal>
            <div className="flex items-center gap-4">
              <KnbEmblem className="h-20 w-20" />
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-sm font-bold uppercase tracking-[0.22em] text-state-gold">{copy.topShort}</span>
                <div className="h-px bg-gradient-to-r from-state-gold/70 via-white/25 to-transparent" />
                <span className="text-xs font-medium uppercase leading-5 tracking-[0.16em] text-white/62 sm:text-sm">
                  {copy.topFullLine1}
                  <br />
                  {copy.topFullLine2}
                </span>
              </div>
            </div>
            <h1 className="mt-7 max-w-5xl text-balance text-4xl font-bold leading-[1.08] tracking-normal md:text-5xl xl:text-[3.75rem]">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-base leading-8 text-white/78 md:text-lg">
              {copy.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={`/${locale}/careers/admission`} variant="gold">{dict.submitAppeal}</Button>
              <Button href={`/${locale}/psychological-testing`} variant="primary">{dict.reportThreat}</Button>
              <Button href={`/${locale}/register`} variant="ghost">{copy.register}</Button>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <HeroEmblemParallax stats={trustStats} />
          </Reveal>
        </Container>
      </HeroParallaxScope>

      <section className="bg-state-navy py-20 text-white md:py-24">
        <Container>
          <Reveal>
            <div className="mb-7 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-gold">{copy.quickEyebrow}</p>
              <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">{copy.quickTitle}</h2>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-4">
            {quickActions.map((item, index) => (
              <Reveal delay={index * 0.04} key={item.title}>
                <ActionCard icon={item.icon} title={item.title} text={item.text} href={`/${locale}/${item.href}`} dark />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Section eyebrow={copy.activitiesEyebrow} title={dict.activities} className="bg-white">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((item, index) => (
            <Reveal delay={index * 0.035} key={item.slug}>
              <Link href={`/${locale}/activities#${item.slug}`}>
                <PremiumCard className="relative h-full overflow-hidden">
                  <span className="absolute right-5 top-5 text-5xl font-black text-state-teal/20">{String(index + 1).padStart(2, "0")}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-state-teal/10 text-state-tealDark transition-colors group-hover:bg-state-teal group-hover:text-white">
                    <item.icon />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-state-navy">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-state-tealDark">Подробнее <ArrowUpRight className="h-4 w-4" /></span>
                </PremiumCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow={copy.careerEyebrow} title={copy.careerTitle} description={copy.careerDescription} dark>
        <AdmissionJourney locale={locale} />
      </Section>

      <Section eyebrow={copy.psychEyebrow} title={copy.psychTitle} description={copy.psychDescription}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {psychologicalTests.map((item, index) => (
            <Reveal delay={index * 0.05} key={item.slug}>
              <Link href={`/${locale}/psychological-testing/${item.slug}`}>
                <PremiumCard className="h-full bg-gradient-to-br from-white via-white to-state-surface">
                  <item.icon className="h-8 w-8 text-state-teal" />
                  <h3 className="mt-5 text-lg font-bold text-state-navy">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full bg-state-teal/10 px-3 py-1 text-xs font-semibold text-state-tealDark">{item.duration}</span>
                    <Sparkles className="h-4 w-4 text-state-gold" />
                  </div>
                </PremiumCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="paper-grid relative overflow-hidden bg-transparent py-16 text-state-navy">
        <Container className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Badge>{copy.contactBadge}</Badge>
            <h2 className="mt-4 text-3xl font-bold">{copy.contactTitle}</h2>
            <p className="mt-3 max-w-2xl text-slate-600">{copy.contactText}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-state-gold" /> {copy.location}</span>
              <span className="inline-flex items-center gap-2"><UsersRound className="h-4 w-4 text-state-gold" /> {copy.audience}</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-state-gold" /> {copy.sources}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={`/${locale}/contacts`} variant="gold">{copy.contacts}</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
