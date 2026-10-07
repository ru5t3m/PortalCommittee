import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { FaqAssistantLauncher } from "@/components/FaqAssistantLauncher";
import { Header } from "@/components/Header";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return (
    <>
      <Header locale={locale as Locale} dict={{ shortBrand: dict.shortBrand }} />
      <main>{children}</main>
      <Footer locale={locale as Locale} />
      <FaqAssistantLauncher locale={locale as Locale} />
    </>
  );
}
