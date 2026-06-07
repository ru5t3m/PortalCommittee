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
    <section className="relative overflow-hidden bg-brand-gradient text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_25rem),radial-gradient(circle_at_80%_60%,rgba(214,168,58,0.22),transparent_24rem)]" />
      <Container className="relative py-20 md:py-24">
        <Reveal>
          {badge ? <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">{badge}</Badge> : null}
          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-tight md:text-7xl">{title}</h1>
          {description ? <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">{description}</p> : null}
          {children ? <div className="mt-9">{children}</div> : null}
        </Reveal>
      </Container>
    </section>
  );
}
