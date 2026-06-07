"use client";

import Link from "next/link";
import { Bell, Brain, CheckCircle2, ClipboardList, FileText, LogOut, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { KnbEmblem } from "@/components/KnbEmblem";
import type { Locale } from "@/lib/i18n";
import { getMe, logout, type AuthMe } from "@/lib/auth";

const copy = {
  ru: {
    title: "Личный кабинет",
    subtitle: "Персональная область для работы с заявками, уведомлениями и сервисами портала.",
    verified: "Профиль подтвержден",
    phone: "Телефон",
    fullName: "ФИО",
    firstName: "Имя",
    lastName: "Фамилия",
    editProfile: "Редактировать",
    saveProfile: "Сохранить",
    cancel: "Отмена",
    logout: "Выйти",
    actionsTitle: "Быстрые действия",
    actions: [
      { title: "Поступление на службу", text: "Открыть этапы отбора и требования к кандидатам.", href: "careers/admission", icon: ClipboardList },
      { title: "Поступление на учебу", text: "Выбрать Академию КНБ или Пограничную академию.", href: "education", icon: FileText },
      { title: "Психотестирование", text: "Перейти к тренировочным психологическим тестам.", href: "psychological-testing", icon: CheckCircle2 }
    ],
    notificationsTitle: "Уведомления",
    application: "Анкета кандидата",
    tracking: "Код заявки",
    status: "Статус",
    email: "Email",
    notifications: ["Анкета кандидата создана и сохранена в защищенной базе.", "Статус заявки будет обновляться модератором после проверки."],
    testsTitle: "Результаты психотестирований",
    testsEmptyTitle: "Пока нет результатов",
    testsEmptyText: "После прохождения психотестирования результаты появятся в этом разделе."
  },
  kk: {
    title: "Жеке кабинет",
    subtitle: "Өтінімдермен, хабарламалармен және портал сервистерімен жұмыс істеуге арналған жеке аймақ.",
    verified: "Профиль расталды",
    phone: "Телефон",
    fullName: "ТАӘ",
    firstName: "Аты",
    lastName: "Тегі",
    editProfile: "Өзгерту",
    saveProfile: "Сақтау",
    cancel: "Болдырмау",
    logout: "Шығу",
    actionsTitle: "Жылдам әрекеттер",
    actions: [
      { title: "Қызметке қабылдау", text: "Іріктеу кезеңдері мен кандидаттарға қойылатын талаптарды ашу.", href: "careers/admission", icon: ClipboardList },
      { title: "Оқуға қабылдау", text: "ҰҚК Академиясын немесе Шекара академиясын таңдау.", href: "education", icon: FileText },
      { title: "Психотест", text: "Жаттығу психологиялық тесттеріне өту.", href: "psychological-testing", icon: CheckCircle2 }
    ],
    notificationsTitle: "Хабарламалар",
    application: "Кандидат анкетасы",
    tracking: "Өтінім коды",
    status: "Мәртебе",
    email: "Email",
    notifications: ["Кандидат анкетасы қорғалған дерекқорда сақталды.", "Өтінім мәртебесін тексеруден кейін модератор жаңартады."],
    testsTitle: "Психотест нәтижелері",
    testsEmptyTitle: "Әзірге нәтиже жоқ",
    testsEmptyText: "Психотесттен өткеннен кейін нәтижелер осы бөлімде пайда болады."
  }
};

export function AccountDashboard({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = copy[locale];
  const [authState, setAuthState] = useState<AuthMe | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const next = await getMe();
        if (isMounted) {
          setAuthState(next);
          setIsChecking(false);
        }
      } catch {
        router.replace(`/${locale}/login`);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [locale, router]);

  async function handleLogout() {
    await logout();
    router.push(`/${locale}/login`);
  }

  if (isChecking || !authState) {
    return (
      <section className="min-h-[calc(100vh-77px)] bg-state-surface py-16">
        <Container>
          <div className="h-40 rounded-[1.35rem] border border-slate-200/80 bg-white/80 shadow-sm" />
        </Container>
      </section>
    );
  }

  const application = authState.candidate_application;
  const fullName = application ? `${application.first_name} ${application.last_name}` : authState.user.full_name;

  return (
    <section className="min-h-[calc(100vh-77px)] bg-[linear-gradient(180deg,#f6fbf8_0%,#ffffff_48%,#eef8f6_100%)] text-state-navy">
      <div className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_25rem),radial-gradient(circle_at_80%_60%,rgba(214,168,58,0.22),transparent_24rem)]" />
        <Container className="relative grid gap-8 py-16 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-center gap-5">
            <KnbEmblem className="h-20 w-20 shrink-0" />
            <div>
              <h1 className="text-4xl font-bold leading-tight tracking-normal md:text-5xl">{t.title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-state-gold/60 hover:text-state-gold" type="button">
            <LogOut className="h-4 w-4" />
            {t.logout}
          </button>
        </Container>
      </div>

      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-[1.35rem] border border-slate-200/80 bg-white/[0.94] p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-state-gold text-state-navy">
                <UserRound className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-state-tealDark">{t.verified}</p>
                <h2 className="mt-1 text-2xl font-bold">{fullName}</h2>
              </div>
            </div>

            <div className="mt-7 grid gap-3">
              <div className="rounded-2xl bg-state-surface p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{t.fullName}</p>
                <p className="mt-2 font-semibold">{fullName}</p>
              </div>
              <div className="rounded-2xl bg-state-surface p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{t.email}</p>
                <p className="mt-2 font-semibold">{authState.user.email ?? (authState.user.telegram_username ? `@${authState.user.telegram_username}` : authState.user.phone ?? "-")}</p>
              </div>
              {application || authState.user.phone ? (
                <div className="rounded-2xl bg-state-surface p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{t.phone}</p>
                  <p className="mt-2 inline-flex items-center gap-2 font-semibold">
                    <Phone className="h-4 w-4 text-state-tealDark" />
                    {application?.phone ?? authState.user.phone}
                  </p>
                </div>
              ) : null}
              {application ? (
                <div className="rounded-2xl bg-state-surface p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{t.application}</p>
                  <p className="mt-2 font-semibold">{t.tracking}: {application.tracking_code}</p>
                  <p className="mt-1 text-sm font-semibold text-state-tealDark">{t.status}: {application.status}</p>
                </div>
              ) : null}
              </div>
          </aside>

          <div className="grid gap-6">
            <section>
              <h2 className="text-2xl font-bold">{t.actionsTitle}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {t.actions.map((action) => (
                  <Link key={action.href} href={`/${locale}/${action.href}`} className="group rounded-[1.35rem] border border-slate-200/80 bg-white/[0.94] p-5 shadow-sm transition hover:-translate-y-1 hover:border-state-teal/45 hover:shadow-lift">
                    <action.icon className="h-7 w-7 text-state-tealDark" />
                    <h3 className="mt-4 text-lg font-bold">{action.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{action.text}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[1.35rem] border border-slate-200/80 bg-white/[0.94] p-6 shadow-sm">
              <h2 className="inline-flex items-center gap-2 text-2xl font-bold">
                <Brain className="h-5 w-5 text-state-tealDark" />
                {t.testsTitle}
              </h2>
              <div className="mt-5 rounded-2xl border border-dashed border-state-teal/30 bg-state-surface p-8 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-state-tealDark shadow-sm">
                  <Brain className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-xl font-bold text-state-navy">{t.testsEmptyTitle}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{t.testsEmptyText}</p>
              </div>
            </section>

            <article className="rounded-[1.35rem] border border-slate-200/80 bg-white/[0.94] p-6 shadow-sm">
              <h2 className="inline-flex items-center gap-2 text-2xl font-bold">
                <Bell className="h-5 w-5 text-state-gold" />
                {t.notificationsTitle}
              </h2>
              <div className="mt-4 grid gap-3">
                {t.notifications.map((notification) => (
                  <p key={notification} className="rounded-2xl bg-state-surface px-4 py-3 text-sm font-medium leading-6 text-slate-600">
                    {notification}
                  </p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </Container>
    </section>
  );
}
