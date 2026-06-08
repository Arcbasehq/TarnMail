export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Connect your accounts",
      desc: "Sign in with Gmail, Outlook, or Yahoo via official OAuth. We never see your password. Only a scoped, encrypted token.",
      visual: (
        <div className="flex flex-wrap gap-2">
          {["Gmail", "Outlook", "Yahoo"].map((p) => (
            <span
              key={p}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      num: "02",
      title: "One unified timeline",
      desc: "All mail from every account lands in a single chronological feed. No tab-switching. No inbox roulette.",
      visual: (
        <div className="space-y-2">
          {[
            { from: "sarah@acme.com", subject: "Q4 budget review", time: "2m", account: "work" },
            { from: "alex@startup.io", subject: "Launch feedback", time: "15m", account: "personal" },
            { from: "chris@design.co", subject: "Design system v3", time: "1h", account: "freelance" },
          ].map((m) => (
            <div
              key={m.subject}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-2.5 text-sm"
            >
              <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
              <span className="font-medium text-slate-900 w-36 truncate">{m.from}</span>
              <span className="flex-1 text-slate-600 truncate">{m.subject}</span>
              <span className="text-xs text-slate-400 shrink-0">{m.time}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      num: "03",
      title: "Search everything, reply anywhere",
      desc: "Full-text search across all accounts. Reply from any address without leaving the app. Your tokens stay encrypted at rest.",
      visual: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
            <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm text-slate-700">"Q4 budget" — 3 results across 2 accounts</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Tokens encrypted · No content mining · Zero tracking</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          How it works
        </p>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-900">
          Three steps to a unified inbox.
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Connect your accounts, see all mail in one timeline, search and reply across every inbox. No migrations, no password resets.
        </p>
      </div>

      <div className="mt-14 space-y-10">
        {steps.map((step, i) => (
          <div
            key={step.num}
            className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center"
          >
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <span className="font-mono text-sm text-accent">{step.num}</span>
              <h3 className="mt-2 font-display text-2xl tracking-tight text-slate-900">
                {step.title}
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
            <div
              className={`rounded-2xl border border-slate-200 bg-slate-50/50 p-6 ${
                i % 2 === 1 ? "lg:order-1" : ""
              }`}
            >
              {step.visual}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
