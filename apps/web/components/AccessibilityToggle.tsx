"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export function AccessibilityToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("accessibility-enhanced") === "true";
    setEnabled(stored);
    document.body.classList.toggle("visually-enhanced", stored);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("accessibility-enhanced", String(next));
    document.body.classList.toggle("visually-enhanced", next);
  }

  return (
    <button className="rounded-2xl p-2 text-state-navy/75 transition hover:bg-state-teal/10 hover:text-state-tealDark" aria-pressed={enabled} aria-label="Accessibility mode" onClick={toggle} type="button">
      <Eye size={20} />
    </button>
  );
}
