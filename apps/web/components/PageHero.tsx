import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function PageHero({
  badge,
  title,
  description,
  children
}: {
  badge?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f5f8fb] text-state-navy">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(0,169,155,0.14),transparent_25rem),radial-gradient(circle_at_84%_35%,rgba(47,111,174,0.12),transparent_27rem)]" />
      <div className="paper-grid absolute inset-0 opacity-45" />
      <Container className="relative py-16 md:py-20">
        <Reveal>
          {badge ? <Badge className="border-state-teal/20 bg-white text-state-tealDark shadow-sm">{badge}</Badge> : null}
          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.08] md:text-6xl">{title}</h1>
          {description ? <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{description}</p> : null}
          {children ? <div className="mt-9">{children}</div> : null}
        </Reveal>
      </Container>
    </section>
  );
}
