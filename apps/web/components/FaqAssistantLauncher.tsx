"use client";

import dynamic from "next/dynamic";
import { Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const buttonClassName = "fixed bottom-5 right-5 z-[1300] grid h-14 w-14 place-items-center rounded-full bg-state-navy text-white shadow-[0_18px_46px_rgba(6,27,51,0.28)] ring-1 ring-white/20 transition hover:bg-[#0b2b4d] focus-visible:outline-state-gold";
const Assistant = dynamic(() => import("./FaqAssistantWidget").then((module) => module.FaqAssistantWidget), {
  ssr: false,
  loading: () => <span role="status" aria-label="FAQ" className={buttonClassName}><Loader2 className="h-6 w-6 animate-spin" /></span>
});

export function FaqAssistantLauncher({ locale }: { locale: Locale }) {
  const [hasOpened, setHasOpened] = useState(false);
  if (hasOpened) return <Assistant locale={locale} />;

  return (
    <button type="button" onClick={() => setHasOpened(true)} className={buttonClassName} aria-label={locale === "ru" ? "Открыть FAQ-ассистента" : "FAQ-ассистентті ашу"}>
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
