"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/api";
import type { PageData } from "@/lib/admin";
import { buttonClass, Pager } from "@/components/admin/ListControls";

type Message = { id: number; text: string; created_at: string };
export function CandidateMessages({ locale, trackingCode }: { locale: Locale; trackingCode?: string }) {
  const kk = locale === "kk";
  const [data, setData] = useState<PageData<Message>>({ items: [], total: 0, offset: 0, limit: 10 });
  const [offset, setOffset] = useState(0);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setBusy(true); setError("");
      try {
        const path = trackingCode ? `appeals/${encodeURIComponent(trackingCode)}/messages` : "candidate/messages";
        const response = await authFetch(`${API_URL}/${path}?limit=10&offset=${offset}`, { signal: controller.signal });
        if (!response.ok) throw new Error(kk ? "Хабарламалар қолжетімсіз. Өтінім иесінің есептік жазбасымен кіріп, қайталаңыз." : "Сообщения недоступны. Войдите под учётной записью владельца заявки и повторите.");
        const next = await response.json() as PageData<Message>;
        if (!controller.signal.aborted) setData(next);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    };
    void run(); return () => controller.abort();
  }, [trackingCode, offset, retry, kk]);
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">{kk ? "Өтінім бойынша хабарламалар" : "Сообщения по заявке"}</h3><button type="button" className={buttonClass} disabled={busy} onClick={() => setRetry(value => value + 1)}>{kk ? "Жаңарту" : "Обновить сообщения"}</button></div>
    {error ? <p role="alert" className="mt-3 text-red-700">{error}</p> : busy ? <p>{kk ? "Жүктелуде…" : "Загрузка…"}</p> : data.items.length ? data.items.map(item => <article key={item.id} className="mt-3 rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString(kk ? "kk-KZ" : "ru-RU")}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{item.text}</p></article>) : <p className="mt-3 text-sm">{kk ? "Хабарламалар әлі жоқ." : "Сообщений пока нет."}</p>}
    <Pager data={data} locale={locale} onOffset={setOffset} busy={busy || !!error} />
  </section>;
}
