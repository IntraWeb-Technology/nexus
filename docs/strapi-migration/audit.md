# Multi-Site Strapi Migration — Workspace Audit

**Status:** Complete (implementation inventory)  
**Date:** 2026-08-03  
**Audience:** Lead Architecture Agent, specialized migration agents, maintainers  
**Canonical docs:** will also be published under `cms-strapi-docs` (`/docs/architecture/`)

This audit is the prerequisite for shared content-model design. No destructive content or route replacement has been performed.

---

## 1. Executive findings

| Finding | Detail |
|---|---|
| Shared Strapi target exists externally | Production Strapi **5.51.1** at `https://cms.intrawebtech.com` (Hostinger VPS Docker project `strapi-mmex`, Elestio image). Used today as **IntraWeb CMS product branding**, not as the portfolio/IntraWeb content backend. |
| No local runnable Strapi app | `portfolio-os/apps/cms` is a **white-label branding overlay** only (no `package.json`, no content-types). |
| Portfolio content is multi-pipeline | Blog = local Markdown (Hashnode-shaped); case studies = MDX; projects = hardcoded TS; optional Dashboard/Prisma path; dead Hashnode GraphQL left over. |
| IntraWeb marketing content is 100% hardcoded | `iw-site-q2` has no CMS client, no `content/`, no MDX. Services/FAQ/nav/footer live in TSX/TS literals. Case studies and blog are placeholders. |
| Hashnode mirror exists | `E:\IntraWeb-Technologies\10_Repos\hashnode-schibelli` — 27 exported `.md` files matching portfolio blog exports. |
| Docs repo is still a template | `cms-strapi-docs` is the Mantine + Nextra starter; **zero Strapi product docs** yet. |
| Portal stays out of Strapi | `iw-portal` operational data (Clerk/Supabase/Stripe/HubSpot) must remain outside Strapi. Social-ops is editorial-adjacent workflow, not the shared CMS content store. |

**Open architectural decision (requires ADR):** Reuse `cms.intrawebtech.com` for multi-site editorial content vs. provision a dedicated content Strapi instance (same major version 5.x). Live content-type inventory on the VPS must be inspected before schema work lands on production.

---

## 2. Repository map

| # | Name (package / brand) | Absolute path | Role in migration |
|---|---|---|---|
| 1 | Portfolio OS (`hashnode-starter-kit` package name — stale) | `C:\Users\jschi\OneDrive\Desktop\Projects\2025_portfolio\portfolio-os` | Personal site + blog + projects + case studies; branding overlay for remote Strapi |
| 2 | Nexus (`my-turborepo`) | `E:\IntraWeb-Technologies\10_Repos\nexus` | IntraWeb marketing site (`iw-site-q2`) + portal (`iw-portal`) |
| 3 | CMS Strapi Docs (`mantine-next-nextra-template`) | `E:\IntraWeb-Technologies\10_Repos\cms-strapi-docs` | Authoritative CMS documentation site (Nextra) |
| 4 | Hashnode export mirror | `E:\IntraWeb-Technologies\10_Repos\hashnode-schibelli` | Source backup of 27 Hashnode articles (outside workspace roots) |
| 5 | Remote Strapi | `https://cms.intrawebtech.com` | Existing Strapi 5.51.1 — candidate shared instance |

Workspace roots currently open in Cursor: portfolio-os, nexus, cms-strapi-docs.

---

## 3. Per-repository inventory

### 3.1 Portfolio OS

| Item | Value |
|---|---|
| Brand | Portfolio OS — `johnschibelli.dev` |
| Package manager | pnpm `10.14.0` |
| Monorepo | Turborepo `^2.5.8`, `pnpm-workspace.yaml` → `apps/*`, `packages/*` |
| Node | Mixed: `.nvmrc` v18, CI Node 20, `apps/docs` engines `22.x` |
| Apps | `site` (Next 15.5.9 / React 18.3), `dashboard` (Next 15.5.9), `docs` (Next 15.5.9 / React 19), `cms` (branding only) |
| Routing | App Router only (`apps/site/app/`) |
| DB | Prisma + PostgreSQL via `packages/db` and dashboard (operational/editorial dashboard — not Strapi) |
| Deploy | Vercel (root + `apps/site/vercel.json`); Dockerfile at root is **stale** Hashnode starter path |
| Commands | `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm typecheck` |
| Strapi env vars | **None** today |
| Preview | No Next.js Draft Mode; soft drafts via frontmatter / case-study status |

**Content pipelines (`apps/site`):**

