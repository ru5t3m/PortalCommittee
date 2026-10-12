import { notFound } from "next/navigation";
import "../globals.css";
import type { Metadata } from "next";
import { Document } from "@/components/Document";
import { Footer } from "@/components/Footer";
import { FaqAssistantLauncher } from "@/components/FaqAssistantLauncher";
import { Header } from "@/components/Header";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ru" ? {
    title: "КНБ РК | Официальный портал",
    description: "Информационный портал по вопросам национальной безопасности Республики Казахстан"
  } : {
    title: "ҚР ҰҚК | Ресми портал",
    description: "Қазақстан Республикасының ұлттық қауіпсіздігі мәселелері бойынша ақпараттық портал"
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return (
    <Document lang={locale}>
      <a href="#main-content" className="skip-link">{locale === "ru" ? "Перейти к основному содержимому" : "Негізгі мазмұнға өту"}</a>
      <Header locale={locale as Locale} dict={{ shortBrand: dict.shortBrand }} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer locale={locale as Locale} />
      <FaqAssistantLauncher locale={locale as Locale} />
    </Document>
  );
}
