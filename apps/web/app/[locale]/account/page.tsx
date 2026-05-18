import { notFound } from "next/navigation";
import { AccountDashboard } from "@/components/AccountDashboard";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <AccountDashboard locale={locale as Locale} />;
}
