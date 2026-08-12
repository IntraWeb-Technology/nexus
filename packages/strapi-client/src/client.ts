import type { z } from "zod";
import { resolveConfig, verifyPreviewSecret as verifyPreviewSecretImpl } from "./config.js";
import type { CreateStrapiClientOptions } from "./config.js";
import { StrapiValidationError } from "./errors.js";
import { strapiGet } from "./http.js";
import {
  shapeArticle,
  shapeCaseStudy,
  shapeFaqItem,
  shapeNavigation,
  shapePage,
  shapePagination,
  shapeProject,
  shapeRedirect,
  shapeService,
  shapeSiteSettings,
  shapeTestimonial,
  type NormalizeContext,
} from "./normalize/content.js";
import {
  shapeAboutPage,
  shapeContactPage,
  shapeHomePage,
  shapeWorkPage,
} from "./normalize/atlas.js";
import {
  API_PATHS,
  POPULATE,
  bySlugQuery,
  byExactMatchQuery,
  buildQueryString,
  collectionQueryFromOptions,
  listQueryFromOptions,
  siteFilter,
  sitesFilter,
} from "./query.js";
import {
  aboutPageSchema,
  articleSchema,
  caseStudySchema,
  contactPageSchema,
  faqItemSchema,
  homePageSchema,
  navigationSchema,
  pageSchema,
  projectSchema,
  redirectSchema,
  serviceSchema,
  siteSettingsSchema,
  testimonialSchema,
  workPageSchema,
} from "./schemas/domain.js";
import { strapiListResponseSchema } from "./schemas/common.js";
import type {
  AboutPage,
  Article,
  CaseStudy,
  CollectionOptions,
  ContactPage,
  FaqItem,
  HomePage,
  ListOptions,
  Paginated,
  Project,
  RequestOptions,
  Service,
  SiteKey,
  StrapiClient,
  Testimonial,
  WorkPage,
} from "./types.js";

function validate<Schema extends z.ZodTypeAny>(
  schema: Schema,
  candidate: unknown,
  path: string,
): z.infer<Schema> {
  const result = schema.safeParse(candidate);
  if (!result.success) {
    throw new StrapiValidationError(path, result.error.issues, `Strapi response failed validation for ${path}`);
  }
  return result.data;
}

async function fetchEnvelope(
  config: ReturnType<typeof resolveConfig>,
  path: string,
  query: string,
  requestOptions: RequestOptions | undefined,
): Promise<{ data: unknown[]; meta: unknown }> {
  const raw = await strapiGet(config, {
    path,
    query,
    signal: requestOptions?.signal,
    timeoutMs: requestOptions?.timeoutMs,
  });
  const envelope = validate(strapiListResponseSchema, raw, path);
  return { data: envelope.data ?? [], meta: envelope.meta ?? null };
}

