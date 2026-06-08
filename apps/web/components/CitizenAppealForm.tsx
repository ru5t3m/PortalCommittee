"use client";

import Link from "next/link";
import { CheckCircle2, LogIn } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { KnbEmblem } from "@/components/KnbEmblem";
import { API_URL, parseApiError, type CitizenAppealPayload, type TrackingResponse } from "@/lib/api";
import { authFetch, getMe } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";

const copy = {
  ru: {
    formTitle: "Подать первичную заявку",
    applicationType: "Вариант поступления",
    serviceType: "Напрямую на службу",
    studyType: "Зачисление на учебу",
    fullName: "ФИО",
    iin: "ИИН, при наличии",
    email: "Электронная почта",
    phone: "Телефон",
    direction: "Интересующее направление",
    message: "Коротко о себе и цели обращения",
    submit: "Отправить заявку",
    success: "Заявка зарегистрирована",
    status: "Текущий статус",
    nextStepsTitle: "Что отправить на почту",
    nextStepsText: "Укажите номер заявки в теме письма и отправьте документы на адрес:",
    documentsTitle: "Перечень документов",
    documents: ["Резюме"],
    newApplication: "Подать еще одну заявку",
    visualSteps: ["Выберите службу или учебу", "Заполните все поля", "Нажмите кнопку отправки", "Отправьте необходимые документы на адрес почты, который увидите после отправки", "Ожидайте обратной связи"],
    error: "Не удалось выполнить запрос",
    checkingAuth: "Проверяем вход",
    authRequired: "Для подачи заявки нужен вход",
    authRequiredText: "Заявка на поступление доступна только пользователям, которые вошли в профиль. Войдите через Telegram или email, затем вернитесь к форме.",
    login: "Войти",
    statusLabels: {
      received: "Получено",
      in_review: "На рассмотрении",
      answered: "Ответ подготовлен",
      rejected: "Отклонено"
    }
  },
  kk: {
    formTitle: "Алғашқы өтінім беру",
    applicationType: "Түсу нұсқасы",
    serviceType: "Тікелей қызметке",
    studyType: "Оқуға қабылдану",
    fullName: "Тегі, аты, әкесінің аты",
    iin: "ЖСН, бар болса",
    email: "Электрондық пошта",
    phone: "Телефон",
    direction: "Қызықтыратын бағыт",
    message: "Өзіңіз және жүгіну мақсаты туралы қысқаша",
    submit: "Өтінімді жіберу",
    success: "Өтінім тіркелді",
    status: "Ағымдағы мәртебе",
    nextStepsTitle: "Поштаға не жіберу керек",
    nextStepsText: "Хат тақырыбында өтінім нөмірін көрсетіп, құжаттарды мына мекенжайға жіберіңіз:",
    documentsTitle: "Құжаттар тізімі",
    documents: ["Түйіндеме"],
    newApplication: "Тағы бір өтінім беру",
    visualSteps: ["Қызметті немесе оқуды таңдаңыз", "Барлық өрістерді толтырыңыз", "Жіберу батырмасын басыңыз", "Жібергеннен кейін көрсетілетін пошта мекенжайына қажетті құжаттарды жіберіңіз", "Кері байланысты күтіңіз"],
    error: "Сұрауды орындау мүмкін болмады",
    checkingAuth: "Кіру тексерілуде",
    authRequired: "Өтінім беру үшін кіру қажет",
    authRequiredText: "Оқуға немесе қызметке өтінім беру портал профиліне кірген пайдаланушыларға ғана қолжетімді. Telegram немесе email арқылы кіріп, нысанға қайта оралыңыз.",
    login: "Кіру",
    statusLabels: {
      received: "Қабылданды",
      in_review: "Қаралуда",
      answered: "Жауап дайындалды",
      rejected: "Қабылданбады"
    }
  }
} as const;

const documentsEmail = "hr@knb.gov.kz";

function statusText(locale: Locale, status: string) {
  const labels = copy[locale].statusLabels;
  return status in labels ? labels[status as keyof typeof labels] : status;
}

