import { ContactsMap } from "@/components/ContactsMap";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Контакты",
    title: "Телефонный справочник территориальных подразделений",
    description: "Выберите, что ищете: территориальный орган КНБ или подразделение Пограничной службы. Номера телефонов доступны в списке и на карте.",
    contentTitle: "Выбор подразделения"
  },
  kk: {
    eyebrow: "Байланыс",
    title: "Аумақтық бөлімшелердің телефон анықтамалығы",
    description: "Іздейтін бөлімді таңдаңыз: ҰҚК аумақтық органы немесе Шекара қызметінің бөлімшесі. Телефон нөмірлері тізімде және картада қолжетімді.",
    contentTitle: "Бөлімшені таңдау"
  }
};

export default async function ContactsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];

  return (
    <>
      <PageHero badge={t.eyebrow} title={t.title} description={t.description} />
      <section className="bg-white py-20 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold text-state-navy md:text-4xl">{t.contentTitle}</h2>
          <div className="mt-8">
            <ContactsMap locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
