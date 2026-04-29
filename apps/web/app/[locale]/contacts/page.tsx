import { Mail, Map, MapPin, Phone } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";

export default function ContactsPage() {
  return (
    <>
      <Section eyebrow="Контакты" title="Официальные каналы связи" description="Центральный аппарат, региональные контакты и карта территориального присутствия." className="bg-white">
        <div className="grid gap-5 md:grid-cols-3">
          <PremiumCard>
            <MapPin className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Центральный аппарат</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Астана, Республика Казахстан. Единый контактный центр: 1400.</p>
          </PremiumCard>
          <PremiumCard>
            <Phone className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Регионы</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Контакты территориальных подразделений публикуются в официальном реестре.</p>
          </PremiumCard>
          <PremiumCard>
            <Map className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Карта</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Интерактивная карта подключается через утвержденный государственный картографический сервис.</p>
          </PremiumCard>
        </div>
      </Section>
      <Section eyebrow="Региональные офисы" title="Территориальные контакты">
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
