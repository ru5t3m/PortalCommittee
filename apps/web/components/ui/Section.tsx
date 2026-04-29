import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
  dark = false
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section className={cn("py-20 md:py-24", dark ? "bg-state-navy text-white" : "bg-transparent", className)}>
      <Container>
        <Reveal>
          <div className="max-w-3xl">
            {eyebrow ? <Badge className={dark ? "border-white/15 bg-white/10 text-state-gold" : undefined}>{eyebrow}</Badge> : null}
            <h2 className={cn("mt-4 text-balance text-3xl font-bold leading-tight md:text-5xl", dark ? "text-white" : "text-state-navy")}>{title}</h2>
            {description ? <p className={cn("mt-5 text-lg leading-8", dark ? "text-white/72" : "text-slate-600")}>{description}</p> : null}
          </div>
        </Reveal>
        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}
