"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";

const ContactsMapLeaflet = dynamic(
  () => import("@/components/ContactsMapLeaflet").then((mod) => mod.ContactsMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/[0.94] p-4 shadow-sm md:p-6">
        <div className="h-[34rem] animate-pulse rounded-[1.1rem] border border-state-teal/15 bg-state-surface" />
      </div>
    )
  }
);

export function ContactsMap({ locale }: { locale: Locale }) {
  return <ContactsMapLeaflet locale={locale} />;
}
