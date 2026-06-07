import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { KnbEmblem } from "@/components/KnbEmblem";
import type { Locale } from "@/lib/i18n";
import { Container } from "@/components/ui/Container";

const copy = {
  ru: {
    short: "КНБ РК",
    text: "Официальный государственный портал. Материалы публикуются в информационных целях и обновляются уполномоченными редакторами.",
    columns: ["О Комитете", "Безопасность", "Служба"],
    main: "Основной раздел",
    psych: "Психотестирование",
    legal: "Нормативная база",
    register: "Регистрация кандидата",
    contacts: "Контакты",
    location: "Астана, Республика Казахстан",
    copyright: "© 2026. Demo portal concept."
  },
  kk: {
    short: "ҚР ҰҚК",
    text: "Ресми мемлекеттік портал. Материалдар ақпараттық мақсатта жарияланады және уәкілетті редакторлармен жаңартылады.",
    columns: ["Комитет туралы", "Қауіпсіздік", "Қызмет"],
    main: "Негізгі бөлім",
    psych: "Психотестілеу",
    legal: "Нормативтік база",
    register: "Кандидатты тіркеу",
    contacts: "Байланыс",
    location: "Астана, Қазақстан Республикасы",
    copyright: "© 2026. Портал тұжырымдамасы."
  }
};

export function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <footer className="relative overflow-hidden bg-[#06182d] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:70px_70px]" />
      <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border border-state-gold/20" />
      <Container className="relative grid gap-10 py-14 md:grid-cols-[1.25fr_0.75fr_0.75fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <KnbEmblem className="h-14 w-14" />
            <p className="text-lg font-semibold">{t.short}</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/70">{t.text}</p>
        </div>
        {t.columns.map((title, index) => (
          <div key={title}>
            <p className="font-semibold">{title}</p>
            <div className="mt-3 grid gap-2 text-sm text-white/70">
              <Link className="hover:text-state-teal" href={`/${locale}/${index === 0 ? "about" : index === 1 ? "activities" : "careers/admission"}`}>{t.main}</Link>
              <Link className="hover:text-state-teal" href={`/${locale}/psychological-testing`}>{t.psych}</Link>
              <Link className="hover:text-state-teal" href={`/${locale}/documents`}>{t.legal}</Link>
              <Link className="hover:text-state-teal" href={`/${locale}/register`}>{t.register}</Link>
            </div>
          </div>
        ))}
        <div>
          <p className="font-semibold">{t.contacts}</p>
          <div className="mt-3 grid gap-3 text-sm text-white/70">
            <span className="flex gap-2"><MapPin className="h-4 w-4 text-state-teal" /> {t.location}</span>
            <span className="flex gap-2"><Phone className="h-4 w-4 text-state-teal" /> 1400</span>
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">{t.copyright}</div>
    </footer>
  );
}
