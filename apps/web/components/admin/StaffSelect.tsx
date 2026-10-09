"use client";
import { useEffect, useState } from "react";
import { adminPage, type Assignee, type PageData } from "@/lib/admin";
import type { Locale } from "@/lib/i18n";
import { fieldClass, buttonClass, Pager } from "./ListControls";

export function StaffSelect({ locale, value, onChange, disabled }: { locale: Locale; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const kk = locale === "kk";
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<PageData<Assignee>>({ items: [], offset: 0, total: 0, limit: 25 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setBusy(true); setError("");
      try { const next = await adminPage<Assignee>("assignees", { q: search, offset }, controller.signal); if (!controller.signal.aborted) setData(next); }
      catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    };
    void run(); return () => controller.abort();
  }, [search, offset]);
  return <div className="grid gap-2 md:col-span-3"><div className="flex gap-2"><input className={fieldClass} disabled={disabled} aria-label={kk ? "Жауаптыны іздеу" : "Поиск ответственного"} maxLength={200} value={query} placeholder={kk ? "Қызметкердің аты немесе email" : "Имя или email сотрудника"} onChange={e => setQuery(e.target.value)} /><button type="button" className={buttonClass} disabled={disabled || busy} onClick={() => { setOffset(0); setSearch(query); }}>{kk ? "Іздеу" : "Найти ответственного"}</button></div>
    <select aria-label={kk ? "Жауапты сүзгісі" : "Фильтр ответственного"} className={fieldClass} value={value} disabled={disabled || busy} onChange={e => onChange(e.target.value)}><option value="">{kk ? "Барлық жауаптылар" : "Все ответственные"}</option>{value && !data.items.some(item => String(item.id) === value) && <option value={value}>{kk ? "Таңдалған қызметкер" : "Выбранный сотрудник"}</option>}{data.items.map(item => <option key={item.id} value={item.id}>{item.full_name}</option>)}</select>
    {error && <p role="alert" className="text-red-700">{error}</p>}{data.total > data.limit && <Pager locale={locale} data={data} busy={busy} onOffset={setOffset} />}
  </div>;
}
