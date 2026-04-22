import type { Metadata } from "next";
import { Btn } from "@/components/primitives";

export const metadata: Metadata = {
  title: "AI Workflow Diagnostic | IntraWeb Technologies",
  description:
    "The IntraWeb AI Workflow Diagnostic maps your operations, identifies automation opportunities, and delivers a prioritized roadmap. Starting at $7,500.",
};

export default function DiagnosticPage() {
  return (
    <div className="container page-inner">
      <h1>Find out exactly where AI can cut your operational load.</h1>
      <p className="lead">
        The IntraWeb AI Workflow Diagnostic is a structured assessment, not a discovery call, that maps your current
        operations, identifies where automation delivers real value, and gives you a prioritized roadmap you own.
        Whether you engage us to build it or not.
      </p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
        <Btn variant="primary" href="/contact">
          Book Standard Diagnostic — $7,500
        </Btn>
        <Btn variant="secondary" href="/contact" icon={false}>
          Book Premium Diagnostic — $12,000
        </Btn>
      </div>

      <h2>What the Diagnostic delivers</h2>
      <ul>
        <li>A full audit of your operational workflows: where time goes, where errors occur, where humans are doing machine work</li>
        <li>An AI and automation opportunity map ranked by impact and implementation complexity</li>
        <li>An honest assessment of integration risks and system dependencies</li>
        <li>A prioritized, fixed-scope implementation roadmap</li>
        <li>A written deliverable you own, regardless of what you do next</li>
      </ul>
      <p style={{ marginTop: 16, color: "var(--iw-fg-2)" }}>
        Most clients walk away from the Diagnostic with 3–5 high-confidence automation opportunities they didn&apos;t
        see before. Many implement the first one themselves.
      </p>

      <h2>Is this right for you?</h2>
      <h3>It&apos;s for you if:</h3>
      <ul>
        <li>You have manual processes your team repeats every week</li>
        <li>You&apos;ve explored AI tools but haven&apos;t seen real ROI</li>
        <li>You&apos;re planning a website or platform build and want automation from the start</li>
        <li>You&apos;re considering hiring but wondering if automation could handle the load instead</li>
        <li>You want an honest outside assessment before committing to a larger engagement</li>
      </ul>
      <h3>It&apos;s not for you if:</h3>
      <ul>
        <li>You&apos;re looking for a one-hour consultation</li>
        <li>You want us to validate a decision you&apos;ve already made</li>
        <li>You need immediate execution without planning</li>
      </ul>

      <h2>Tiers</h2>
      <h3>Standard Diagnostic — $7,500</h3>
      <ul>
        <li>Single-team or single-function scope</li>
        <li>1–2 discovery sessions</li>
        <li>Written opportunity map and roadmap</li>
        <li>Delivered in 5–7 business days</li>
      </ul>
      <h3>Premium Diagnostic — $12,000</h3>
      <ul>
        <li>Multi-team or complex system scope</li>
        <li>3–4 discovery sessions across stakeholders</li>
        <li>Full delivery risk and dependency assessment</li>
        <li>Priority scheduling, delivered in 7–10 business days</li>
      </ul>

      <div style={{ marginTop: 40 }}>
        <Btn variant="primary" href="/contact">
          Let&apos;s Start
        </Btn>
      </div>
    </div>
  );
}
