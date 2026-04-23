"use client";

import Link from "next/link";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { GeoFaqBlock } from "@/components/geo-faq-block";
import { PageHero } from "@/components/page-hero";
import { SectionLabel } from "@/components/section-label";
import { Btn, Reveal } from "@/components/primitives";
import { Ic } from "@/components/icons";

const diagnosticList = [
  "Full operational process audit",
  "AI and automation opportunity map",
  "Risk and integration assessment",
  "Prioritized implementation roadmap",
  "Written deliverable you keep, no matter what you decide next",
];

/** Website offers — product-style marketing cards */
const websiteProductCards = [
  {
    id: "web-starter",
    name: "Starter",
    tagline: "A crisp site that makes the first impression — and the first lead — easy.",
    /** Rough page budget so buyers know what “a site” means at this tier */
    pages: "4–6 pages",
    pagesNote: "Most often: home, your offer, about, contact, and one more (e.g. FAQ, landing, or policy).",
    highlights: [
      "The pages buyers expect: your story, your offer, proof, and a clear way to reach you",
      "Fast on mobile, structured for search — performance is part of the product",
      "Leads go to your team’s inbox and CRM, not into the void",
      "You can update copy and images without opening a dev ticket every week",
    ],
  },
  {
    id: "web-growth",
    name: "Growth",
    tagline: "More room to grow: content, campaigns, and conversion paths that scale with you.",
    pages: "6–12 pages",
    pagesNote: "Space for a fuller map — extra landings, blog or resources, campaign pages, and supporting URLs.",
    highlights: [
      "A bigger site map — more landings, resources, and room to test what pulls leads in",
      "Smarter paths to “book a call” and “talk to sales” — not just a static form",
      "Connects to the tools you already run — CRM, calendar, and email in one flow",
      "Tuned to turn traffic into pipeline, not just win a design award",
    ],
  },
  {
    id: "web-advanced",
    name: "Advanced / SaaS",
    tagline: "When the web is the product: accounts, product UI, and serious engineering.",
    pages: "8–15+ public pages, plus app UI",
    pagesNote:
      "It’s not only “more blog pages” — you’re usually looking at a wider marketing set plus in-app or product screens (sign-in, dashboard, wizards, etc.). Exact sitemap and screens are set in scoping so you know what you’re getting.",
    highlights: [
      "Sign-in, roles, and app-style screens for customers and partners — not only marketing pages",
      "Dashboards, wizards, and data where your business actually runs",
      "Hooks into your product and billing so the experience feels like one system",
      "Built to hold up under real users, real traffic, and real roadmaps",
    ],
  },
] as const;

const addons = [
  "Additional Pages",
  "Hosting + DevOps Setup",
  "Analytics + Tracking Setup",
  "Copywriting",
  "Branding / UI System",
  "SEO Package",
];

const autoEngagements = [
  { t: "Workflow Automation — Standard", b: "Connect your tools, reduce manual work, stabilize core processes." },
  {
    t: "Workflow Automation — Advanced",
    b: "Multi-system orchestration, error handling, and operational hardening.",
  },
  {
    t: "AI Integration — Mid-Level",
    b: "Embed models, guardrails, and data flows into your existing product and operations stack.",
  },
  { t: "Advanced AI Systems", b: "Architecture, evaluation, reliability, and production-grade deployment." },
];

const saasEng = [
  { t: "MVP Build", b: "Core user journeys, foundational data model, shippable first release." },
  { t: "Full SaaS Platform", b: "Multi-tenant architecture, billing hooks, admin tooling, hardening." },
];

const retainers = [
  { t: "Website Maintenance — Basic", b: "Updates, monitoring, light changes." },
  { t: "Website Maintenance — Standard", b: "Proactive updates, monitoring, prioritized support." },
  { t: "Website Maintenance — Advanced", b: "Higher-change sites, expanded QA and coverage." },
  { t: "Growth & Optimization Retainer", b: "Conversion improvements, analytics-driven iteration." },
  { t: "AI & Automation Retainer — Standard", b: "Maintenance, monitoring, tuning, roadmap execution." },
  { t: "AI & Automation Retainer — Premium", b: "Expanded capacity, priority response, advanced iteration." },
];

