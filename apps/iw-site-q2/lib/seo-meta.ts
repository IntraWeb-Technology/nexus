import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

const author = { name: "John Schibelli", url: `${SITE_URL}/about` };
const org = "IntraWeb Technologies";

const robots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
};

const twitterBase: Metadata["twitter"] = { card: "summary_large_image", creator: author.name };

type PageMeta = {
  title: string;
  description: string;
  keywords: string[];
  path: `/${string}` | "";
  ogAlt: string;
  /** Open Graph art at https://intrawebtech.com/og/[ogFilename].png */
  ogFilename: string;
  /** optional absolute image URL override */
  ogImageUrl?: string;
};

function ogFor(slug: string) {
  return `${SITE_URL}/og/${slug}.png`;
}

export function pageMetadata(p: PageMeta, opts?: { titleAbsolute?: boolean }): Metadata {
  const pageUrl = p.path ? `${SITE_URL}${p.path}` : `${SITE_URL}`;
  const og = p.ogImageUrl ?? ogFor(p.ogFilename);

  return {
    title: opts?.titleAbsolute ? { absolute: p.title } : p.title,
    description: p.description,
    keywords: p.keywords,
    authors: [author],
    creator: org,
    publisher: org,
    robots,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: pageUrl,
      siteName: org,
      title: p.title,
      description: p.description,
      images: [
        { url: og, width: 1200, height: 630, alt: p.ogAlt },
      ],
    },
    twitter: { ...twitterBase, title: p.title, description: p.description, images: [og] },
    alternates: { canonical: pageUrl },
  } satisfies Metadata;
}

export const homeSeo: PageMeta = {
  title: "IntraWeb | AI Automation & Web Systems for SMBs",
  description:
    "IntraWeb builds AI-powered web systems, workflow automation, and intelligent integrations for SMBs. Based in NJ, serving the NY metro and remote nationwide.",
  keywords: [
    "workflow automation NJ",
    "AI integration small business",
    "automate business operations",
    "AI workflow diagnostic",
    "n8n automation agency",
    "HubSpot automation",
    "operations automation NJ",
  ],
  path: "",
  ogFilename: "home",
  ogAlt: "IntraWeb Technologies — AI systems and workflow automation for SMBs",
};

export const servicesSeo: PageMeta = {
  title: "Services | AI Integration, Workflow Automation & Web Development — IntraWeb",
  description:
    "From AI workflow diagnostics to SaaS product builds, IntraWeb designs and delivers systems that reduce manual work and scale your operations.",
  keywords: [
    "workflow automation services",
    "AI integration services",
    "e-commerce automation",
    "website automation",
    "SaaS development NJ",
    "lead intake automation",
    "business process automation",
  ],
  path: "/services",
  ogFilename: "services",
  ogAlt: "IntraWeb services: diagnostics, workflow automation, AI integration, and web development",
};

export const aboutSeo: PageMeta = {
  title: "About IntraWeb | AI-First Engineering Studio, NJ",
  description:
    "IntraWeb is a boutique AI and automation studio led by a senior engineer with 15+ years of experience. Based in northern NJ, serving SMBs nationwide.",
  keywords: [
    "IntraWeb Technologies",
    "John Schibelli",
    "AI automation studio NJ",
    "automation engineer New Jersey",
    "AI systems architect NJ",
  ],
  path: "/about",
  ogFilename: "about",
  ogAlt: "About IntraWeb Technologies — New Jersey AI and automation engineering studio",
};

export const diagnosticSeo: PageMeta = {
  title: "AI Workflow Diagnostic | IntraWeb",
  description:
    "The IntraWeb AI Workflow Diagnostic maps your operations, identifies automation opportunities, and delivers a prioritized roadmap you keep.",
  keywords: [
    "AI workflow diagnostic",
    "automation readiness assessment",
    "business process audit",
    "AI ROI assessment",
    "workflow optimization consulting",
  ],
  path: "/diagnostic",
  ogFilename: "diagnostic",
  ogAlt: "Book the IntraWeb AI Workflow Diagnostic",
};

export const workSeo: PageMeta = {
  title: "Work | IntraWeb",
  description: "Case studies and systems IntraWeb has shipped for SMBs: automation, integrations, and web platforms.",
  keywords: [
    "automation case studies",
    "workflow automation results",
    "AI integration examples",
    "IntraWeb Technologies portfolio",
  ],
  path: "/work",
  ogFilename: "work",
  ogAlt: "IntraWeb client work: automation, integrations, and web platforms",
};

export const contactSeo: PageMeta = {
  title: "Contact IntraWeb | Start a Project or Book a Diagnostic",
  description:
    "Ready to automate your operations or build your next web system? Contact IntraWeb to start the conversation.",
  keywords: [
    "hire automation engineer NJ",
    "AI automation studio contact",
    "workflow automation quote",
    "book AI diagnostic",
  ],
  path: "/contact",
  ogFilename: "contact",
  ogAlt: "Contact IntraWeb Technologies to start a project or book a diagnostic",
};
