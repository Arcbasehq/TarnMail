export default function EmailThreading() {
  const threads = [
    {
      subject: "Q4 budget review",
      count: 12,
      participants: ["Sarah K.", "Mike T.", "You"],
      lastActive: "2m ago",
    },
    {
      subject: "Product launch feedback",
      count: 8,
      participants: ["Alex R.", "You", "Jamie L."],
      lastActive: "15m ago",
    },
    {
      subject: "Design system updates",
      count: 23,
      participants: ["Chris M.", "You"],
      lastActive: "1h ago",
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <h2 className="font-display text-4xl tracking-tight text-slate-900">
          Conversations, not clutter.
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Every thread unified, every reply in context.
        </p>
      </div>

      <div className="mt-12 space-y-4">
        {threads.map((thread) => (
          <div
            key={thread.subject}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-accent/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{thread.subject}</h3>
                <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/10 px-1.5 text-xs font-medium text-accent">
                      {thread.count}
                    </span>
                    replies
                  </span>
                  <span>·</span>
                  <span>{thread.participants.join(", ")}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400">{thread.lastActive}</span>
            </div>

            <div className="mt-4 flex gap-1.5">
              {Array.from({ length: Math.min(thread.count, 8) }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-accent/20 to-accent/40"
                  style={{ opacity: 1 - i * 0.1 }}
                />
              ))}
              {thread.count > 8 && (
                <div className="flex h-1.5 items-center px-2 text-xs text-slate-400">
                  +{thread.count - 8}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
