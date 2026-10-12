"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleUserRound, LogIn, Menu } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { getMe, type AuthMe } from "@/lib/auth";

import { headerLinks as links } from "@/lib/header-navigation";

const authCopy = {
  ru: {
    login: "Вход"
  },
  kk: {
    login: "Кіру"
  }
};

export function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Link prefetch={false} onMouseEnter={() => router.prefetch(href)} onFocus={() => router.prefetch(href)} className="whitespace-nowrap rounded-xl border border-transparent px-3 py-2.5 text-[13px] font-semibold text-state-navy/80 transition hover:border-state-teal/20 hover:bg-[#eef8f7] hover:text-state-tealDark" href={href}>
      {children}
    </Link>
  );
}

function displayName(authState: AuthMe | null) {
  if (!authState) return "";
  const candidate = authState.candidate_application;
  return candidate ? `${candidate.first_name} ${candidate.last_name}` : authState.user.full_name;
}

function LanguageSwitcher({ locale, className }: { locale: Locale; className: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <div className={className}>
      {(["kk", "ru"] as const).map((item) => {
        const path = pathname.replace(/^\/(kk|ru)(?=\/|$)/, `/${item}`);
        const href = `${path}${query ? `?${query}` : ""}`;
        return (
          <a key={item} href={href} hrefLang={item} lang={item} aria-label={item === "ru" ? "Русский" : "Қазақша"}
            aria-current={item === locale ? "true" : undefined}
            onClick={(event) => {
              const target = new URL(href, window.location.origin);
              target.hash = window.location.hash;
              event.currentTarget.href = target.href;
            }}
            className={`grid h-9 min-w-9 place-items-center rounded-xl px-2.5 text-xs font-bold uppercase transition ${item === locale ? "bg-state-navy text-white shadow-sm" : "border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-state-navy"}`}>
            {item}
          </a>
        );
      })}
    </div>
  );
}

function MobileMenu({ locale, auth, authState }: { locale: Locale; auth: (typeof authCopy)[Locale]; authState: AuthMe | null }) {
  const name = displayName(authState);
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => { if (ref.current) ref.current.open = false; }, [pathname]);
  return (
    <details ref={ref} onKeyDown={event => {
      if (event.key === "Escape" && event.currentTarget.open) {
        event.preventDefault(); event.currentTarget.open = false;
        event.currentTarget.querySelector("summary")?.focus();
      }
    }} className="relative xl:hidden">
      <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 bg-slate-50 text-state-navy/75 transition hover:border-state-teal/25 hover:bg-[#eef8f7] hover:text-state-tealDark" aria-label={locale === "ru" ? "Меню" : "Мәзір"}>
        <Menu size={21} />
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.7rem)] z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(6,27,51,0.16)]">
        <Suspense>
          <LanguageSwitcher locale={locale} className="flex gap-1 px-4 py-2 sm:hidden" />
        </Suspense>
        {links[locale].map(([href, label]) => (
          <Link prefetch={false} key={href} href={`/${locale}/${href}`} className="block rounded-xl px-4 py-3 text-sm font-semibold text-state-navy/80 transition hover:bg-[#eef8f7] hover:text-state-tealDark">
            {label}
          </Link>
        ))}
        <div className="my-2 h-px bg-slate-200" />
        {authState ? (
          <Link prefetch={false} href={`/${locale}/account`} className="flex items-center gap-2 rounded-xl bg-state-gold px-4 py-3 text-sm font-semibold text-state-navy transition hover:bg-[#e5bd55]">
            <CircleUserRound className="h-4 w-4" />
            {name}
          </Link>
        ) : (
          <Link prefetch={false} href={`/${locale}/login`} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-state-navy/80 transition hover:bg-[#eef8f7] hover:text-state-tealDark">
            <LogIn className="h-4 w-4" />
            {auth.login}
          </Link>
        )}
      </div>
    </details>
  );
}

export function HeaderControls({ locale }: { locale: Locale }) {
  const auth = authCopy[locale];
  const [authState, setAuthState] = useState<AuthMe | null>(null);

  useEffect(() => {
    let isMounted = true;
    let requestId = 0;
    const loadAuthState = async () => {
      const currentRequest = ++requestId;
      try {
        const next = await getMe();
        if (isMounted && currentRequest === requestId) setAuthState(next);
      } catch {
        if (isMounted && currentRequest === requestId) setAuthState(null);
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
        <div className="flex shrink-0 items-center gap-2">
          <AccessibilityToggle locale={locale} />
          <Suspense>
            <LanguageSwitcher locale={locale} className="hidden gap-1 sm:flex" />
          </Suspense>
          <MobileMenu locale={locale} auth={auth} authState={authState} />
          {authState ? (
            <Link prefetch={false} href={`/${locale}/account`} className="hidden h-10 w-10 place-items-center rounded-xl bg-state-navy text-white shadow-lg shadow-state-navy/10 transition hover:bg-state-tealDark sm:grid" aria-label={name}>
              <CircleUserRound className="h-5 w-5" />
            </Link>
          ) : (
            <Link prefetch={false} href={`/${locale}/login`} className="hidden min-h-10 items-center gap-2 rounded-xl bg-state-navy px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-state-navy/10 transition hover:bg-state-tealDark sm:inline-flex">
              <LogIn className="h-4 w-4" />
              {auth.login}
            </Link>
          )}
        </div>
  );
}
