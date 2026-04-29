import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  MapPin,
  Search,
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
import { NewsCard } from "@/components/ui/NewsCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { activities, news, psychologicalTests, quickActions } from "@/lib/data";
import { getDictionary, type Locale } from "@/lib/i18n";

const trustStats = [
  ["1992", "год образования"],
  ["24/7", "оперативная готовность"],
  ["17", "региональных контуров"],
  ["1400", "контактный центр"]
];

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <>
      <HeroParallaxScope className="min-h-[calc(100vh-76px)] overflow-hidden bg-[#06182d] text-white">
        <div className="security-grid absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,169,155,0.35),transparent_30rem),radial-gradient(circle_at_80%_8%,rgba(248,177,51,0.18),transparent_28rem),linear-gradient(115deg,rgba(6,24,45,0.96),rgba(5,36,55,0.8)_48%,rgba(0,125,115,0.62))]" />
        <div className="absolute left-1/2 top-12 hidden h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-state-gold/15 lg:block" />

        <Container className="relative grid min-h-[calc(100vh-76px)] items-center gap-12 py-14 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <div className="flex items-center gap-4">
              <KnbEmblem className="h-20 w-20" />
              <div className="h-px flex-1 bg-gradient-to-r from-state-gold/70 via-white/25 to-transparent" />
            </div>
            <h1 className="mt-8 max-w-5xl text-balance text-5xl font-bold leading-[1.02] md:text-7xl">Комитет национальной безопасности Республики Казахстан</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76 md:text-xl">Специальный государственный орган, обеспечивающий национальную безопасность, защиту конституционного строя, суверенитета, государственной границы и интересов Республики Казахстан.</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href={`/${locale}/careers/admission`} variant="gold">{dict.submitAppeal}</Button>
              <Button href={`/${locale}/psychological-testing`} variant="primary">{dict.reportThreat}</Button>
              <Button href={`/${locale}/search`} variant="ghost">Поиск по порталу</Button>
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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-gold">Быстрая навигация</p>
              <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Основные разделы портала</h2>
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

      <Section eyebrow="Компетенции" title={dict.activities} description="Каждое направление оформлено как часть единой операционной карты, а не как разрозненный список карточек." className="bg-white">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <Section eyebrow="Карьера" title="Поступление на службу" description="Последовательность отбора вынесена в плотную визуальную линию, чтобы кандидат сразу видел весь маршрут." dark>
        <AdmissionJourney locale={locale} />
      </Section>

      <Section eyebrow="Самопроверка" title="Психологическое тестирование" description="Демо-разделы помогают кандидату оценить базовые навыки до официальных этапов отбора. Результаты не являются официальным заключением.">
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

      <Section eyebrow="Пресс-центр" title={dict.news} description="Официальные сообщения, заявления и полезные материалы для граждан и СМИ." dark>
        <div className="grid gap-6 md:grid-cols-3">
          {news.map((item, index) => (
            <Reveal delay={index * 0.06} key={item.title}>
              <NewsCard {...item} />
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="paper-grid relative overflow-hidden bg-transparent py-16 text-state-navy">
        <Container className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Badge>Контактный центр</Badge>
            <h2 className="mt-4 text-3xl font-bold">Нужна официальная информация?</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Используйте поиск по порталу, документы или региональные контакты, чтобы быстро найти официальную информацию.</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-state-gold" /> Астана, Республика Казахстан</span>
              <span className="inline-flex items-center gap-2"><UsersRound className="h-4 w-4 text-state-gold" /> гражданам и кандидатам</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-state-gold" /> официальные источники</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={`/${locale}/search`} variant="secondary"><Search className="h-4 w-4" /> Найти информацию</Button>
            <Button href={`/${locale}/contacts`} variant="gold">Контакты</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
