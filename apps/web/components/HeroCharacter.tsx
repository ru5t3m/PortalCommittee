"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import { getMe } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import styles from "./HeroCharacter.module.css";

const HeroCharacterViewer = dynamic(() => import("./HeroCharacterViewer"), { ssr: false });

class ViewerBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function HeroCharacter({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [firstName, setFirstName] = useState("");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const handleReady = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => { setReady(false); setFailed(true); }, []);

  useEffect(() => {
    let active = true;
    let revision = 0;
    const load = async () => {
      const current = ++revision;
      try {
        const profile = await getMe();
        const name = profile.candidate_application?.first_name || profile.user.full_name.trim().split(/\s+/)[0];
        if (active && current === revision) setFirstName(name);
      } catch {
        if (active && current === revision) setFirstName("");
      }
    };
    void load();
    window.addEventListener("knb-auth-changed", load);
    window.addEventListener("storage", load);
    return () => {
      active = false;
      window.removeEventListener("knb-auth-changed", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const name = (firstName || (locale === "ru" ? "Кандидат" : "Үміткер")).toLocaleUpperCase(locale);
  const length = Array.from(name).length;

  return (
    <div className={styles.stage}>
      <div className={styles.controls}>
        {failed && <button type="button" className={styles.retry}
          onClick={() => {
            setReady(false);
            setFailed(false);
            setAttempt((value) => value + 1);
          }}>
          {locale === "ru" ? "Повторить загрузку 3D" : "3D жүктеуді қайталау"}
        </button>}
        <p className={styles.hint} role="status" aria-live="polite">
          {failed ? (locale === "ru" ? "3D недоступно. Можно попробовать ещё раз." : "3D қолжетімсіз. Қайталап көріңіз.")
            : ready ? (locale === "ru" ? "Тяните влево или вправо · стрелки ← →" : "Солға не оңға сүйреңіз · ← →")
              : (locale === "ru" ? "Загружаем персонажа…" : "Кейіпкер жүктелуде…")}
        </p>
        <a className={styles.credit} href="/media/characters/swat-operator-LICENSE.txt" target="_blank" rel="noreferrer">
          3D: Mateusz Woliński · CC BY 4.0
        </a>
      </div>
      <div className={styles.figure}>
        <div className={ready ? styles.hiddenPoster : undefined} aria-hidden="true">
        <Image src="/media/characters/swat-operator-poster-v1.webp" alt="" width={700} height={1050}
          priority sizes="(min-width: 1024px) 768px, (min-width: 640px) 640px, 140vw"
          className={styles.image} draggable={false} />
        <span className={styles.name} style={{ fontSize: `${length > 12 ? 1.2 : length > 8 ? 1.55 : 2.05}cqw` }}>{name}</span>
        </div>
        {!failed && <ViewerBoundary key={attempt} onError={handleError}>
          <HeroCharacterViewer name={name} locale={locale} onReady={handleReady} onError={handleError} />
        </ViewerBoundary>}
      </div>
      {children}
    </div>
  );
}