1. Local Markdown blog — `lib/local-blog-loader.ts` → `content/blog/*.md` (**primary**)
2. Optional Dashboard API — `USE_DASHBOARD_FOR_BLOG=true`
3. Dead Hashnode GraphQL queries under `lib/api/queries/` (unused by `content-api.ts`)
4. MDX case studies — `lib/mdx-case-study-loader.ts`
5. Hardcoded projects — `data/projects/*.ts`

### 3.2 Nexus (IntraWeb)

| Item | Value |
|---|---|
| Package manager | pnpm `10.33.0` |
| Node | `22.x` |
| Monorepo | Turborepo `^2.9.6`; workspace **excludes** legacy `apps/iw-site` |
| Marketing app | `@repo/iw-site-q2` — Next **16.2.2** / React **19.2.4**, App Router, port 3010 |
| Portal app | `@repo/iw-portal` — Next 16.2.2, Clerk + Supabase + Stripe (operational) |
| Domain | `intrawebtech.com` / `www.intrawebtech.com` |
| CMS client | **None** (zero `strapi` matches) |
| Deploy | Separate Vercel projects per app |
| Commands | `pnpm --filter @repo/iw-site-q2 {dev,build,lint,check-types,test}` |
| Legacy | `apps/iw-site` deleted on disk / mass-deleted in git; had careers, testimonials, portfolio case-study components |

**Editorial vs operational boundary:**

```text
Editorial content → Strapi (this migration)
Operational data  → iw-portal / Supabase / Clerk / Stripe / HubSpot
Social-ops review → stays in portal (workflow), may later *publish into* Strapi or Postiz — not a Strapi schema dump of portal tables
```

### 3.3 cms-strapi-docs

| Item | Value |
|---|---|
| Stack | Next **16.2.12**, Nextra **4.6.1**, Mantine **9.5.0**, React **19.2.8**, Yarn **4.16.0** |
| Content | `content/*.mdx` — template demos only |
| Base path | `/docs` (`contentDirBasePath`) |
| Strapi docs | **None yet** |
| Commands | `yarn dev`, `yarn build`, `yarn test`, `yarn typecheck`, `yarn lint` |

### 3.4 Hashnode mirror (`hashnode-schibelli`)

| Item | Value |
|---|---|
| Format | Flat `.md` files named by Hashnode `cuid` |
| Count | **27** |
| Relationship | Byte-aligned with 27 of 28 portfolio blog files; portfolio also has 1 hand-authored post |

### 3.5 Remote Strapi (`apps/cms` branding)

| Item | Value |
|---|---|
| Version | **5.51.1** |
| URL | `https://cms.intrawebtech.com` |
| Hosting | Hostinger VPS Docker `strapi-mmex` (Elestio `elestio/strapi-production`) |
| Local package | Branding only — logos, theme, translations, email templates, compose generator |
| Content-types in git | **None** (live schema unknown until admin/API inspection) |

---

## 4. Content-source matrix

