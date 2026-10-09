"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { adminGet, adminPage, adminWrite, type AdminAppeal, type AdminCandidate, type Assignee, type CaseComment, type CaseHistory, type PageData, type Unit } from "@/lib/admin";
import { buttonClass, cardClass, fieldClass, Pager } from "./ListControls";
import { StaffSelect } from "./StaffSelect";

type Case = AdminAppeal | AdminCandidate;
type Kind = "appeals" | "candidates";
const statuses = { appeals: ["received", "in_review", "answered", "rejected"], candidates: ["draft", "submitted", "in_review", "approved", "rejected"] };
const labels: Record<string, [string, string]> = { received: ["Получено", "Қабылданды"], in_review: ["На рассмотрении", "Қаралуда"], answered: ["Ответ подготовлен", "Жауап дайындалды"], rejected: ["Отклонено", "Қабылданбады"], draft: ["Черновик", "Жоба"], submitted: ["Подано", "Берілді"], approved: ["Одобрено", "Мақұлданды"] };
const statusLabel = (value: string, kk: boolean) => labels[value]?.[kk ? 1 : 0] ?? value;
const title = (row: Case) => "subject" in row ? row.subject : `${row.last_name} ${row.first_name} ${row.middle_name ?? ""}`;
const date = (value: string, kk: boolean) => new Date(value).toLocaleString(kk ? "kk-KZ" : "ru-RU");
const failure = (e: unknown) => e instanceof Error ? e.message : "Не удалось выполнить запрос";

