import { Camera, FileText } from "lucide-react";
import { NewsCard } from "@/components/ui/NewsCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";
import { getNews } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Пресс-центр",
    title: "Новости, заявления и материалы для СМИ",
    description: "Официальная коммуникация, публикации и порядок аккредитации представителей средств массовой информации.",
    mediaEyebrow: "СМИ",
    mediaTitle: "Медиа и аккредитация",
    media: "Медиа",
    mediaText: "Фотографии, видеофрагменты и материалы для публикации предоставляются через официальный пресс-контур.",
    accreditation: "Аккредитация СМИ",
    accreditationText: "Заявки рассматриваются по установленным правилам с учетом целей мероприятия и требований безопасности."
  },
  kk: {
    eyebrow: "Баспасөз орталығы",
    title: "Жаңалықтар, мәлімдемелер және БАҚ материалдары",
    description: "Ресми коммуникация, жарияланымдар және бұқаралық ақпарат құралдары өкілдерін аккредиттеу тәртібі.",
    mediaEyebrow: "БАҚ",
    mediaTitle: "Медиа және аккредитация",
    media: "Медиа",
    mediaText: "Фотосуреттер, бейнеүзінділер және жариялауға арналған материалдар ресми баспасөз контуры арқылы беріледі.",
    accreditation: "БАҚ аккредитациясы",
    accreditationText: "Өтінімдер іс-шара мақсаттары мен қауіпсіздік талаптарын ескере отырып, белгіленген қағидалар бойынша қаралады."
  }
};

export default async function PressPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  const news = getNews(locale);
  return (
    <>
      <Section eyebrow={t.eyebrow} title={t.title} description={t.description} className="bg-white">
        <div className="grid gap-6 md:grid-cols-3">
          {news.map((item) => <NewsCard key={item.title} {...item} />)}
        </div>
      </Section>
      <Section eyebrow={t.mediaEyebrow} title={t.mediaTitle}>
        <div className="grid gap-5 md:grid-cols-2">
          <PremiumCard>
            <Camera className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.media}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.mediaText}</p>
          </PremiumCard>
          <PremiumCard>
            <FileText className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{t.accreditation}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.accreditationText}</p>
          </PremiumCard>
        </div>
      </Section>
    </>
  );
}