| Repository | Content Type | Current Source | Entry Count | Target Strapi Type | Site Ownership | Media Dependencies | Migration Risk | Notes |
|---|---|---|---:|---|---|---|---|---|
| portfolio-os | Article (blog) | `apps/site/content/blog/*.md` (+ Hashnode mirror) | 28 | Article | personal (default); review queue if company-relevant | Hashnode CDN covers + local public assets | Medium | Hashnode frontmatter (`cuid`, `slug`, `cover`, `ogImage`, `datePublished`); preserve canonical / hashnodeId |
| hashnode-schibelli | Article (export) | Flat cuid `.md` | 27 | Article (same records) | Deduplicate against portfolio | Remote Hashnode CDN URLs | Low if upserted by cuid/slug | Source of truth for original Hashnode metadata |
| portfolio-os | Case Study | `apps/site/content/case-studies/*.mdx` | 3 | CaseStudy | personal; IntraWeb case may be **shared** | Unsplash + local | Medium | Rich frontmatter (client, metrics, SEO); list page currently uses mock data — fix as part of integration |
| portfolio-os | Project | `apps/site/data/projects/*.ts` | 6 | Project | personal; IntraWeb project may be shared | Local/public | Medium | Hardcoded TS objects — no CMS pattern today |
| portfolio-os | Page (static) | App routes + components (`about`, `contact`, …) | ~8 indexable | Page / SiteSettings | personal | OG assets | Low–Medium | Prefer Site Settings + Page only where copy must be editable |
| portfolio-os | Navigation | Hardcoded site nav | 1 set | Navigation | personal | — | Low | |
| portfolio-os | Author | Frontmatter / structured data Person | 1 | Author | global / personal | Avatar | Low | Do not expose private email on public API by default |
| portfolio-os | SEO defaults | `structured-data.ts`, per-route metadata | n/a | SiteSettings.defaultSeo + SEO component | personal | `public/assets/og.png` | Medium | Preserve schema.org generators; feed from CMS fields where practical |
| nexus iw-site-q2 | Service / packages | `components/pages/services-content.tsx` | 3+6+4+2+6+6 tiers/cards | Service (+ optional Pricing/Feature components) | intraweb | — | High (structure) | Many pricing/engagement shapes — model carefully; avoid over-fragmenting |
| nexus iw-site-q2 | FAQ | `lib/geo-faq.ts` | 7 | FAQ or FAQ section component | intraweb | — | Low | Also drives FAQPage JSON-LD |
| nexus iw-site-q2 | About / home copy | `about-page.tsx`, `components/sections/*` | many literals | Page sections / SiteSettings | intraweb | `public/*.png` (~44 files) | Medium | Doctrine docs constrain voice — editor guide must reference doctrine |
| nexus iw-site-q2 | Navigation / footer | `lib/site.ts`, `footer.tsx` | 4 nav + footer blocks | Navigation + SiteSettings | intraweb | logos | Low | |
| nexus iw-site-q2 | Work / case studies | `work-content.tsx` placeholder | 0 live | CaseStudy | intraweb (and shared from portfolio) | TBD | Low now / Medium later | Fill from portfolio IntraWeb case study + new entries |
| nexus iw-site-q2 | Blog | Static “coming soon” | 0 | Article | intraweb / shared | — | Medium | Shared articles via Site relation |
| nexus iw-site-q2 | Testimonials | Absent (existed in deleted `iw-site`) | 0 | Testimonial | intraweb | avatars | Low | Optional restore from git history if content still desired |
| nexus iw-site-q2 | Careers | Absent (6 roles in deleted `iw-site`) | 0 | (optional Team/Job type) | intraweb | — | Deferred | Create only if product wants careers back |
| nexus iw-site-q2 | SEO / JSON-LD | `lib/seo-meta.ts`, `lib/geo-jsonld.ts` | 6 page metas + schemas | SEO component + SiteSettings | intraweb | OG paths referenced but assets may be missing | Medium | Preserve `llms.txt` as static or CMS-managed text |
| nexus iw-portal | Clients, invoices, RBAC, etc. | Supabase | n/a | **Out of scope** | — | — | — | Operational boundary |
| nexus iw-portal | Social-ops drafts | Supabase `019_social_ops_core.sql` | in progress | Out of scope (workflow) | — | — | — | May webhook *into* Strapi later; not the content model home |
| portfolio-os dashboard | TipTap articles (Prisma) | Dashboard DB | unknown | Review / optional second source | personal | — | High if dual-write | Prefer single editorial source of truth in Strapi post-cutover |

---

## 5. Media inventory

| Location | Approx. count | Notes |
|---|---:|---|
| `portfolio-os/apps/site/public/` | 31 files | PNG/JPG/PDF/SVG; blog covers mostly Hashnode CDN |
| `nexus/apps/iw-site-q2/public/` | 44 files | Marketing photography + logos |
| Hashnode CDN | per article | Durable remote URLs — migrate to object storage or keep referenced with canonical policy |
| Remote Strapi uploads | unknown | Must not rely on ephemeral container FS long-term — ADR for R2/S3 |

---

## 6. SEO / routes (baseline)

### Personal (`johnschibelli.dev`)

- Sitemap: `apps/site/app/sitemap.ts` (static + projects + case studies + posts)
- RSS: `apps/site/app/blog/rss.xml/route.ts`
- Robots: `app/robots.ts` (blocks some AI crawlers)
- Structured data: `lib/structured-data.ts`
- Key routes: `/`, `/blog`, `/blog/[slug]`, `/projects`, `/projects/[slug]`, `/case-studies`, `/case-studies/[slug]`, `/about`, `/contact`

### IntraWeb (`intrawebtech.com`)

- Sitemap: 6 URLs only (blog/legal/start omitted intentionally)
- Robots: `public/robots.txt` (allows major AI crawlers)
- JSON-LD: organization, website, services ItemList, FAQ, diagnostic HowTo, person
- Key routes: `/`, `/services`, `/diagnostic`, `/about`, `/work`, `/contact`, `/start`, `/blog`, legal pages

Full route-parity table will live in `docs/strapi-migration/seo-parity.md` after integration.

---

