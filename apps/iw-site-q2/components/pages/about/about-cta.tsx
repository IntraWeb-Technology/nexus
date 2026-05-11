import Link from "next/link";

export function AboutCTA() {
  return (
    <div className="about-cta-panel relative flex flex-col overflow-hidden rounded-[3px] border border-[color:var(--about-border)] bg-[color:var(--about-surface)] p-7 shadow-[var(--about-shadow-md)] md:p-9">
      <div className="about-cta-strip absolute left-0 top-0 h-full w-[3px]" aria-hidden />
      <h2 className="about-section-title pl-1 text-[clamp(1.5rem,2.5vw,2.125rem)] font-semibold tracking-[-0.03em] text-[color:var(--about-text)]">
        Start a conversation
      </h2>
      <div className="mt-5 space-y-4 pl-1 text-[16px] leading-[1.68] text-[color:var(--about-text-secondary)] md:text-[17px] md:leading-[1.62]">
        <p>
          If what is on this page matches what you are dealing with operationally, the right next step is a conversation.
        </p>
        <p>
          Start with your operational context — what is working, what is not, and where the gaps are creating the most
          friction.
        </p>
        <p>From there, we will assess whether the work is a fit and what an engagement would realistically look like.</p>
      </div>
      <div className="mt-9 pl-1">
        <Link href="/contact" className="about-cta-btn inline-flex items-center gap-2.5">
          <span>Contact / Start a conversation</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
      <p className="mt-5 border-t border-[color:var(--about-border-inner)] pt-5 pl-1 font-mono text-[12px] leading-snug text-[color:var(--about-text-muted)] md:text-[13px]">
        First conversation is diagnostic, not sales.
      </p>
    </div>
  );
}
