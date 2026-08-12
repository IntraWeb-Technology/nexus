# Route and SEO parity

**Status:** Validated against current `app/` trees + sitemaps (2026-08-04)  
**Validator:** Testing and Validation Agent  
**Prefer:** Preserve URLs (no redirects unless a path cannot be kept)

Status values: `preserved` | `cms-backed-fallback` | `placeholder` | `deferred`

Related: ADR-010 in sibling `cms-strapi-docs/content/adr/`, [architecture-contracts.md](./architecture-contracts.md), [migration-report.md](./migration-report.md)

---

## Personal (`johnschibelli.dev`)

**Source tree:** `apps/personal-site/apps/site/app/`  
**Sitemap:** `apps/personal-site/apps/site/app/sitemap.ts`  
**Content resolution:** Strapi (when enabled) → local markdown/TS → Hashnode (`lib/content-api.ts`, `lib/strapi-content.ts`)

### Public marketing / content routes

| Old URL | New URL | Status | Canonical notes | Redirect? | Metadata parity | Structured data |
|---|---|---|---|---|---|---|
| `/` | `/` | `preserved` | Site default (`NEXT_PUBLIC_SITE_URL` \|\| `https://johnschibelli.dev`) | No | Static / layout metadata unchanged | Site-level as before |
| `/about` | `/about` | `preserved` | Site default | No | Unchanged (not CMS-driven yet) | As before |
| `/contact` | `/contact` | `preserved` | Site default | No | Unchanged | As before |
| `/blog` | `/blog` | `cms-backed-fallback` | Index uses unified posts; URL preserved | No | Title/description from posts when present | Article list — no new schema required |
| `/blog/[slug]` | `/blog/[slug]` | `cms-backed-fallback` | Prefer Strapi `shared.seo.canonicalUrl` when live; during dual-run Hashnode host may still be authoritative — set explicit canonicals before cutover | No (prefer preserve) | `generateMetadata` from post title/brief/cover; **no `alternates.canonical` yet** on blog slug page | Article JSON-LD not wired on blog slug page today |
| `/projects` | `/projects` | `cms-backed-fallback` | Site default | No | Index metadata preserved | N/A |
| `/projects/[slug]` | `/projects/[slug]` | `cms-backed-fallback` | Page hardcodes `https://schibelli.dev/projects/...` — **domain mismatch risk** vs `johnschibelli.dev` / sitemap base | No | OG/Twitter present; align `metadataBase` / canonical host before cutover | CreativeWork / SoftwareApplication JSON-LD present |
| `/case-studies` | `/case-studies` | `cms-backed-fallback` | Site default | No | Index metadata present | N/A |
| `/case-studies/[slug]` | `/case-studies/[slug]` | `cms-backed-fallback` | Canonical `https://johnschibelli.dev/case-studies/{slug}` | No | `generateMetadata` + `alternates.canonical` | As implemented on page |

### Sitemap coverage (personal)

Included: `/`, `/about`, `/projects`, `/case-studies`, `/blog`, `/contact`, plus dynamic `/projects/*`, published `/case-studies/*`, `/blog/*`.

Not in sitemap (expected): `/login`, `/admin/**`, `/maintenance`, `/under-construction`.

### Operational / utility routes (out of editorial CMS scope)

| Old URL | New URL | Status | Canonical notes | Redirect? | Metadata parity | Structured data |
|---|---|---|---|---|---|---|
| `/login` | `/login` | `deferred` | Auth surface — not Strapi | No | N/A | N/A |
| `/admin/**` | `/admin/**` | `deferred` | Portfolio OS admin — operational; ADR-021 boundary | No | N/A | N/A |
| `/maintenance` | `/maintenance` | `deferred` | Ops utility | No | N/A | N/A |
| `/under-construction` | `/under-construction` | `deferred` | Ops utility | No | N/A | N/A |

### Personal SEO notes

- **URL preservation:** Public content paths match pre-migration routes; no redirect map required for the marketing surface.
- **Dual-run:** Blog soft-fails Strapi/local → Hashnode so the site never blanks; duplicate indexing risk until Strapi canonicals win and Hashnode is demoted.
- **RSS:** `app/blog/rss.xml/route.ts` updated for unified content path — verify published dates after live migrate.
- **Host inconsistency:** Project detail metadata still references `schibelli.dev`; sitemap/case studies use `johnschibelli.dev`. Fix before SEO cutover sign-off.

