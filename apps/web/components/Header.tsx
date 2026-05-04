import Link from "next/link";
import { Menu, Search } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { KnbEmblem } from "@/components/KnbEmblem";
import { Container } from "@/components/ui/Container";

const links = [
  ["", 0],
  ["about", 1],
  ["activities", 2],
  ["press", 3],
  ["careers/admission", 4],
  ["psychological-testing", 5],
  ["documents", 6],
  ["contacts", 7]
] as const;

export function Header({ locale, dict }: { locale: Locale; dict: { brand: string; shortBrand: string; nav: string[] } }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06182d] text-white shadow-[0_14px_40px_rgba(6,24,45,0.24)] backdrop-blur-2xl">
      <div className="h-1 bg-[linear-gradient(90deg,#00a99b,#f8b133,#c11724,#00a99b)]" />
      <Container className="flex items-center justify-between gap-4 py-3">
        <Link href={`/${locale}`} className="flex min-w-0 items-center gap-3">
          <KnbEmblem className="h-12 w-12" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold uppercase tracking-wide text-white">{dict.shortBrand}</span>
            <span className="block truncate text-xs text-white/58">{dict.brand}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm lg:flex" aria-label="Main navigation">
          {links.map(([href, index]) => (
            <Link className="rounded-full px-3 py-2 font-medium text-white/72 transition hover:bg-white/10 hover:text-state-gold" key={href} href={`/${locale}/${href}`}>
              {dict.nav[index]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/search`} className="rounded-full p-2 text-white/72 transition hover:bg-white/10 hover:text-state-gold" aria-label="Search">
            <Search size={20} />
          </Link>
          <AccessibilityToggle />
          <div className="hidden gap-1 sm:flex">
            {(["kk", "ru"] as const).map((item) => (
              <Link key={item} className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition ${item === locale ? "bg-state-gold text-state-navy" : "text-white/55 hover:bg-white/10 hover:text-white"}`} href={`/${item}`}>
                {item}
              </Link>
            ))}
          </div>
          <button className="rounded-full p-2 text-white/72 transition hover:bg-white/10 hover:text-state-gold lg:hidden" aria-label="Open menu" type="button">
            <Menu size={21} />
          </button>
        </div>
      </Container>
    </header>
  );
}
