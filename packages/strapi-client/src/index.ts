/**
 * `@repo/strapi-client` — server-only typed Strapi 5 REST client.
 *
 * **Never import this package into Client Components or browser bundles.**
 * Tokens must come from server env (`STRAPI_API_TOKEN`), never `NEXT_PUBLIC_*`.
 */

export { createStrapiClient } from "./client.js";
export type { CreateStrapiClientOptions } from "./config.js";
export { STRAPI_ENV_KEYS, verifyPreviewSecret } from "./config.js";

export {
  StrapiClientError,
  StrapiHttpError,
  StrapiTimeoutError,
  StrapiValidationError,
} from "./errors.js";
export type { StrapiErrorCode } from "./errors.js";

export {
  API_PATHS,
  POPULATE,
  siteFilter,
  sitesFilter,
  siteKeyFilter,
  sitesKeyFilter,
  buildQueryString,
  mergeFilters,
  statusFromPreview,
} from "./query.js";

export {
  shapeArticle,
  normalizeArticle,
} from "./normalize/index.js";

export type {
  Article,
  Author,
  CaseStudy,
  Category,
  CollectionOptions,
  ContactInformation,
  FaqItem,
  Feature,
  Link,
  ListOptions,
  MediaAsset,
  Navigation,
  NavigationItem,
  NavigationLocation,
  Page,
  PageBlock,
  Paginated,
  PaginationMeta,
  Project,
  ProjectRef,
  PublicationStatus,
  Redirect,
  RequestOptions,
  Seo,
  Service,
  SiteKey,
  SiteRef,
  SiteSettings,
  SocialLink,
  StatItem,
  StrapiClient,
  Tag,
  Technology,
  Testimonial,
} from "./types.js";
