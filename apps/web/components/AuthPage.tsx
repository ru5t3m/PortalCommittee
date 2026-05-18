"use client";

import Link from "next/link";
import { CheckCircle2, LockKeyhole, Phone, ShieldCheck, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { KnbEmblem } from "@/components/KnbEmblem";
import type { Locale } from "@/lib/i18n";

type AuthMode = "login" | "register";

const copy = {
  ru: {
    login: {
      title: "Вход в личный кабинет",
      subtitle: "Введите номер телефона и пароль, чтобы продолжить работу с сервисами портала.",
      submit: "Войти",
      switchText: "Нет аккаунта?",
      switchAction: "Зарегистрироваться"
    },
    register: {
      title: "Регистрация кандидата",
      subtitle: "Заполните данные, чтобы создать учетную запись для дальнейшей работы с порталом.",
      submit: "Создать аккаунт",
      switchText: "Уже есть аккаунт?",
      switchAction: "Войти"
    },
    phone: "Номер телефона",
    firstName: "Имя",
    lastName: "Фамилия",
    password: "Пароль",
    phonePlaceholder: "+7 700 000 00 00",
    firstNamePlaceholder: "Введите имя",
    lastNamePlaceholder: "Введите фамилию",
    passwordPlaceholder: "Введите пароль",
    remember: "Запомнить меня",
    consent: "Согласен на обработку персональных данных",
    forgot: "Забыли пароль?",
    error: "Проверьте данные: неверный номер телефона или пароль.",
    secureTitle: "Защищенный доступ",
    dataProtection: "Данные защищены и используются только для проверки личности, авторизации и работы с сервисами портала.",
    features: ["Единый кабинет кандидата", "Статусы заявок и уведомления", "Доступ к сервисам портала"]
  },
  kk: {
    login: {
      title: "Жеке кабинетке кіру",
      subtitle: "Портал сервистерін жалғастыру үшін телефон нөмірі мен құпия сөзді енгізіңіз.",
      submit: "Кіру",
      switchText: "Аккаунтыңыз жоқ па?",
      switchAction: "Тіркелу"
    },
    register: {
      title: "Кандидатты тіркеу",
      subtitle: "Порталмен әрі қарай жұмыс істеу үшін есептік жазба жасау деректерін толтырыңыз.",
      submit: "Аккаунт жасау",
      switchText: "Аккаунтыңыз бар ма?",
      switchAction: "Кіру"
    },
    phone: "Телефон нөмірі",
    firstName: "Аты",
    lastName: "Тегі",
    password: "Құпия сөз",
    phonePlaceholder: "+7 700 000 00 00",
    firstNamePlaceholder: "Атыңызды енгізіңіз",
    lastNamePlaceholder: "Тегіңізді енгізіңіз",
    passwordPlaceholder: "Құпия сөзді енгізіңіз",
    remember: "Мені есте сақтау",
    consent: "Жеке деректерді өңдеуге келісемін",
    forgot: "Құпия сөзді ұмыттыңыз ба?",
    error: "Деректерді тексеріңіз: телефон нөмірі немесе құпия сөз қате.",
    secureTitle: "Қорғалған қолжетімділік",
    dataProtection: "Деректер қорғалған және тек жеке басты тексеру, авторизация және портал сервистерімен жұмыс істеу үшін пайдаланылады.",
    features: ["Кандидаттың бірыңғай кабинеті", "Өтінім мәртебелері мен хабарламалар", "Портал сервистеріне қолжетімділік"]
  }
};

const allowedUser = {
  firstName: "Рустем",
  lastName: "Жармагамбетов",
  phone: "+77057578841",
  password: "1234"
};

function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "");
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

function Field({ name, label, icon: Icon, type, placeholder, autoComplete, required = true }: { name: string; label: string; icon: LucideIcon; type: string; placeholder: string; autoComplete: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-state-navy">{label}</span>
      <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-state-teal focus-within:ring-4 focus-within:ring-state-teal/10">
        <Icon className="h-5 w-5 shrink-0 text-state-tealDark" />
        <input
          name={name}
          className="w-full bg-transparent text-base font-medium text-state-navy outline-none placeholder:text-slate-400"
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
      </span>
    </label>
  );
}

