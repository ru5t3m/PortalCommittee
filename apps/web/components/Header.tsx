import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { headerLinks } from "@/lib/header-navigation";
import { HeaderControls, HeaderLink } from "@/components/HeaderControls";
import { KnbEmblem } from "@/components/KnbEmblem";
import { Container } from "@/components/ui/Container";

export function Header({ locale, dict }: { locale: Locale; dict: { shortBrand: string } }) {
  return (
    <header className="sticky top-0 z-[1200] border-b border-slate-200 bg-white text-state-navy shadow-[0_10px_32px_rgba(6,24,45,0.08)]">
      <div className="h-[3px] bg-[linear-gradient(90deg,#00a99b,#2f6fae,#d6a83a)]" />
      <Container className="flex items-center justify-between gap-3 py-3 xl:gap-4">
        <Link prefetch={false} href={`/${locale}`} className="flex shrink-0 items-center gap-3">
          <KnbEmblem className="h-12 w-12 shrink-0" />
          <span className="text-sm font-bold uppercase tracking-wide text-state-navy">{dict.shortBrand}</span>
        </Link>
        <HeaderControls locale={locale} />
      </Container>
      <div className="hidden border-t border-slate-200/80 xl:block">
        <Container>
          <nav className="flex items-center justify-between gap-1 py-2" aria-label={locale === "ru" ? "Основная навигация" : "Негізгі навигация"}>
            {headerLinks[locale].map(([href, label]) => <HeaderLink key={href} href={`/${locale}/${href}`}>{label}</HeaderLink>)}
          </nav>
        </Container>
      </div>
    </header>
  );
}
