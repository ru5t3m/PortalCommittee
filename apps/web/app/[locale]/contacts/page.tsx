import { Mail, Map, MapPin, Phone } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Контакты",
    title: "Официальные каналы связи",
    description: "Центральный аппарат, региональные контакты и карта территориального присутствия.",
    central: "Центральный аппарат",
    centralText: "Астана, Республика Казахстан. Единый контактный центр: 1400.",
    regions: "Регионы",
    regionsText: "Контакты территориальных подразделений публикуются в официальном реестре.",
    map: "Карта",
    mapText: "Интерактивная карта подключается через утвержденный государственный картографический сервис.",
    regionalEyebrow: "Региональные офисы",
    regionalTitle: "Территориальные контакты"
  },
  kk: {
    eyebrow: "Байланыс",
    title: "Ресми байланыс арналары",
    description: "Орталық аппарат, өңірлік байланыстар және аумақтық қатысу картасы.",
    central: "Орталық аппарат",
    centralText: "Астана, Қазақстан Республикасы. Бірыңғай байланыс орталығы: 1400.",
    regions: "Өңірлер",
    regionsText: "Аумақтық бөлімшелердің байланыстары ресми тізілімде жарияланады.",
    map: "Карта",
    mapText: "Интерактивті карта бекітілген мемлекеттік картографиялық сервис арқылы қосылады.",
    regionalEyebrow: "Өңірлік кеңселер",
    regionalTitle: "Аумақтық байланыстар"
  }
};

export default async function ContactsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  return (
    <>
      <Section eyebrow={t.eyebrow} title={t.title} description={t.description} className="bg-white">
        <div className="grid gap-5 md:grid-cols-3">
          <PremiumCard>
            <MapPin className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.central}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.centralText}</p>
          </PremiumCard>
          <PremiumCard>
            <Phone className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.regions}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.regionsText}</p>
          </PremiumCard>
          <PremiumCard>
            <Map className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.map}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.mapText}</p>
          </PremiumCard>
        </div>
      </Section>
      <Section eyebrow={t.regionalEyebrow} title={t.regionalTitle}>
        <div className="grid gap-5 md:grid-cols-2">
          {[["Астана", "пр. Мәңгілік Ел, 10", "+7 7172 000 000", "astana@example.gov.kz"], ["Алматы", "ул. Байзакова, 100", "+7 727 000 000", "almaty@example.gov.kz"]].map(([region, address, phone, email]) => (
            <PremiumCard key={region}>
              <h3 className="text-2xl font-bold text-state-navy">{region}</h3>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <span className="flex gap-2"><MapPin className="h-4 w-4 text-state-teal" /> {address}</span>
                <span className="flex gap-2"><Phone className="h-4 w-4 text-state-teal" /> {phone}</span>
                <span className="flex gap-2"><Mail className="h-4 w-4 text-state-teal" /> {email}</span>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Section>
    </>
  );
}
