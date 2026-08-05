# Shared architecture contracts

**Status:** Active  
**Date:** 2026-08-04  
**Owner:** Lead Architecture Agent

All specialized agents must follow these contracts. Do not invent incompatible schemas, API shapes, or site keys.

---

## Site keys (stable)

| key | Domain | Frontend |
|---|---|---|
| `personal` | johnschibelli.dev | `apps/personal-site/apps/site` (canonical content also in portfolio-os) |
| `intraweb` | intrawebtech.com | `apps/iw-site-q2` |

---

## Strapi instance strategy

| Environment | Instance | Notes |
|---|---|---|
| Local / schema development | `apps/cms-strapi` (Strapi **5.51.1**) | SQLite by default; Postgres via `DATABASE_CLIENT=postgres` |
| Production candidate A | Dedicated content Strapi (preferred until live inventory clears) | Same major as branding CMS |
| Production candidate B | `https://cms.intrawebtech.com` | Only after backup + content-type inventory + explicit approval |

**Do not write production schemas without approval.**

---

## Content-type UIDs (v1)

| UID | Collection | Site rule |
|---|---|---|
| `api::site.site` | Site | n/a |
| `api::site-setting.site-setting` | Site Settings | exactly one Site |
| `api::navigation.navigation` | Navigation | exactly one Site |
| `api::page.page` | Page | exactly one Site; unique `(site, slug)` |
| `api::article.article` | Article | many Sites |
| `api::author.author` | Author | global |
| `api::category.category` | Category | global |
| `api::tag.tag` | Tag | global |
| `api::project.project` | Project | many Sites |
| `api::technology.technology` | Technology | global |
| `api::case-study.case-study` | Case Study | many Sites |
| `api::service.service` | Service | exactly one Site |
| `api::faq-item.faq-item` | FAQ Item | many Sites |
| `api::testimonial.testimonial` | Testimonial | many Sites |
| `api::redirect.redirect` | Redirect | exactly one Site |

---

## Component UIDs (v1)

```text
shared.seo
shared.link
shared.social-link
shared.navigation-item
shared.contact-information
shared.feature
blocks.hero
blocks.rich-text
blocks.cta
blocks.faq-section
blocks.media
blocks.stats
```

Page dynamic zone: `sections` → only `blocks.*` above. Unknown blocks: log + skip.

---

## Shared client public API

Package: `packages/strapi-client` (`@repo/strapi-client`) — **implemented** (server-only; Zod-validated; 10 unit tests).

Consumer dependency: `"@repo/strapi-client": "workspace:*"`

```ts
type SiteKey = "personal" | "intraweb";

getSiteSettings(siteKey: SiteKey)
getNavigation(siteKey: SiteKey, location: "header" | "footer" | "mobile" | "sidebar")
getPageBySlug(siteKey: SiteKey, slug: string)
getArticles(siteKey: SiteKey, options?: ListOptions)
getArticleBySlug(siteKey: SiteKey, slug: string)
getProjects(siteKey: SiteKey, options?: ListOptions)
getProjectBySlug(siteKey: SiteKey, slug: string)
getServices(siteKey: SiteKey)
getCaseStudies(siteKey: SiteKey, options?: ListOptions)
getCaseStudyBySlug(siteKey: SiteKey, slug: string)
getTestimonials(siteKey: SiteKey)
getFaqItems(siteKey: SiteKey)
getRedirect(siteKey: SiteKey, sourcePath: string)
```

Rules:

- Server-only auth (`STRAPI_API_TOKEN`) — never `NEXT_PUBLIC_`
- All public queries filter by Site relation (except global types)
- Normalize to domain models; never return raw Strapi DTOs to UI
- Runtime validation with Zod

---

## Env vars (frontends)

```text
STRAPI_URL=
STRAPI_API_TOKEN=
STRAPI_PREVIEW_SECRET=
STRAPI_WEBHOOK_SECRET=
```

Site key is a build-time constant per app, not a secret.

---

## Editorial vs operational boundary

```text
Editorial → Strapi
Operational (portal) → Supabase / Clerk / Stripe / HubSpot
```

---

## Content source roots for migration

| Source | Absolute path |
|---|---|
| Portfolio blog + case studies + projects | `C:\Users\jschi\OneDrive\Desktop\Projects\2025_portfolio\portfolio-os\apps\site\` |
| Hashnode mirror | `E:\IntraWeb-Technologies\10_Repos\hashnode-schibelli\` |
| IntraWeb marketing | `E:\IntraWeb-Technologies\10_Repos\nexus\apps\iw-site-q2\` |
| Incomplete nexus copy | `apps/personal-site` — missing `content/blog` and 2 case studies; do not treat as SoT |

---

## Webhook / revalidation payload (draft)

```json
{
  "event": "entry.publish | entry.unpublish | entry.update | entry.delete",
  "uid": "api::article.article",
  "entryId": "string",
  "siteKeys": ["personal"],
  "slugs": { "article": "slug-here" },
  "paths": ["/blog/slug-here"]
}
```

Secret header: `x-strapi-webhook-secret` matching `STRAPI_WEBHOOK_SECRET`.

---

## Migration tooling

| Path | Role |
|---|---|
| `tools/strapi-migrate` | **Canonical** dry-run / validate / live upsert / rollback |
| `apps/cms-strapi/scripts/seed-sites.ts` | Seed `personal` + `intraweb` Site entries |
| `apps/cms-strapi/scripts/migrate/*` | Do not use in parallel — fold into `tools/strapi-migrate` if useful |

Live upsert maps normalized records to Strapi 5 REST shapes with Site `connect` by `key`. Remote media re-upload and Tag/Technology connect are still open.

---

## Frontend integration status

| App | Site key | Status |
|---|---|---|
| `apps/iw-site-q2` | `intraweb` | Soft fallback for nav, FAQ, services; Draft Mode `/api/preview` + `/api/exit-preview`; webhook `/api/revalidate` |
| `apps/personal-site/apps/site` | `personal` | Soft fallback Strapi → local → Hashnode; same preview + revalidate routes; thin `lib/strapi.ts` with `{ preview }` |

Unset / empty / error → existing hardcoded or local loaders. Never blank the page.
