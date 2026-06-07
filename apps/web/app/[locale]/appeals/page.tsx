import { CitizenAppealForm } from "@/components/CitizenAppealForm";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Первичная заявка",
    title: "Хочу к вам на работу или учебу",
    description: "Оставьте контактные данные и кратко укажите интересующее направление. После регистрации система выдаст номер заявки и адрес для отправки резюме.",
    contentTitle: "Форма заявки"
  },
  kk: {
    eyebrow: "Алғашқы өтінім",
    title: "Сіздерге жұмысқа немесе оқуға түскім келеді",
    description: "Байланыс деректерін қалдырып, қызықтыратын бағытты қысқаша көрсетіңіз. Тіркелгеннен кейін жүйе өтінім нөмірін және түйіндеме жіберуге арналған мекенжайды береді.",
    contentTitle: "Өтінім нысаны"
  }
};

export default async function AppealsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];

  return (
    <>
      <PageHero badge={t.eyebrow} title={t.title} description={t.description} />
      <section className="bg-white py-20 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold text-state-navy md:text-4xl">{t.contentTitle}</h2>
          <div className="mt-8">
            <CitizenAppealForm locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
