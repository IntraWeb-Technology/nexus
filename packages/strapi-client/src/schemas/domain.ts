import { z } from "zod";
import {
  contactInformationSchema,
  featureSchema,
  linkSchema,
  navigationItemSchema,
  seoSchema,
  siteKeySchema,
  socialLinkSchema,
  statItemSchema,
} from "./components.js";
import { mediaAssetSchema } from "./media.js";

// api::site.site (referenced, never fetched directly by this client)
export const siteRefSchema = z.object({
  documentId: z.string(),
  key: siteKeySchema,
  name: z.string(),
  domain: z.string().nullable(),
});

// api::author.author
export const authorSchema = z.object({
  documentId: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  biography: z.string().nullable(),
  avatar: mediaAssetSchema.nullable(),
  socialLinks: z.array(socialLinkSchema),
});

// api::category.category
export const categorySchema = z.object({
  documentId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
});

// api::tag.tag
export const tagSchema = z.object({
  documentId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
});

// api::technology.technology
export const technologySchema = z.object({
  documentId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  logo: mediaAssetSchema.nullable(),
  websiteUrl: z.string().nullable(),
  featured: z.boolean(),
});

// api::site-setting.site-setting (single per site, relation: `site` oneToOne)
export const siteSettingsSchema = z.object({
  documentId: z.string(),
  siteKey: siteKeySchema,
  siteName: z.string(),
  siteDescription: z.string().nullable(),
  logo: mediaAssetSchema.nullable(),
  favicon: mediaAssetSchema.nullable(),
  defaultSeo: seoSchema.nullable(),
  socialLinks: z.array(socialLinkSchema),
  contact: contactInformationSchema.nullable(),
});

// api::navigation.navigation (relation: `site` manyToOne)
export const navigationSchema = z.object({
  documentId: z.string(),
  siteKey: siteKeySchema,
  location: z.enum(["header", "footer", "mobile", "sidebar"]),
  name: z.string().nullable(),
  items: z.array(navigationItemSchema),
});

// api::faq-item.faq-item (relation: `sites` manyToMany) — declared before
// pageBlockSchema because `blocks.faq-section` embeds FAQ item relations.
export const faqItemSchema = z.object({
  documentId: z.string(),
  siteKeys: z.array(siteKeySchema),
  question: z.string(),
  answer: z.string(),
  sortOrder: z.number().nullable(),
  featured: z.boolean(),
});

// Page.sections dynamic zone (blocks.hero | blocks.rich-text | blocks.cta |
// blocks.faq-section | blocks.media | blocks.stats)
export const pageBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    id: z.string(),
    headline: z.string(),
    subheadline: z.string().nullable(),
    media: mediaAssetSchema.nullable(),
    primaryCta: linkSchema.nullable(),
    secondaryCta: linkSchema.nullable(),
  }),
  z.object({
    type: z.literal("rich-text"),
    id: z.string(),
    body: z.string(),
  }),
  z.object({
    type: z.literal("cta"),
    id: z.string(),
    headline: z.string(),
    body: z.string().nullable(),
    button: linkSchema.nullable(),
  }),
  z.object({
    type: z.literal("faq-section"),
    id: z.string(),
    title: z.string().nullable(),
    items: z.array(faqItemSchema),
  }),
  z.object({
    type: z.literal("media"),
    id: z.string(),
    media: mediaAssetSchema.nullable(),
    alt: z.string().nullable(),
    caption: z.string().nullable(),
  }),
  z.object({
    type: z.literal("stats"),
    id: z.string(),
    items: z.array(statItemSchema),
  }),
]);

// api::page.page (relation: `site` manyToOne)
export const pageSchema = z.object({
  documentId: z.string(),
  siteKey: siteKeySchema,
  title: z.string(),
  slug: z.string(),
  pageType: z.string().nullable(),
  sections: z.array(pageBlockSchema),
  seo: seoSchema.nullable(),
  publishedAt: z.string().nullable(),
});

// api::article.article (relation: `sites` manyToMany)
export const articleSchema = z.object({
  documentId: z.string(),
  siteKeys: z.array(siteKeySchema),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  body: z.string().nullable(),
  contentFormat: z.enum(["markdown", "mdx", "blocks", "html"]).nullable(),
  featuredImage: mediaAssetSchema.nullable(),
  author: authorSchema.nullable(),
  categories: z.array(categorySchema),
  tags: z.array(tagSchema),
  seo: seoSchema.nullable(),
  publishedDate: z.string().nullable(),
  updatedDate: z.string().nullable(),
  featured: z.boolean(),
  canonicalUrl: z.string().nullable(),
  hashnodeId: z.string().nullable(),
});

// Minimal reference used by CaseStudy.relatedProject (api::project.project, manyToOne)
export const projectRefSchema = z.object({
  documentId: z.string(),
  name: z.string(),
  slug: z.string(),
});

// api::project.project (relation: `sites` manyToMany)
export const projectSchema = z.object({
  documentId: z.string(),
  siteKeys: z.array(siteKeySchema),
  name: z.string(),
  slug: z.string(),
  summary: z.string().nullable(),
  description: z.string().nullable(),
  projectType: z.string().nullable(),
  technologies: z.array(technologySchema),
  featuredImage: mediaAssetSchema.nullable(),
  gallery: z.array(mediaAssetSchema),
  repositoryUrl: z.string().nullable(),
  liveUrl: z.string().nullable(),
  documentationUrl: z.string().nullable(),
  /** Domain name for Strapi `projectStatus` (status is reserved by Draft & Publish). */
  status: z
    .enum(["planned", "in-progress", "completed", "archived"])
    .nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  featured: z.boolean(),
  seo: seoSchema.nullable(),
  publishedAt: z.string().nullable(),
});

// api::case-study.case-study (relation: `sites` manyToMany, `relatedProject` manyToOne)
export const caseStudySchema = z.object({
  documentId: z.string(),
  siteKeys: z.array(siteKeySchema),
  title: z.string(),
  slug: z.string(),
  clientName: z.string().nullable(),
  summary: z.string().nullable(),
  challenge: z.string().nullable(),
  solution: z.string().nullable(),
  results: z.string().nullable(),
  technologies: z.array(technologySchema),
  relatedProject: projectRefSchema.nullable(),
  featuredImage: mediaAssetSchema.nullable(),
  gallery: z.array(mediaAssetSchema),
  seo: seoSchema.nullable(),
  publishedAt: z.string().nullable(),
});

// api::service.service (relation: `site` manyToOne — single site, not multi)
export const serviceSchema = z.object({
  documentId: z.string(),
  siteKey: siteKeySchema,
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  features: z.array(featureSchema),
  technologies: z.array(technologySchema),
  featuredImage: mediaAssetSchema.nullable(),
  featured: z.boolean(),
  seo: seoSchema.nullable(),
  publishedAt: z.string().nullable(),
});

// api::testimonial.testimonial (relation: `sites` manyToMany)
export const testimonialSchema = z.object({
  documentId: z.string(),
  siteKeys: z.array(siteKeySchema),
  name: z.string(),
  role: z.string().nullable(),
  company: z.string().nullable(),
  quote: z.string(),
  avatar: mediaAssetSchema.nullable(),
  featured: z.boolean(),
});

// api::redirect.redirect (relation: `site` manyToOne — single site, not multi)
export const redirectSchema = z.object({
  documentId: z.string(),
  siteKey: siteKeySchema,
  sourcePath: z.string(),
  destinationPath: z.string(),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]),
  enabled: z.boolean(),
});
