"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { adminGet, adminPage, adminWrite, type PageData, type StaffUser, type Unit } from "@/lib/admin";
import { buttonClass, cardClass, fieldClass, Pager } from "./ListControls";

export function StaffManager({ locale, actorId }: { locale: Locale; actorId: number }) {
  const kk = locale === "kk";
  const [units, setUnits] = useState<Unit[]>([]);
  const [data, setData] = useState<PageData<StaffUser>>({ items: [], total: 0, limit: 25, offset: 0 });
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
    setBusy(true); setError("");
    await Promise.all([adminGet<Unit[]>("organizational-units", controller.signal), adminPage<StaffUser>("users", { q: search, role, offset }, controller.signal)]).then(([nextUnits, next]) => {
      if (controller.signal.aborted) return;
      setUnits(nextUnits); setData(next); setSelected(current => next.items.some(item => item.id === current) ? current : next.items[0]?.id ?? null);
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Ошибка загрузки"); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    };
    void run();
    return () => controller.abort();
  }, [search, role, offset, revision]);
  const user = data.items.find(item => item.id === selected);
  return <div className="grid gap-5 lg:grid-cols-2">
    <section className={cardClass}>
      <h3 className="text-xl font-bold">{kk ? "Қызметкерлер және пайдаланушылар" : "Сотрудники и пользователи"}</h3>
      <p className="my-3 text-sm">{kk ? "Қызметкер алдымен порталда email және парольмен тіркеледі. Содан кейін оған құқықтар тағайындалады." : "Сотрудник сначала регистрируется на портале с email и паролем. Затем ему назначаются права."}</p>
      <form className="grid gap-3" onSubmit={e => { e.preventDefault(); setOffset(0); setSearch(query.trim()); }}>
        <input className={fieldClass} aria-label={kk ? "Пайдаланушыны іздеу" : "Поиск пользователя"} maxLength={200} placeholder="Email / ФИО" value={query} onChange={e => setQuery(e.target.value)} />
        <select className={fieldClass} aria-label={kk ? "Рөл сүзгісі" : "Фильтр роли"} value={role} onChange={e => { setOffset(0); setRole(e.target.value); }}><option value="">{kk ? "Барлық рөлдер" : "Все роли"}</option><option value="admin">{kk ? "Әкімші" : "Администратор"}</option><option value="moderator">{kk ? "Қызметкер" : "Сотрудник"}</option><option value="candidate">{kk ? "Кандидат" : "Кандидат"}</option></select>
        <button className={buttonClass} disabled={busy}>{kk ? "Іздеу" : "Найти пользователя"}</button>
      </form>
      {error && <p role="alert" className="my-3 text-red-700">{error}<button className={buttonClass} onClick={() => setRevision(value => value + 1)}>{kk ? "Қайталау" : "Повторить"}</button></p>}
      {busy ? <p>{kk ? "Жүктелуде…" : "Загрузка…"}</p> : data.items.map(item => <button type="button" key={item.id} onClick={() => setSelected(item.id)} className={`mt-2 block w-full rounded-xl p-3 text-left text-sm ${item.id === selected ? "bg-state-teal/10" : "bg-slate-50"}`}><strong>{item.full_name}</strong><span className="block">{item.email} · ID {item.id}</span><span>{item.role} {item.staff_scope} {item.is_blocked ? (kk ? "· Бұғатталған" : "· Заблокирован") : ""}</span></button>)}
      <Pager data={data} locale={locale} onOffset={setOffset} busy={busy || !!error} />
    </section>
    {user && !busy && !error && <AccessEditor key={`${user.id}-${revision}`} user={user} units={units} own={user.id === actorId} locale={locale} onSaved={() => setRevision(value => value + 1)} />}
    <UnitManager units={units} locale={locale} onSaved={() => setRevision(value => value + 1)} />
  </div>;
}