export function CaseWorkspace({ kind, locale, permissions, onChanged }: { kind: Kind; locale: Locale; permissions: string[]; onChanged: () => void }) {
  const kk = locale === "kk";
  const [data, setData] = useState<PageData<Case>>({ items: [], total: 0, limit: 25, offset: 0 });
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ q: "", status: "", organizational_unit_id: "", assigned_to_id: "", unassigned: false });
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [loadedKey, setLoadedKey] = useState("");
  const listKey = JSON.stringify({ kind, filters, offset });
  const canAssign = permissions.includes("cases:assign");
  useEffect(() => {
    const controller = new AbortController();
    if (canAssign) void adminGet<Unit[]>("organizational-units", controller.signal).then(setUnits).catch(e => { if (!controller.signal.aborted) setError(failure(e)); });
    return () => controller.abort();
  }, [canAssign, revision]);
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
    setBusy(true); setError("");
    await adminPage<Case>(kind, { ...filters, offset }, controller.signal).then(next => {
      if (controller.signal.aborted) return;
      if (offset > 0 && next.items.length === 0) { setOffset(Math.max(0, offset - 25)); return; }
      setData(next); setLoadedKey(JSON.stringify({ kind, filters, offset })); setSelected(current => next.items.some(item => item.id === current) ? current : next.items[0]?.id ?? null);
    }).catch(e => { if (!controller.signal.aborted) setError(failure(e)); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    };
    void run();
    return () => controller.abort();
  }, [kind, filters, offset, revision]);
  const row = data.items.find(item => item.id === selected);
  const refresh = () => { setRevision(value => value + 1); onChanged(); };
  return <div className="grid gap-5 lg:grid-cols-2">
    <form className={`${cardClass} grid gap-3 lg:col-span-2 md:grid-cols-3`} onSubmit={e => { e.preventDefault(); setOffset(0); setFilters(current => ({ ...current, q: query.trim() })); }}>
      <input aria-label={kk ? "Іздеу" : "Поиск заявок"} placeholder={kk ? "ТАӘ, email, телефон, код" : "ФИО, email, телефон, код"} className={fieldClass} value={query} maxLength={200} onChange={e => setQuery(e.target.value)} />
      <select aria-label={kk ? "Мәртебе сүзгісі" : "Фильтр статуса"} className={fieldClass} value={filters.status} onChange={e => { setOffset(0); setFilters(current => ({ ...current, status: e.target.value })); }}><option value="">{kk ? "Барлық мәртебелер" : "Все статусы"}</option>{statuses[kind].map(value => <option key={value} value={value}>{statusLabel(value, kk)}</option>)}</select>
      {canAssign && <select aria-label={kk ? "Бөлімше сүзгісі" : "Фильтр подразделения"} className={fieldClass} value={filters.organizational_unit_id} onChange={e => { setOffset(0); setFilters(current => ({ ...current, organizational_unit_id: e.target.value })); }}><option value="">{kk ? "Барлық бөлімшелер" : "Все подразделения"}</option>{units.map(unit => <option key={unit.id} value={unit.id}>{kk ? unit.name_kk : unit.name_ru}</option>)}</select>}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.unassigned} onChange={e => { setOffset(0); setFilters(current => ({ ...current, unassigned: e.target.checked, assigned_to_id: "" })); }} />{kk ? "Жауаптысыз" : "Без ответственного"}</label>
      <StaffSelect locale={locale} value={filters.assigned_to_id} disabled={filters.unassigned} onChange={value => { setOffset(0); setFilters(current => ({ ...current, assigned_to_id: value })); }} />
      <div className="flex items-end gap-2"><button className={buttonClass} disabled={busy}>{kk ? "Іздеу" : "Найти"}</button><button type="button" className={buttonClass} disabled={busy} onClick={() => setRevision(value => value + 1)}>{kk ? "Жаңарту" : "Обновить список"}</button></div>
    </form>
    {error && <p role="alert" className="text-red-700 lg:col-span-2">{error}</p>}
    <section className={cardClass} aria-busy={busy}>
      {busy ? <p>{kk ? "Жүктелуде…" : "Загрузка…"}</p> : error ? null : data.items.length ? data.items.map(item => <button type="button" key={item.id} onClick={() => setSelected(item.id)} className={`block w-full rounded-xl border-b p-4 text-left ${selected === item.id ? "bg-state-teal/10" : "hover:bg-slate-50"}`}><span className="font-bold">{title(item)}</span><span className="mt-1 block text-xs">{item.tracking_code} · {statusLabel(item.status, kk)}</span><span className="block text-xs">{kk ? "Жауапты" : "Ответственный"}: {item.assigned_to_name ?? "—"} · {kk ? "Бөлімше" : "Подразделение"}: {item[kk ? "organizational_unit_name_kk" : "organizational_unit_name_ru"] ?? units.find(unit => unit.id === item.organizational_unit_id)?.[kk ? "name_kk" : "name_ru"] ?? "—"}</span></button>) : <p>{kk ? "Өтінімдер табылмады" : "Заявки не найдены"}</p>}
      <Pager data={data} onOffset={setOffset} busy={busy || !!error} locale={locale} />
    </section>
    {loadedKey === listKey && !error && row ? <CaseDetails key={`${kind}-${row.id}`} row={row} kind={kind} locale={locale} units={units} canAssign={canAssign} onChanged={refresh} /> : <div className={cardClass}>{kk ? "Жазбаны таңдаңыз" : "Выберите запись"}</div>}
  </div>;
}

