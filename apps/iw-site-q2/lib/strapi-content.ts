/**
 * Soft-fail Strapi content resolvers for IntraWeb.
 * Always return usable hardcoded data when CMS is down, empty, or disabled.
 * Server-only — do not import from Client Components (use `cms-content-types` for types).
 */

import { draftMode } from "next/headers";
import type { CmsServiceCard, GeoFaqPair, SiteNavLink } from "@/lib/cms-content-types";
import { geoFaqItems } from "@/lib/geo-faq";
import { navLinks } from "@/lib/site";
import { getStrapiClient, STRAPI_SITE_KEY } from "@/lib/strapi";

export type { CmsServiceCard, GeoFaqPair, SiteNavLink } from "@/lib/cms-content-types";

const FALLBACK_NAV: SiteNavLink[] = navLinks.map((l) => ({
  label: l.label,
  href: l.href,
}));

const FALLBACK_FAQ: GeoFaqPair[] = geoFaqItems.map((item) => ({
  q: item.q,
  a: item.a,
}));

async function isPreviewEnabled(): Promise<boolean> {
  try {
    const draft = await draftMode();
    return draft.isEnabled;
  } catch {
    return false;
  }
}

/** Header nav: Strapi `header` location when present, else hardcoded `navLinks`. */
export async function resolveHeaderNavLinks(): Promise<SiteNavLink[]> {
  const client = getStrapiClient();
  if (!client) return FALLBACK_NAV;

  try {
    const preview = await isPreviewEnabled();
    const nav = await client.getNavigation(STRAPI_SITE_KEY, "header", {
      preview,
    });
    const items = nav?.items?.filter((item) => item.label && item.href) ?? [];
    if (items.length === 0) return FALLBACK_NAV;
    return items.map((item) => ({ label: item.label, href: item.href }));
  } catch {
    return FALLBACK_NAV;
  }
}

/** GEO FAQ pairs for accordion + FAQPage JSON-LD. */
export async function resolveGeoFaqItems(): Promise<GeoFaqPair[]> {
  const client = getStrapiClient();
  if (!client) return FALLBACK_FAQ;

  try {
    const preview = await isPreviewEnabled();
    const items = await client.getFaqItems(STRAPI_SITE_KEY, { preview });
    if (!items.length) return FALLBACK_FAQ;
    return items.map((item) => ({
      q: item.question,
      a: item.answer,
    }));
  } catch {
    return FALLBACK_FAQ;
  }
}

/**
 * Services from Strapi, or `null` to keep the hardcoded `services-content` packages.
 * Does not invent prices — callers must omit pricing UI when mapping CMS data.
 */
export async function resolveCmsServices(): Promise<CmsServiceCard[] | null> {
  const client = getStrapiClient();
  if (!client) return null;

  try {
    const preview = await isPreviewEnabled();
    const services = await client.getServices(STRAPI_SITE_KEY, { preview });
    if (!services.length) return null;
    return services.map((svc) => ({
      documentId: svc.documentId,
      name: svc.name,
      shortDescription: svc.shortDescription,
      features: svc.features.map((f) => ({
        title: f.title,
        description: f.description,
      })),
    }));
  } catch {
    return null;
  }
}