export function AuthPage({ locale, mode }: { locale: Locale; mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const t = copy[locale];
  const page = t[mode];
  const isRegister = mode === "register";
  const switchHref = `/${locale}/${isRegister ? "login" : "register"}`;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const phone = normalizePhone(String(formData.get("phone") ?? ""));
    const password = String(formData.get("password") ?? "");
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");

    const hasValidLogin = phone === allowedUser.phone && password === allowedUser.password;
    const hasValidIdentity = !isRegister || (
      normalizeName(firstName) === normalizeName(allowedUser.firstName) &&
      normalizeName(lastName) === normalizeName(allowedUser.lastName)
    );

    if (!hasValidLogin || !hasValidIdentity) {
      setError(t.error);
      return;
    }

    const user = {
      firstName: allowedUser.firstName,
      lastName: allowedUser.lastName,
      phone: allowedUser.phone
    };

    window.localStorage.setItem("knb-auth-user", JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("knb-auth-changed", { detail: user }));
    router.push(`/${locale}/account`);
  }

  return (
    <section className="relative min-h-[calc(100vh-77px)] overflow-hidden bg-[#06182d] text-white">
      <div className="security-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(0,169,155,0.32),transparent_28rem),radial-gradient(circle_at_82%_20%,rgba(214,168,58,0.2),transparent_26rem),linear-gradient(130deg,rgba(6,24,45,0.98),rgba(5,36,55,0.86)_54%,rgba(0,125,115,0.52))]" />
      <div className="absolute right-[-10rem] top-20 h-[34rem] w-[34rem] rounded-full border border-state-gold/15" />

      <Container className="relative grid min-h-[calc(100vh-77px)] content-center items-start gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <div className="flex items-center gap-4">
            <KnbEmblem className="h-20 w-20" />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-state-gold">{locale === "kk" ? "ҚР ҰҚК" : "КНБ РК"}</p>
              <div className="mt-2 h-px w-44 bg-gradient-to-r from-state-gold/70 via-white/25 to-transparent" />
            </div>
          </div>
          <h1 className="mt-8 text-balance text-4xl font-bold leading-tight tracking-normal md:text-5xl">{page.title}</h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-white/74 md:text-lg">{page.subtitle}</p>

          <div className="mt-8 grid gap-3">
            {t.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-white/78">
                <CheckCircle2 className="h-5 w-5 text-state-gold" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-[1.35rem] border border-white/20 bg-white/[0.96] p-6 text-state-navy shadow-[0_30px_90px_rgba(0,0,0,0.24)] md:p-8">
            <div className="mb-7">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-tealDark">{isRegister ? t.register.submit : t.login.submit}</p>
                <h2 className="mt-2 text-2xl font-bold">{page.title}</h2>
              </div>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              {isRegister ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="firstName" label={t.firstName} icon={UserRound} type="text" placeholder={t.firstNamePlaceholder} autoComplete="given-name" />
                  <Field name="lastName" label={t.lastName} icon={UserRound} type="text" placeholder={t.lastNamePlaceholder} autoComplete="family-name" />
                </div>
              ) : null}
              <Field name="phone" label={t.phone} icon={Phone} type="tel" placeholder={t.phonePlaceholder} autoComplete="tel" />
              <Field name="password" label={t.password} icon={LockKeyhole} type="password" placeholder={t.passwordPlaceholder} autoComplete={isRegister ? "new-password" : "current-password"} />

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="inline-flex items-center gap-2 font-medium text-slate-600">
                  <input className="h-4 w-4 rounded border-slate-300 text-state-teal focus:ring-state-teal" type="checkbox" required={isRegister} />
                  {isRegister ? t.consent : t.remember}
                </label>
                {!isRegister ? <Link href={`/${locale}/login`} className="font-semibold text-state-tealDark hover:text-state-gold">{t.forgot}</Link> : null}
              </div>

              <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-button-gradient px-5 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:shadow-premium" type="submit">
                {page.submit}
              </button>
              {error ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
            </form>

            <div className="mt-6 rounded-2xl border border-state-teal/15 bg-state-surface p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-state-tealDark" />
                <div>
                  <p className="font-bold text-state-navy">{t.secureTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{t.dataProtection}</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              {page.switchText}{" "}
              <Link href={switchHref} className="font-bold text-state-tealDark hover:text-state-gold">
                {page.switchAction}
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
