"use client";
import type { Locale } from "@/lib/i18n";
import type { PageData } from "@/lib/admin";

export const fieldClass = "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-state-navy";
export const buttonClass = "rounded-xl bg-state-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50";
export const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export function Pager({ data, onOffset, busy, locale }: { data: Pick<PageData<unknown>, "offset" | "total" | "limit">; onOffset: (offset: number) => void; busy?: boolean; locale: Locale }) {
  const kk = locale === "kk";
  return <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
    <span aria-live="polite">{data.total ? `${data.offset + 1}–${Math.min(data.offset + data.limit, data.total)} / ${data.total}` : (kk ? "Жазбалар жоқ" : "Записей нет")}</span>
    <div className="flex gap-2">
      <button type="button" className={buttonClass} disabled={busy || data.offset === 0} onClick={() => onOffset(Math.max(0, data.offset - data.limit))}>{kk ? "Артқа" : "Назад"}</button>
      <button type="button" className={buttonClass} disabled={busy || data.offset + data.limit >= data.total} onClick={() => onOffset(data.offset + data.limit)}>{kk ? "Әрі қарай" : "Далее"}</button>
    </div>
  </div>;
}
