import { z } from "zod";
import { asBoolean, asString, flattenEntries, flattenEntry, type FlatEntry } from "./common.js";
import { mediaAssetSchema, shapeMedia } from "./media.js";

const SITE_KEYS = ["personal", "intraweb"] as const;
export const siteKeySchema = z.enum(SITE_KEYS);

export function normalizeSiteKey(value: unknown): "personal" | "intraweb" | null {
  const key = asString(value);
  const result = siteKeySchema.safeParse(key);
  return result.success ? result.data : null;
}

/** Site keys for entries with a to-many `sites` relation (`api::site.site`). */
export function siteKeysFromToMany(entry: FlatEntry, field = "sites"): Array<"personal" | "intraweb"> {
  return flattenEntries(entry[field])
    .map((site) => normalizeSiteKey(site.key))
    .filter((key): key is "personal" | "intraweb" => key != null);
}

/** Site key for entries with a to-one `site` relation (`api::site.site`). */
export function siteKeyFromToOne(entry: FlatEntry, field = "site"): "personal" | "intraweb" | null {
  const site = flattenEntry(entry[field]);
  return site ? normalizeSiteKey(site.key) : null;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

// shared.link { label, href, openInNewTab }
export const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
  openInNewTab: z.boolean(),
  isExternal: z.boolean(),
});

export function shapeLink(raw: unknown): z.input<typeof linkSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const label = asString(entry.label);
  const href = asString(entry.href);
  if (!label || !href) return null;
  return {
    label,
    href,
    openInNewTab: asBoolean(entry.openInNewTab),
    isExternal: isExternalHref(href),
  };
}

// shared.social-link { platform, url, label }
export const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
  label: z.string().nullable(),
});

export function shapeSocialLink(raw: unknown): z.input<typeof socialLinkSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const platform = asString(entry.platform);
  const url = asString(entry.url);
  if (!platform || !url) return null;
  return { platform, url, label: asString(entry.label) };
}

export function shapeSocialLinks(raw: unknown): Array<z.input<typeof socialLinkSchema>> {
  return flattenEntries(raw)
    .map((item) => shapeSocialLink(item))
    .filter((item): item is z.input<typeof socialLinkSchema> => item != null);
}

// shared.navigation-item { label, href, openInNewTab, children: shared.link[] }
// NOTE: `children` is a repeatable `shared.link`, not a recursive navigation item.
export const navigationItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  openInNewTab: z.boolean(),
  isExternal: z.boolean(),
  children: z.array(linkSchema),
});

export function shapeNavigationItem(raw: unknown): z.input<typeof navigationItemSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const label = asString(entry.label);
  const href = asString(entry.href);
  if (!label || !href) return null;
  const children = flattenEntries(entry.children)
    .map((child) => shapeLink(child))
    .filter((child): child is z.input<typeof linkSchema> => child != null);
  return {
    label,
    href,
    openInNewTab: asBoolean(entry.openInNewTab),
    isExternal: isExternalHref(href),
    children,
  };
}

// shared.contact-information
export const contactInformationSchema = z.object({
  email: z.string().nullable(),
  phone: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
});

export function shapeContactInformation(raw: unknown): z.input<typeof contactInformationSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  return {
    email: asString(entry.email),
    phone: asString(entry.phone),
    addressLine1: asString(entry.addressLine1),
    addressLine2: asString(entry.addressLine2),
    city: asString(entry.city),
    region: asString(entry.region),
    postalCode: asString(entry.postalCode),
    country: asString(entry.country),
  };
}

// shared.feature { title, description, icon }
export const featureSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
});

export function shapeFeature(raw: unknown): z.input<typeof featureSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const title = asString(entry.title);
  if (!title) return null;
  return {
    title,
    description: asString(entry.description),
    icon: asString(entry.icon),
  };
}

export function shapeFeatures(raw: unknown): Array<z.input<typeof featureSchema>> {
  return flattenEntries(raw)
    .map((item) => shapeFeature(item))
    .filter((item): item is z.input<typeof featureSchema> => item != null);
}

// shared.stat-item { label, value, description }
export const statItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  description: z.string().nullable(),
});

export function shapeStatItem(raw: unknown): z.input<typeof statItemSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const label = asString(entry.label);
  const value = asString(entry.value);
  if (!label || !value) return null;
  return { label, value, description: asString(entry.description) };
}

// shared.seo { metaTitle, metaDescription, canonicalUrl, ogImage, ogTitle, ogDescription, noIndex, structuredData }
export const seoSchema = z.object({
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  canonicalUrl: z.string().nullable(),
  ogImage: mediaAssetSchema.nullable(),
  noIndex: z.boolean(),
});

export function shapeSeo(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof seoSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  return {
    metaTitle: asString(entry.metaTitle),
    metaDescription: asString(entry.metaDescription),
    canonicalUrl: asString(entry.canonicalUrl),
    ogImage: shapeMedia(entry.ogImage, mediaBaseUrl),
    noIndex: asBoolean(entry.noIndex),
  };
}