---

## IntraWeb (`intrawebtech.com`)

**Source tree:** `apps/iw-site-q2/app/(site)/`  
**Sitemap:** `apps/iw-site-q2/app/sitemap.ts` (static subset)  
**CMS soft-fail:** FAQ, nav, services via `lib/strapi-content.ts` → hardcoded fallbacks

### Public routes

| Old URL | New URL | Status | Canonical notes | Redirect? | Metadata parity | Structured data |
|---|---|---|---|---|---|---|
| `/` | `/` | `cms-backed-fallback` | Site URL from `lib/site-url` / seo-meta | No | `pageMetadata(homeSeo)` preserved; nav soft-fails to hardcoded | WebSite + WebPage JSON-LD |
| `/services` | `/services` | `cms-backed-fallback` | Site default | No | `pageMetadata(servicesSeo)`; packages from Strapi when present else hardcoded | Breadcrumb + ItemList + FAQPage (resolved FAQs) |
| `/diagnostic` | `/diagnostic` | `cms-backed-fallback` | Site default | No | `pageMetadata(diagnosticSeo)` | Service + HowTo + FAQPage + Breadcrumb |
| `/about` | `/about` | `preserved` | Site default | No | `pageMetadata(aboutSeo)` | Person + Breadcrumb |
| `/work` | `/work` | `placeholder` | URL preserved; body is placeholder grid (not CMS case studies yet) | No | `pageMetadata(workSeo)` present | Breadcrumb only |
| `/contact` | `/contact` | `preserved` | Site default | No | `pageMetadata(contactSeo)` | Breadcrumb |
| `/start` | `/start` | `preserved` | Intake funnel; not in sitemap | No | Page metadata as coded | None required |
| `/thank-you` | `/thank-you` | `preserved` | Post-submit; not in sitemap | No | As coded | None required |
| `/blog` | `/blog` | `placeholder` | “Coming soon” stub; **not in sitemap** (correct until articles exist) | No | Absolute title set | None |
| `/privacy` | `/privacy` | `preserved` | `alternates.canonical: /privacy` | No | Legal copy | None |
| `/terms` | `/terms` | `preserved` | `alternates.canonical: /terms` | No | Legal copy | None |
| `/data-deletion` | `/data-deletion` | `preserved` | Compliance flow; not in sitemap | No | As coded | None |
| `/data-deletion/confirm` | `/data-deletion/confirm` | `preserved` | Token confirm step | No | As coded | None |

### Sitemap coverage (IntraWeb)

Included today: `/`, `/services`, `/diagnostic`, `/about`, `/work`, `/contact`.

Not listed (intentional for now): `/start`, `/thank-you`, `/blog`, `/privacy`, `/terms`, `/data-deletion*`. Add `/blog` (and article slugs) only after published IntraWeb articles exist.

### IntraWeb SEO notes

- **URL preservation:** All existing public paths retained; design and hardcoded marketing remain the fallback.
- **FAQ JSON-LD:** `buildFaqPageJsonLd(resolveGeoFaqItems())` — must stay in sync with visible FAQ accordion (Strapi or `lib/geo-faq.ts`).
- **Services pricing:** Migration review queue flags package tiers without prices — do not invent prices in CMS or metadata.
- **Work / blog:** Placeholder until Case Study / Article content is published for `intraweb` and frontends render lists.

---

## Cutover checklist (not yet run against production)

- [ ] No cross-site content leakage (`personal` vs `intraweb` filters)
- [ ] Duplicate slugs across sites allowed; same site blocked (lifecycle)
- [ ] Drafts not indexed / not in sitemap
- [ ] Sitemap includes published Strapi routes only where CMS is SoT
- [ ] RSS (personal) includes Strapi articles with correct dates
- [ ] Hashnode dual-run uses canonicals to avoid duplicate indexing
- [ ] OG images resolve (CDN URLs until media library / R2)
- [ ] FAQ JSON-LD still matches visible FAQs
- [ ] Align personal project canonical host (`schibelli.dev` vs `johnschibelli.dev`)
- [ ] Preview + webhook revalidate secrets set per environment
