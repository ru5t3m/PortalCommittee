"use client";

import { CalendarDays, CheckCircle2, Loader2, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { KnbEmblem } from "@/components/KnbEmblem";
import type { Locale } from "@/lib/i18n";
import {
  completeEdsLogin,
  loginWithPassword,
  registerWithPassword,
  startEdsLogin
} from "@/lib/auth";
import { signAuthChallengeWithNcaLayer } from "@/lib/ncalayer";

type AuthMode = "login" | "register";
type Provider = "eds" | "email";

const copy = {
  ru: {
    title: "Вход в личный кабинет",
    subtitle: "Используйте вход по email и паролю или ЭЦП.",
    registerTitle: "Регистрация кандидата",
    registerSubtitle: "Создайте аккаунт по email и паролю. Эти данные будут использоваться для входа в личный кабинет и прохождения доступных сервисов портала.",
    eds: "ЭЦП",
    email: "Email",
    edsTitle: "Вход через ЭЦП",
    edsText: "Для входа нужен установленный NCALayer и действующий сертификат НУЦ РК для аутентификации.",
    emailTitle: "Вход по email",
    emailRegisterTitle: "Создание аккаунта",
    firstName: "Имя",
    lastName: "Фамилия",
    birthDate: "Дата рождения",
    phone: "Номер телефона",
    emailLabel: "Email",
    password: "Пароль",
    firstNamePlaceholder: "Введите имя",
    lastNamePlaceholder: "Введите фамилию",
    phonePlaceholder: "+7 700 000 00 00",
    emailPlaceholder: "name@example.kz",
    passwordPlaceholder: "Введите пароль",
    emailSubmit: "Войти",
    registerSubmit: "Создать аккаунт",
    goRegister: "Зарегистрироваться",
    goLogin: "Уже есть аккаунт? Войти",
    startEds: "Подписать и войти",
    starting: "Создаем защищенную заявку...",
    verified: "Подпись подтверждена. Завершаем вход...",
    error: "Не удалось выполнить вход. Повторите попытку.",
    ncaError: "Не удалось подключиться к NCALayer или подписать запрос. Проверьте, что NCALayer запущен.",
    passwordPolicyError: "Пароль должен содержать не менее 10 символов, а также заглавную букву, строчную букву и цифру.",
    secureTitle: "Защищенная авторизация",
    dataProtection: "Данные используются только для идентификации, авторизации и работы с сервисами портала.",
    features: ["Вход по email и паролю", "ЭЦП через NCALayer", "Защищенная сессия портала"],
    registerFeatures: ["Регистрация только по email", "Данные кандидата сохраняются в анкете", "Защищенная сессия портала"],
  },
  kk: {
    title: "Жеке кабинетке кіру",
    subtitle: "Email және құпия сөз немесе ЭЦҚ арқылы кіріңіз.",
    registerTitle: "Кандидатты тіркеу",
    registerSubtitle: "Email және құпия сөз арқылы аккаунт жасаңыз. Бұл деректер жеке кабинетке кіру және портал сервистерін пайдалану үшін қолданылады.",
    eds: "ЭЦҚ",
    email: "Email",
    edsTitle: "ЭЦҚ арқылы кіру",
    edsText: "Кіру үшін NCALayer орнатылып, іске қосылуы және ҚР ҰКО аутентификация сертификаты болуы керек.",
    emailTitle: "Email арқылы кіру",
    emailRegisterTitle: "Аккаунт жасау",
    firstName: "Аты",
    lastName: "Тегі",
    birthDate: "Туған күні",
    phone: "Телефон нөмірі",
    emailLabel: "Email",
    password: "Құпия сөз",
    firstNamePlaceholder: "Атыңызды енгізіңіз",
    lastNamePlaceholder: "Тегіңізді енгізіңіз",
    phonePlaceholder: "+7 700 000 00 00",
    emailPlaceholder: "name@example.kz",
    passwordPlaceholder: "Құпия сөзді енгізіңіз",
    emailSubmit: "Кіру",
    registerSubmit: "Аккаунт жасау",
    goRegister: "Тіркелу",
    goLogin: "Аккаунтыңыз бар ма? Кіру",
    startEds: "Қол қойып кіру",
    starting: "Қорғалған сұрау жасалуда...",
    verified: "Қолтаңба расталды. Кіру аяқталуда...",
    error: "Кіру орындалмады. Қайта көріңіз.",
    ncaError: "NCALayer-ге қосылу немесе сұрауға қол қою мүмкін болмады. NCALayer іске қосылғанын тексеріңіз.",
    passwordPolicyError: "Құпия сөз кемінде 10 таңбадан тұрып, бас әріп, кіші әріп және цифр қамтуы керек.",
    secureTitle: "Қорғалған авторизация",
    dataProtection: "Деректер тек жеке басты тексеру, авторизация және портал сервистерімен жұмыс істеу үшін пайдаланылады.",
    features: ["Email және құпия сөз арқылы кіру", "NCALayer арқылы ЭЦҚ", "Порталдың қорғалған сессиясы"],
    registerFeatures: ["Тіркелу тек email арқылы", "Кандидат деректері анкетаға сақталады", "Порталдың қорғалған сессиясы"],
  }
};

function humanizeAuthError(message: string, locale: Locale) {
  if (message.toLowerCase().includes("password must be at least 10 characters")) {
    return copy[locale].passwordPolicyError;
  }
  return message || copy[locale].error;
}

export function AuthPage({ locale, mode }: { locale: Locale; mode: AuthMode }) {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider>("email");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isEdsSubmitting, setIsEdsSubmitting] = useState(false);
  const t = copy[locale];
  const isRegister = mode === "register";
  const pageTitle = isRegister ? t.registerTitle : t.title;
  const pageSubtitle = isRegister ? t.registerSubtitle : t.subtitle;
  const pageFeatures = isRegister ? t.registerFeatures : t.features;

  async function beginEdsLogin() {
    setError("");
    setStatus(t.starting);
    setIsEdsSubmitting(true);
    try {
      const edsChallenge = await startEdsLogin();
      const cmsBase64 = await signAuthChallengeWithNcaLayer(edsChallenge.challenge_base64);
      setStatus(t.verified);
      await completeEdsLogin(edsChallenge.challenge_id, edsChallenge.nonce, cmsBase64);
      router.push(`/${locale}/account`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(message ? humanizeAuthError(message, locale) : t.ncaError);
      setStatus("");
    } finally {
      setIsEdsSubmitting(false);
    }
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsEmailSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const birthDate = String(formData.get("birthDate") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    try {
      if (isRegister) {
        await registerWithPassword({ email, password, first_name: firstName, last_name: lastName, birth_date: birthDate, phone });
      } else {
        await loginWithPassword(email, password);
      }
      router.push(`/${locale}/account`);
    } catch (caught) {
      setError(caught instanceof Error ? humanizeAuthError(caught.message, locale) : t.error);
    } finally {
      setIsEmailSubmitting(false);
    }
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
          <h1 className="mt-8 text-balance text-4xl font-bold leading-tight tracking-normal md:text-5xl">{pageTitle}</h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-white/74 md:text-lg">{pageSubtitle}</p>

          <div className="mt-8 grid gap-3">
            {pageFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-white/78">
                <CheckCircle2 className="h-5 w-5 text-state-gold" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-[1.35rem] border border-white/20 bg-white/[0.96] p-6 text-state-navy shadow-[0_30px_90px_rgba(0,0,0,0.24)] md:p-8">
            {!isRegister ? (
              <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                {(["email", "eds"] as Provider[]).map((item) => (
                  <button
                    key={item}
                    className={`min-h-11 rounded-xl text-sm font-bold transition ${provider === item ? "bg-white text-state-navy shadow-sm" : "text-slate-500 hover:text-state-navy"}`}
                    type="button"
                    onClick={() => {
                      setProvider(item);
                      setError("");
                      setStatus("");
                    }}
                  >
                    {item === "eds" ? t.eds : t.email}
                  </button>
                ))}
              </div>
            ) : null}

            {provider === "eds" ? (
              <>
                <div className="mb-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-tealDark">{t.eds}</p>
                  <h2 className="mt-2 text-2xl font-bold">{t.edsTitle}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{t.edsText}</p>
                </div>

                <div className="rounded-2xl border border-state-teal/15 bg-state-surface p-5">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-state-tealDark" />
                    <div>
                      <p className="font-bold text-state-navy">{t.secureTitle}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{t.dataProtection}</p>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isEdsSubmitting}
                  className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-button-gradient px-5 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:shadow-premium disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  onClick={beginEdsLogin}
                >
                  {isEdsSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  {t.startEds}
                </button>
              </>
            ) : (
              <>
                <div className="mb-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-tealDark">Email</p>
                  <h2 className="mt-2 text-2xl font-bold">{isRegister ? t.emailRegisterTitle : t.emailTitle}</h2>
                </div>

                <form className="grid gap-4" onSubmit={handleEmailSubmit}>
                  {isRegister ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-state-navy">
                        {t.firstName}
                        <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                          <UserRound className="h-5 w-5 text-state-tealDark" />
                          <input name="firstName" autoComplete="given-name" className="w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-400" placeholder={t.firstNamePlaceholder} required />
                        </span>
                      </label>
                      <label className="grid gap-2 text-sm font-semibold text-state-navy">
                        {t.lastName}
                        <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                          <UserRound className="h-5 w-5 text-state-tealDark" />
                          <input name="lastName" autoComplete="family-name" className="w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-400" placeholder={t.lastNamePlaceholder} required />
                        </span>
                      </label>
                    </div>
                  ) : null}
                  {isRegister ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-state-navy">
                        {t.birthDate}
                        <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                          <CalendarDays className="h-5 w-5 text-state-tealDark" />
                          <input name="birthDate" type="date" className="w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-400" required />
                        </span>
                      </label>
                      <label className="grid gap-2 text-sm font-semibold text-state-navy">
                        {t.phone}
                        <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                          <Phone className="h-5 w-5 text-state-tealDark" />
                          <input name="phone" type="tel" autoComplete="tel" className="w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-400" placeholder={t.phonePlaceholder} required />
                        </span>
                      </label>
                    </div>
                  ) : null}
                  <label className="grid gap-2 text-sm font-semibold text-state-navy">
                    {t.emailLabel}
                    <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                      <Mail className="h-5 w-5 text-state-tealDark" />
                      <input name="email" type="email" autoComplete="email" className="w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-400" placeholder={t.emailPlaceholder} required />
                    </span>
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-state-navy">
                    {t.password}
                    <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                      <LockKeyhole className="h-5 w-5 text-state-tealDark" />
                      <input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} className="w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-400" placeholder={t.passwordPlaceholder} required />
                    </span>
                  </label>
                  <button disabled={isEmailSubmitting} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-button-gradient px-5 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:shadow-premium disabled:cursor-not-allowed disabled:opacity-70" type="submit">
                    {isEmailSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                    {isRegister ? t.registerSubmit : t.emailSubmit}
                  </button>
                </form>
              </>
            )}

            {status ? (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-state-teal/20 bg-state-surface px-4 py-3 text-sm font-semibold leading-6 text-state-tealDark">
                <ShieldCheck className="h-5 w-5" />
                {status}
              </div>
            ) : null}

            {error ? (
              <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 rounded-2xl border border-state-teal/15 bg-state-surface p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-state-tealDark" />
                <div>
                  <p className="font-bold text-state-navy">{t.secureTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{t.dataProtection}</p>
                </div>
              </div>
            </div>

            <a
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-state-teal/25 bg-white px-5 text-sm font-bold text-state-tealDark transition hover:border-state-gold hover:text-state-navy"
              href={`/${locale}/${isRegister ? "login" : "register"}`}
            >
              {isRegister ? t.goLogin : t.goRegister}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