function CaseDetails({ row, kind, locale, units, canAssign, onChanged }: { row: Case; kind: Kind; locale: Locale; units: Unit[]; canAssign: boolean; onChanged: () => void }) {
  const kk = locale === "kk";
  const [status, setStatus] = useState(row.status);
  const [legacyNote, setLegacyNote] = useState("moderator_comment" in row ? row.moderator_comment ?? "" : "");
  const [unit, setUnit] = useState(String(row.organizational_unit_id ?? ""));
  const [assignee, setAssignee] = useState(String(row.assigned_to_id ?? ""));
  const [staffQuery, setStaffQuery] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [staffOffset, setStaffOffset] = useState(0);
  const [staff, setStaff] = useState<PageData<Assignee>>({ items: [], total: 0, offset: 0, limit: 25 });
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("internal");
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const path = `${kind}/${row.id}`;
  useEffect(() => {
    if (!canAssign) return;
    const controller = new AbortController();
    void adminPage<Assignee>("assignees", { q: staffSearch, offset: staffOffset }, controller.signal).then(setStaff).catch(e => { if (!controller.signal.aborted) setError(failure(e)); });
    return () => controller.abort();
  }, [canAssign, staffSearch, staffOffset]);
  async function write(suffix: string, payload: unknown, method = "PATCH") {
    setBusy(true); setError(""); setSuccess("");
    try { await adminWrite(`${path}/${suffix}`, payload, method); setSuccess(kk ? "Сақталды" : "Сохранено"); setRevision(value => value + 1); onChanged(); return true; }
    catch (e) { setError(failure(e)); return false; }
    finally { setBusy(false); }
  }
  return <section className={`${cardClass} grid content-start gap-5`}><fieldset disabled={busy} className="contents">
    <h3 className="text-xl font-bold">{title(row)}</h3><p className="text-xs">{row.tracking_code} · {date(row.created_at, kk)}</p>
    <div className="grid gap-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm">{"subject" in row ? <><p>{row.full_name}</p><p>{row.email} · {row.phone}</p><p>{row.message}</p></> : <><p>{row.user.email} · {row.phone}</p><p>{row.region} · {row.education_level}</p><p>{row.desired_direction}</p></>}{row.iin && <p>{row.iin}</p>}</div>
    <form className="grid gap-3" onSubmit={e => { e.preventDefault(); void write("status", { status, ...(kind === "candidates" ? { moderator_comment: legacyNote || null } : {}) }); }}>
      <label className="grid gap-2">{kk ? "Мәртебе" : "Статус"}<select className={fieldClass} value={status} onChange={e => setStatus(e.target.value as Case["status"])}>{statuses[kind].map(value => <option key={value} value={value}>{statusLabel(value, kk)}</option>)}</select></label>
      {kind === "candidates" && <label className="grid gap-2 text-sm">{kk ? "Қызметтік ескертпе (кандидатқа көрінбейді)" : "Служебное примечание (кандидату не видно)"}<textarea className={fieldClass} rows={3} maxLength={4000} value={legacyNote} onChange={e => setLegacyNote(e.target.value)} /></label>}
      <button className={buttonClass} disabled={busy}>{kk ? "Мәртебені сақтау" : "Сохранить статус"}</button>
    </form>
    {canAssign && <form className="grid gap-3 border-t pt-4" onSubmit={e => { e.preventDefault(); void write("assignment", { organizational_unit_id: unit ? Number(unit) : null, assigned_to_id: assignee ? Number(assignee) : null }); }}>
      <label className="grid gap-2">{kk ? "Бөлімше" : "Подразделение"}<select className={fieldClass} value={unit} onChange={e => { setUnit(e.target.value); setAssignee(""); }}><option value="">{kk ? "Тағайындалмаған" : "Не назначено"}</option>{units.map(item => <option key={item.id} value={item.id}>{kk ? item.name_kk : item.name_ru}</option>)}</select></label>
      <label className="grid gap-2">{kk ? "Қызметкерді іздеу" : "Поиск сотрудника"}<input className={fieldClass} maxLength={200} value={staffQuery} onChange={e => setStaffQuery(e.target.value)} /></label>
      <button type="button" className={buttonClass} onClick={() => { setStaffOffset(0); setStaffSearch(staffQuery); }}>{kk ? "Іздеу" : "Найти сотрудника"}</button>
      <label className="grid gap-2">{kk ? "Жауапты" : "Ответственный"}<select className={fieldClass} value={assignee} onChange={e => setAssignee(e.target.value)}><option value="">{kk ? "Тағайындалмаған" : "Не назначен"}</option>{assignee && !staff.items.some(item => String(item.id) === assignee) && <option value={assignee}>{row.assigned_to_name ?? (kk ? "Таңдалған қызметкер" : "Выбранный сотрудник")}</option>}{staff.items.map(item => <option key={item.id} value={item.id} disabled={item.staff_scope === "territorial" && String(item.organizational_unit_id) !== unit}>{item.full_name}</option>)}</select></label>
      <Pager data={staff} onOffset={setStaffOffset} locale={locale} busy={busy} />
      <button className={buttonClass} disabled={busy}>{kk ? "Жауаптыны сақтау" : "Сохранить назначение"}</button>
    </form>}
    <form className="grid gap-3 border-t pt-4" onSubmit={e => { e.preventDefault(); void write("comments", { visibility, text }, "POST").then(saved => { if (saved) setText(""); }); }}>
      <label className="grid gap-2">{kk ? "Жаңа түсіндірме" : "Новый комментарий"}<textarea className={fieldClass} required maxLength={4000} rows={4} value={text} onChange={e => setText(e.target.value)} /></label>
      <label className="grid gap-2">{kk ? "Кімге көрінеді" : "Кому видно"}<select className={fieldClass} value={visibility} onChange={e => setVisibility(e.target.value)}><option value="internal">{kk ? "Тек қызметкерлерге" : "Только сотрудникам"}</option><option value="candidate">{kk ? "Кандидатқа хабарлама" : "Сообщение кандидату"}</option></select></label>
      <button className={buttonClass} disabled={busy || !text.trim()}>{kk ? "Түсіндірме қосу" : "Добавить комментарий"}</button>
    </form>
    {error && <p role="alert" className="text-red-700">{error}</p>}{success && <p role="status" className="text-state-tealDark">{success}</p>}
    <CaseTimeline key={`comments-${revision}`} path={`${path}/comments`} locale={locale} history={false} />
    <CaseTimeline key={`history-${revision}`} path={`${path}/history`} locale={locale} history />
  </fieldset></section>;
}

