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
import { admissionFaq, admissionSteps } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

export default async function AdmissionPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  const candidate: Array<{ title: string; text: string; icon: LucideIcon }> = [
    { title: "Гражданство РК", text: "Кандидат должен быть гражданином Республики Казахстан.", icon: ShieldCheck },
    { title: "Возраст", text: "Возрастные требования зависят от должности и формы службы.", icon: UserCheck },
    { title: "Образование", text: "Среднее специальное или высшее образование по профилю вакансии.", icon: Award },
    { title: "Здоровье", text: "Соответствие медицинским требованиям к службе.", icon: HeartPulse },
    { title: "Репутация", text: "Законопослушность, устойчивые моральные качества и дисциплина.", icon: BadgeCheck }
  ];

  const requirements = ["Образование", "Физподготовка", "Психологическое тестирование", "Полиграф", "Отсутствие судимости", "Специальная проверка"];
  const documents = ["Удостоверение личности", "Диплом", "Автобиография", "Фото", "Анкета кандидата"];
  const refusals = ["Недостоверные данные", "Несоответствие по здоровью", "Невыполнение квалификационных требований"];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_25rem),radial-gradient(circle_at_80%_60%,rgba(214,168,58,0.22),transparent_24rem)]" />
        <Container className="relative grid gap-10 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <Reveal>
            <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">Вакансии и служба</Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-tight md:text-7xl">Поступление на службу</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">Понятный маршрут кандидата: от первичной заявки до решения комиссии. Страница снижает барьер входа и помогает заранее подготовить документы.</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href={`/${locale}/psychological-testing`}>Проверить способности</Button>
              <Button href="#timeline" variant="ghost">Посмотреть этапы</Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass rounded-[2rem] p-6 text-state-navy shadow-premium">
              <div className="grid gap-4 sm:grid-cols-2">
                {["Прозрачный процесс", "Единые требования", "Проверка документов", "Поддержка кандидата"].map((item) => (
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

      <Section eyebrow="Кандидаты" title="Кто может поступить" description="Базовые критерии помогают кандидатам заранее оценить готовность к службе." className="bg-white">
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

      <Section eyebrow="Требования" title="Что оценивается при отборе" description="Проверки проводятся в рамках законодательства Республики Казахстан и внутренних регламентов.">
        <div className="grid gap-5 md:grid-cols-3">
          {requirements.map((title) => (
            <PremiumCard key={title} className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-state-teal/10 text-state-tealDark">
                <BadgeCheck />
              </span>
              <div>
                <h3 className="font-bold text-state-navy">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Критерий проверяется уполномоченными специалистами на соответствующем этапе.</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Section>

      <section id="timeline">
        <Section eyebrow="Процесс" title="Этапы отбора" description="На desktop timeline расположен горизонтально, на мобильных устройствах перестраивается в вертикальный маршрут." className="bg-white">
          <Timeline steps={admissionSteps} activeIndex={0} />
        </Section>
      </section>

      <Section eyebrow="Пакет кандидата" title="Документы">
        <div className="grid gap-5 md:grid-cols-5">
          {documents.map((title) => (
            <PremiumCard key={title} className="text-center">
              <FileText className="mx-auto h-8 w-8 text-state-teal" />
              <h3 className="mt-5 font-bold text-state-navy">{title}</h3>
            </PremiumCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="Ограничения" title="Причины отказа" className="bg-white">
        <div className="grid gap-5 md:grid-cols-3">
          {refusals.map((title) => (
            <PremiumCard key={title} className="border-red-100 bg-red-50/60">
              <Ban className="h-8 w-8 text-red-600" />
              <h3 className="mt-5 font-bold text-state-navy">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Решение принимается комиссией с учетом требований службы и результатов проверки.</p>
            </PremiumCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="Ответы" title="FAQ">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <PremiumCard className="bg-state-navy text-white">
            <ShieldCheck className="h-10 w-10 text-state-teal" />
            <h3 className="mt-5 text-2xl font-bold">Подготовьтесь заранее</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">Соберите документы, проверьте актуальность контактных данных и внимательно заполните анкету кандидата.</p>
            <Button href={`/${locale}/psychological-testing`} className="mt-6">Пройти самопроверку</Button>
          </PremiumCard>
          <FAQAccordion items={admissionFaq} />
        </div>
      </Section>
    </>
  );
}
