import Image from "next/image";
import Link from "next/link";

import "./about-reference.css";

const TIMELINE = [
  { n: "01", title: "Operational intake", body: "Initial conversation, context gathering, and access to the people who know how work actually moves." },
  { n: "02", title: "Diagnostic", body: "Systems inventory, gap identification, operational assessment, and scope determination." },
  { n: "03", title: "Infrastructure design", body: "Architecture decisions, system relationships, and implementation sequencing." },
  { n: "04", title: "Implementation", body: "Phased build, running systems delivered at each phase, and client ownership throughout." },
  { n: "05", title: "Operational continuity", body: "Monitoring, adjustment, ongoing support, and evolution as the company scales." },
] as const;

const SYSTEM_ROWS = [
  { icon: "⌘", title: "Workflow automation", body: "Triggered systems that move work forward without manual handoffs." },
  { icon: "AI", title: "AI-native infrastructure", body: "AI systems designed into your operational environment from the start." },
  { icon: "▥", title: "Reporting systems", body: "Operational reporting that pulls from where work actually happens." },
  { icon: "◫", title: "Client platforms", body: "Custom portals that give clients visibility and control without manual updates." },
  { icon: "◎", title: "CRM and sales ops", body: "CRM infrastructure connected to fulfillment, delivery, and revenue recognition." },
  { icon: "↔", title: "System integrations", body: "Connections between tools that were never designed to work together." },
] as const;

const COMPARISON = [
  ["Scope is defined before the operational environment is understood.", "Diagnostic precedes scope. The operational environment determines what gets built."],
  ["Recommendations are delivered for the client to implement.", "Running infrastructure is delivered. The client owns working systems, not a framework."],
  ["AI is added onto existing workflows.", "AI is designed into operational infrastructure from the start."],
  ["The engagement ends at delivery.", "Operational continuity is built into the relationship."],
] as const;

const EXPECTATIONS = [
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

export function AboutPageContent() {
  return (
    <main className="about-ref about-page min-h-screen pb-[var(--space-page-bottom)]">
      <section className="about-hero" aria-labelledby="about-hero-heading">
        <div className="about-hero__bg" aria-hidden>
          <Image
            src="/from-chaos-to-clarity.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ objectPosition: "38% center" }}
          />
          <div className="about-hero__scrim" />
          <div className="about-hero__fade" />
        </div>
        <div className="about-container about-hero__inner">
          <div className="about-hero__grid">
            <div className="hero-copy">
              <p className="mono about-hero__eyebrow">About IntraWeb</p>
              <h1 id="about-hero-heading">Operational systems built for how your company actually works.</h1>
              <p>We build the infrastructure, automation, and AI systems that turn operational complexity into clarity.</p>
            </div>
            <div className="hero-overlay">
              <p>
                IntraWeb builds integrated operational systems for companies that need their tools, workflows, and people
                to function as one environment.
              </p>
              <p>The work sits at the intersection of systems architecture, workflow automation, and AI implementation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section light" aria-labelledby="builds-title">
        <div className="about-container split systems">
          <div className="section-intro">
            <p className="eyebrow dark">What IntraWeb builds</p>
            <h2 id="builds-title">What IntraWeb builds</h2>
            <p>Different companies have different operational gaps.</p>
            <p>
              The systems we build sit at the intersection of infrastructure, automation, custom platforms, and AI implementation.
            </p>
            <p>
              The goal is not a single tool or workflow. It is the operational layer that connects systems, people, and data so
              the whole environment functions.
            </p>
            <Link href="/services">
              Explore what we build <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="system-list">
            {SYSTEM_ROWS.map((row) => (
              <article key={row.title}>
                <span className="mini-icon" aria-hidden>
                  {row.icon}
                </span>
                <div>
                  <h3>{row.title}</h3>
                  <p>{row.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section dark" aria-labelledby="engagements-title">
        <div className="about-container split process-section">
          <div className="section-intro">
            <p className="eyebrow">How engagements work</p>
            <h2 id="engagements-title">How engagements work</h2>
            <p>
              Every engagement starts with understanding how your organization actually functions, not how it is supposed to function.
            </p>
            <p>From there, we design and build the operational infrastructure that creates durable change in phases, with you.</p>
            <Link href="/diagnostic">
              See the process <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="timeline">
            {TIMELINE.map((step) => (
              <article key={step.n}>
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section dark" aria-labelledby="why-title">
        <div className="about-container two-panel">
          <div>
            <p className="eyebrow">Why IntraWeb</p>
            <h2 id="why-title">Why the approach is different</h2>
            <p>
              Most engagements deliver recommendations, tools, or documentation while leaving the operational environment largely
              unexamined.
            </p>

            <div className="comparison">
              <div className="head">Most engagements</div>
              <div className="head">IntraWeb engagements</div>
              {COMPARISON.flatMap(([most, intra], i) => [
                <p key={`most-${i}`}>{most}</p>,
                <p key={`intra-${i}`}>{intra}</p>,
              ])}
            </div>
          </div>

          <div>
            <p className="eyebrow">What to expect</p>
            <h2 id="expect-title">What to expect</h2>
            <p>A few things worth knowing before reaching out.</p>

            <div className="expectations">
              {EXPECTATIONS.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-section light final" aria-label="Operator background and contact">
        <div className="about-container closing-grid">
          <div>
            <p className="eyebrow dark">Operator background</p>
            <h2>Operator background</h2>
            <p>IntraWeb is founded and operated by John Schibelli.</p>
            <p>
              Fifteen-plus years in engineering building production systems in React, Next.js, and TypeScript across companies at
              different operational scales shaped the way this work is approached.
            </p>
            <p>The frustration was consistent: too much focus on individual systems, not enough on the operational layer that connects them.</p>
            <p>Clients work with the person who designs and builds the systems. More context. Better decisions. Better outcomes.</p>
          </div>

          <div className="operator-media" aria-hidden>
            <div className="operator-photo-wrap">
              <Image src="/hero-01.png" alt="" fill sizes="(max-width: 1100px) 100vw, 38vw" />
            </div>
          </div>

          <div className="cta-panel">
            <p className="eyebrow dark">Start a conversation</p>
            <h2>Start a conversation</h2>
            <p>If what is on this page matches what you are dealing with operationally, the right next step is a conversation.</p>
            <p>Start with your operational context: what is working, what is not, and where the gaps are creating the most friction.</p>
            <Link href="/contact" className="button">
              Contact / Start a conversation <span aria-hidden>→</span>
            </Link>
            <small>First conversation is diagnostic, not sales.</small>
          </div>
        </div>
      </section>
    </main>
  );
}
