import { notFound } from "next/navigation";
import { AuthPage } from "@/components/AuthPage";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <AuthPage locale={locale as Locale} mode="login" />;
}
