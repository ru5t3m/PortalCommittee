"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/api";
import { authFetch, getMe, logout, type AuthUser } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";

export function GamePortal({ locale }: { locale: Locale }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const user = useRef<AuthUser | null>(null);
  const [session, setSession] = useState<AuthUser | "loading" | "guest" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false;
    let checking = false;
    const checkSession = async () => {
      if (checking) return;
      checking = true;
      try {
        const profile = await getMe();
        if (!disposed) {
          if (user.current?.id !== profile.user.id) setSession(profile.user);
          user.current = profile.user;
        }
      } catch {
        if (!disposed) {
          user.current = null;
          setSession(window.sessionStorage.getItem("knb-access-token") ? "error" : "guest");
        }
      } finally { checking = false; }
    };
    void checkSession();
    const changed = () => {
      if (!window.sessionStorage.getItem("knb-access-token")) {
        user.current = null;
        setSession("guest");
      } else void checkSession();
    };
    const receive = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const message = event.data;
      if (message?.type !== "specgame:request" || typeof message.id !== "string" || message.id.length > 100 ||
          !["session", "load", "action", "logout"].includes(message.method)) return;
      const source = event.source as Window;
      const sessionId = user.current?.id;
      const reply = (value: object) => {
        if (!disposed && sessionId === user.current?.id) source.postMessage({ type: "specgame:response", id: message.id, ...value }, event.origin);
      };
      try {
        if (!user.current) { reply({ error: "Войдите в портал заново", status: 401 }); return; }
        if (message.method === "session") { reply({ result: { user: { id: user.current.id, email: user.current.email } } }); return; }
        if (message.method === "logout") { await logout(); return; }
        const response = await authFetch(`${API_URL}/games/specgame/${message.method === "action" ? "actions" : "progress"}`, message.method === "action" ? {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(message.payload)
        } : { cache: "no-store" });
        if (!response.ok) {
          reply({ error: response.status === 409 ? "Прогресс изменён в другом окне. Обновите страницу." : "Не удалось загрузить или сохранить прогресс. Повторите попытку.", status: response.status });
          if (response.status === 401) { user.current = null; setSession("guest"); }
          return;
        }
        reply({ result: await response.json() });
      } catch { reply({ error: "Нет связи с сервером. Проверьте подключение." }); }
    };
    window.addEventListener("message", receive);
    window.addEventListener("knb-auth-changed", changed);
    return () => {
      disposed = true;
      window.removeEventListener("message", receive);
      window.removeEventListener("knb-auth-changed", changed);
    };
  }, [attempt]);

  if (typeof session === "object") return <iframe key={session.id} ref={frame} src="/game/index.html" title={locale === "kk" ? "Оқу симуляциясы" : "Учебная симуляция"} className="block min-h-[800px] w-full border-0" style={{ height: "calc(100dvh - 77px)" }} />;
  const next = encodeURIComponent(`/${locale}/game`);
  return <section className="flex min-h-[calc(100vh-77px)] flex-col items-center justify-center gap-6 bg-[#06182d] px-6 text-center text-white">
    <h1 className="text-3xl font-bold">{locale === "kk" ? "Оқу симуляциясы" : "Учебная симуляция"}</h1>
    {session === "loading" ? <p role="status">{locale === "kk" ? "Жүктелуде…" : "Загрузка…"}</p> : session === "error" ? <>
      <p role="alert">{locale === "kk" ? "Сервермен байланыс жоқ." : "Не удалось подключиться к серверу."}</p>
      <button className="rounded-xl bg-state-teal px-6 py-3 font-semibold" onClick={() => setAttempt(value => value + 1)}>{locale === "kk" ? "Қайталау" : "Повторить"}</button>
    </> : <>
      <p>{locale === "kk" ? "Прогресті сақтау үшін портал аккаунтына кіріңіз." : "Войдите в аккаунт портала, чтобы играть и сохранять прогресс."}</p>
      <div className="flex gap-4">
        <Link className="rounded-xl bg-state-teal px-6 py-3 font-semibold" href={`/${locale}/login?next=${next}`}>{locale === "kk" ? "Кіру" : "Войти"}</Link>
        <Link className="rounded-xl border border-white/30 px-6 py-3 font-semibold" href={`/${locale}/register?next=${next}`}>{locale === "kk" ? "Тіркелу" : "Регистрация"}</Link>
      </div>
    </>}
  </section>;
}
