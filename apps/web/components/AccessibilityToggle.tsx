"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function AccessibilityToggle({ locale }: { locale: Locale }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => {
      let stored = document.documentElement.classList.contains("visually-enhanced");
      try { stored = localStorage.getItem("accessibility-enhanced") === "true"; } catch {}
      setEnabled(stored);
      document.documentElement.classList.toggle("visually-enhanced", stored);
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem("accessibility-enhanced", String(next)); } catch {}
    document.documentElement.classList.toggle("visually-enhanced", next);
  }

  return (
    <button className="rounded-2xl p-2 text-state-navy/75 transition hover:bg-state-teal/10 hover:text-state-tealDark" aria-pressed={enabled} aria-label={locale === "ru" ? "Версия для слабовидящих" : "Нашар көретіндерге арналған нұсқа"} onClick={toggle} type="button">
      <Eye size={20} />
    </button>
  );
}
