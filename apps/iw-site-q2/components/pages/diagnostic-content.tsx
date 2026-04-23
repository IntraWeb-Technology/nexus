"use client";

import { PageHero } from "@/components/page-hero";
import { SectionLabel } from "@/components/section-label";
import { DiagnosticCalEmbed } from "@/components/diagnostic-cal-embed";
import { Btn, Reveal } from "@/components/primitives";

const delivers = [
  "A full audit of your operational workflows — where time goes, where errors occur, where humans are doing machine work",
  "An AI and automation opportunity map ranked by impact and implementation complexity",
  "An honest assessment of integration risks and system dependencies",
  "A prioritized, fixed-scope implementation roadmap",
  "A written deliverable you own, regardless of what you do next",
];

const forYou = [
  "You have manual processes your team repeats every week",
  "You've explored AI tools but haven't seen real ROI",
  "You're planning a website or platform build and want to integrate automation from the start",
  "You're considering hiring but wondering if automation could handle the load instead",
  "You want an honest outside assessment before committing to a larger engagement",
];

const notFor = [
  "You're looking for a one-hour consultation",
  "You want us to validate a decision you've already made",
  "You need immediate execution without planning",
];

const everyIncludes = [
  "Dedicated discovery sessions (number based on your scope)",
  "Written opportunity map and prioritized roadmap",
  "Honest assessment of where AI fits — and where it doesn't",
  "Delivered within a defined timeframe agreed upfront",
];

export function DiagnosticPageContent() {
  return (
    <main>
      <PageHero
        title="Find out exactly where AI can cut your operational load."
        subhead="The IntraWeb AI Workflow Diagnostic is a structured assessment — not a discovery call — that maps your current operations, identifies where automation delivers real value, and gives you a prioritized roadmap you own. Whether you engage us to build it or not."
        minHeight
        align="center"
      />

      <section
        id="book-diagnostic"
        className="marketing-slab marketing-slab--continue"
        style={{ scrollMarginTop: "calc(var(--nav-h) + 1rem)" }}
      >
        <div className="container" style={{ maxWidth: 1100 }}>
          <Reveal>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 2.2vw, 1.85rem)",
                fontWeight: 600,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Book your diagnostic
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "var(--iw-fg-2)",
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: 640,
                margin: "0 auto 28px",
              }}
            >
              Choose a time that works for you. The calendar below uses the same event type as Cal.com
              (intraweb/discovery).
            </p>
            <DiagnosticCalEmbed />
          </Reveal>
        </div>
      </section>

      <section className="marketing-slab marketing-slab--continue">
        <div className="container">
          <Reveal>
            <h2
              id="delivers"
              style={{ fontSize: "clamp(1.5rem, 2.2vw, 1.85rem)", fontWeight: 600, marginBottom: 20 }}
            >
              What the Diagnostic delivers.
            </h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, lineHeight: 1.7, color: "var(--iw-fg-1)" }}>
              {delivers.map((d) => (
                <li key={d} style={{ marginBottom: 12, paddingLeft: 0, display: "flex", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--color-accent)", marginRight: 10, flexShrink: 0 }}>—</span>
                  {d}
                </li>
              ))}
            </ul>
            <p
              className="card"
              style={{
                marginTop: 28,
                padding: 20,
                lineHeight: 1.7,
                fontSize: 16,
                color: "var(--iw-fg-1)",
                background: "var(--page-bg-elevated-dark)",
                border: "1px solid var(--card-border-on-dark)",
                borderLeft: "3px solid var(--color-accent)",
                borderRadius: 12,
              }}
            >
              Most clients walk away from the Diagnostic with 3–5 high-confidence automation opportunities they
              didn&apos;t see before. Many implement the first one themselves.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="marketing-slab" style={{ paddingTop: 0 }}>
        <div className="container" style={{ display: "grid", gap: 48, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <Reveal>
            <h2
              id="foryou"
              style={{ fontSize: "clamp(1.5rem, 2.2vw, 1.85rem)", fontWeight: 600, marginBottom: 20 }}
            >
              Is this right for you?
            </h2>
            <h3 id="its-for" style={{ fontSize: 17, color: "var(--color-accent)", fontWeight: 600, marginBottom: 10 }}>
              It&apos;s for you if:
            </h3>
            <ul style={{ lineHeight: 1.7, color: "var(--iw-fg-1)" }}>
              {forYou.map((x) => (
                <li key={x} style={{ marginBottom: 8 }}>
                  {x}
                </li>
              ))}
            </ul>
            <h3
              id="notfor"
              style={{ fontSize: 17, color: "var(--color-accent)", fontWeight: 600, margin: "20px 0 10px" }}
            >
              It&apos;s not for you if:
            </h3>
            <ul style={{ lineHeight: 1.7, color: "var(--iw-fg-1)" }}>
              {notFor.map((x) => (
                <li key={x} style={{ marginBottom: 8 }}>
                  {x}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="marketing-slab marketing-slab--stack marketing-slab--page-end">
        <div className="container" style={{ maxWidth: 720 }}>
          <Reveal>
            <div style={{ marginBottom: 12 }}>
              <SectionLabel>What to expect</SectionLabel>
            </div>
            <p
              className="card"
              style={{
                padding: 20,
                fontSize: 16,
                lineHeight: 1.7,
                color: "var(--iw-fg-1)",
                background: "var(--page-bg-elevated-dark)",
                border: "1px solid var(--card-border-on-dark)",
                borderLeft: "3px solid var(--color-accent)",
                borderRadius: 12,
                marginBottom: 32,
              }}
            >
              Scope and structure depend on your situation. We&apos;ll align on the right approach on the discovery
              call before anything is scheduled.
            </p>
            <h2 style={{ fontSize: "clamp(1.35rem, 2vw, 1.7rem)", fontWeight: 600, marginBottom: 16 }}>What every Diagnostic includes</h2>
            <ul style={{ lineHeight: 1.7, color: "var(--iw-fg-1)", fontSize: 16 }}>
              {everyIncludes.map((d) => (
                <li key={d} style={{ marginBottom: 8 }}>
                  {d}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 32 }}>
              <Btn href="#book-diagnostic" variant="primary">
                Open the calendar
              </Btn>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
