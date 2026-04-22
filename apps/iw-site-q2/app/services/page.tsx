import type { Metadata } from "next";
import Link from "next/link";
import { Btn } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Services | AI Integration, Workflow Automation & Web Development",
  description:
    "From AI workflow diagnostics to SaaS product builds, IntraWeb designs and delivers systems that reduce manual work and scale your operations.",
};

export default function ServicesPage() {
  return (
    <div className="container page-inner">
      <h1>What we build, and how it fits together.</h1>
      <p className="lead">
        IntraWeb isn&apos;t a menu of services. It&apos;s a system. Every engagement is designed to reduce your
        operational load, increase what your business can handle, and create infrastructure that grows with you.
      </p>

      <h2 id="diagnostic">Start here: AI Workflow Diagnostic</h2>
      <p>
        Before anything gets built, you need to know what is worth building. The Diagnostic is a structured
        engagement that maps your operations, identifies where AI and automation deliver real value, and produces a
        prioritized roadmap you own. Standard <span className="price">$7,500</span>. Premium{" "}
        <span className="price">$12,000</span> for multi-team scope and deeper system complexity.
      </p>
      <Btn variant="primary" href="/diagnostic">
        Book a Diagnostic
      </Btn>

      <h2 id="web">Foundation: websites and platforms built to be extended</h2>
      <p>
        Every site we build is engineered, not assembled in a drag-and-drop tool and handed off. Next.js, React,
        mobile-first, performance-tuned, and structured to plug into the AI and automation layer when you are ready.
      </p>
      <h3>SMB packages (integrated bundles)</h3>
      <ul>
        <li>
          <strong>Website</strong> — <span className="price">$7,000</span> · Up to 5 pages. Home, About, Services, FAQ,
          Contact. Next.js/React, mobile-first, CMS integration.
        </li>
        <li>
          <strong>Website + Automation</strong> — <span className="price">$15,500</span> · 8 pages + lead capture
          connected to a full CRM and email automation workflow.
        </li>
        <li>
          <strong>Website + AI</strong> — <span className="price">$45,500</span> · 12 pages + mid-level AI integration
          and a 3-month AI &amp; Automation Retainer included.
        </li>
      </ul>
      <h3>Standalone web</h3>
      <ul>
        <li>
          <strong>Starter</strong> — <span className="price">$8,000</span> · Conversion-focused marketing site.
        </li>
        <li>
          <strong>Growth</strong> — <span className="price">$18,500</span> · Richer content architecture, integrations,
          UX patterns for lead generation.
        </li>
        <li>
          <strong>Advanced / SaaS</strong> — <span className="price">$47,500</span> · Product-grade web experience with
          deeper architecture and integrations.
        </li>
      </ul>
      <p>
        Add-ons include additional pages, hosting + DevOps setup, analytics, copywriting, branding/UI system, and SEO
        packages. <Link href="/contact">Ask for a scoped quote →</Link>
      </p>

      <h2 id="automation">The core work: AI &amp; automation</h2>
      <p>
        We identify your highest-friction manual processes and replace them with monitored, maintained automation. We
        layer in AI where it creates leverage: content generation, lead qualification, documents, client communication,
        data analysis.
      </p>
      <ul>
        <li>
          <strong>Workflow Automation — Standard</strong> — <span className="price">$10,000</span>
        </li>
        <li>
          <strong>Workflow Automation — Advanced</strong> — <span className="price">$15,000</span>
        </li>
        <li>
          <strong>AI Integration — Mid-Level</strong> — <span className="price">$25,000</span>
        </li>
        <li>
          <strong>Advanced AI Systems</strong> — <span className="price">$70,000</span>
        </li>
      </ul>

      <h2 id="saas">The ceiling: SaaS &amp; product builds</h2>
      <ul>
        <li>
          <strong>MVP Build</strong> — <span className="price">$42,500</span> · Core user journeys, foundational data
          model, shippable first release.
        </li>
        <li>
          <strong>Full SaaS Platform</strong> — <span className="price">$127,500</span> · Multi-tenant architecture,
          billing hooks, admin tooling, hardening.
        </li>
      </ul>

      <h2 id="retainers">After launch: retainers</h2>
      <p>
        Website maintenance from <span className="price">$500/mo</span> to <span className="price">$1,000/mo</span>.
        Growth &amp; Optimization Retainer <span className="price">$3,500/mo</span>. AI &amp; Automation Retainer
        Standard <span className="price">$5,000/mo</span> and Premium <span className="price">$8,500/mo</span>.
      </p>

      <div style={{ marginTop: 48 }}>
        <Btn variant="primary" href="/contact">
          Start a project
        </Btn>
      </div>
    </div>
  );
}
