"use client";

import { useEffect, useRef, type PointerEvent, type KeyboardEvent } from "react";
import { createHeroScene } from "./hero-character-scene";
import type { Locale } from "@/lib/i18n";
import styles from "./HeroCharacter.module.css";

export default function HeroCharacterViewer({ name, locale, onReady, onError }: {
  name: string; locale: Locale; onReady: () => void; onError: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<Awaited<ReturnType<typeof createHeroScene>> | null>(null);
  const currentName = useRef(name);
  const drag = useRef<{ id: number; x: number; y: number; rotating: boolean } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let readyFrame = 0;
    const timeout = window.setTimeout(() => { controller.abort(); onError(); }, 120000);
    void createHeroScene(host.current!, controller.signal, onError).then((created) => {
      if (controller.signal.aborted) { created.dispose(); return; }
      scene.current = created;
      window.clearTimeout(timeout);
      created.setName(currentName.current);
      readyFrame = requestAnimationFrame(() => { if (!controller.signal.aborted) onReady(); });
    }).catch(() => { if (!controller.signal.aborted) onError(); });
    return () => { window.clearTimeout(timeout); cancelAnimationFrame(readyFrame); controller.abort(); scene.current?.dispose(); scene.current = null; };
  }, [onReady, onError]);

  useEffect(() => { currentName.current = name; scene.current?.setName(name); }, [name]);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || event.pointerId !== active.id) return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    if (!active.rotating) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag.current = null; return; }
      if (Math.abs(dx) < 4) return;
      active.rotating = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    scene.current?.rotate(dx * 0.012);
    active.x = event.clientX;
    active.y = event.clientY;
  };
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      scene.current?.rotate(event.key === "ArrowLeft" ? -Math.PI / 12 : Math.PI / 12);
    } else if (event.key === "Home") { event.preventDefault(); scene.current?.reset(); }
  };
  return <div ref={host} className={styles.viewer} tabIndex={0} role="group"
    aria-label={locale === "ru" ? "3D-персонаж. Вращайте перетаскиванием или стрелками влево и вправо. Home — исходный ракурс." : "3D-кейіпкер. Сүйреп немесе сол және оң көрсеткілермен айналдырыңыз. Home — бастапқы көрініс."}
    onKeyDown={keyDown}
    onPointerDown={(event) => {
      if (!scene.current || !event.isPrimary || event.button !== 0) return;
      event.currentTarget.focus({ preventScroll: true });
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, rotating: false };
    }}
    onPointerMove={move}
    onPointerUp={() => { drag.current = null; }}
    onPointerCancel={() => { drag.current = null; }}
    onLostPointerCapture={() => { drag.current = null; }} />;
}