const ecCards = [
  { k: "Abandoned cart recovery", b: "Multi-touch email and SMS sequences that fire automatically when a shopper leaves. Unique discount codes, personalized cart content, timed to recover revenue without discounting every order." },
  { k: "Order processing and fulfillment", b: "Confirmation emails, fulfillment routing, inventory threshold alerts, and fraud flagging — all triggered the moment an order comes in." },
  { k: "Shipping and delivery", b: "Branded shipment notifications, in-transit milestone updates, and proactive delay alerts before your customer emails support asking where their order is." },
  { k: "Returns and refunds", b: "Self-service return intake, automated eligibility checks, and payment processor refund processing. No ticket queue, no manual review for standard returns." },
  { k: "Post-purchase retention", b: "Review request sequences, replenishment reminders for consumable products, AI-matched cross-sell emails, and win-back campaigns for lapsed customers." },
  { k: "Operations and reporting", b: "Daily revenue summaries, low-stock reorder alerts, AI-powered support ticket triage, and chargeback early warning before a dispute is formally filed." },
];

function SectionBlock({ children, id, firstAfterHero }: { children: React.ReactNode; id?: string; firstAfterHero?: boolean }) {
  return (
    <section
      className={firstAfterHero ? "marketing-slab marketing-slab--continue" : "marketing-slab"}
      id={id}
    >
      {children}
    </section>
  );
}

