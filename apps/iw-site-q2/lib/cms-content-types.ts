/** Shared CMS→UI shapes (safe for Client Components — no Strapi imports). */

export type SiteNavLink = { label: string; href: string };

export type GeoFaqPair = { q: string; a: string };

/** Mapped Service fields for the packages grid — no prices. */
export type CmsServiceCard = {
  documentId: string;
  name: string;
  shortDescription: string | null;
  features: { title: string; description: string | null }[];
};
