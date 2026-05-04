import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileText, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getActivities } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

const gameUrl = "https://spec-game-pi.vercel.app";

const copy = {
  ru: {
    eyebrow: "Направления деятельности",
    overview: "Обзор",
    title: "Описание направления",
    description: "Раздел содержит публично раскрываемую информацию и контекст деятельности.",
    cardDescription: "Описание",
    threats: "Типовые угрозы",
    threatsText: "Подозрительная активность, попытки доступа к сведениям, противоправная пропаганда или цифровые атаки.",
    recommendations: "Рекомендации",
    recommendationsText: "Изучайте официальные материалы, проверяйте источники и следуйте рекомендациям государственных органов.",
    interactive: "Интерактив",
    gameTitle: "Понять направление через игру",
    gameText: "Интерактивная игра открывается на отдельной странице.",
    play: "Сыграть"
  },
  kk: {
    eyebrow: "Қызмет бағыттары",
    overview: "Шолу",
    title: "Бағыт сипаттамасы",
    description: "Бөлімде ашық жарияланатын ақпарат және қызмет контексті берілген.",
    cardDescription: "Сипаттама",
    threats: "Үлгілік қатерлер",
    threatsText: "Күдікті белсенділік, мәліметтерге қол жеткізу әрекеттері, құқыққа қарсы насихат немесе цифрлық шабуылдар.",
    recommendations: "Ұсынымдар",
    recommendationsText: "Ресми материалдарды оқып, дереккөздерді тексеріңіз және мемлекеттік органдардың ұсынымдарын орындаңыз.",
    interactive: "Интерактив",
    gameTitle: "Бағытты ойын арқылы түсіну",
    gameText: "Интерактивті ойын бөлек бетте ашылады.",
    play: "Ойнау"
  }
};

export default async function ActivityPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const activities = getActivities(locale);
  const activity = activities.find((item) => item.slug === slug);
  if (!activity) notFound();
  const t = copy[locale];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.18),transparent_24rem),radial-gradient(circle_at_80%_40%,rgba(214,168,58,0.18),transparent_22rem)]" />
        <Container className="relative py-20">
          <Reveal>
            <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">{t.eyebrow}</Badge>
            <activity.icon className="mt-8 h-12 w-12 text-white" />
            <h1 className="mt-5 text-balance text-5xl font-bold leading-tight md:text-6xl">{activity.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">{activity.text}</p>
          </Reveal>
        </Container>
      </section>

      <Section eyebrow={t.overview} title={t.title} description={t.description} className="bg-white">
        <div className="grid gap-5 md:grid-cols-3">
          <PremiumCard>
            <FileText className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.cardDescription}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{activity.text}</p>
          </PremiumCard>
          <PremiumCard>
            <AlertTriangle className="h-8 w-8 text-state-gold" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.threats}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.threatsText}</p>
          </PremiumCard>
          <PremiumCard>
            <CheckCircle2 className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.recommendations}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.recommendationsText}</p>
          </PremiumCard>
        </div>
      </Section>
      <Section eyebrow={t.interactive} title={t.gameTitle}>
        <div className="rounded-[2rem] bg-state-navy p-8 text-white shadow-premium">
          <Gamepad2 className="h-10 w-10 text-state-gold" />
          <h2 className="mt-5 text-3xl font-bold">{t.gameTitle}</h2>
          <p className="mt-3 max-w-2xl text-white/70">{t.gameText}</p>
          <a className="mt-6 inline-flex rounded-2xl bg-white/10 px-6 py-3 font-semibold ring-1 ring-white/20 transition hover:bg-white/15" href={gameUrl}>
            {t.play}
          </a>
        </div>
      </Section>
    </>
  );
}
