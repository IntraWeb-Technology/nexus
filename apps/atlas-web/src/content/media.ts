/**
 * M7 production media contract — neutral URLs (static now; Strapi-capable later).
 * Do not couple UI to `/public` path semantics beyond opaque `src` strings.
 */

/** Raster / SVG media reference safe for future CMS URLs. */
export type MediaAsset = {
  /** Absolute site path or future absolute CMS URL */
  src: string;
  width: number;
  height: number;
  /** next/image sizes attribute when rendered responsively */
  sizes?: string;
  /** LCP / above-fold only */
  priority?: boolean;
};

/** Semantic naming: `{subject}-{role}-{viewport?}.{ext}` under `/images/...`. */
export const mediaAssets = {
  /** A-01 — Home hero Portfolio OS surface */
  homeHeroDesktop: {
    src: "/images/case-studies/portfolio-os/portfolio-os-home-hero-desktop.webp",
    width: 1760,
    height: 1100,
    sizes: "(min-width: 1440px) 880px, 100vw",
    priority: true,
  },
  homeHeroTablet: {
    src: "/images/case-studies/portfolio-os/portfolio-os-home-hero-tablet.webp",
    width: 1536,
    height: 960,
    sizes: "100vw",
    priority: true,
  },
  homeHeroMobile: {
    src: "/images/case-studies/portfolio-os/portfolio-os-home-hero-mobile.webp",
    width: 780,
    height: 640,
    sizes: "100vw",
    priority: true,
  },
  /** PA-HF / A-02 family */
  workFeaturedDesktop: {
    src: "/images/case-studies/portfolio-os/portfolio-os-work-featured-desktop.webp",
    width: 2400,
    height: 1350,
    sizes: "(min-width: 1440px) 1216px, 100vw",
  },
  workFeaturedCompact: {
    src: "/images/case-studies/portfolio-os/portfolio-os-work-featured-compact.webp",
    width: 1536,
    height: 864,
    sizes: "100vw",
  },
  homeFeatured: {
    src: "/images/case-studies/portfolio-os/portfolio-os-home-featured-desktop.webp",
    width: 2400,
    height: 1350,
    sizes: "(min-width: 1440px) 1376px, 100vw",
  },
  /** A-06 case hero */
  caseHeroDesktop: {
    src: "/images/case-studies/portfolio-os/portfolio-os-case-hero-desktop.webp",
    width: 2400,
    height: 1350,
    sizes: "(min-width: 1440px) 1216px, 100vw",
    priority: true,
  },
  caseHeroTablet: {
    src: "/images/case-studies/portfolio-os/portfolio-os-case-hero-tablet.webp",
    width: 1536,
    height: 864,
    sizes: "100vw",
  },
  caseHeroMobile: {
    src: "/images/case-studies/portfolio-os/portfolio-os-case-hero-mobile.webp",
    width: 780,
    height: 520,
    sizes: "100vw",
  },
  /** PA-CS3 brand / homepage implementation */
  caseImplBrand: {
    src: "/images/case-studies/portfolio-os/portfolio-os-case-implementation-desktop.webp",
    width: 1680,
    height: 1050,
    sizes: "(min-width: 1440px) 840px, 100vw",
  },
  caseImplBrandTablet: {
    src: "/images/case-studies/portfolio-os/portfolio-os-case-implementation-tablet.webp",
    width: 1536,
    height: 960,
    sizes: "100vw",
  },
  caseImplBrandMobile: {
    src: "/images/case-studies/portfolio-os/portfolio-os-case-implementation-mobile.webp",
    width: 780,
    height: 640,
    sizes: "100vw",
  },
  /** PA-CS4 micro-hierarchy */
  caseImplUi: {
    src: "/images/case-studies/portfolio-os/portfolio-os-case-ui-closeup.webp",
    width: 1120,
    height: 700,
    sizes: "(min-width: 1440px) 448px, 100vw",
  },
  /** A-03 Shared Strapi — architecture diagram SVG */
  sharedStrapi: {
    src: "/images/work/shared-strapi-architecture.svg",
    width: 1520,
    height: 860,
    sizes: "(min-width: 1440px) 760px, 100vw",
  },
  /** A-04 IntraWeb Automation — workflow diagram SVG */
  intrawebAutomation: {
    src: "/images/work/intraweb-automation-workflow.svg",
    width: 1120,
    height: 640,
    sizes: "(min-width: 1440px) 560px, 100vw",
  },
  /** Home selected feature (Shared Strapi) */
  homeSelectedFeature: {
    src: "/images/work/shared-strapi-architecture.svg",
    width: 1520,
    height: 860,
    sizes: "(min-width: 1440px) 1376px, 100vw",
  },
  /** A-13 default OG */
  ogDefault: {
    src: "/og/default.png",
    width: 1200,
    height: 630,
  },
} as const satisfies Record<string, MediaAsset>;
