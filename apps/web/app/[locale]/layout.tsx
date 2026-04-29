import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return (
    <>
      <Header locale={locale as Locale} dict={dict} />
      <main>{children}</main>
      <Footer locale={locale as Locale} />
    </>
  );
}
