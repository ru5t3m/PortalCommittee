import { ExternalLink, FileCheck2, Scale } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/lib/i18n";

const legalActsRu = [
  {
    group: "Законы Республики Казахстан",
    icon: Scale,
    items: [
      { title: "О специальных государственных органах Республики Казахстан", href: "https://adilet.zan.kz/rus/docs/Z1200000552" },
      { title: "Об органах национальной безопасности Республики Казахстан", href: "https://adilet.zan.kz/rus/docs/Z950002710_" },
      { title: "О Государственной границе Республики Казахстан", href: "https://adilet.zan.kz/rus/docs/Z1300000070" },
      { title: "О национальной безопасности Республики Казахстан", href: "https://adilet.zan.kz/rus/docs/Z1200000527" },
      { title: "О контрразведывательной деятельности", href: "https://adilet.zan.kz/rus/docs/Z1600000035" },
      { title: "О противодействии терроризму", href: "https://adilet.zan.kz/rus/docs/Z990000416_" },
      { title: "О противодействии экстремизму", href: "https://adilet.zan.kz/rus/docs/Z050000031_" },
      { title: "О внешней разведке", href: "https://adilet.zan.kz/rus/docs/Z100000277_" }
    ]
  },
  {
    group: "Положения и ведомственные акты",
    icon: FileCheck2,
    items: [
      { title: "Об утверждении Положения о Комитете национальной безопасности Республики Казахстан", href: "https://adilet.zan.kz/rus/docs/U960002922_" },
      { title: "Вопросы Пограничной службы Комитета национальной безопасности Республики Казахстан", href: "https://adilet.zan.kz/rus/docs/U990000282_" },
      { title: "Об утверждении Правил приема на обучение в военные, специальные учебные заведения органов национальной безопасности Республики Казахстан, реализующие образовательные программы высшего образования", href: "https://adilet.zan.kz/rus/docs/V1600013104" }
    ]
  }
];

const legalActsKk = [
  {
    group: "Қазақстан Республикасының заңдары",
    icon: Scale,
    items: [
      { title: "Қазақстан Республикасының арнаулы мемлекеттік органдары туралы", href: "https://adilet.zan.kz/rus/docs/Z1200000552" },
      { title: "Қазақстан Республикасының ұлттық қауіпсіздік органдары туралы", href: "https://adilet.zan.kz/rus/docs/Z950002710_" },
      { title: "Қазақстан Республикасының Мемлекеттік шекарасы туралы", href: "https://adilet.zan.kz/rus/docs/Z1300000070" },
      { title: "Қазақстан Республикасының ұлттық қауіпсіздігі туралы", href: "https://adilet.zan.kz/rus/docs/Z1200000527" },
      { title: "Қарсы барлау қызметі туралы", href: "https://adilet.zan.kz/rus/docs/Z1600000035" },
      { title: "Терроризмге қарсы іс-қимыл туралы", href: "https://adilet.zan.kz/rus/docs/Z990000416_" },
      { title: "Экстремизмге қарсы іс-қимыл туралы", href: "https://adilet.zan.kz/rus/docs/Z050000031_" },
      { title: "Сыртқы барлау туралы", href: "https://adilet.zan.kz/rus/docs/Z100000277_" }
    ]
  },
  {
    group: "Ережелер және ведомстволық актілер",
    icon: FileCheck2,
    items: [
      { title: "Қазақстан Республикасы Ұлттық қауіпсіздік комитеті туралы ережені бекіту туралы", href: "https://adilet.zan.kz/rus/docs/U960002922_" },
      { title: "Қазақстан Республикасы Ұлттық қауіпсіздік комитетінің Шекара қызметі мәселелері", href: "https://adilet.zan.kz/rus/docs/U990000282_" },
      { title: "Ұлттық қауіпсіздік органдарының жоғары білімнің білім беру бағдарламаларын іске асыратын әскери, арнаулы оқу орындарына оқуға қабылдау қағидаларын бекіту туралы", href: "https://adilet.zan.kz/rus/docs/V1600013104" }
    ]
  }
];

const copy = {
  ru: {
    eyebrow: "Документы",
    title: "Нормативные правовые акты",
    description: "Подборка официальных документов по вопросам национальной безопасности, службы и обучения. Ссылки ведут на ИПС «Әділет»."
  },
  kk: {
    eyebrow: "Құжаттар",
    title: "Нормативтік құқықтық актілер",
    description: "Ұлттық қауіпсіздік, қызмет және оқуға қабылдау мәселелері бойынша ресми құжаттар топтамасы. Сілтемелер «Әділет» АҚЖ беттеріне апарады."
  }
};

export default async function DocumentsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  const legalActs = locale === "kk" ? legalActsKk : legalActsRu;
  return (
    <Section
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
      className="bg-white"
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {legalActs.map((section) => (
          <PremiumCard key={section.group} className="h-full">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-state-teal/10 text-state-tealDark">
                <section.icon className="h-6 w-6" />
              </span>
              <div>
                <Badge>ИПС Әділет</Badge>
                <h3 className="mt-3 text-2xl font-bold leading-tight text-state-navy">{section.group}</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {section.items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-state-navy transition hover:-translate-y-0.5 hover:border-state-teal/45 hover:shadow-sm"
                >
                  <span className="text-sm font-semibold leading-6">{item.title}</span>
                  <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-state-gold transition group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </PremiumCard>
        ))}
      </div>
    </Section>
  );
}
