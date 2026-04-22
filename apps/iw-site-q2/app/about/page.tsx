import type { Metadata } from "next";
import { Btn } from "@/components/primitives";

export const metadata: Metadata = {
  title: "About IntraWeb Technologies | AI-First Engineering Studio, NJ",
  description:
    "IntraWeb is a boutique AI and automation studio led by a senior engineer with 15+ years of experience. Based in northern NJ, serving SMBs nationwide.",
};

export default function AboutPage() {
  return (
    <div className="container page-inner">
      <h1>Built by an engineer. Operated like one, too.</h1>
      <p className="lead">
        IntraWeb Technologies is a boutique AI and automation studio based in northern New Jersey. We are not an agency
        with layers of account management and outsourced execution. We are a senior engineering practice with direct
        delivery and a bias toward building things that work.
      </p>

      <h2>Who you&apos;re working with</h2>
      <p>
        IntraWeb is led by John Schibelli, a senior front-end developer and AI systems engineer with 15+ years of
        experience across React, Next.js, TypeScript, and full-stack development, with a growing specialization in AI
        integration architecture and workflow automation.
      </p>
      <p>
        Before IntraWeb, John built production systems for brands and enterprises across the NJ/NYC metro. He started
        IntraWeb because he kept seeing the same pattern: businesses getting sold on technology that nobody maintained,
        integrated, or actually used.
      </p>
      <p>
        IntraWeb is the answer to that problem: an engineering practice that takes ownership of the full system, not
        just the build.
      </p>
      <p className="mono" style={{ fontSize: 14, color: "var(--iw-fg-2)", marginTop: 24 }}>
        We build with: Next.js · React · TypeScript · Node.js · Supabase · n8n · Claude API · OpenAI · ElevenLabs ·
        HubSpot · Stripe · Vercel · PostgreSQL
      </p>

      <h2>How we work</h2>
      <h3>1. Diagnose before you build.</h3>
      <p>
        We don&apos;t start engagements by pitching solutions. We start by understanding your operations. The Diagnostic
        exists because building the wrong thing faster is not a service.
      </p>
      <h3>2. Engineer, don&apos;t bolt.</h3>
      <p>
        Every integration we create is designed from the architecture up, not cobbled together with a brittle chain and
        hope. Systems fail at the seams. We design for the seams.
      </p>
      <h3>3. Stay accountable after launch.</h3>
      <p>
        Most agencies disappear after delivery. Our retainer model is built around the assumption that production
        systems need ongoing care. We make that easy to budget and easy to manage.
      </p>

      <div style={{ marginTop: 48, display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Btn variant="primary" href="/diagnostic">
          Start with a Diagnostic
        </Btn>
        <Btn variant="secondary" href="/contact" icon={false}>
          Schedule a Discovery Call
        </Btn>
      </div>
    </div>
  );
}
