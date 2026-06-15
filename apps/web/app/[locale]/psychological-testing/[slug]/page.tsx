import { notFound } from "next/navigation";
import { PsychologicalTestRunner } from "@/components/PsychologicalTestRunner";
import type { Locale } from "@/lib/i18n";

export default async function PsychologicalTestPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  if (slug !== "primary-selection") {
    notFound();
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: "body > header, body > footer { display: none !important; }"
        }}
      />
      <PsychologicalTestRunner locale={locale} slug={slug} />
    </>
  );
}
