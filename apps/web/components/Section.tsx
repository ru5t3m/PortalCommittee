export function Section({ title, children, tone = "light" }: { title: string; children: React.ReactNode; tone?: "light" | "white" }) {
  return (
    <section className={tone === "white" ? "bg-white" : "bg-state-surface"}>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-3xl font-bold text-state-navy">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
