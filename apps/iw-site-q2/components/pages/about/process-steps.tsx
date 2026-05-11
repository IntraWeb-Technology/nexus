const STEPS = [
  {
    title: "Operational intake",
    body: "Initial conversation, context gathering, and access to the people who know how work actually moves.",
  },
  {
    title: "Diagnostic",
    body: "Systems inventory, gap identification, operational assessment, and scope determination.",
  },
  {
    title: "Infrastructure design",
    body: "Architecture decisions, system relationships, and implementation sequencing.",
  },
  {
    title: "Implementation",
    body: "Phased build, running systems delivered at each phase, and client ownership throughout.",
  },
  {
    title: "Operational continuity",
    body: "Monitoring, adjustment, ongoing support, and evolution as the company scales.",
  },
] as const;

export function ProcessSteps() {
  return (
    <ol className="about-process m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-5 lg:gap-3 xl:gap-4">
      {STEPS.map((step, i) => (
        <li key={step.title} className="min-h-0">
          <article className="about-process-card flex h-full min-h-full flex-col border border-[color:var(--about-border)] bg-[color:var(--about-surface)] p-5 shadow-[var(--about-shadow-sm)] lg:border-[color:var(--about-border-soft)] lg:p-4 xl:p-5">
            <span className="about-process-num font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--about-text-muted)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[color:var(--about-text)] xl:text-base">
              {step.title}
            </h3>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[color:var(--about-text-secondary)] xl:text-[14px]">{step.body}</p>
          </article>
        </li>
      ))}
    </ol>
  );
}
