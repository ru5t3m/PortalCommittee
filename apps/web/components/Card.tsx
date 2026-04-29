export function Card({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-state-navy">{title}</h3>
      {text ? <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
