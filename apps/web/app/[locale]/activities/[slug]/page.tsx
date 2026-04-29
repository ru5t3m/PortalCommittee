import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileText, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { activities } from "@/lib/data";

export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = activities.find((item) => item.slug === slug);
  if (!activity) notFound();

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.18),transparent_24rem),radial-gradient(circle_at_80%_40%,rgba(214,168,58,0.18),transparent_22rem)]" />
        <Container className="relative py-20">
          <Reveal>
            <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">Направления деятельности</Badge>
            <activity.icon className="mt-8 h-12 w-12 text-white" />
            <h1 className="mt-5 text-balance text-5xl font-bold leading-tight md:text-6xl">{activity.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">{activity.text}</p>
          </Reveal>
        </Container>
      </section>

      <Section eyebrow="Обзор" title="Угрозы и рекомендации" description="Раздел содержит публично раскрываемую информацию, практические рекомендации и контекст деятельности." className="bg-white">
        <div className="grid gap-5 md:grid-cols-3">
          <PremiumCard>
            <FileText className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Описание</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Информация о задачах направления, доступная для публичного раскрытия.</p>
          </PremiumCard>
          <PremiumCard>
            <AlertTriangle className="h-8 w-8 text-state-gold" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Типовые угрозы</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Подозрительная активность, попытки доступа к сведениям, противоправная пропаганда или цифровые атаки.</p>
          </PremiumCard>
          <PremiumCard>
            <CheckCircle2 className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Рекомендации</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Изучайте официальные материалы, проверяйте источники и следуйте рекомендациям государственных органов.</p>
          </PremiumCard>
        </div>
      </Section>
      <Section eyebrow="Интерактив" title="Понять направление через игру">
        <div className="rounded-[2rem] bg-state-navy p-8 text-white shadow-premium">
          <Gamepad2 className="h-10 w-10 text-state-gold" />
          <h2 className="mt-5 text-3xl font-bold">Мини-игра будет добавлена позже</h2>
          <p className="mt-3 max-w-2xl text-white/70">Кнопка подготовлена под будущий код игры. Сейчас она работает как визуальная заглушка и никуда не ведет.</p>
          <button className="mt-6 inline-flex rounded-2xl bg-white/10 px-6 py-3 font-semibold ring-1 ring-white/20 transition hover:bg-white/15" type="button">
            Сыграть
          </button>
        </div>
      </Section>
    </>
  );
}
