import { ContactsMap } from "@/components/ContactsMap";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Контакты",
    title: "Карта территориальных контактов",
    description: "Выберите населенный пункт на карте Казахстана, чтобы посмотреть адрес, телефон и электронную почту подразделения."
  },
  kk: {
    eyebrow: "Байланыс",
    title: "Аумақтық байланыстар картасы",
    description: "Бөлімшенің мекенжайын, телефонын және электрондық поштасын көру үшін Қазақстан картасынан елді мекенді таңдаңыз."
  }
};

export default async function ContactsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];

  return (
    <Section eyebrow={t.eyebrow} title={t.title} description={t.description} className="bg-white">
      <ContactsMap locale={locale} />
    </Section>
  );
}