export function createStrapiClient(options: CreateStrapiClientOptions): StrapiClient {
  const config = resolveConfig(options);
  const ctx: NormalizeContext = { mediaBaseUrl: config.baseUrl };

  const getSiteSettings: StrapiClient["getSiteSettings"] = async (siteKey, requestOptions) => {
    const path = API_PATHS.siteSettings;
    const query = buildQueryString({
      filters: siteFilter(siteKey),
      populate: POPULATE.siteSettings,
      pagination: { page: 1, pageSize: 1 },
      status: requestOptions?.preview ? "draft" : "published",
    });
    const { data } = await fetchEnvelope(config, path, query, requestOptions);
    const candidate = shapeSiteSettings(data[0], siteKey, ctx);
    if (!candidate) return null;
    return validate(siteSettingsSchema, candidate, path);
  };

  const getNavigation: StrapiClient["getNavigation"] = async (siteKey, location, requestOptions) => {
    const path = API_PATHS.navigations;
    const query = buildQueryString({
      filters: { site: { key: { $eq: siteKey } }, location: { $eq: location } },
      populate: POPULATE.navigation,
      pagination: { page: 1, pageSize: 1 },
      status: requestOptions?.preview ? "draft" : "published",
    });
    const { data } = await fetchEnvelope(config, path, query, requestOptions);
    const candidate = shapeNavigation(data[0], siteKey);
    if (!candidate) return null;
    return validate(navigationSchema, candidate, path);
  };

  const getPageBySlug: StrapiClient["getPageBySlug"] = async (siteKey, slug, requestOptions) => {
    const path = API_PATHS.pages;
    const query = bySlugQuery(siteFilter(siteKey), slug, POPULATE.page, requestOptions?.preview);
    const { data } = await fetchEnvelope(config, path, query, requestOptions);
    const candidate = shapePage(data[0], siteKey, ctx);
    if (!candidate) return null;
    return validate(pageSchema, candidate, path);
  };

  const getArticles: StrapiClient["getArticles"] = async (
    siteKey,
    options?: ListOptions & RequestOptions,
  ): Promise<Paginated<Article>> => {
    const path = API_PATHS.articles;
    const query = listQueryFromOptions(sitesFilter(siteKey), options, POPULATE.article, {
      sort: "publishedDate:desc",
      pageSize: 25,
    });
    const { data, meta } = await fetchEnvelope(config, path, query, options);
    const items = data
      .map((raw) => shapeArticle(raw, siteKey, ctx))
      .filter((candidate): candidate is NonNullable<typeof candidate> => candidate != null)
      .map((candidate) => validate(articleSchema, candidate, path));
    return { items, pagination: shapePagination(meta) };
  };

  const getArticleBySlug: StrapiClient["getArticleBySlug"] = async (siteKey, slug, requestOptions) => {
    const path = API_PATHS.articles;
    const query = bySlugQuery(sitesFilter(siteKey), slug, POPULATE.article, requestOptions?.preview);
    const { data } = await fetchEnvelope(config, path, query, requestOptions);
    const candidate = shapeArticle(data[0], siteKey, ctx);
    if (!candidate) return null;
    return validate(articleSchema, candidate, path);
  };

  const getProjects: StrapiClient["getProjects"] = async (
    siteKey,
    options?: ListOptions & RequestOptions,
  ): Promise<Paginated<Project>> => {
    const path = API_PATHS.projects;
    const query = listQueryFromOptions(sitesFilter(siteKey), options, POPULATE.project, {
      sort: "featured:desc",
      pageSize: 25,
    });
    const { data, meta } = await fetchEnvelope(config, path, query, options);
    const items = data
      .map((raw) => shapeProject(raw, siteKey, ctx))
      .filter((candidate): candidate is NonNullable<typeof candidate> => candidate != null)
      .map((candidate) => validate(projectSchema, candidate, path));
    return { items, pagination: shapePagination(meta) };
  };

  const getProjectBySlug: StrapiClient["getProjectBySlug"] = async (siteKey, slug, requestOptions) => {
    const path = API_PATHS.projects;
    const query = bySlugQuery(sitesFilter(siteKey), slug, POPULATE.project, requestOptions?.preview);
    const { data } = await fetchEnvelope(config, path, query, requestOptions);
    const candidate = shapeProject(data[0], siteKey, ctx);
    if (!candidate) return null;
    return validate(projectSchema, candidate, path);
  };

  const getServices: StrapiClient["getServices"] = async (
    siteKey,
    options?: CollectionOptions & RequestOptions,
  ): Promise<Service[]> => {
    const path = API_PATHS.services;
    const query = collectionQueryFromOptions(siteFilter(siteKey), options, POPULATE.service);
    const { data } = await fetchEnvelope(config, path, query, options);
    return data
      .map((raw) => shapeService(raw, siteKey, ctx))
      .filter((candidate): candidate is NonNullable<typeof candidate> => candidate != null)
      .map((candidate) => validate(serviceSchema, candidate, path));
  };

  const getCaseStudies: StrapiClient["getCaseStudies"] = async (
    siteKey,
    options?: ListOptions & RequestOptions,
  ): Promise<Paginated<CaseStudy>> => {
    const path = API_PATHS.caseStudies;
    const query = listQueryFromOptions(sitesFilter(siteKey), options, POPULATE.caseStudy, {
      pageSize: 25,
    });
    const { data, meta } = await fetchEnvelope(config, path, query, options);
    const items = data
      .map((raw) => shapeCaseStudy(raw, siteKey, ctx))
      .filter((candidate): candidate is NonNullable<typeof candidate> => candidate != null)
      .map((candidate) => validate(caseStudySchema, candidate, path));
    return { items, pagination: shapePagination(meta) };
  };

  const getCaseStudyBySlug: StrapiClient["getCaseStudyBySlug"] = async (siteKey, slug, requestOptions) => {
    const path = API_PATHS.caseStudies;
    const query = bySlugQuery(sitesFilter(siteKey), slug, POPULATE.caseStudy, requestOptions?.preview);
    const { data } = await fetchEnvelope(config, path, query, requestOptions);
    const candidate = shapeCaseStudy(data[0], siteKey, ctx);
    if (!candidate) return null;
    return validate(caseStudySchema, candidate, path);
  };

  const getTestimonials: StrapiClient["getTestimonials"] = async (
    siteKey,
    options?: CollectionOptions & RequestOptions,
  ): Promise<Testimonial[]> => {
    const path = API_PATHS.testimonials;
    const query = collectionQueryFromOptions(sitesFilter(siteKey), options, POPULATE.testimonial);
    const { data } = await fetchEnvelope(config, path, query, options);
    return data
      .map((raw) => shapeTestimonial(raw, siteKey, ctx))
      .filter((candidate): candidate is NonNullable<typeof candidate> => candidate != null)
      .map((candidate) => validate(testimonialSchema, candidate, path));
  };

  const getFaqItems: StrapiClient["getFaqItems"] = async (
    siteKey,
    options?: CollectionOptions & RequestOptions,
  ): Promise<FaqItem[]> => {
    const path = API_PATHS.faqItems;
    const query = collectionQueryFromOptions(sitesFilter(siteKey), { sort: "sortOrder:asc", ...options }, POPULATE.faqItem);
    const { data } = await fetchEnvelope(config, path, query, options);
    return data
      .map((raw) => shapeFaqItem(raw, siteKey))
      .filter((candidate): candidate is NonNullable<typeof candidate> => candidate != null)
      .map((candidate) => validate(faqItemSchema, candidate, path));
  };

  const getRedirect: StrapiClient["getRedirect"] = async (siteKey, sourcePath, requestOptions) => {
    const path = API_PATHS.redirects;
    const query = byExactMatchQuery(siteFilter(siteKey), "sourcePath", sourcePath, POPULATE.redirect);
    const { data } = await fetchEnvelope(config, path, query, requestOptions);
    const candidate = shapeRedirect(data[0], siteKey);
    if (!candidate) return null;
    return validate(redirectSchema, candidate, path);
  };

  const getSingletonBySite = async <Schema extends z.ZodTypeAny>(
    apiPath: (typeof API_PATHS)[keyof typeof API_PATHS],
    populate: unknown,
    schema: Schema,
    shaper: (
      raw: unknown,
      siteKey: SiteKey,
      ctx: NormalizeContext,
    ) => z.input<Schema> | null,
    siteKey: SiteKey,
    requestOptions?: RequestOptions,
  ): Promise<z.infer<Schema> | null> => {
    const query = buildQueryString({
      filters: siteFilter(siteKey),
      populate,
      pagination: { page: 1, pageSize: 1 },
      status: requestOptions?.preview ? "draft" : "published",
    });
    const { data } = await fetchEnvelope(config, apiPath, query, requestOptions);
    const candidate = shaper(data[0], siteKey, ctx);
    if (!candidate) return null;
    return validate(schema, candidate, apiPath);
  };

  const getHomePage: StrapiClient["getHomePage"] = async (siteKey, requestOptions) =>
    getSingletonBySite(
      API_PATHS.homePages,
      POPULATE.homePage,
      homePageSchema,
      shapeHomePage,
      siteKey,
      requestOptions,
    );

  const getAboutPage: StrapiClient["getAboutPage"] = async (siteKey, requestOptions) =>
    getSingletonBySite(
      API_PATHS.aboutPages,
      POPULATE.aboutPage,
      aboutPageSchema,
      shapeAboutPage,
      siteKey,
      requestOptions,
    );

  const getWorkPage: StrapiClient["getWorkPage"] = async (siteKey, requestOptions) =>
    getSingletonBySite(
      API_PATHS.workPages,
      POPULATE.workPage,
      workPageSchema,
      shapeWorkPage,
      siteKey,
      requestOptions,
    );

  const getContactPage: StrapiClient["getContactPage"] = async (siteKey, requestOptions) =>
    getSingletonBySite(
      API_PATHS.contactPages,
      POPULATE.contactPage,
      contactPageSchema,
      shapeContactPage,
      siteKey,
      requestOptions,
    );

  return {
    verifyPreviewSecret: (secret) => verifyPreviewSecretImpl(config, secret),
    getSiteSettings,
    getNavigation,
    getPageBySlug,
    getArticles,
    getArticleBySlug,
    getProjects,
    getProjectBySlug,
    getServices,
    getCaseStudies,
    getCaseStudyBySlug,
    getTestimonials,
    getFaqItems,
    getRedirect,
    getHomePage,
    getAboutPage,
    getWorkPage,
    getContactPage,
  } satisfies StrapiClient;
}
