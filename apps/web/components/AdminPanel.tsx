"use client";

import { FileText, ShieldCheck, UserRoundCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n";
import {
  getAdminDashboard,
  listAdminAppeals,
  listAdminCandidates,
  updateAdminAppealStatus,
  updateAdminCandidateStatus,
  type AdminAppeal,
  type AdminCandidate,
  type AdminDashboard
} from "@/lib/admin";

const copy = {
  ru: {
    loading: "Загрузка данных",
    denied: "Войдите под учетной записью Admin или Moderator.",
    refresh: "Обновить",
    appeals: "Обращения",
    candidates: "Кандидаты",
    emptyAppeals: "Обращений пока нет.",
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
    appeals: "Өтініштер",
    candidates: "Кандидаттар",
    emptyAppeals: "Әзірге өтініш жоқ.",
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

const appealStatuses: AdminAppeal["status"][] = ["received", "in_review", "answered", "rejected"];
const candidateStatuses: AdminCandidate["status"][] = ["submitted", "in_review", "approved", "rejected"];

type Tab = "appeals" | "candidates";
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

export function AdminPanel({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [appeals, setAppeals] = useState<AdminAppeal[]>([]);
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("appeals");
  const [selectedAppealId, setSelectedAppealId] = useState<number | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [candidateComment, setCandidateComment] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedAppeal = useMemo(() => appeals.find((item) => item.id === selectedAppealId) ?? null, [appeals, selectedAppealId]);
  const selectedCandidate = useMemo(() => candidates.find((item) => item.id === selectedCandidateId) ?? null, [candidates, selectedCandidateId]);

  async function loadData() {
    setError("");
    const [nextDashboard, nextAppeals, nextCandidates] = await Promise.all([
      getAdminDashboard(),
      listAdminAppeals(),
      listAdminCandidates()
    ]);
    setDashboard(nextDashboard);
    setAppeals(nextAppeals);
    setCandidates(nextCandidates);
    setSelectedAppealId((current) => current ?? nextAppeals[0]?.id ?? null);
    setSelectedCandidateId((current) => current ?? nextCandidates[0]?.id ?? null);
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
  }, []);

  useEffect(() => {
    setCandidateComment(selectedCandidate?.moderator_comment ?? "");
  }, [selectedCandidate]);

  function refresh() {
    startTransition(async () => {
      try {
        await loadData();
      } catch (refreshError) {
        setError(refreshError instanceof Error ? refreshError.message : t.denied);
      }
    });
  }

  function changeAppealStatus(status: AdminAppeal["status"]) {
    if (!selectedAppeal) return;
    startTransition(async () => {
      try {
        const updated = await updateAdminAppealStatus(selectedAppeal.id, status);
        setAppeals((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      } catch (statusError) {
        setError(statusError instanceof Error ? statusError.message : t.denied);
      }
    });
  }

  function changeCandidateStatus(status: AdminCandidate["status"]) {
    if (!selectedCandidate) return;
    startTransition(async () => {
      try {
        const updated = await updateAdminCandidateStatus(selectedCandidate.id, status, candidateComment.trim() || null);
        setCandidates((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      } catch (statusError) {
        setError(statusError instanceof Error ? statusError.message : t.denied);
      }
    });
  }

  if (error && !dashboard) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>;
  }

  if (!dashboard) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600">{t.loading}</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {([
          { label: t.appeals, value: dashboard.appeals, icon: FileText },
          { label: t.candidates, value: dashboard.candidates, icon: UserRoundCheck },
          { label: "Content", value: dashboard.pages, icon: ShieldCheck },
          { label: t.actor, value: dashboard.actor.role, icon: ShieldCheck }
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
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {(["appeals", "candidates"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-state-navy text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {tab === "appeals" ? t.appeals : t.candidates}
            </button>
          ))}
        </div>
        <button type="button" onClick={refresh} disabled={isPending} className="rounded-xl bg-state-gold px-4 py-2 text-sm font-bold text-state-navy transition hover:bg-[#e5bd55] disabled:opacity-60">
          {t.refresh}
        </button>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}

      {activeTab === "appeals" ? (
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {appeals.length === 0 ? <p className="p-5 text-sm text-slate-500">{t.emptyAppeals}</p> : appeals.map((item) => (
              <button key={item.id} type="button" onClick={() => setSelectedAppealId(item.id)} className={`block w-full border-b border-slate-100 p-4 text-left transition last:border-b-0 ${item.id === selectedAppealId ? "bg-state-teal/10" : "hover:bg-slate-50"}`}>
                <span className="text-sm font-bold text-state-navy">{item.subject}</span>
                <span className="mt-1 block text-xs text-slate-500">{item.tracking_code} · {statusText(locale, item.status)}</span>
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedAppeal ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-wide text-state-teal">{t.details}</p>
                <h3 className="mt-2 text-2xl font-bold text-state-navy">{selectedAppeal.subject}</h3>
                <p className="mt-2 text-sm text-slate-500">{t.created}: {formatDate(selectedAppeal.created_at)}</p>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedAppeal.message}</p>
                <div className="mt-5 grid gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <span>{selectedAppeal.full_name}</span>
                  <span>{selectedAppeal.email} · {selectedAppeal.phone}</span>
                  {selectedAppeal.iin ? <span>{selectedAppeal.iin}</span> : null}
                </div>
                <label className="mt-5 grid gap-2 text-sm font-semibold text-state-navy">
                  {t.status}
                  <select value={selectedAppeal.status} onChange={(event) => changeAppealStatus(event.target.value as AdminAppeal["status"])} className="min-h-11 rounded-xl border border-slate-200 px-3">
                    {appealStatuses.map((status) => <option key={status} value={status}>{statusText(locale, status)}</option>)}
                  </select>
                </label>
              </>
            ) : <p className="text-sm text-slate-500">{t.noSelection}</p>}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {candidates.length === 0 ? <p className="p-5 text-sm text-slate-500">{t.emptyCandidates}</p> : candidates.map((item) => (
              <button key={item.id} type="button" onClick={() => setSelectedCandidateId(item.id)} className={`block w-full border-b border-slate-100 p-4 text-left transition last:border-b-0 ${item.id === selectedCandidateId ? "bg-state-teal/10" : "hover:bg-slate-50"}`}>
                <span className="text-sm font-bold text-state-navy">{item.last_name} {item.first_name}</span>
                <span className="mt-1 block text-xs text-slate-500">{item.tracking_code} · {statusText(locale, item.status)}</span>
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedCandidate ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-wide text-state-teal">{t.application}</p>
                <h3 className="mt-2 text-2xl font-bold text-state-navy">{selectedCandidate.last_name} {selectedCandidate.first_name}</h3>
                <p className="mt-2 text-sm text-slate-500">{t.created}: {formatDate(selectedCandidate.created_at)}</p>
                <div className="mt-5 grid gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <span>{selectedCandidate.user.email ?? selectedCandidate.user.phone ?? selectedCandidate.user.telegram_username ?? selectedCandidate.user.full_name} · {selectedCandidate.phone}</span>
                  {selectedCandidate.iin ? <span>{selectedCandidate.iin}</span> : null}
                  {selectedCandidate.region ? <span>{selectedCandidate.region}</span> : null}
                  {selectedCandidate.education_level ? <span>{selectedCandidate.education_level}</span> : null}
                  {selectedCandidate.desired_direction ? <span>{selectedCandidate.desired_direction}</span> : null}
                </div>
                <label className="mt-5 grid gap-2 text-sm font-semibold text-state-navy">
                  {t.comment}
                  <textarea value={candidateComment} onChange={(event) => setCandidateComment(event.target.value)} rows={4} maxLength={4000} className="rounded-xl border border-slate-200 px-4 py-3" />
                </label>
                <label className="mt-5 grid gap-2 text-sm font-semibold text-state-navy">
                  {t.status}
                  <select value={selectedCandidate.status} onChange={(event) => changeCandidateStatus(event.target.value as AdminCandidate["status"])} className="min-h-11 rounded-xl border border-slate-200 px-3">
                    {candidateStatuses.map((status) => <option key={status} value={status}>{statusText(locale, status)}</option>)}
                  </select>
                </label>
              </>
            ) : <p className="text-sm text-slate-500">{t.noSelection}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
