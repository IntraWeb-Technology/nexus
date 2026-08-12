import type {
  CollectionOptions,
  ListOptions,
  PublicationStatus,
  SiteKey,
} from "./types.js";

/** Collection REST paths (plural API IDs). */
export const API_PATHS = {
  siteSettings: "/api/site-settings",
  navigations: "/api/navigations",
  pages: "/api/pages",
  articles: "/api/articles",
  projects: "/api/projects",
  services: "/api/services",
  caseStudies: "/api/case-studies",
  testimonials: "/api/testimonials",
  faqItems: "/api/faq-items",
  redirects: "/api/redirects",
  homePages: "/api/home-pages",
  aboutPages: "/api/about-pages",
  workPages: "/api/work-pages",
  contactPages: "/api/contact-pages",
} as const;

/**
 * Site filter for types with exactly one Site relation (`site`).
 * Strapi 5 deep filter: `filters[site][key][$eq]=personal`
 */
export function siteFilter(siteKey: SiteKey): Record<string, unknown> {
  return {
    site: {
      key: {
        $eq: siteKey,
      },
    },
  };
}

/** Alias matching architecture-docs wording. */
export const siteKeyFilter = siteFilter;

/**
 * Site filter for many-to-many Site relations (`sites`).
 * Strapi 5 deep filter: `filters[sites][key][$eq]=personal`
 */
export function sitesFilter(siteKey: SiteKey): Record<string, unknown> {
  return {
    sites: {
      key: {
        $eq: siteKey,
      },
    },
  };
}

/** Alias matching architecture-docs wording. */
export const sitesKeyFilter = sitesFilter;

export function mergeFilters(
  ...parts: Array<Record<string, unknown> | undefined>
): Record<string, unknown> | undefined {
  const defined = parts.filter(
    (part): part is Record<string, unknown> =>
      part != null && Object.keys(part).length > 0,
  );
  if (defined.length === 0) return undefined;
  if (defined.length === 1) return defined[0];
  return { $and: defined };
}

export function statusFromPreview(preview?: boolean): PublicationStatus {
  return preview ? "draft" : "published";
}

export type BuildQueryInput = {
  filters?: Record<string, unknown>;
  populate?: unknown;
  pagination?: { page?: number; pageSize?: number };
  sort?: string | string[];
  status?: PublicationStatus;
  fields?: string[];
};

/**
 * Serialize nested query params using Strapi's LHS bracket notation
 * (same shape as `qs.stringify(..., { encodeValuesOnly: true })`).
 */
export function buildQueryString(input: BuildQueryInput): string {
  const query: Record<string, unknown> = {};

  if (input.filters && Object.keys(input.filters).length > 0) {
    query.filters = input.filters;
  }
  if (input.populate !== undefined) {
    query.populate = input.populate;
  }
  if (input.pagination) {
    query.pagination = input.pagination;
  }
  if (input.sort !== undefined) {
    query.sort = input.sort;
  }
  if (input.status) {
    query.status = input.status;
  }
  if (input.fields) {
    query.fields = input.fields;
  }

  return stringifyBrackets(query);
}

function stringifyBrackets(
  value: unknown,
  prefix = "",
  parts: string[] = [],
): string {
  if (value === undefined || value === null) {
    return parts.join("&");
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const key = prefix ? `${prefix}[${index}]` : String(index);
      if (item !== null && typeof item === "object") {
        stringifyBrackets(item, key, parts);
      } else {
        parts.push(`${key}=${encodeURIComponent(String(item))}`);
      }
    });
    return parts.join("&");
  }

  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const next = prefix ? `${prefix}[${key}]` : key;
      if (nested !== null && typeof nested === "object") {
        stringifyBrackets(nested, next, parts);
      } else if (nested !== undefined) {
        parts.push(`${next}=${encodeURIComponent(String(nested))}`);
      }
    }
    return parts.join("&");
  }

  if (prefix) {
    parts.push(`${prefix}=${encodeURIComponent(String(value))}`);
  }
  return parts.join("&");
}

function featuredFilter(
  featured: boolean | undefined,
): Record<string, unknown> | undefined {
  if (featured === undefined) return undefined;
  return { featured: { $eq: featured } };
}

export function listQueryFromOptions(
  siteFilterValue: Record<string, unknown>,
  options: ListOptions | undefined,
  populate: unknown,
  defaults?: { sort?: string | string[]; pageSize?: number },
): string {
  const filters = mergeFilters(
    siteFilterValue,
    featuredFilter(options?.featured),
    options?.filters,
  );
  return buildQueryString({
    filters,
    populate,
    pagination: {
      page: options?.page ?? 1,
      pageSize: options?.pageSize ?? defaults?.pageSize ?? 25,
    },
    sort: options?.sort ?? defaults?.sort,
    status: statusFromPreview(options?.preview),
  });
}

export function collectionQueryFromOptions(
  siteFilterValue: Record<string, unknown>,
  options: CollectionOptions | undefined,
  populate: unknown,
  defaults?: { sort?: string | string[]; pageSize?: number },
): string {
  const filters = mergeFilters(
    siteFilterValue,
    featuredFilter(options?.featured),
    options?.filters,
  );
  return buildQueryString({
    filters,
    populate,
    pagination: {
      page: 1,
      pageSize: defaults?.pageSize ?? 100,
    },
    sort: options?.sort ?? defaults?.sort,
    status: statusFromPreview(options?.preview),
  });
}

export function bySlugQuery(
  siteFilterValue: Record<string, unknown>,
  slug: string,
  populate: unknown,
  preview?: boolean,
): string {
  return byExactMatchQuery(siteFilterValue, "slug", slug, populate, preview);
}

