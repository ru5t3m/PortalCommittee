import { GamePortal } from "@/components/GamePortal";
import type { Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <GamePortal locale={locale} />;
}
