export function OperatorBlock() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(240px,340px)] lg:items-start lg:gap-12">
      <div className="min-w-0 space-y-5">
        <h2 className="about-section-title text-[clamp(1.5rem,2.5vw,2.125rem)] font-semibold tracking-[-0.03em] text-[color:var(--about-text)]">
          Operator background
        </h2>
        <div className="space-y-4 text-[16px] leading-[1.68] text-[color:var(--about-text-secondary)] md:text-[17px] md:leading-[1.62]">
          <p>IntraWeb is founded and operated by John Schibelli.</p>
          <p>
            Fifteen-plus years in engineering building production systems in React, Next.js, and TypeScript across companies
            at different operational scales shaped the way this work is approached.
          </p>
          <p>
            The frustration was consistent: too much focus on individual systems, not enough on the operational layer that
            connects them. IntraWeb was built to address that layer directly.
          </p>
          <p>Clients work with the person who designs and builds the systems. More context. Better decisions. Better outcomes.</p>
        </div>
      </div>
      <div
        className="about-operator-visual relative aspect-[4/3] w-full overflow-hidden rounded-[4px] border border-[color:var(--about-border)] shadow-[var(--about-shadow-sm)]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[color:var(--about-surface-muted)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:repeating-linear-gradient(-18deg,rgba(245,166,35,0.2)_0_1px,transparent_1px_14px),repeating-linear-gradient(72deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_20px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_70%_30%,rgba(36,56,74,0.45),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-[color:var(--about-bg)] to-transparent" />
        <div className="absolute inset-x-[14%] bottom-[18%] top-[24%] rounded-[3px] border border-[color:rgba(255,255,255,0.12)] bg-[color:rgba(22,26,32,0.85)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[4px]" />
      </div>
    </div>
  );
}
