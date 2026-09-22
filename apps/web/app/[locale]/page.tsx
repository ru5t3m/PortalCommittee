import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  ListChecks,
  MapPin,
  UsersRound
} from "lucide-react";
import { AdmissionJourney } from "@/components/AdmissionJourney";
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

const activityVisuals = [
  "/media/official/special-unit-winter.jpg",
  "/media/official/drone-system.jpg",
  "/media/official/aviation-field.jpg",
  "/media/official/notebook-pen.jpg",
  "/media/official/special-vehicle-equipment.jpg",
  "/media/official/knb-vest.jpg"
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
    psychDescription: "Познакомьтесь с форматом первичного отбора и проверьте внимательность, логику и умение работать с визуальной информацией.",
    psychStart: "Начать тестирование",
    psychDetails: "Как проходит тест",
    psychTasks: "100 заданий",
    psychTasksText: "Числовые и визуальные задачи",
    psychTime: "60 минут",
    psychTimeText: "Единый таймер прохождения",
    psychFormat: "2 раздела",
    psychFormatText: "Последовательный формат",
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
    psychDescription: "Бастапқы іріктеу форматымен танысып, зейінділікті, логиканы және көрнекі ақпаратпен жұмыс істеу қабілетін тексеріңіз.",
    psychStart: "Тестілеуді бастау",
    psychDetails: "Тест қалай өтеді",
    psychTasks: "100 тапсырма",
    psychTasksText: "Сандық және көрнекі тапсырмалар",
    psychTime: "60 минут",
    psychTimeText: "Бірыңғай өту таймері",
    psychFormat: "2 бөлім",
    psychFormatText: "Бірізді формат",
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
  const currentLocale: Locale = locale === "kk" ? "kk" : "ru";
  const dict = getDictionary(currentLocale);
  const copy = homeCopy[currentLocale];
  const trustStats = currentLocale === "kk" ? trustStatsKk : trustStatsRu;
  const activities = getActivities(currentLocale);
  const psychologicalTests = getPsychologicalTests(currentLocale);
  const quickActions = getQuickActions(currentLocale);

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white text-state-navy">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(0,169,155,0.12),transparent_30rem),radial-gradient(circle_at_88%_16%,rgba(47,111,174,0.10),transparent_28rem)]" />
        <Container className="relative grid min-h-[calc(100vh-76px)] items-center gap-10 py-12 lg:grid-cols-[0.96fr_1.04fr] xl:gap-16">
          <Reveal>
            <div className="flex items-center gap-4">
              <KnbEmblem className="h-20 w-20" />
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-sm font-bold uppercase tracking-[0.22em] text-state-tealDark">{copy.topShort}</span>
                <div className="h-px bg-gradient-to-r from-state-teal/60 via-slate-200 to-transparent" />
                <span className="text-xs font-medium uppercase leading-5 tracking-[0.14em] text-slate-500 sm:text-sm">
                  {copy.topFullLine1}
                  <br />
                  {copy.topFullLine2}
                </span>
              </div>
            </div>
            <h1 className="mt-7 max-w-5xl text-balance text-4xl font-bold leading-[1.06] tracking-[-0.025em] md:text-5xl xl:text-[3.55rem]">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-base leading-8 text-slate-600 md:text-lg">
              {copy.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={`/${currentLocale}/careers/admission`} variant="gold">{dict.submitAppeal}</Button>
              <Button href={`/${currentLocale}/psychological-testing`} variant="primary">{dict.reportThreat}</Button>
              <Button href={`/${currentLocale}/register`} variant="secondary">{copy.register}</Button>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative mx-auto max-w-[44rem] pb-14 sm:pl-10">
              <div className="relative aspect-[4/4.35] overflow-hidden rounded-[2.25rem] bg-slate-100 shadow-[0_30px_90px_rgba(6,27,51,0.16)] sm:aspect-[4/3.55]">
                <Image src="/media/official/honor-guard.jpg" alt="" fill priority className="object-cover object-[58%_center]" sizes="(max-width: 1024px) 100vw, 52vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-state-navy/35 via-transparent to-white/5" />
              </div>
              <div className="absolute -bottom-1 left-0 grid w-[88%] grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white bg-white/95 shadow-[0_18px_55px_rgba(6,27,51,0.14)] backdrop-blur sm:grid-cols-4">
                {trustStats.map(([value, label]) => (
                  <div className="min-h-24 p-4" key={label}>
                    <p className="text-2xl font-bold text-state-navy">{value}</p>
                    <p className="mt-1 text-xs leading-4 text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="border-b border-slate-200 bg-[#f5f8fa] py-10 md:py-12">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-black shadow-[0_24px_70px_rgba(6,27,51,0.14)]">
                <video className="block max-h-[72vh] w-full bg-black object-contain" controls playsInline preload="metadata" poster="/media/official/service-pin.jpg">
                  <source src="/media/video/admission-and-service.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-[#f5f8fa] py-20 text-state-navy md:py-24">
        <Container>
          <Reveal>
            <div className="mb-7 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-tealDark">{copy.quickEyebrow}</p>
              <h2 className="mt-2 text-3xl font-bold text-state-navy md:text-4xl">{copy.quickTitle}</h2>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-4">
            {quickActions.map((item, index) => (
              <Reveal delay={index * 0.04} key={item.title}>
                <ActionCard icon={item.icon} title={item.title} text={item.text} href={`/${currentLocale}/${item.href}`} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Section eyebrow={copy.activitiesEyebrow} title={dict.activities} className="bg-[#f5f8fa]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((item, index) => (
            <Reveal delay={index * 0.035} key={item.slug}>
              <Link href={`/${currentLocale}/activities#${item.slug}`}>
                <PremiumCard className="relative h-full overflow-hidden p-0">
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    <Image src={activityVisuals[index]} alt="" fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-state-navy/30 to-transparent" />
                    <span className="absolute right-5 top-4 text-4xl font-black text-white/80 drop-shadow">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="p-6">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-state-teal/10 text-state-tealDark transition-colors group-hover:bg-state-teal group-hover:text-white">
                      <item.icon />
                    </span>
                    <h3 className="mt-5 text-xl font-bold text-state-navy">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-state-tealDark">Подробнее <ArrowUpRight className="h-4 w-4" /></span>
                  </div>
                </PremiumCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow={copy.careerEyebrow} title={copy.careerTitle} description={copy.careerDescription} dark className="!py-14 md:!py-16">
        <AdmissionJourney locale={currentLocale} />
      </Section>

      <section className="relative overflow-hidden border-y border-slate-200 bg-[#f5f8fa] py-16 text-state-navy md:py-20">
        <div className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-state-teal/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-state-blue/10 blur-3xl" />
        <Container className="relative">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-tealDark">{copy.psychEyebrow}</p>
                <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight md:text-5xl">{copy.psychTitle}</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">{copy.psychDescription}</p>
            </div>
          </Reveal>

          {psychologicalTests.map((item) => (
            <Reveal delay={0.08} key={item.slug}>
              <div className="mt-9 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(6,27,51,0.12)]">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative overflow-hidden bg-state-navy p-7 text-white md:p-10 lg:p-12">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,169,155,0.26),transparent_24rem),radial-gradient(circle_at_100%_100%,rgba(214,168,58,0.16),transparent_22rem)]" />
                    <div className="pointer-events-none absolute inset-0 security-grid opacity-25" />
                    <div className="relative">
                      <div className="flex items-center">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-state-gold text-state-navy shadow-lg shadow-black/20">
                          <item.icon className="h-7 w-7" />
                        </span>
                      </div>
                      <h3 className="mt-8 max-w-xl text-2xl font-bold leading-tight md:text-4xl">{item.title}</h3>
                      <p className="mt-5 max-w-xl text-sm leading-7 text-white/72 md:text-base">{item.text}</p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <Button href={`/${currentLocale}/psychological-testing/${item.slug}`} variant="gold">
                          {copy.psychStart}
                        </Button>
                        <Button href={`/${currentLocale}/psychological-testing`} variant="ghost">
                          {copy.psychDetails}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="relative min-h-[23rem] overflow-hidden bg-slate-100 lg:min-h-0">
                    <Image src="/media/official/emblem-notebook.jpg" alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 48vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-state-navy/55 via-transparent to-transparent" />
                    <div className="absolute inset-x-5 bottom-5 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                      <div className="rounded-2xl border border-white/25 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                        <ListChecks className="h-5 w-5 text-state-tealDark" />
                        <p className="mt-3 text-sm font-bold text-state-navy">{copy.psychTasks}</p>
                        <p className="mt-1 text-[11px] leading-4 text-slate-600">{copy.psychTasksText}</p>
                      </div>
                      <div className="rounded-2xl border border-white/25 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                        <Clock3 className="h-5 w-5 text-state-tealDark" />
                        <p className="mt-3 text-sm font-bold text-state-navy">{copy.psychTime}</p>
                        <p className="mt-1 text-[11px] leading-4 text-slate-600">{copy.psychTimeText}</p>
                      </div>
                      <div className="rounded-2xl border border-white/25 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                        <BadgeCheck className="h-5 w-5 text-state-tealDark" />
                        <p className="mt-3 text-sm font-bold text-state-navy">{copy.psychFormat}</p>
                        <p className="mt-1 text-[11px] leading-4 text-slate-600">{copy.psychFormatText}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#f5f8fa] py-16 text-state-navy">
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
            <Button href={`/${currentLocale}/contacts`} variant="gold">{copy.contacts}</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