## 7. Environment-variable conventions (targets)

No Strapi vars exist yet. Proposed (server-only unless noted):

```text
STRAPI_URL=
STRAPI_API_TOKEN=
STRAPI_PREVIEW_SECRET=
STRAPI_WEBHOOK_SECRET=
STRAPI_SITE_KEY_PERSONAL=personal
STRAPI_SITE_KEY_INTRAWEB=intraweb
```

Never use `NEXT_PUBLIC_` for API tokens or preview/webhook secrets. Site key may be a build-time constant per app rather than a secret.

---

## 8. Agent ownership boundaries

| Agent | Owns | Must not |
|---|---|---|
| Lead Architecture | Contracts, Site model, ADRs, integration gates, this audit | Invent divergent schemas per agent |
| Strapi Implementation | Content-types, components, lifecycles, permissions, media, deploy config on Strapi 5.x | Change frontend visuals; touch portal transactional schema |
| Migration | Extractors, upserts, dry-run, reports, review queue | Guess ambiguous site ownership |
| Portfolio Integration | `apps/site` Strapi client usage, route/SEO/RSS parity | Call raw Strapi from leaf UI components |
| IntraWeb Integration | `iw-site-q2` Strapi client usage, services/FAQ/nav/pages | Move portal/Supabase data into Strapi |
| Testing & Validation | Unit/integration/e2e, site isolation, SEO parity | Disable lint/typecheck/tests to force green |
| Documentation Architect | `cms-strapi-docs` only (unless assigned otherwise) | Change application behavior |

**Shared contracts (single source):** Site keys `personal` | `intraweb`; domain models from shared client; content-type UIDs; webhook/revalidation payload shape.

---

## 9. Risks and blockers

| Risk | Severity | Mitigation |
|---|---|---|
| Unknown live schema on `cms.intrawebtech.com` | High | Inspect admin/API before writing production schemas; backup DB first |
| Reusing product CMS vs dedicated content CMS | High | ADR-002; prefer one instance only if isolation story is clear |
| Dual blog sources (Markdown + Dashboard + future Strapi) | High | Cutover plan: Strapi becomes SoT; keep Markdown as read-only fallback during migration |
| IntraWeb services pricing complexity | Medium | Start with Service + Feature components; avoid premature Pricing Plan type |
| Missing OG assets on IntraWeb | Medium | Validate paths during SEO parity |
| Media on Hashnode CDN | Medium | Policy: reference vs re-upload; document in media ADR |
| Portal social-ops overlap | Medium | Keep boundary; document integration later |
| Production DB changes | Critical | Explicit approval + backup + reversible migrations |
| Live content-type inventory still incomplete | High | Need admin API token; public `/api` probe next |

---

## 10. Recommended next steps (no phase gate)

1. **ADR pack** — Strapi selection (already live 5.51.1), shared instance, Site relations, media, operational boundary.
2. **Inspect live Strapi** — content-types, permissions, DB backup status (manual/admin; production-safe).
3. **Freeze content-model v1** from this matrix (only types justified above).
4. **Scaffold shared client** interface (package placement: prefer `nexus/packages` or `portfolio-os/packages` with mirrored API until a true shared package exists).
5. **Migration scripts** — Hashnode/portfolio articles first (cleanest), then projects/case studies, then IntraWeb hardcoded extraction.
6. **Frontend adapters** behind feature flags / fallback to current loaders.
7. **cms-strapi-docs** — replace template content with architecture + audit summary + ADRs.

---

## 11. Related documents (to be created)

| Path | Purpose |
|---|---|
| `docs/strapi-migration/README.md` | Index for engineering migration docs |
| `docs/strapi-migration/content-model.md` | Frozen schema decisions |
| `docs/strapi-migration/strapi-setup.md` | Instance setup / env |
| `docs/strapi-migration/migration-report.md` | Post-run report |
| `docs/strapi-migration/seo-parity.md` | Route/SEO parity table |
| `cms-strapi-docs/content/architecture/` | Canonical public architecture |
| `cms-strapi-docs/content/adr/` | ADRs |

---

## 12. Validation of this audit

- [x] Workspace roots enumerated
- [x] Existing Strapi located (remote 5.51.1 + branding package)
- [x] Confirmed no second docs/CMS repo needed
- [x] Content sources and entry counts measured
- [x] Portal operational boundary stated
- [x] Live Strapi Docker project confirmed running (`strapi-mmex` on VPS 1343086)
- [ ] Live Strapi content-type inventory (blocked on admin/API token)
- [ ] Production backup confirmation before schema writes
