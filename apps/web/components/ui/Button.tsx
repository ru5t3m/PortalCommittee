import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "gold";
  className?: string;
  type?: "button" | "submit";
};

const styles = {
  primary: "bg-button-gradient text-white shadow-lift hover:shadow-premium",
  secondary: "border border-state-teal/35 bg-white/85 text-state-navy hover:border-state-teal hover:bg-white",
  ghost: "border border-white/25 bg-white/10 text-white hover:bg-white/18",
  gold: "bg-state-gold text-state-navy shadow-lg hover:bg-[#e5bd55]"
};

export function Button({ children, href, variant = "primary", className, type = "button" }: ButtonProps) {
  const classes = cn(
    "group inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
    styles[variant],
    className
  );
  const content = (
    <>
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </>
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} type={type}>
      {content}
    </button>
  );
}
