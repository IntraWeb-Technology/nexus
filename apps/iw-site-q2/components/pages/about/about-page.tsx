import Link from "next/link";
import { AboutCTA } from "./about-cta";
import { AboutHero } from "./about-hero";
import { AboutSection } from "./about-section";
import { ComparisonTable } from "./comparison-table";
import { ExpectationList } from "./expectation-list";
import { OperatorBlock } from "./operator-block";
import { ProcessSteps } from "./process-steps";
import { SystemTypeCards } from "./system-type-cards";
import { TaxonomyGrid } from "./taxonomy-grid";

export function AboutPageContent() {
  return (
    <main className="about-page min-h-screen bg-[color:var(--about-bg)] pb-[var(--space-page-bottom)] pt-[calc(var(--nav-h)+1rem)] text-[color:var(--about-text)]">
      <div className="border-b border-[color:var(--about-border)] bg-[color:var(--about-bg)]">
        <AboutHero />
      </div>

      <AboutSection aria-labelledby="builds-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14 xl:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <p className="about-builds-kicker mb-5 flex items-stretch gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--about-text-muted)]">
              <span className="w-0.5 shrink-0 rounded-full bg-[color:var(--accent)]" aria-hidden />
              <span>What IntraWeb builds</span>
            </p>
            <h2
              id="builds-title"
              className="max-w-[min(42ch,620px)] text-[clamp(1.5rem,2.8vw,2.375rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[color:var(--about-text)]"
            >
              Operational systems built at the intersection of people, systems, and data.
            </h2>
            <p className="about-prose m-0 mt-7 space-y-4 text-[16px] leading-[1.68] text-[color:var(--about-text-secondary)] md:text-[17px] md:leading-[1.62] md:space-y-5">
              <span className="block">
                Different companies have different operational gaps. The systems we build sit at the intersection of
                infrastructure, automation, custom platforms, and AI implementation.
              </span>
              <span className="block">
                The goal is not a single tool or workflow. It is the operational layer that connects systems, people, and
                data so the whole environment functions.
              </span>
            </p>
            <p className="mt-8">
              <Link href="/services" className="about-inline-link">
                Explore what we build <span aria-hidden>→</span>
              </Link>
            </p>
          </div>
          <TaxonomyGrid />
        </div>
      </AboutSection>

      <AboutSection aria-labelledby="engagements-title" variant="muted">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16 xl:gap-20">
          <div className="max-w-md lg:max-w-none">
            <h2 id="engagements-title" className="about-section-title text-[clamp(1.5rem,2.5vw,2.125rem)]">
              How engagements work
            </h2>
            <div className="about-prose mt-7 space-y-4 text-[16px] leading-[1.68] text-[color:var(--about-text-secondary)] md:text-[17px] md:leading-[1.62]">
              <p>
                Every engagement starts with understanding how your organization actually functions, not how it is supposed to
                function.
              </p>
              <p>
                From there, we design and build the operational infrastructure that creates durable change in phases, with you.
              </p>
            </div>
            <p className="mt-8">
              <Link href="/diagnostic" className="about-inline-link">
                See the process <span aria-hidden>→</span>
              </Link>
            </p>
          </div>
          <ProcessSteps />
        </div>
      </AboutSection>

      <AboutSection aria-labelledby="built-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16 xl:gap-20">
          <div className="max-w-md lg:max-w-none">
            <h2 id="built-title" className="about-section-title text-[clamp(1.5rem,2.5vw,2.125rem)]">
              What gets built
            </h2>
            <p className="about-prose mt-7 text-[16px] leading-[1.68] text-[color:var(--about-text-secondary)] md:text-[17px] md:leading-[1.62]">
              We build operational systems that run your business end to end.
            </p>
            <p className="mt-8">
              <Link href="/services" className="about-inline-link">
                View system types <span aria-hidden>→</span>
              </Link>
            </p>
          </div>
          <SystemTypeCards />
        </div>
      </AboutSection>

      <AboutSection aria-labelledby="why-title" variant="muted">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
          <div>
            <h2 id="why-title" className="about-section-title text-[clamp(1.5rem,2.5vw,2.125rem)]">
              Why the approach is different
            </h2>
            <p className="about-prose mt-7 text-[16px] leading-[1.68] text-[color:var(--about-text-secondary)] md:text-[17px] md:leading-[1.62]">
              Most engagements deliver recommendations, tools, or documentation while leaving the operational environment largely
              unexamined. IntraWeb is structured differently.
            </p>
            <div className="mt-10 md:mt-12">
              <ComparisonTable />
            </div>
          </div>
          <section aria-labelledby="expect-title">
            <h2 id="expect-title" className="about-section-title text-[clamp(1.5rem,2.5vw,2.125rem)]">
              What to expect
            </h2>
            <p className="about-prose mt-7 text-[16px] leading-[1.68] text-[color:var(--about-text-secondary)] md:text-[17px] md:leading-[1.62]">
              A few things worth knowing before reaching out.
            </p>
            <div className="mt-8">
              <ExpectationList />
            </div>
          </section>
        </div>
      </AboutSection>

      <AboutSection>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <OperatorBlock />
          <AboutCTA />
        </div>
      </AboutSection>
    </main>
  );
}
