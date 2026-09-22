"use client";

import Link from "next/link";
import { CircleUserRound, LogIn, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { KnbEmblem } from "@/components/KnbEmblem";
import { Container } from "@/components/ui/Container";
import { getMe, type AuthMe } from "@/lib/auth";

const links = {
  ru: [
    ["", "Главная"],
    ["about", "О КНБ РК"],
    ["activities", "Направления деятельности"],
    ["careers/admission", "Поступление на службу"],
    ["education", "Поступление на учебу"],
    ["psychological-testing", "Психотестирование"],
    ["documents", "Нормативная база"],
    ["contacts", "Контакты"]
  ],
  kk: [
    ["", "Басты бет"],
    ["about", "Комитет туралы"],
    ["activities", "Қызмет бағыттары"],
    ["careers/admission", "Қызметке қабылдау"],
    ["education", "Оқуға қабылдау"],
    ["psychological-testing", "Психотест"],
    ["documents", "Нормативтік база"],
    ["contacts", "Байланыс"]
  ]
} as const;

const authCopy = {
  ru: {
    login: "Вход"
  },
  kk: {
    login: "Кіру"
  }
};

type HeaderDict = {
  brand: string;
  shortBrand: string;
  nav: string[];
};

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="whitespace-nowrap rounded-xl border border-transparent px-3 py-2.5 text-[13px] font-semibold text-state-navy/80 transition hover:border-state-teal/20 hover:bg-[#eef8f7] hover:text-state-tealDark" href={href}>
      {children}
    </Link>
  );
}

function DesktopNav({ locale }: { locale: Locale }) {
  return (
    <div className="hidden border-t border-slate-200/80 xl:block">
      <Container>
        <nav className="flex items-center justify-between gap-1 py-2" aria-label="Main navigation">
          {links[locale].map(([href, label]) => (
            <HeaderLink key={href} href={`/${locale}/${href}`}>
              {label}
            </HeaderLink>
          ))}
        </nav>
      </Container>
    </div>
  );
}

function displayName(authState: AuthMe | null) {
  if (!authState) return "";
  const candidate = authState.candidate_application;
  return candidate ? `${candidate.first_name} ${candidate.last_name}` : authState.user.full_name;
}

function MobileMenu({ locale, dict, auth, authState }: { locale: Locale; dict: HeaderDict; auth: (typeof authCopy)[Locale]; authState: AuthMe | null }) {
  const name = displayName(authState);
  return (
    <details className="relative xl:hidden">
      <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 bg-slate-50 text-state-navy/75 transition hover:border-state-teal/25 hover:bg-[#eef8f7] hover:text-state-tealDark" aria-label="Open menu">
        <Menu size={21} />
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.7rem)] z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(6,27,51,0.16)]">
        {links[locale].map(([href, label]) => (
          <Link key={href} href={`/${locale}/${href}`} className="block rounded-xl px-4 py-3 text-sm font-semibold text-state-navy/80 transition hover:bg-[#eef8f7] hover:text-state-tealDark">
            {label}
          </Link>
        ))}
        <div className="my-2 h-px bg-slate-200" />
        {authState ? (
          <Link href={`/${locale}/account`} className="flex items-center gap-2 rounded-xl bg-state-gold px-4 py-3 text-sm font-semibold text-state-navy transition hover:bg-[#e5bd55]">
            <CircleUserRound className="h-4 w-4" />
            {name}
          </Link>
        ) : (
          <Link href={`/${locale}/login`} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-state-navy/80 transition hover:bg-[#eef8f7] hover:text-state-tealDark">
            <LogIn className="h-4 w-4" />
            {auth.login}
          </Link>
        )}
      </div>
    </details>
  );
}

export function Header({ locale, dict }: { locale: Locale; dict: { brand: string; shortBrand: string; nav: string[] } }) {
  const auth = authCopy[locale];
  const [authState, setAuthState] = useState<AuthMe | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAuthState = async () => {
      try {
        const next = await getMe();
        if (isMounted) setAuthState(next);
      } catch {
        if (isMounted) setAuthState(null);
      }
    };

    void loadAuthState();
    const handleAuthChange = () => void loadAuthState();
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("knb-auth-changed", handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("knb-auth-changed", handleAuthChange);
    };
  }, []);

  const name = displayName(authState);

  return (
    <header className="sticky top-0 z-[1200] border-b border-slate-200 bg-white text-state-navy shadow-[0_10px_32px_rgba(6,24,45,0.08)]">
      <div className="h-[3px] bg-[linear-gradient(90deg,#00a99b,#2f6fae,#d6a83a)]" />
      <Container className="flex items-center justify-between gap-3 py-3 xl:gap-4">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-3">
          <KnbEmblem className="h-12 w-12 shrink-0" />
          <span className="text-sm font-bold uppercase tracking-wide text-state-navy">{dict.shortBrand}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <AccessibilityToggle />
          <div className="hidden gap-1 sm:flex">
            {(["kk", "ru"] as const).map((item) => (
              <Link key={item} className={`grid h-9 min-w-9 place-items-center rounded-xl px-2.5 text-xs font-bold uppercase transition ${item === locale ? "bg-state-navy text-white shadow-sm" : "border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-state-navy"}`} href={`/${item}`}>
                {item}
              </Link>
            ))}
          </div>
          <MobileMenu locale={locale} dict={dict} auth={auth} authState={authState} />
          {authState ? (
            <Link href={`/${locale}/account`} className="hidden h-10 w-10 place-items-center rounded-xl bg-state-navy text-white shadow-lg shadow-state-navy/10 transition hover:bg-state-tealDark sm:grid" aria-label={name}>
              <CircleUserRound className="h-5 w-5" />
            </Link>
          ) : (
            <Link href={`/${locale}/login`} className="hidden min-h-10 items-center gap-2 rounded-xl bg-state-navy px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-state-navy/10 transition hover:bg-state-tealDark sm:inline-flex">
              <LogIn className="h-4 w-4" />
              {auth.login}
            </Link>
          )}
        </div>
      </Container>
      <DesktopNav locale={locale} />
    </header>
  );
}
