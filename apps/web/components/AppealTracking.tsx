"use client";
import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { API_URL, type TrackingResponse } from "@/lib/api";
import { CandidateMessages } from "@/components/CandidateMessages";
import { buttonClass, fieldClass } from "@/components/admin/ListControls";

export function AppealTracking({ locale }: { locale: Locale }) {
  const kk = locale === "kk";
  const [code, setCode] = useState("");
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState(false);
  const labels: Record<string, string> = kk ? { received: "Қабылданды", in_review: "Қаралуда", answered: "Жауап дайындалды", rejected: "Қабылданбады" } : { received: "Получено", in_review: "На рассмотрении", answered: "Ответ подготовлен", rejected: "Отклонено" };
  return <section id="tracking" className="mb-10 rounded-2xl border border-slate-200 bg-state-surface p-5 md:p-8">
    <h2 className="text-2xl font-bold text-state-navy">{kk ? "Өтінім мәртебесін тексеру" : "Проверить статус заявки"}</h2>
    <form className="mt-4 flex flex-wrap gap-3" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setResult(null); setError(""); setMessages(false);
      try { const response = await fetch(`${API_URL}/appeals/${encodeURIComponent(code.trim().toUpperCase())}`, { cache: "no-store" }); if (!response.ok) throw new Error(response.status === 404 ? (kk ? "Өтінім табылмады. Кодты тексеріңіз." : "Заявка не найдена. Проверьте код.") : (kk ? "Мәртебе қолжетімсіз. Кейінірек қайталаңыз." : "Статус временно недоступен. Повторите позже.")); setResult(await response.json()); }
      catch (e) { setError(e instanceof Error ? e.message : (kk ? "Байланыс қатесі" : "Ошибка соединения")); }
      finally { setBusy(false); }
    }}>
      <label className="grid flex-1 gap-2 text-sm font-semibold">{kk ? "Өтінім коды" : "Код заявки"}<input className={fieldClass} required maxLength={40} value={code} onChange={e => setCode(e.target.value)} placeholder="APL-…" autoComplete="off" /></label>
      <button className={`${buttonClass} self-end`} disabled={busy || !code.trim()}>{busy ? (kk ? "Тексерілуде…" : "Проверяем…") : (kk ? "Мәртебені тексеру" : "Проверить статус")}</button>
    </form>
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {result && <div className="mt-4 grid gap-3"><p role="status" className="font-bold">{result.tracking_code}: {labels[result.status] ?? result.status}</p><p className="text-sm">{kk ? "Жеке хабарламалар өтінім иесіне кіргеннен кейін қолжетімді." : "Личные сообщения доступны владельцу заявки после входа."} <Link className="underline" href={`/${locale}/login`}>{kk ? "Кіру" : "Войти"}</Link></p><button type="button" className={`${buttonClass} justify-self-start`} onClick={() => setMessages(true)}>{kk ? "Жауапты оқу" : "Прочитать ответ"}</button>{messages && <CandidateMessages key={result.tracking_code} locale={locale} trackingCode={result.tracking_code} />}</div>}
  </section>;
}
