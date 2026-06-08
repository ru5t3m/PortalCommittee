import Link from "next/link";
import { ArrowUpRight, GraduationCap, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    eyebrow: "Поступление на учебу",
    title: "Выберите учебное заведение",
    description: "Раздел подготовлен как точка выбора между Академией КНБ и Пограничной академией КНБ. Подробные страницы можно наполнить следующим этапом.",
    contentTitle: "Учебные заведения",
    go: "Перейти",
    academies: [
      { title: "Академия КНБ", text: "Отдельная страница для информации о поступлении, направлениях подготовки и требованиях к кандидатам.", href: "knb-academy", icon: GraduationCap, image: "/education/knb-academy-emblem.png" },
      { title: "Пограничная академия КНБ", text: "Отдельная страница для поступающих на направления, связанные с пограничной службой.", href: "border-academy", icon: Shield }
    ]
  },
  kk: {
    eyebrow: "Оқуға қабылдау",
    title: "Оқу орнын таңдаңыз",
    description: "Бөлім ҰҚК Академиясы мен ҰҚК Шекара академиясы арасындағы таңдау нүктесі ретінде дайындалған. Толық беттерді келесі кезеңде толтыруға болады.",
    contentTitle: "Оқу орындары",
    go: "Өту",
    academies: [
      { title: "ҰҚК Академиясы", text: "Оқуға қабылдау, даярлық бағыттары және кандидаттарға қойылатын талаптар туралы бөлек бет.", href: "knb-academy", icon: GraduationCap, image: "/education/knb-academy-emblem.png" },
      { title: "ҰҚК Шекара академиясы", text: "Шекара қызметімен байланысты бағыттарға түсушілерге арналған бөлек бет.", href: "border-academy", icon: Shield }
    ]
  }
};

export default async function EducationPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  const academies = t.academies as Array<{ title: string; text: string; href: string; icon: LucideIcon; image?: string }>;

  return (
    <>
      <PageHero badge={t.eyebrow} title={t.title} description={t.description} />
      <section className="bg-white py-20 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold text-state-navy md:text-4xl">{t.contentTitle}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {academies.map((academy) => (
              <Link href={`/${locale}/education/${academy.href}`} key={academy.title}>
                <PremiumCard className="h-full">
                  {academy.image ? (
                    <img src={academy.image} alt="" className="h-36 w-36 object-contain sm:h-40 sm:w-40" />
                  ) : (
                    <academy.icon className="h-9 w-9 text-state-teal" />
                  )}
                  <h3 className="mt-5 text-2xl font-bold text-state-navy">{academy.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{academy.text}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-state-tealDark">
                    {t.go} <ArrowUpRight className="h-4 w-4" />
                  </span>
                </PremiumCard>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
