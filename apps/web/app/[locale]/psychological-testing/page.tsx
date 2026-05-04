import Link from "next/link";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getPsychologicalTests } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    badge: "Самопроверка кандидата",
    title: "Психологическое тестирование",
    description: "Демо-тесты помогают понять сильные стороны: внимание, память, логику и устойчивость к нагрузке. Это не официальный этап отбора и не заменяет профессиональную оценку.",
    sections: "Разделы",
    choose: "Выберите направление самопроверки",
    chooseText: "Каждая страница содержит сценарий прохождения, примеры заданий и рекомендации по подготовке.",
    important: "Важно",
    results: "Как использовать результаты",
    resultTitle: "Результат самопроверки справочный",
    resultText: "Он помогает подготовиться и понять, какие навыки стоит развивать. Официальные психологические тесты проводятся только уполномоченными специалистами в рамках отбора.",
    back: "Вернуться к поступлению"
  },
  kk: {
    badge: "Кандидаттың өзін-өзі тексеруі",
    title: "Психологиялық тестілеу",
    description: "Демо-тесттер зейін, жад, логика және жүктемеге төзімділік сияқты күшті жақтарды түсінуге көмектеседі. Бұл ресми іріктеу кезеңі емес және кәсіби бағалауды алмастырмайды.",
    sections: "Бөлімдер",
    choose: "Өзін-өзі тексеру бағытын таңдаңыз",
    chooseText: "Әр бетте өту сценарийі, тапсырма мысалдары және дайындық бойынша ұсынымдар бар.",
    important: "Маңызды",
    results: "Нәтижелерді қалай пайдалану керек",
    resultTitle: "Өзін-өзі тексеру нәтижесі анықтамалық сипатта",
    resultText: "Ол дайындалуға және қандай дағдыларды дамыту керегін түсінуге көмектеседі. Ресми психологиялық тесттерді іріктеу аясында тек уәкілетті мамандар өткізеді.",
    back: "Қабылдауға оралу"
  }
};

export default async function PsychologicalTestingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  const psychologicalTests = getPsychologicalTests(locale);

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.18),transparent_24rem),radial-gradient(circle_at_75%_65%,rgba(214,168,58,0.18),transparent_24rem)]" />
        <Container className="relative py-24">
          <Reveal>
            <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">{t.badge}</Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-tight md:text-7xl">{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">{t.description}</p>
          </Reveal>
        </Container>
      </section>

      <Section eyebrow={t.sections} title={t.choose} description={t.chooseText} className="bg-white">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {psychologicalTests.map((test) => (
            <Link href={`/${locale}/psychological-testing/${test.slug}`} key={test.slug}>
              <PremiumCard className="h-full">
                <test.icon className="h-9 w-9 text-state-teal" />
                <h3 className="mt-5 text-xl font-bold text-state-navy">{test.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{test.text}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="rounded-full bg-state-teal/10 px-3 py-1 text-xs font-semibold text-state-tealDark">{test.duration}</span>
                  <ArrowUpRight className="h-5 w-5 text-state-teal" />
                </div>
              </PremiumCard>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow={t.important} title={t.results}>
        <PremiumCard className="flex gap-4 border-state-gold/30 bg-state-gold/10">
          <AlertCircle className="h-7 w-7 shrink-0 text-state-gold" />
          <div>
            <h3 className="text-xl font-bold text-state-navy">{t.resultTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{t.resultText}</p>
          </div>
        </PremiumCard>
        <div className="mt-8">
          <Button href={`/${locale}/careers/admission`}>{t.back}</Button>
        </div>
      </Section>
    </>
  );
}
