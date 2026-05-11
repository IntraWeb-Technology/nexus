const ITEMS = [
  {
    title: "Communication is direct",
    body: "No account management layer. The person you talk to in the first conversation is the person who does the work.",
  },
  {
    title: "The diagnostic is real",
    body: "It surfaces how the organization actually functions. That determines whether the work will succeed.",
  },
  {
    title: "Access matters",
    body: "Effective diagnostics require access to the people who know how the work really moves.",
  },
  {
    title: "Timelines reflect operational reality",
    body: "We work against what the organization can absorb and operationalize at each phase.",
  },
  {
    title: "The relationship is designed for continuity",
    body: "Operational infrastructure evolves. Most engagements continue past initial implementation.",
  },
] as const;

export function ExpectationList() {
  return (
    <ul className="about-expect m-0 list-none space-y-0 divide-y divide-[color:var(--about-border-inner)] border border-[color:var(--about-border)] p-0 shadow-[var(--about-shadow-sm)]">
      {ITEMS.map((item) => (
        <li key={item.title} className="flex gap-4 bg-[color:var(--about-surface)] px-4 py-5 md:gap-5 md:px-6 md:py-6">
          <span className="about-expect__mark mt-1 shrink-0 font-mono text-[11px] font-semibold text-[color:var(--about-text-muted)]" aria-hidden>
            —
          </span>
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[color:var(--about-text)] md:text-[17px]">{item.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--about-text-secondary)] md:text-[15px]">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