export function ServicesPageContent() {
  return (
    <main className="iw-with-bc">
      <BreadcrumbNav
        items={[
          { name: "IntraWeb Technologies", href: "/" },
          { name: "Services", current: true },
        ]}
      />
      <PageHero
        title="What we build — and how it fits together."
        subhead={
          <>
            IntraWeb isn&apos;t a menu of services. It&apos;s a system. Every engagement is designed to reduce your
            operational load, increase what your business can handle, and create infrastructure that grows with you.
          </>
        }
      />

      <SectionBlock id="diagnostic" firstAfterHero>
        <div className="container">
          <Reveal>
            <SectionLabel>Start here</SectionLabel>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 2.6vw, 2.1rem)",
                fontWeight: 600,
                marginTop: 16,
                fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
              }}
            >
              AI Workflow Diagnostic
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 24, maxWidth: 720 }}>
              Before anything gets built, you need to know what&apos;s worth building. The Diagnostic is a structured
              engagement — not a discovery call — that maps your operations, identifies where AI and automation deliver
              real value, and produces a prioritized roadmap you own.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 16, maxWidth: 720 }}>
              Scope and complexity vary. We&apos;ll match the engagement to your situation on the call.
            </p>
            <ul style={{ marginTop: 28, color: "var(--iw-fg-1)", lineHeight: 1.7, maxWidth: 640 }}>
              {diagnosticList.map((x) => (
                <li key={x} style={{ marginBottom: 8 }}>
                  {x}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 28 }}>
              <Btn href="/diagnostic" variant="primary">
                Book a Diagnostic
              </Btn>
            </div>
          </Reveal>
        </div>
      </SectionBlock>

      <SectionBlock id="packages">
        <div className="container">
          <Reveal>
            <SectionLabel>Integrated packages</SectionLabel>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 2.6vw, 2.1rem)",
                fontWeight: 600,
                marginTop: 16,
                fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
              }}
            >
              Websites built to do more than sit there.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 20, maxWidth: 800 }}>
              Three ways to show up online. Each one is built to work with your business — not just go live and get
              forgotten. Not sure which fits? That&apos;s what the Diagnostic is for.
            </p>
          </Reveal>
          <div
            className="services-three"
            style={{ marginTop: 40, gap: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))" }}
          >
            {websiteProductCards.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 80}>
                <div
                  className="card"
                  style={{
                    height: "100%",
                    padding: 28,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    borderRadius: 12,
                    border: "1px solid var(--card-border-on-dark, rgba(255,255,255,0.08))",
                    background: "var(--page-bg-elevated-dark, rgba(16, 26, 46, 0.75))",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "clamp(1.25rem, 1.5vw, 1.4rem)",
                        fontWeight: 700,
                        fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
                        color: "var(--iw-fg)",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {pkg.name}
                    </h3>
                    <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.5, color: "var(--iw-fg-2)" }}>{pkg.tagline}</p>
                    <div
                      style={{
                        marginTop: 14,
                        padding: "14px 16px",
                        borderRadius: 8,
                        background: "rgba(52, 231, 208, 0.06)",
                        border: "1px solid rgba(52, 231, 208, 0.12)",
                      }}
                    >
                      <p
                        className="mono"
                        style={{ margin: 0, fontSize: 9, color: "var(--iw-amber)", letterSpacing: "0.12em" }}
                      >
                        ABOUT THIS SIZE
                      </p>
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "clamp(1.25rem, 1.3vw, 1.4rem)",
                          fontWeight: 700,
                          color: "var(--iw-fg)",
                          letterSpacing: "-0.03em",
                          lineHeight: 1.2,
                        }}
                      >
                        {pkg.pages}
                      </p>
                      <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, color: "var(--iw-fg-2)" }}>
                        {pkg.pagesNote}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {pkg.highlights.map((h) => (
                      <div key={h} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <Ic.check width={18} height={18} style={{ color: "var(--color-accent)", flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--iw-fg-1)" }}>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <h3 style={{ marginTop: 48, fontSize: 20, fontWeight: 600 }}>Add-ons</h3>
            <ul style={{ marginTop: 12, color: "var(--iw-fg-1)" }}>
              {addons.map((a) => (
                <li key={a} style={{ marginBottom: 6 }}>
                  {a}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 28, fontSize: 16, color: "var(--iw-fg-1)" }}>
              <Btn href="/diagnostic" variant="primary">
                Not sure which fits? Start with a Diagnostic
              </Btn>
            </div>
          </Reveal>
        </div>
      </SectionBlock>

      <SectionBlock id="automation">
        <div className="container">
          <Reveal>
            <SectionLabel>The core work</SectionLabel>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 2.6vw, 2.1rem)",
                fontWeight: 600,
                marginTop: 16,
                fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
              }}
            >
              Automation that runs your operations. AI that scales your output.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 20, maxWidth: 800 }}>
              This is where IntraWeb does its best work. We identify your highest-friction manual processes — the stuff
              your team does every day that shouldn&apos;t require a human — and replace it with monitored, maintained
              automation.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 12, maxWidth: 800 }}>
              Then we layer in AI where it creates leverage: content generation, lead qualification, document creation,
              client communication, data analysis.
            </p>
            <div
              className="card"
              style={{ marginTop: 32, padding: 24, borderLeft: "3px solid var(--color-accent)", borderRadius: 12, background: "var(--page-bg-elevated-dark)" }}
            >
              <ul style={{ listStyle: "none", margin: 0, padding: 0, color: "var(--iw-fg-1)" }}>
                {autoEngagements.map((e) => (
                  <li
                    key={e.t}
                    style={{
                      marginBottom: 18,
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <Ic.check
                      width={16}
                      height={16}
                      style={{ color: "var(--color-accent)", marginTop: 3, flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.t}</div>
                      <div style={{ lineHeight: 1.6 }}>{e.b}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </SectionBlock>

      <SectionBlock id="saas">
        <div className="container">
          <Reveal>
            <SectionLabel>The ceiling</SectionLabel>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 2.6vw, 2.1rem)",
                fontWeight: 600,
                marginTop: 16,
                fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
              }}
            >
              From MVP to full platform.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 20, maxWidth: 800 }}>
              If you&apos;re building a product — not just a website — IntraWeb can take you from validated idea to
              shippable first release, or from MVP to a multi-tenant, billing-enabled, production-hardened platform.
            </p>
            <ul style={{ marginTop: 20, lineHeight: 1.7, color: "var(--iw-fg-1)" }}>
              {saasEng.map((e) => (
                <li key={e.t} style={{ marginBottom: 8 }}>
                  <strong>{e.t}:</strong> {e.b}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </SectionBlock>

      <SectionBlock id="retainers">
        <div className="container">
          <Reveal>
            <SectionLabel>After launch</SectionLabel>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 2.6vw, 2.1rem)",
                fontWeight: 600,
                marginTop: 16,
                fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
              }}
            >
              The system doesn&apos;t stop working when the project ends.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 20, maxWidth: 800 }}>
              Every automation, AI integration, and website we build runs better with ongoing support. Retainers keep
              your systems tuned, monitored, and evolving — without you having to manage it.
            </p>
            <ul style={{ marginTop: 20, listStyle: "none", margin: 0, padding: 0 }}>
              {retainers.map((r) => (
                <li
                  key={r.t}
                  className="card"
                  style={{
                    padding: 16,
                    marginBottom: 10,
                    borderLeft: "3px solid var(--color-accent)",
                    background: "var(--page-bg-elevated-dark)",
                    borderRadius: 12,
                  }}
                >
                  <strong style={{ color: "var(--iw-fg)" }}>{r.t}</strong>
                  <br />
                  <span style={{ color: "var(--iw-fg-1)", lineHeight: 1.6 }}>{r.b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </SectionBlock>

      <SectionBlock id="ecom">
        <div className="container">
          <Reveal>
            <SectionLabel>Built for e-commerce</SectionLabel>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 2.6vw, 2.1rem)",
                fontWeight: 600,
                marginTop: 16,
                fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
              }}
            >
              Your store runs 24 hours. Your operations should too.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 20, maxWidth: 800 }}>
              Most e-commerce businesses are held together by manual work — someone checking orders, copying tracking
              numbers, sending follow-up emails, processing returns. That work is real, it&apos;s repetitive, and it
              doesn&apos;t need a human.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 12, maxWidth: 800 }}>
              IntraWeb builds end-to-end e-commerce automation that covers the full order lifecycle: from the moment a
              shopper abandons a cart to the moment they become a repeat customer. Every stage is connected, monitored,
              and runs without anyone touching it.
            </p>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
              marginTop: 32,
            }}
          >
            {ecCards.map((c, i) => (
              <Reveal key={c.k} delay={i * 80}>
                <div
                  className="card"
                  style={{
                    padding: 24,
                    borderLeft: "3px solid var(--color-accent)",
                    minHeight: 200,
                    borderRadius: 12,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 10,
                      color: "var(--iw-fg)",
                      fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
                    }}
                  >
                    {c.k}
                  </h3>
                  <p style={{ fontSize: 15, color: "var(--iw-fg-1)", lineHeight: 1.6, margin: 0 }}>{c.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p
              style={{
                marginTop: 40,
                padding: 20,
                border: "1px solid var(--card-border-on-dark)",
                borderLeft: "4px solid var(--color-accent)",
                background: "rgba(30,37,53,0.6)",
                lineHeight: 1.7,
                fontSize: 16,
                color: "var(--iw-fg-1)",
                borderRadius: 12,
              }}
            >
              These aren&apos;t templates. Every workflow is built to your stack, your policies, and your customer
              journey — then monitored and maintained under retainer so it keeps running as your business scales.
            </p>
            <p style={{ marginTop: 28, fontSize: 16, color: "var(--iw-fg-1)" }}>
              <Btn href="/diagnostic" variant="primary">
                Start with a Diagnostic to map your automation opportunities
              </Btn>
            </p>
            <p style={{ marginTop: 24, fontSize: 15, color: "var(--iw-fg-2)" }}>
              <Link href="/start" style={{ color: "var(--color-accent)" }}>
                Or start with the full project intake →
              </Link>
            </p>
          </Reveal>
        </div>
      </SectionBlock>
      <GeoFaqBlock className="marketing-slab marketing-slab--page-end" id="faq" />
    </main>
  );
}
