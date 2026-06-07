"use client";

import { CheckCircle2, ExternalLink, Loader2, MessageCircle, ShieldCheck, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { KnbEmblem } from "@/components/KnbEmblem";
import type { Locale } from "@/lib/i18n";
import { completeTelegramLogin, getTelegramLoginStatus, startTelegramLogin, type TelegramLoginStart } from "@/lib/auth";

type AuthMode = "login" | "register";

const copy = {
  ru: {
    title: "Вход через Telegram",
    subtitle: "Для входа и регистрации подтвердите Telegram-аккаунт и номер телефона через официальный бот портала.",
    start: "Начать вход через Telegram",
    openTelegram: "Открыть Telegram",
    starting: "Создаем защищенную заявку...",
    waiting: "Ожидаем подтверждение номера в Telegram",
    verified: "Номер подтвержден. Завершаем вход...",
    expired: "Срок подтверждения истек. Начните вход заново.",
    error: "Не удалось выполнить вход через Telegram. Повторите попытку.",
    secureTitle: "Подтверждение телефона",
    dataProtection: "Номер телефона передается только после вашего согласия в Telegram и используется для идентификации, авторизации и работы с сервисами портала.",
    features: ["Без пароля", "Подтверждение текущего Telegram-аккаунта", "Защищенная сессия портала"],
    steps: ["Нажмите кнопку входа", "Откройте бота в Telegram", "Нажмите «Поделиться номером телефона»"]
  },
  kk: {
    title: "Telegram арқылы кіру",
    subtitle: "Кіру және тіркелу үшін порталдың ресми боты арқылы Telegram аккаунтыңызды және телефон нөміріңізді растаңыз.",
    start: "Telegram арқылы кіруді бастау",
    openTelegram: "Telegram ашу",
    starting: "Қорғалған сұрау жасалуда...",
    waiting: "Telegram ішінде телефон нөмірін растауды күтіп тұрмыз",
    verified: "Нөмір расталды. Кіру аяқталуда...",
    expired: "Растау мерзімі аяқталды. Кіруді қайта бастаңыз.",
    error: "Telegram арқылы кіру орындалмады. Қайта көріңіз.",
    secureTitle: "Телефонды растау",
    dataProtection: "Телефон нөмірі Telegram ішіндегі келісіміңізден кейін ғана беріледі және жеке басты тексеру, авторизация және портал сервистерімен жұмыс істеу үшін пайдаланылады.",
    features: ["Құпия сөзсіз", "Ағымдағы Telegram аккаунтын растау", "Порталдың қорғалған сессиясы"],
    steps: ["Кіру батырмасын басыңыз", "Ботты Telegram ішінде ашыңыз", "«Телефон нөмірімен бөлісу» батырмасын басыңыз"]
  }
};

function humanizeAuthError(message: string, locale: Locale) {
  return message || copy[locale].error;
}

export function AuthPage({ locale }: { locale: Locale; mode: AuthMode }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<TelegramLoginStart | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const t = copy[locale];

  async function beginTelegramLogin() {
    setError("");
    setStatus(t.starting);
    setIsStarting(true);
    try {
      const nextChallenge = await startTelegramLogin();
      setChallenge(nextChallenge);
      setStatus(t.waiting);
      window.open(nextChallenge.deep_link, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(caught instanceof Error ? humanizeAuthError(caught.message, locale) : t.error);
      setStatus("");
    } finally {
      setIsStarting(false);
    }
  }

  useEffect(() => {
    if (!challenge) return;

    let cancelled = false;
    let completionStarted = false;
    const interval = window.setInterval(async () => {
      if (completionStarted) return;
      try {
        const current = await getTelegramLoginStatus(challenge.challenge_id);
        if (cancelled) return;

        if (current.status === "expired") {
          setError(t.expired);
          setStatus("");
          setChallenge(null);
          window.clearInterval(interval);
          return;
        }

        if (current.status === "verified") {
          completionStarted = true;
          setStatus(t.verified);
          setIsCompleting(true);
          window.clearInterval(interval);
          try {
            await completeTelegramLogin(challenge.challenge_id, challenge.nonce);
            if (!cancelled) {
              router.push(`/${locale}/account`);
            }
          } catch (caught) {
            if (!cancelled) {
              setError(caught instanceof Error ? humanizeAuthError(caught.message, locale) : t.error);
              setStatus("");
              setChallenge(null);
              setIsCompleting(false);
            }
          }
        } else if (current.status === "awaiting_contact") {
          setStatus(t.waiting);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? humanizeAuthError(caught.message, locale) : t.error);
          setStatus("");
          setIsCompleting(false);
        }
      }
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [challenge, locale, router, t.error, t.expired, t.verified, t.waiting]);

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
          <h1 className="mt-8 text-balance text-4xl font-bold leading-tight tracking-normal md:text-5xl">{t.title}</h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-white/74 md:text-lg">{t.subtitle}</p>

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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-tealDark">Telegram</p>
              <h2 className="mt-2 text-2xl font-bold">{t.title}</h2>
            </div>

            <div className="grid gap-4">
              {t.steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-state-teal/10 text-sm font-bold text-state-tealDark">{index + 1}</span>
                  <span className="text-sm font-semibold leading-6 text-slate-700">{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                disabled={isStarting || isCompleting}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-button-gradient px-5 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:shadow-premium disabled:cursor-not-allowed disabled:opacity-70"
                type="button"
                onClick={beginTelegramLogin}
              >
                {isStarting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
                {t.start}
              </button>

              <a
                aria-disabled={!challenge}
                className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                  challenge ? "border-state-teal/30 bg-state-surface text-state-tealDark hover:border-state-gold hover:text-state-navy" : "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
                }`}
                href={challenge?.deep_link ?? "#"}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-5 w-5" />
                {t.openTelegram}
              </a>
            </div>

            {status ? (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-state-teal/20 bg-state-surface px-4 py-3 text-sm font-semibold leading-6 text-state-tealDark">
                {isCompleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Smartphone className="h-5 w-5" />}
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
          </div>
        </div>
      </Container>
    </section>
  );
}