function AccessEditor({ user, units, own, locale, onSaved }: { user: StaffUser; units: Unit[]; own: boolean; locale: Locale; onSaved: () => void }) {
  const kk = locale === "kk";
  const [role, setRole] = useState(user.role);
  const [scope, setScope] = useState(user.staff_scope ?? "central");
  const [unit, setUnit] = useState(String(user.organizational_unit_id ?? ""));
  const [active, setActive] = useState(user.is_active);
  const [blocked, setBlocked] = useState(user.is_blocked);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <form className={`${cardClass} grid content-start gap-4`} onSubmit={e => {
    e.preventDefault(); setBusy(true); setError("");
    void adminWrite(`users/${user.id}/access`, { role, staff_scope: role === "moderator" ? scope : null, organizational_unit_id: role === "moderator" && scope === "territorial" ? Number(unit) : null, is_active: active, is_blocked: blocked }).then(onSaved).catch(e => setError(e instanceof Error ? e.message : "Ошибка сохранения")).finally(() => setBusy(false));
  }}>
    <h3 className="text-xl font-bold">{user.full_name}</h3>
    <p className="text-sm">{kk ? "Құқықтар өзгергенде пайдаланушының барлық сессиялары аяқталады." : "При изменении прав все сессии пользователя завершатся."}</p>
    {own && <p role="status">{kk ? "Өз құқықтарыңызды өзгертуге болмайды." : "Изменять собственные права нельзя."}</p>}
    <fieldset disabled={own || busy} className="grid gap-4">
      <label className="grid gap-2">{kk ? "Рөл" : "Роль"}<select className={fieldClass} value={role} onChange={e => setRole(e.target.value as StaffUser["role"])}><option value="candidate">Кандидат</option><option value="moderator">{kk ? "Қызметкер" : "Сотрудник"}</option><option value="admin">{kk ? "Әкімші" : "Администратор"}</option></select></label>
      {role === "moderator" && <><label className="grid gap-2">{kk ? "Қолжетімділік аумағы" : "Область доступа"}<select className={fieldClass} value={scope} onChange={e => setScope(e.target.value as "central" | "territorial")}><option value="central">{kk ? "Орталық аппарат" : "Центральный аппарат"}</option><option value="territorial">{kk ? "Аумақтық бөлімше" : "Территориальное подразделение"}</option></select></label>{scope === "territorial" && <label className="grid gap-2">{kk ? "Қызметкердің бөлімшесі" : "Подразделение сотрудника"}<select className={fieldClass} required value={unit} onChange={e => setUnit(e.target.value)}><option value="">{kk ? "Таңдаңыз" : "Выберите"}</option>{units.map(item => <option key={item.id} value={item.id}>{kk ? item.name_kk : item.name_ru}</option>)}</select></label>}</>}
      <label className="flex gap-2"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />{kk ? "Есептік жазба белсенді" : "Учётная запись активна"}</label>
      <label className="flex gap-2"><input type="checkbox" checked={blocked} onChange={e => setBlocked(e.target.checked)} />{kk ? "Бұғатталған" : "Заблокирована"}</label>
      <button className={buttonClass}>{kk ? "Құқықтарды сақтау" : "Сохранить права"}</button>
    </fieldset>
    {error && <p role="alert" className="text-red-700">{error}</p>}
  </form>;
}

function UnitManager({ units, locale, onSaved }: { units: Unit[]; locale: Locale; onSaved: () => void }) {
  const kk = locale === "kk";
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ code: "", name_ru: "", name_kk: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  function choose(value: string) { setSelected(value); const unit = units.find(item => String(item.id) === value); setForm(unit ? { code: unit.code, name_ru: unit.name_ru, name_kk: unit.name_kk } : { code: "", name_ru: "", name_kk: "" }); setMessage(""); }
  return <section className={`${cardClass} lg:col-span-2`}>
    <h3 className="mb-4 text-xl font-bold">{kk ? "Бөлімшелер" : "Подразделения"}</h3>
    <input className={fieldClass} placeholder={kk ? "Бөлімшені іздеу" : "Поиск подразделения"} aria-label={kk ? "Бөлімшені іздеу" : "Поиск подразделения"} value={search} onChange={e => setSearch(e.target.value)} />
    <select aria-label={kk ? "Бөлімшені өңдеу" : "Редактировать подразделение"} className={`${fieldClass} my-3`} value={selected} onChange={e => choose(e.target.value)}><option value="">{kk ? "Жаңа бөлімше" : "Новое подразделение"}</option>{units.filter(unit => unit.id === Number(selected) || `${unit.code} ${unit.name_ru} ${unit.name_kk}`.toLowerCase().includes(search.toLowerCase())).map(unit => <option key={unit.id} value={unit.id}>{unit.code} · {kk ? unit.name_kk : unit.name_ru}</option>)}</select>
    <form className="grid gap-3 md:grid-cols-3" onSubmit={e => { e.preventDefault(); setBusy(true); setMessage(""); void adminWrite(`organizational-units${selected ? `/${selected}` : ""}`, form, selected ? "PUT" : "POST").then(() => { setMessage(kk ? "Сақталды" : "Сохранено"); if (!selected) setForm({ code: "", name_ru: "", name_kk: "" }); onSaved(); }).catch(e => setMessage(e instanceof Error ? e.message : "Ошибка сохранения")).finally(() => setBusy(false)); }}>
      {(["code", "name_ru", "name_kk"] as const).map(key => <label key={key} className="grid gap-2 text-sm">{key === "code" ? (kk ? "Бөлімше коды" : "Код подразделения") : key === "name_ru" ? (kk ? "Орысша атауы" : "Название на русском") : (kk ? "Қазақша атауы" : "Название на казахском")}<input required className={fieldClass} maxLength={key === "code" ? 80 : 255} value={form[key]} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} /></label>)}
      <button className={buttonClass} disabled={busy}>{kk ? "Бөлімшені сақтау" : "Сохранить подразделение"}</button>
    </form><p role="status" className="mt-3 text-sm">{message}</p>
  </section>;
}
