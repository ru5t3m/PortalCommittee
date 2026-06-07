"use client";

import Link from "next/link";
import { ChevronDown, CircleUserRound, LogIn, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { KnbEmblem } from "@/components/KnbEmblem";
import { Container } from "@/components/ui/Container";
import { getMe, type AuthMe } from "@/lib/auth";

const links = {
  ru: [
    ["", "Главная"],
    ["about", "О Комитете"],
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

const moreCopy = {
  ru: "Еще",
  kk: "Тағы"
};

type HeaderDict = {
  brand: string;
  shortBrand: string;
  nav: string[];
};

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="whitespace-nowrap rounded-full px-3 py-2 font-medium text-white/72 transition hover:bg-white/10 hover:text-state-gold" href={href}>
      {children}
    </Link>
  );
}

function OverflowNav({ locale, dict }: { locale: Locale; dict: HeaderDict }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems = useMemo(
    () => links[locale].map(([href, label]) => ({ href: `/${locale}/${href}`, label })),
    [locale]
  );

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const calculate = () => {
      const itemWidths = Array.from(measure.querySelectorAll<HTMLElement>("[data-nav-item]")).map((item) => item.offsetWidth);
      const moreWidth = measure.querySelector<HTMLElement>("[data-more-item]")?.offsetWidth ?? 0;
      const gap = 4;
      const availableWidth = container.clientWidth;

      let usedWidth = 0;
      let nextVisibleCount = itemWidths.length;

      for (let index = 0; index < itemWidths.length; index += 1) {
        const remainingAfterItem = itemWidths.length - index - 1;
        const reserveMoreWidth = remainingAfterItem > 0 ? moreWidth + gap : 0;
        const nextWidth = usedWidth + itemWidths[index] + (index > 0 ? gap : 0) + reserveMoreWidth;

        if (nextWidth > availableWidth) {
          nextVisibleCount = index;
          break;
        }

        usedWidth += itemWidths[index] + (index > 0 ? gap : 0);
      }

      setVisibleCount(nextVisibleCount);
    };

    calculate();
    const resizeObserver = new ResizeObserver(calculate);
    resizeObserver.observe(container);
    resizeObserver.observe(measure);
    window.addEventListener("resize", calculate);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculate);
    };
  }, [navItems]);

  useEffect(() => {
    if (!isMoreOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMoreOpen]);

  const visibleItems = navItems.slice(0, visibleCount);
  const hiddenItems = navItems.slice(visibleCount);

  return (
    <div ref={containerRef} className="relative hidden min-w-0 flex-1 items-center justify-center text-sm lg:flex">
      <nav className="flex min-w-0 items-center gap-1" aria-label="Main navigation">
        {visibleItems.map((item) => (
          <HeaderLink key={item.href} href={item.href}>
            {item.label}
          </HeaderLink>
        ))}
        {hiddenItems.length > 0 ? (
          <details ref={detailsRef} open={isMoreOpen} onToggle={(event) => setIsMoreOpen(event.currentTarget.open)} className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 font-semibold text-white/76 transition hover:bg-white/10 hover:text-state-gold">
              {moreCopy[locale]}
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.7rem)] z-50 w-72 overflow-hidden rounded-2xl border border-white/15 bg-[#071f3a] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
              {hiddenItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMoreOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-white/78 transition hover:bg-white/10 hover:text-state-gold">
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        ) : null}
      </nav>

      <div ref={measureRef} className="pointer-events-none invisible absolute left-0 top-0 flex items-center gap-1 whitespace-nowrap" aria-hidden="true">
        {navItems.map((item) => (
          <span key={item.href} data-nav-item className="rounded-full px-3 py-2 font-medium">
            {item.label}
          </span>
        ))}
        <span data-more-item className="inline-flex items-center gap-1 rounded-full px-3 py-2 font-semibold">
          {moreCopy[locale]}
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
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
    <details className="relative lg:hidden">
      <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-full text-white/72 transition hover:bg-white/10 hover:text-state-gold" aria-label="Open menu">
        <Menu size={21} />
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.7rem)] z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/15 bg-[#071f3a] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        {links[locale].map(([href, label]) => (
          <Link key={href} href={`/${locale}/${href}`} className="block rounded-xl px-4 py-3 text-sm font-semibold text-white/78 transition hover:bg-white/10 hover:text-state-gold">
            {label}
          </Link>
        ))}
        <div className="my-2 h-px bg-white/10" />
        {authState ? (
          <Link href={`/${locale}/account`} className="flex items-center gap-2 rounded-xl bg-state-gold px-4 py-3 text-sm font-semibold text-state-navy transition hover:bg-[#e5bd55]">
            <CircleUserRound className="h-4 w-4" />
            {name}
          </Link>
        ) : (
          <Link href={`/${locale}/login`} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/10 hover:text-state-gold">
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
    <header className="sticky top-0 z-[1200] border-b border-white/10 bg-[#06182d] text-white shadow-[0_14px_40px_rgba(6,24,45,0.24)] backdrop-blur-2xl">
      <div className="h-1 bg-[linear-gradient(90deg,#00a99b,#f8b133,#c11724,#00a99b)]" />
      <Container className="flex items-center justify-between gap-3 py-3 xl:gap-4">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-3">
          <KnbEmblem className="h-12 w-12 shrink-0" />
          <span className="text-sm font-semibold uppercase tracking-wide text-white">{dict.shortBrand}</span>
        </Link>
        <OverflowNav locale={locale} dict={dict} />
        <div className="flex shrink-0 items-center gap-2">
          <AccessibilityToggle />
          <div className="hidden gap-1 sm:flex">
            {(["kk", "ru"] as const).map((item) => (
              <Link key={item} className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition ${item === locale ? "bg-state-gold text-state-navy" : "text-white/55 hover:bg-white/10 hover:text-white"}`} href={`/${item}`}>
                {item}
              </Link>
            ))}
          </div>
          <MobileMenu locale={locale} dict={dict} auth={auth} authState={authState} />
          {authState ? (
            <Link href={`/${locale}/account`} className="hidden h-10 w-10 place-items-center rounded-full bg-state-gold text-state-navy shadow-lg shadow-black/10 transition hover:bg-[#e5bd55] sm:grid" aria-label={name}>
              <CircleUserRound className="h-5 w-5" />
            </Link>
          ) : (
            <Link href={`/${locale}/login`} className="hidden min-h-10 items-center gap-2 rounded-full bg-state-gold px-4 py-2 text-sm font-semibold text-state-navy shadow-lg shadow-black/10 transition hover:bg-[#e5bd55] sm:inline-flex">
              <LogIn className="h-4 w-4" />
              {auth.login}
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}