function CaseTimeline({ path, locale, history }: { path: string; locale: Locale; history: boolean }) {
  const kk = locale === "kk";
  const [data, setData] = useState<PageData<CaseComment | CaseHistory>>({ items: [], offset: 0, total: 0, limit: 10 });
  const [offset, setOffset] = useState(0);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
    setBusy(true); setError("");
    await adminPage<CaseComment | CaseHistory>(path, { offset, limit: 10 }, controller.signal).then(setData).catch(e => { if (!controller.signal.aborted) setError(failure(e)); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    };
    void run();
    return () => controller.abort();
  }, [path, offset, retry]);
  return <div className="border-t pt-4"><h4 className="font-bold">{history ? (kk ? "Өңдеу тарихы" : "История обработки") : (kk ? "Түсіндірмелер" : "Комментарии")}</h4>
    {error ? <p role="alert">{error}<button className={buttonClass} onClick={() => setRetry(value => value + 1)}>{kk ? "Қайталау" : "Повторить"}</button></p> : busy ? <p>{kk ? "Жүктелуде…" : "Загрузка…"}</p> : data.items.map(item => <article key={item.id} className="mt-3 rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{("author_name" in item ? item.author_name : item.actor_name) ?? (kk ? "Белгісіз қызметкер" : "Сотрудник не указан")} · {date(item.created_at, kk)}</p>{"text" in item ? <><p className="text-xs font-bold">{item.visibility === "internal" ? (kk ? "Қызметтік" : "Служебная заметка") : (kk ? "Кандидатқа" : "Сообщение кандидату")}</p><p className="mt-2 whitespace-pre-wrap break-words">{item.text}</p></> : <HistoryDetails item={item} kk={kk} />}</article>)}
    <Pager data={data} onOffset={setOffset} busy={busy || !!error} locale={locale} />
  </div>;
}

function HistoryDetails({ item, kk }: { item: CaseHistory; kk: boolean }) {
  const names: Record<string, string> = { update_status: kk ? "Мәртебе өзгертілді" : "Изменён статус", assign: kk ? "Тағайындау өзгертілді" : "Изменено назначение", comment: kk ? "Түсіндірме қосылды" : "Добавлен комментарий" };
  const fields: Record<string, string> = { status: kk ? "Мәртебе" : "Статус", moderator_comment: kk ? "Қызметтік ескертпе" : "Служебное примечание", organizational_unit_id: kk ? "Бөлімше ID" : "ID подразделения", assigned_to_id: kk ? "Жауаптының ID" : "ID ответственного", visibility: kk ? "Көріну" : "Видимость", comment_id: kk ? "Түсіндірме ID" : "ID комментария" };
  const value = (v: unknown) => v == null ? "—" : statusLabel(String(v), kk);
  return <><p>{names[item.action] ?? item.action}</p>{item.details ? Object.entries(item.details).map(([key, change]) => <p key={key} className="whitespace-pre-wrap break-words">{fields[key] ?? key}: {typeof change === "object" && change !== null && "before" in change && "after" in change ? `${value(change.before)} → ${value(change.after)}` : value(change)}</p>) : <p className="text-xs">{kk ? "Ескі жазба: өзгеріс мәндері сақталмаған" : "Старая запись: значения изменений не сохранялись"}</p>}</>;
}
