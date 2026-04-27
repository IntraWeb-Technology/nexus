import { SITE_URL } from "@/lib/site-url";
import { geoFaqItems } from "@/lib/geo-faq";

const orgId = `${SITE_URL}/#organization`;
const siteId = `${SITE_URL}/#website`;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": orgId,
  name: "IntraWeb Technologies",
  legalName: "IntraWeb Technologies LLC",
  url: SITE_URL,
  logo: `${SITE_URL}/IW-logo-q2.png`,
  description:
    "AI-first product and automation studio for small and mid-sized businesses. We build workflow automation, AI integrations, and web systems that replace manual operational work.",
  foundingDate: "2020",
  founders: [
    {
      "@type": "Person",
      name: "John Schibelli",
      jobTitle: "Founder & COO",
      url: `${SITE_URL}/about`,
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Towaco",
    addressRegion: "NJ",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "State", name: "New Jersey" },
    { "@type": "City", name: "New York" },
    { "@type": "Country", name: "United States" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "human@intrawebtech.com",
    contactType: "customer service",
  },
  sameAs: ["https://linkedin.com/company/intrawebtech"],
  knowsAbout: [
    "Workflow Automation",
    "AI Integration",
    "Lead Generation Automation",
    "E-commerce Automation",
    "n8n",
    "HubSpot Integration",
    "SaaS Development",
    "Operations Automation",
    "AI Workflow Diagnostic",
  ],
} as const;

export const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": siteId,
  name: "IntraWeb Technologies",
  url: SITE_URL,
  description: "AI systems and automation infrastructure for SMBs that want to operate smarter.",
  publisher: { "@id": orgId },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?s={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
} as const;

export const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: "IntraWeb Technologies | AI automation and web systems for SMBs",
  isPartOf: { "@id": siteId },
  about: { "@id": orgId },
} as const;

export const itemListServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "IntraWeb Technologies Services",
  description: "AI automation, workflow engineering, web development, and SaaS product builds for SMBs.",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Service",
        name: "AI Workflow Diagnostic",
        description:
          "A structured operational assessment that maps manual processes, identifies AI and automation opportunities, and delivers a prioritized implementation roadmap.",
        provider: { "@type": "Organization", name: "IntraWeb Technologies" },
        serviceType: "Business Consulting",
        areaServed: "United States",
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Service",
        name: "Workflow Automation",
        description:
          "End-to-end workflow automation for SMB operations — lead intake, onboarding, proposals, invoicing, and reporting. Built on n8n with HubSpot and Stripe integration.",
        provider: { "@type": "Organization", name: "IntraWeb Technologies" },
        serviceType: "IT Services and IT Consulting",
        areaServed: "United States",
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Service",
        name: "AI Integration",
        description:
          "Integration of AI models and pipelines into existing products and operations stacks, including retrieval workflows, prompt guardrails, and multi-step agents.",
        provider: { "@type": "Organization", name: "IntraWeb Technologies" },
        serviceType: "Software Development",
        areaServed: "United States",
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Service",
        name: "E-commerce Automation",
        description:
          "Full order lifecycle automation for e-commerce businesses — abandoned cart recovery, order processing, shipping notifications, returns, post-purchase retention, and operations reporting.",
        provider: { "@type": "Organization", name: "IntraWeb Technologies" },
        serviceType: "IT Services and IT Consulting",
        areaServed: "United States",
      },
    },
    {
      "@type": "ListItem",
      position: 5,
      item: {
        "@type": "Service",
        name: "Website Development",
        description: "Performance-engineered websites and SaaS platforms for SMBs, built with automation integration from day one.",
        provider: { "@type": "Organization", name: "IntraWeb Technologies" },
        serviceType: "Web Development",
        areaServed: "United States",
      },
    },
    {
      "@type": "ListItem",
      position: 6,
      item: {
        "@type": "Service",
        name: "MVP and SaaS Platform Build",
        description:
          "Full product engineering from validated MVP to multi-tenant SaaS platform with billing, auth, and production hardening.",
        provider: { "@type": "Organization", name: "IntraWeb Technologies" },
        serviceType: "Software Development",
        areaServed: "United States",
      },
    },
  ],
} as const;

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "John Schibelli",
  jobTitle: "Founder & COO",
  worksFor: {
    "@type": "Organization",
    name: "IntraWeb Technologies",
  },
  description:
    "Senior engineer and AI systems architect with 15+ years of experience building production systems for SMBs across the NJ/NYC metro. Founder of IntraWeb Technologies.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Towaco",
    addressRegion: "NJ",
    addressCountry: "US",
  },
  knowsAbout: [
    "Workflow Automation",
    "AI Systems Architecture",
    "Frontend Engineering",
    "Full-Stack Development",
    "HubSpot",
    "n8n",
    "Lead Generation Systems",
    "Operations Automation",
  ],
  url: `${SITE_URL}/about`,
} as const;

export const diagnosticServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI Workflow Diagnostic",
  alternateName: "Automation Readiness Assessment",
  description:
    "A structured operational assessment for SMBs. Audits current workflows, maps AI and automation opportunities, assesses integration risk, and delivers a prioritized implementation roadmap the client keeps.",
  provider: {
    "@type": "Organization",
    name: "IntraWeb Technologies",
    url: SITE_URL,
  },
  serviceType: "Business Process Consulting",
  areaServed: "United States",
  offers: {
    "@type": "Offer",
    description: "Structured engagement scoped to your business. Contact IntraWeb to discuss scope.",
    availability: "https://schema.org/InStock",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Diagnostic Deliverables",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Operational process audit" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI and automation opportunity map" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Risk and integration assessment" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Prioritized implementation roadmap" } },
    ],
  },
} as const;

export const diagnosticHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How the IntraWeb AI Workflow Diagnostic works",
  description: "A structured 4-step engagement that audits your operations and delivers a prioritized AI and automation roadmap.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Discovery call",
      text: "A 30-minute call to align on scope, business context, and what the engagement needs to cover.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Operational audit",
      text: "Dedicated sessions to map your current workflows — where time goes, where errors occur, and where manual work is being done that doesn't require a human.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Opportunity mapping",
      text: "IntraWeb identifies AI and automation opportunities ranked by impact and implementation complexity, with an honest assessment of integration risks.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Roadmap delivery",
      text: "A written deliverable is delivered within the agreed timeframe. You keep it regardless of whether you engage IntraWeb to build it.",
    },
  ],
} as const;

function faqPageMainEntity() {
  return geoFaqItems.map((x) => ({
    "@type": "Question" as const,
    name: x.q,
    acceptedAnswer: { "@type": "Answer" as const, text: x.a },
  }));
}

export const homeFaqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqPageMainEntity(),
};

export function buildBreadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path === "/" ? "" : c.path}`,
    })),
  };
}
