export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-br from-indigo-50/70 via-white to-white">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
        <p className="rise font-mono text-xs uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
        <h1
          className="rise mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl"
          style={{ animationDelay: "100ms" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="rise mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600"
            style={{ animationDelay: "200ms" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