export function byExactMatchQuery(
  siteFilterValue: Record<string, unknown>,
  field: string,
  value: string,
  populate: unknown,
  preview?: boolean,
): string {
  return buildQueryString({
    filters: mergeFilters(siteFilterValue, {
      [field]: { $eq: value },
    }),
    populate,
    pagination: { page: 1, pageSize: 1 },
    status: statusFromPreview(preview),
  });
}

/** Shared populate fragments aligned with content-model components. */
const publishingMediaPopulate = {
  asset: true,
} as const;

const publishingSectionPopulate = {
  figure: { populate: publishingMediaPopulate },
  callout: true,
  code: true,
  terminal: true,
  table: true,
  evidence: {
    populate: {
      meta: true,
    },
  },
} as const;

const homeBridgePopulate = {
  cta: true,
  workLink: true,
} as const;

export const POPULATE = {
  media: true,
  seo: {
    populate: {
      ogImage: true,
    },
  },
  siteSettings: {
    defaultSeo: {
      populate: {
        ogImage: true,
      },
    },
    logo: true,
    favicon: true,
    contactInformation: true,
    socialLinks: true,
    site: true,
  },
  navigation: {
    items: {
      populate: {
        children: {
          populate: {
            children: true,
          },
        },
      },
    },
    site: true,
  },
  page: {
    seo: {
      populate: {
        ogImage: true,
      },
    },
    site: true,
    sections: {
      on: {
        "blocks.hero": {
          populate: {
            media: true,
            primaryCta: true,
            secondaryCta: true,
          },
        },
        "blocks.rich-text": true,
        "blocks.cta": {
          populate: {
            button: true,
          },
        },
        "blocks.faq-section": {
          populate: {
            items: true,
          },
        },
        "blocks.media": {
          populate: {
            media: true,
          },
        },
        "blocks.stats": {
          populate: {
            items: true,
          },
        },
      },
    },
  },
  article: {
    featuredImage: true,
    seo: {
      populate: {
        ogImage: true,
      },
    },
    author: {
      populate: {
        avatar: true,
        socialLinks: true,
      },
    },
    categories: true,
    tags: true,
    sites: true,
    headerMeta: true,
    sections: {
      populate: publishingSectionPopulate,
    },
    contactBridge: {
      populate: homeBridgePopulate,
    },
  },
  project: {
    featuredImage: true,
    gallery: true,
    seo: {
      populate: {
        ogImage: true,
      },
    },
    technologies: {
      populate: {
        logo: true,
      },
    },
    sites: true,
    cardMedia: {
      populate: publishingMediaPopulate,
    },
  },
  caseStudy: {
    featuredImage: true,
    gallery: true,
    seo: {
      populate: {
        ogImage: true,
      },
    },
    technologies: {
      populate: {
        logo: true,
      },
    },
    relatedProject: true,
    sites: true,
    heroMeta: true,
    overview: true,
    problem: true,
    constraints: true,
    architecture: true,
    decisions: true,
    implementation: true,
    delivery: true,
    outcomes: true,
    lessons: true,
    figureSlots: {
      populate: {
        media: {
          populate: publishingMediaPopulate,
        },
      },
    },
    contactBridge: {
      populate: homeBridgePopulate,
    },
  },
  service: {
    featuredImage: true,
    seo: {
      populate: {
        ogImage: true,
      },
    },
    features: true,
    technologies: {
      populate: {
        logo: true,
      },
    },
    site: true,
  },
  testimonial: {
    avatar: true,
    sites: true,
  },
  faqItem: {
    sites: true,
  },
  redirect: {
    site: true,
  },
  homePage: {
    site: true,
    seo: {
      populate: {
        ogImage: true,
      },
    },
    hero: {
      populate: {
        media: { populate: publishingMediaPopulate },
        primaryCta: true,
        secondaryCta: true,
      },
    },
    featured: {
      populate: {
        figure: { populate: publishingMediaPopulate },
        cta: true,
      },
    },
    featuredProject: true,
    selected: {
      populate: {
        project: {
          populate: {
            cardMedia: { populate: publishingMediaPopulate },
          },
        },
      },
    },
    philosophy: true,
    writingItems: {
      populate: {
        article: true,
      },
    },
    aboutTeaser: {
      populate: homeBridgePopulate,
    },
    contactBridge: {
      populate: homeBridgePopulate,
    },
  },
  aboutPage: {
    site: true,
    seo: {
      populate: {
        ogImage: true,
      },
    },
    opening: true,
    philosophy: true,
    approach: {
      populate: {
        figure: { populate: publishingMediaPopulate },
      },
    },
    style: true,
    principles: true,
    timeline: true,
    focus: true,
    reading: true,
    architecture: {
      populate: {
        figure: { populate: publishingMediaPopulate },
      },
    },
    notes: true,
    contactBridge: {
      populate: homeBridgePopulate,
    },
  },
  workPage: {
    site: true,
    seo: {
      populate: {
        ogImage: true,
      },
    },
    intro: {
      populate: {
        meta: true,
      },
    },
    featuredProject: {
      populate: {
        cardMedia: { populate: publishingMediaPopulate },
      },
    },
    featuredCopy: {
      populate: {
        figure: { populate: publishingMediaPopulate },
        figureCompact: { populate: publishingMediaPopulate },
        cta: true,
      },
    },
    taxonomy: true,
    contactBridge: {
      populate: homeBridgePopulate,
    },
  },
  contactPage: {
    site: true,
    seo: {
      populate: {
        ogImage: true,
      },
    },
  },
} as const;
