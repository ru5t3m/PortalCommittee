"use client";

import { BarChart3, FileText, MapPinned, ShieldCheck, UserRoundCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n";
import { primaryPsychologicalSections } from "@/lib/primary-psychological-test";
import {
  adminPage,
  type PageData,
  createAdminRegionOffice,
  deleteAdminRegionOffice,
  getAdminDashboard,
  listAdminCandidates,
  listAdminRegionOffices,
  updateAdminRegionOffice,
  type AdminCandidate,
  type AdminDashboard,
  type AdminPsychologicalTestResult,
  type AdminRegionOffice,
  type AdminRegionOfficePayload
} from "@/lib/admin";

import { CaseWorkspace } from "@/components/admin/CaseWorkspace";
import { Pager, buttonClass, fieldClass } from "@/components/admin/ListControls";

const StaffManager = dynamic(() => import("@/components/admin/StaffManager").then(module => module.StaffManager));

const copy = {
  ru: {
    loading: "Загрузка данных",
    denied: "Войдите под учетной записью Admin или Moderator.",
    refresh: "Обновить",
    appeals: "Заявки на службу/учебу",
    candidates: "Кандидаты",
    users: "Пользователи",
    testing: "Тестирования",
    contactsTab: "Контакты",
    contactDirectory: "Справочник контактов",
    newContact: "Новый контакт",
    deleteContact: "Удалить",
    service: "Служба",
    serviceKnb: "КНБ",
    serviceBorder: "Пограничная служба",
    nameRu: "Название RU",
    nameKk: "Название KK",
    regionRu: "Регион RU",
    regionKk: "Регион KK",
    phones: "Телефоны",
    phonesHint: "Один номер на строку",
    latitude: "Широта",
    longitude: "Долгота",
    emptyContacts: "Контакты пока не заведены.",
    candidatePipeline: "Воронка кандидатов",
    needsReview: "Требуют рассмотрения",
    approved: "Одобрены",
    rejected: "Отклонены",
    searchPlaceholder: "Поиск по ФИО, телефону, email или трек-номеру",
    allStatuses: "Все статусы",
    noTestingData: "Результатов психологических тестирований пока нет.",
    answered: "Ответов",
    correct: "Верно",
    answerKey: "Ключ ответов",
    userAnswer: "Ответ кандидата",
    noAnswer: "Нет ответа",
    explanation: "Пояснение",
    timeSpent: "Затрачено",
    submittedAt: "Дата прохождения",
    sections: "Разделы",
    emptyAppeals: "Заявок на службу или учебу пока нет.",
    emptyCandidates: "Кандидатских заявок пока нет.",
    details: "Детали",
    status: "Статус",
    save: "Сохранить",
    comment: "Комментарий модератора",
    noSelection: "Выберите запись слева.",
    created: "Создано",
    contacts: "Контакты",
    application: "Анкета",
    actor: "Оператор",
    statusLabels: {
      received: "Получено",
      in_review: "На рассмотрении",
      answered: "Ответ подготовлен",
      rejected: "Отклонено",
      draft: "Черновик",
      submitted: "Подано",
      approved: "Одобрено"
    }
  },
  kk: {
    loading: "Деректер жүктелуде",
    denied: "Admin немесе Moderator есептік жазбасымен кіріңіз.",
    refresh: "Жаңарту",
    appeals: "Қызмет/оқу өтінімдері",
    candidates: "Кандидаттар",
    users: "Пайдаланушылар",
    testing: "Тестілеу",
    contactsTab: "Байланыстар",
    contactDirectory: "Байланыс анықтамалығы",
    newContact: "Жаңа байланыс",
    deleteContact: "Жою",
    service: "Қызмет",
    serviceKnb: "ҰҚК",
    serviceBorder: "Шекара қызметі",
    nameRu: "Атауы RU",
    nameKk: "Атауы KK",
    regionRu: "Өңір RU",
    regionKk: "Өңір KK",
    phones: "Телефондар",
    phonesHint: "Әр жолға бір нөмір",
    latitude: "Ендік",
    longitude: "Бойлық",
    emptyContacts: "Байланыстар әзірге енгізілмеген.",
    candidatePipeline: "Кандидаттар воронкасы",
    needsReview: "Қарауды қажет етеді",
    approved: "Мақұлданды",
    rejected: "Қабылданбады",
    searchPlaceholder: "ТАӘ, телефон, email немесе трек-нөмір бойынша іздеу",
    allStatuses: "Барлық мәртебелер",
    noTestingData: "Психологиялық тестілеу нәтижелері әзірге жоқ.",
    answered: "Жауап",
    correct: "Дұрыс",
    answerKey: "Жауап кілті",
    userAnswer: "Кандидат жауабы",
    noAnswer: "Жауап жоқ",
    explanation: "Түсіндірме",
    timeSpent: "Жұмсалған уақыт",
    submittedAt: "Өткен күні",
    sections: "Бөлімдер",
    emptyAppeals: "Қызметке немесе оқуға өтінімдер әзірге жоқ.",
    emptyCandidates: "Әзірге кандидат өтінімдері жоқ.",
    details: "Толығырақ",
    status: "Мәртебе",
    save: "Сақтау",
    comment: "Модератор түсіндірмесі",
    noSelection: "Сол жақтан жазбаны таңдаңыз.",
    created: "Құрылған",
    contacts: "Байланыс",
    application: "Анкета",
    actor: "Оператор",
    statusLabels: {
      received: "Қабылданды",
      in_review: "Қаралуда",
      answered: "Жауап дайындалды",
      rejected: "Қабылданбады",
      draft: "Черновик",
      submitted: "Берілді",
      approved: "Мақұлданды"
    }
  }
} as const;

type Tab = "overview" | "candidates" | "appeals" | "testing" | "contacts" | "staff";

type StatItem = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusText(locale: Locale, status: string) {
  const labels = copy[locale].statusLabels;
  return status in labels ? labels[status as keyof typeof labels] : status;
}

function formatTestAnswer(answer: string | string[] | undefined, emptyLabel: string) {
  if (Array.isArray(answer)) return answer.length ? answer.join(", ") : emptyLabel;
  return answer?.trim() ? answer : emptyLabel;
}

const emptyRegionOfficePayload: AdminRegionOfficePayload = {
  service: "knb",
  name_ru: "",
  name_kk: "",
  region_ru: "",
  region_kk: "",
  phones: [""],
  latitude: "",
  longitude: ""
};

function officeToPayload(office: AdminRegionOffice): AdminRegionOfficePayload {
  return {
    service: office.service,
    name_ru: office.name_ru,
    name_kk: office.name_kk,
    region_ru: office.region_ru,
    region_kk: office.region_kk,
    phones: office.phones,
    latitude: office.latitude,
    longitude: office.longitude
  };
}

export function AdminPanel({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [testPage, setTestPage] = useState<PageData<AdminPsychologicalTestResult>>({ items: [], total: 0, limit: 10, offset: 0 });
  const testResults = testPage.items;
  const [testOffset, setTestOffset] = useState(0);
  const [testQuery, setTestQuery] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [testRevision, setTestRevision] = useState(0);
  const [caseRevision, setCaseRevision] = useState(0);
  const [directoryRevision, setDirectoryRevision] = useState(0);
  const overviewLoaded = useRef<number | null>(null);
  const contactsLoaded = useRef<number | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [regionOffices, setRegionOffices] = useState<AdminRegionOffice[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("appeals");
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | "new" | null>(null);
  const [officeForm, setOfficeForm] = useState<AdminRegionOfficePayload>(emptyRegionOfficePayload);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedOffice = useMemo(() => regionOffices.find((item) => item.id === selectedOfficeId) ?? null, [regionOffices, selectedOfficeId]);
  const candidateStatusCounts = dashboard?.candidate_status_counts ?? {};

  async function loadData() {
    setError("");
    const nextDashboard = await getAdminDashboard();
    setDashboard(nextDashboard);
  }

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        await loadData();
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : t.denied);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, [t.denied]);

  useEffect(() => {
    if (activeTab !== "overview" || overviewLoaded.current === directoryRevision) return;
    let active = true;
    setOverviewLoading(true);
    void listAdminCandidates().then(next => {
      if (!active) return;
      setCandidates(next);
      overviewLoaded.current = directoryRevision;
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : t.denied); }).finally(() => { if (active) setOverviewLoading(false); });
    return () => { active = false; };
  }, [activeTab, directoryRevision, t.denied]);

  const canManageContacts = Boolean(dashboard?.permissions?.includes("contacts:manage"));
  useEffect(() => {
    if (activeTab !== "contacts" || !canManageContacts || contactsLoaded.current === directoryRevision) return;
    let active = true;
    setContactsLoading(true);
    void listAdminRegionOffices().then(next => {
      if (!active) return;
      setRegionOffices(next);
      setSelectedOfficeId(current => current ?? next[0]?.id ?? "new");
      contactsLoaded.current = directoryRevision;
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : t.denied); }).finally(() => { if (active) setContactsLoading(false); });
    return () => { active = false; };
  }, [activeTab, canManageContacts, directoryRevision, t.denied]);

  useEffect(() => {
    if (activeTab !== "testing") return;
    const controller = new AbortController(); setTestBusy(true); setError("");
    void adminPage<AdminPsychologicalTestResult>("psychological-tests/results", { q: testSearch, offset: testOffset, limit: 10 }, controller.signal).then(setTestPage).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : t.denied); }).finally(() => { if (!controller.signal.aborted) setTestBusy(false); });
    return () => controller.abort();
  }, [activeTab, testSearch, testOffset, testRevision, t.denied]);

  useEffect(() => {
    if (selectedOfficeId === "new" || !selectedOffice) {
      setOfficeForm(emptyRegionOfficePayload);
      return;
    }
    setOfficeForm(officeToPayload(selectedOffice));
  }, [selectedOffice, selectedOfficeId]);

  function refresh() {
    startTransition(async () => {
      try {
        await loadData();
        setCaseRevision(value => value + 1);
        setDirectoryRevision(value => value + 1);
        setTestRevision(value => value + 1);
      } catch (refreshError) {
        setError(refreshError instanceof Error ? refreshError.message : t.denied);
      }
    });
  }

  function updateOfficeField<K extends keyof AdminRegionOfficePayload>(field: K, value: AdminRegionOfficePayload[K]) {
    setOfficeForm((current) => ({ ...current, [field]: value }));
  }

  function updateOfficePhones(value: string) {
    updateOfficeField("phones", value.split("\n"));
  }

  function newOffice() {
    setSelectedOfficeId("new");
    setOfficeForm(emptyRegionOfficePayload);
    setActiveTab("contacts");
  }

  function saveOffice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...officeForm,
      phones: officeForm.phones.map((phone) => phone.trim()).filter(Boolean)
    };
    startTransition(async () => {
      try {
        if (selectedOfficeId === "new" || selectedOfficeId === null) {
          const created = await createAdminRegionOffice(payload);
          setRegionOffices((items) => [...items, created]);
          setSelectedOfficeId(created.id);
        } else {
          const updated = await updateAdminRegionOffice(selectedOfficeId, payload);
          setRegionOffices((items) => items.map((item) => (item.id === updated.id ? updated : item)));
        }
      } catch (officeError) {
        setError(officeError instanceof Error ? officeError.message : t.denied);
      }
    });
  }

  function removeSelectedOffice() {
    if (typeof selectedOfficeId !== "number") return;
    startTransition(async () => {
      try {
        await deleteAdminRegionOffice(selectedOfficeId);
        setRegionOffices((items) => {
          const next = items.filter((item) => item.id !== selectedOfficeId);
          setSelectedOfficeId(next[0]?.id ?? "new");
          return next;
        });
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : t.denied);
      }
    });
  }

  function formatDuration(durationSeconds: number, remainingSeconds: number) {
    const spent = Math.max(0, durationSeconds - remainingSeconds);
    const minutes = Math.floor(spent / 60);
    const seconds = spent % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  if (error && !dashboard) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>;
  }

  if (!dashboard) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600">{t.loading}</div>;
  }

  return (
    <div className="grid gap-6 rounded-2xl bg-slate-100 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-state-tealDark">Admin dashboard</p>
          <h2 className="mt-2 text-3xl font-bold text-state-navy">Панель управления</h2>
        </div>
        <button type="button" onClick={refresh} disabled={isPending} className="rounded-xl bg-state-gold px-4 py-2 text-sm font-bold text-state-navy transition hover:bg-[#e5bd55] disabled:opacity-60">
          {t.refresh}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {([
          { label: t.appeals, value: dashboard.appeals, icon: FileText },
          { label: t.candidates, value: dashboard.candidates, icon: UserRoundCheck },
          { label: t.users, value: dashboard.users, icon: Users },
          { label: t.contactsTab, value: dashboard.region_offices, icon: MapPinned }
        ] satisfies StatItem[]).map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className="h-6 w-6 text-state-teal" />
              <p className="mt-4 text-sm font-semibold text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-state-navy">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {([
          { label: t.candidatePipeline, value: dashboard.candidates, icon: BarChart3 },
          { label: statusText(locale, "submitted"), value: candidateStatusCounts.submitted ?? 0, icon: UserRoundCheck },
          { label: t.approved, value: candidateStatusCounts.approved ?? 0, icon: ShieldCheck },
          { label: t.rejected, value: candidateStatusCounts.rejected ?? 0, icon: FileText }
        ] satisfies StatItem[]).map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className="h-6 w-6 text-state-teal" />
              <p className="mt-4 text-sm font-semibold text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-state-navy">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-white p-1">
          {(["overview", "candidates", "appeals", "testing", "contacts", "staff"] as const).filter((tab) => (tab !== "contacts" || dashboard.permissions?.includes("contacts:manage")) && (tab !== "staff" || dashboard.permissions?.includes("users:manage"))).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-state-navy text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {tab === "overview" ? "Dashboard" : tab === "appeals" ? t.appeals : tab === "candidates" ? t.candidates : tab === "contacts" ? t.contactsTab : tab === "staff" ? (locale === "kk" ? "Қызметкерлер мен бөлімшелер" : "Сотрудники и подразделения") : t.testing}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}

      {(activeTab === "overview" && overviewLoading) || (activeTab === "contacts" && contactsLoading) ? (
        <div role="status" className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600">{t.loading}</div>
      ) : activeTab === "overview" ? (
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-state-navy">{t.needsReview}</h3>
            <div className="mt-4 grid gap-3">
              {candidates.filter((item) => item.status === "submitted" || item.status === "in_review").slice(0, 8).map((item) => (
                <button key={item.id} type="button" onClick={() => { setActiveTab("candidates"); }} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:border-state-teal/40">
                  <span>
                    <span className="block text-sm font-bold text-state-navy">{item.last_name} {item.first_name}</span>
                    <span className="mt-1 block text-xs text-slate-500">{item.tracking_code} · {item.phone}</span>
                  </span>
                  <span className="rounded-full bg-state-teal/10 px-3 py-1 text-xs font-bold text-state-tealDark">{statusText(locale, item.status)}</span>
                </button>
              ))}
              {candidates.filter((item) => item.status === "submitted" || item.status === "in_review").length === 0 ? <p className="text-sm text-slate-500">{t.emptyCandidates}</p> : null}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-state-navy">{t.actor}</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              <span className="rounded-xl bg-slate-50 p-3">{dashboard.actor.full_name}</span>
              <span className="rounded-xl bg-slate-50 p-3">{dashboard.actor.email ?? dashboard.actor.phone ?? "admin"}</span>
              <span className="rounded-xl bg-slate-50 p-3">Admin session</span>
            </div>
          </section>
        </div>
      ) : activeTab === "appeals" || activeTab === "candidates" ? (
        <CaseWorkspace key={`${activeTab}-${caseRevision}`} kind={activeTab} locale={locale} permissions={dashboard.permissions} onChanged={() => { void getAdminDashboard().then(setDashboard).catch(e => setError(e instanceof Error ? e.message : t.denied)); }} />
      ) : (
      activeTab === "staff" ? (
        <StaffManager locale={locale} actorId={dashboard.actor.id} />
      ) : activeTab === "contacts" ? (
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
              <h3 className="text-lg font-bold text-state-navy">{t.contactDirectory}</h3>
              <button type="button" onClick={newOffice} className="rounded-xl bg-state-gold px-3 py-2 text-xs font-bold text-state-navy transition hover:bg-[#e5bd55]">
                {t.newContact}
              </button>
            </div>
            {regionOffices.length === 0 ? <p className="p-5 text-sm text-slate-500">{t.emptyContacts}</p> : regionOffices.map((office) => (
              <button key={office.id} type="button" onClick={() => setSelectedOfficeId(office.id)} className={`block w-full border-b border-slate-100 p-4 text-left transition last:border-b-0 ${office.id === selectedOfficeId ? "bg-state-teal/10" : "hover:bg-slate-50"}`}>
                <span className="text-sm font-bold text-state-navy">{locale === "kk" ? office.name_kk : office.name_ru}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {office.service === "knb" ? t.serviceKnb : t.serviceBorder} · {locale === "kk" ? office.region_kk : office.region_ru}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={saveOffice} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-state-teal">{t.contactsTab}</p>
                <h3 className="mt-2 text-2xl font-bold text-state-navy">{selectedOfficeId === "new" ? t.newContact : t.contactDirectory}</h3>
              </div>
              {typeof selectedOfficeId === "number" ? (
                <button type="button" onClick={removeSelectedOffice} disabled={isPending} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60">
                  {t.deleteContact}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.service}
                <select value={officeForm.service} onChange={(event) => updateOfficeField("service", event.target.value as AdminRegionOfficePayload["service"])} className="min-h-11 rounded-xl border border-slate-200 px-3">
                  <option value="knb">{t.serviceKnb}</option>
                  <option value="border">{t.serviceBorder}</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.regionRu}
                <input required value={officeForm.region_ru} onChange={(event) => updateOfficeField("region_ru", event.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.nameRu}
                <input required value={officeForm.name_ru} onChange={(event) => updateOfficeField("name_ru", event.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.nameKk}
                <input required value={officeForm.name_kk} onChange={(event) => updateOfficeField("name_kk", event.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.regionKk}
                <input required value={officeForm.region_kk} onChange={(event) => updateOfficeField("region_kk", event.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.latitude}
                <input required value={officeForm.latitude} onChange={(event) => updateOfficeField("latitude", event.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.longitude}
                <input required value={officeForm.longitude} onChange={(event) => updateOfficeField("longitude", event.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy md:col-span-2">
                {t.phones}
                <textarea required value={officeForm.phones.join("\n")} onChange={(event) => updateOfficePhones(event.target.value)} rows={5} className="rounded-xl border border-slate-200 px-4 py-3" />
                <span className="text-xs font-medium text-slate-500">{t.phonesHint}</span>
              </label>
            </div>

            <div className="mt-5">
              <button type="submit" disabled={isPending} className="rounded-xl bg-state-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-state-tealDark disabled:opacity-60">
                {t.save}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-state-navy">{t.testing}</h3>
          <form className="mt-4 flex gap-3" onSubmit={e => { e.preventDefault(); setTestOffset(0); setTestSearch(testQuery.trim()); setTestRevision(value => value + 1); }}>
            <input aria-label={locale === "kk" ? "Нәтижелерді іздеу" : "Поиск результатов"} className={fieldClass} maxLength={200} value={testQuery} onChange={e => setTestQuery(e.target.value)} placeholder={t.searchPlaceholder} />
            <button className={buttonClass} disabled={testBusy}>{locale === "kk" ? "Іздеу" : "Найти"}</button>
          </form>
          <Pager data={testPage} onOffset={setTestOffset} busy={testBusy} locale={locale} />
          {testBusy ? <p>{t.loading}</p> : testResults.length ? (
            <div className="mt-5 grid gap-4">
              {testResults.map((result) => {
                const application = result.candidate_application;
                const displayName = application ? `${application.last_name} ${application.first_name}` : result.user.full_name;
                return (
                  <article key={result.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-state-navy">{displayName}</h4>
                        <p className="mt-1 text-sm font-semibold text-state-tealDark">{result.test_title}</p>
                        <p className="mt-1 text-xs text-slate-500">{result.user.email ?? result.user.phone ?? result.user.telegram_username ?? result.user.full_name}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-state-navy shadow-sm">
                        {result.answered_questions}/{result.total_questions}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
                      <span className="rounded-xl bg-white px-3 py-2">{t.submittedAt}: {formatDate(result.submitted_at)}</span>
                      <span className="rounded-xl bg-white px-3 py-2">{t.answered}: {result.answered_questions}/{result.total_questions}</span>
                      <span className="rounded-xl bg-white px-3 py-2">{t.timeSpent}: {formatDuration(result.duration_seconds, result.remaining_seconds)}</span>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.sections}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.sections.map((section) => (
                          <span key={`${result.id}-${section.id}`} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                            {section.title}: {section.answered_questions}/{section.total_questions}
                            {typeof section.correct_answers === "number" && section.scored_questions ? ` · ${t.correct}: ${section.correct_answers}/${section.scored_questions}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                    <details className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <summary className="cursor-pointer text-sm font-bold text-state-navy">{t.answerKey}</summary>
                      <div className="mt-4 grid gap-4">
                        {primaryPsychologicalSections.slice(0, 2).map((section) => {
                          const sectionAnswers = result.answers?.[section.id] ?? {};
                          return (
                            <div key={`${result.id}-${section.id}-answers`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                              <h5 className="text-sm font-bold text-state-navy">{section.title}</h5>
                              <div className="mt-3 grid gap-2">
                                {section.questions.map((question, index) => (
                                  <div key={`${result.id}-${question.id}`} className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-700">
                                    <div className="font-bold text-state-navy">
                                      {index + 1}. {question.prompt}
                                    </div>
                                    <div className="mt-1">
                                      {t.userAnswer}: <span className="font-semibold">{formatTestAnswer(sectionAnswers[question.id], t.noAnswer)}</span>
                                    </div>
                                    <div>
                                      {t.correct}: <span className="font-semibold">{result.answer_key?.[question.id]?.values.join(", ") ?? "-"}</span>
                                    </div>
                                    {result.answer_key?.[question.id]?.explanation ? <div className="mt-1 text-slate-500">{t.explanation}: {result.answer_key?.[question.id]?.explanation}</div> : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t.noTestingData}</p>
          )}
        </section>
      )
      )}
    </div>
  );
}
