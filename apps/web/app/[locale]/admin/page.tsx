import { AdminPanel } from "@/components/AdminPanel";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Admin panel",
    title: "Модерация обращений и кандидатов",
    description: "Рабочая панель для ролей Admin и Moderator. Доступ выполняется через реальную backend-сессию.",
    contentTitle: "Операционная область"
  },
  kk: {
    eyebrow: "Admin panel",
    title: "Өтініштер мен кандидаттарды модерациялау",
    description: "Admin және Moderator рөлдеріне арналған жұмыс панелі. Кіру нақты backend сессиясы арқылы орындалады.",
    contentTitle: "Операциялық аймақ"
  }
};

export default async function AdminPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];

  return (
    <>
      <PageHero badge={t.eyebrow} title={t.title} description={t.description} />
      <section className="bg-white py-20 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold text-state-navy md:text-4xl">{t.contentTitle}</h2>
          <div className="mt-8">
            <AdminPanel locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