async function submitAuthorizedCitizenAppeal(payload: CitizenAppealPayload) {
  const response = await authFetch(`${API_URL}/appeals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as TrackingResponse;
}

export function CitizenAppealForm({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const formRef = useRef<HTMLFormElement>(null);
  const [authStatus, setAuthStatus] = useState<"checking" | "allowed" | "denied">("checking");
  const [submitResult, setSubmitResult] = useState<TrackingResponse | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    let active = true;
    getMe()
      .then(() => {
        if (active) setAuthStatus("allowed");
      })
      .catch(() => {
        if (active) setAuthStatus("denied");
      });

    return () => {
      active = false;
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      full_name: String(formData.get("fullName") ?? "").trim(),
      iin: String(formData.get("iin") ?? "").trim() || undefined,
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      subject: `${String(formData.get("applicationType") ?? "").trim()}: ${String(formData.get("direction") ?? "").trim()}`,
      message: String(formData.get("message") ?? "").trim()
    };

    startSubmit(async () => {
      setSubmitError("");
      setSubmitResult(null);
      try {
        const result = await submitAuthorizedCitizenAppeal(payload);
        setSubmitResult(result);
        formRef.current?.reset();
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : t.error);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <aside className="relative min-h-[34rem] overflow-hidden rounded-2xl bg-state-navy p-6 text-white shadow-premium md:p-8">
        <div className="security-grid absolute inset-0 opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(0,169,155,0.32),transparent_18rem),radial-gradient(circle_at_82%_28%,rgba(214,168,58,0.22),transparent_16rem)]" />
        <div className="relative grid gap-8">
          <div className="mx-auto grid aspect-square w-full max-w-[18rem] place-items-center rounded-full border border-state-gold/30 bg-white/5 md:max-w-[21rem]">
            <div className="absolute h-48 w-48 rounded-full border border-white/10 md:h-64 md:w-64" />
            <div className="absolute h-36 w-36 rounded-full bg-state-gold/10 blur-xl md:h-48 md:w-48" />
            <KnbEmblem className="relative h-40 w-40 md:h-52 md:w-52" />
          </div>

          <ol className="grid gap-3">
            {t.visualSteps.map((step, index) => (
              <li key={step} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold leading-6 text-white/84">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-state-gold text-xs font-bold text-state-navy">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </aside>

      {authStatus === "checking" ? (
        <section className="grid min-h-[20rem] content-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-state-tealDark">{t.checkingAuth}</p>
        </section>
      ) : authStatus === "denied" ? (
        <section className="grid min-h-[24rem] content-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-state-teal/10 text-state-tealDark">
            <LogIn className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-state-navy">{t.authRequired}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{t.authRequiredText}</p>
          <div className="mt-6">
            <Link href={`/${locale}/login`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-state-gold px-5 py-3 text-sm font-bold text-state-navy transition hover:bg-[#e5bd55]">
              {t.login}
            </Link>
          </div>
        </section>
      ) : (
      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-2xl font-bold text-state-navy">{t.formTitle}</h2>
        {submitResult ? (
          <div className="grid gap-4 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
            <div className="flex flex-wrap items-center gap-3 font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              <span>{t.success}: {submitResult.tracking_code}</span>
              <span>{t.status}: {statusText(locale, submitResult.status)}</span>
            </div>
            <div className="rounded-xl bg-white/70 p-4">
              <p className="font-bold">{t.nextStepsTitle}</p>
              <p className="mt-2 leading-6">{t.nextStepsText} <a className="font-bold underline" href={`mailto:${documentsEmail}?subject=${encodeURIComponent(submitResult.tracking_code)}`}>{documentsEmail}</a></p>
              <p className="mt-3 font-bold">{t.documentsTitle}</p>
              <ul className="mt-2 list-disc pl-5">
                {t.documents.map((document) => <li key={document}>{document}</li>)}
              </ul>
            </div>
            <button type="button" onClick={() => setSubmitResult(null)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-state-gold px-4 py-2 text-sm font-bold text-state-navy transition hover:bg-[#e5bd55]">
              {t.newApplication}
            </button>
          </div>
        ) : (
          <>
            <label className="grid gap-2 text-sm font-semibold text-state-navy">
              {t.applicationType}
              <select required name="applicationType" defaultValue={t.serviceType} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10">
                <option value={t.serviceType}>{t.serviceType}</option>
                <option value={t.studyType}>{t.studyType}</option>
              </select>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.fullName}
                <input required name="fullName" minLength={3} maxLength={255} className="min-h-12 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.iin}
                <input name="iin" minLength={12} maxLength={12} inputMode="numeric" className="min-h-12 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.email}
                <input required name="email" type="email" className="min-h-12 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-state-navy">
                {t.phone}
                <input required name="phone" minLength={5} maxLength={60} className="min-h-12 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-state-navy">
              {t.direction}
              <input required name="direction" minLength={3} maxLength={180} className="min-h-12 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-state-navy">
              {t.message}
              <textarea required name="message" minLength={20} maxLength={8000} rows={7} className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10" />
            </label>
            {submitError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{submitError}</p> : null}
            <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-state-gold px-5 py-3 text-sm font-bold text-state-navy transition hover:bg-[#e5bd55] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "..." : t.submit}
            </button>
          </>
        )}
      </form>
      )}
    </div>
  );
}
