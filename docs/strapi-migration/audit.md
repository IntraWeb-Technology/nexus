# Multi-Site Strapi Migration — Workspace Audit

**Status:** Complete (refreshed)  
**Date:** 2026-08-04  
**Audience:** Lead Architecture Agent, specialized migration agents, maintainers  
**Canonical docs:** `cms-strapi-docs` (`/docs/architecture/`)  
**Shared contracts:** [contracts.md](./contracts.md)

This audit is the prerequisite for shared content-model design. No destructive content or route replacement has been performed.

---

## 1. Executive findings

| Finding | Detail |
|---|---|
| Local Strapi scaffold exists | `nexus/apps/cms-strapi` — Strapi **5.51.2**, SQLite default, **zero content-types** yet |
| Live remote Strapi | `https://cms.intrawebtech.com` — product CMS candidate; `/api` returns 404 without auth; **no production schema writes** until inventory + backup + approval |
| Personal site is inside Nexus | `nexus/apps/personal-site` (Portfolio OS monorepo nested under apps) |
| Portfolio blog is live Hashnode GraphQL | `apps/site/app/blog` calls `gql.hashnode.com`; local `content/blog/*.md` **absent** in nested copy |
| Hashnode mirror is primary offline article source | `hashnode-schibelli` — **27** `.md` files; portfolio-os also has **28** blog files (+ hand-authored `multi-agent-development-workflow.md`) |
| Legacy portfolio-os still on disk | `C:\Users\jschi\OneDrive\Desktop\Projects\2025_portfolio\portfolio-os` — fuller content tree (blog MD, 3 case studies, projects, cms branding) |
| IntraWeb marketing is hardcoded | `iw-site-q2` — no CMS client; services/FAQ/nav in TS/TSX |
| Docs repo exists and has started ADRs | Sibling `cms-strapi-docs` (Nextra); ADRs 001–003, 021 + architecture stubs present |
| Portal stays out of Strapi | `iw-portal` operational data must remain outside Strapi |
| `strapi-develop` is upstream Strapi source | Not the project CMS — reference only |

---

## 2. Repository map

| # | Name | Absolute path | Role |
|---|---|---|---|
| 1 | Nexus (turborepo) | `E:\IntraWeb-Technologies\10_Repos\nexus` | IntraWeb site + portal + nested personal-site + cms-strapi + migration docs |
| 2 | Personal site (nested) | `E:\IntraWeb-Technologies\10_Repos\nexus\apps\personal-site` | johnschibelli.dev frontend |
| 3 | CMS Strapi (local) | `E:\IntraWeb-Technologies\10_Repos\nexus\apps\cms-strapi` | Editorial Strapi 5.51.2 app under development |
| 4 | CMS Strapi Docs | `E:\IntraWeb-Technologies\10_Repos\cms-strapi-docs` | Authoritative CMS documentation (Nextra) |
| 5 | Hashnode export | `E:\IntraWeb-Technologies\10_Repos\hashnode-schibelli` | 27 Hashnode article exports |
| 6 | Portfolio OS (legacy) | `C:\Users\jschi\OneDrive\Desktop\Projects\2025_portfolio\portfolio-os` | Fuller content source for migration (blog MD, case studies, cms branding) |
| 7 | Remote Strapi | `https://cms.intrawebtech.com` | Live 5.51.2 deploy target candidate |
| 8 | strapi-develop | `E:\IntraWeb-Technologies\10_Repos\strapi-develop` | Upstream Strapi monorepo (reference only) |

---

## 3. Per-repository inventory

### 3.1 Nexus root

| Item | Value |
|---|---|
| Package manager | pnpm `10.33.0` |
| Node | `22.x` |
| Monorepo | Turborepo `^2.9.6`; workspace `apps/*` / `packages/*` (see `pnpm-workspace.yaml` excludes) |
| Commands | `pnpm build`, `pnpm lint`, `pnpm check-types`, `pnpm --filter @repo/iw-site-q2 {dev,build,lint,check-types,test}` |

### 3.2 Personal site (`apps/personal-site`)

| Item | Value |
|---|---|
| Brand | Portfolio OS — `johnschibelli.dev` |
| Package manager | pnpm `10.14.0` |
| Monorepo | Nested Turborepo: `apps/site`, `apps/dashboard`, `apps/documentation-portfolio-os` |
| Root package Next | `^14.2.32` / React `^18.3.1` (site app may differ) |
| Routing | App Router (`apps/site/app/`) |
| Blog source (runtime) | **Hashnode GraphQL** (`gql.hashnode.com`, host `mindware.hashnode.dev`) |
| Case studies | `content/case-studies/tendril.mdx` only in nested copy |
| Projects | `data/projects/*.ts` — **5** projects (+ index/types) |
| Strapi client | **None** |
| Preview | No Next Draft Mode |

**Content pipelines (`apps/site`):**

1. Live Hashnode GraphQL — blog index + `[slug]` (**primary runtime**)
2. Hashnode import scripts → Dashboard (`scripts/import-hashnode-articles.ts`)
3. MDX case studies — partial in nested copy; full set in legacy portfolio-os
4. Hardcoded projects — `data/projects/*.ts`

### 3.3 Legacy portfolio-os

| Item | Value |
|---|---|
| Path | `C:\Users\jschi\OneDrive\Desktop\Projects\2025_portfolio\portfolio-os` |
| Blog MD | **28** files under `apps/site/content/blog/` (27 Hashnode + 1 hand-authored) |
| Case studies | **3** MDX: `tendril`, `intraweb`, `portfolio-os` |
| CMS branding | `apps/cms` overlay for remote Strapi |
| Use in migration | Prefer as offline content source alongside `hashnode-schibelli` |

### 3.4 IntraWeb marketing (`apps/iw-site-q2`)

| Item | Value |
|---|---|
| Package | `@repo/iw-site-q2` |
| Stack | Next **16.2.2** / React **19.2.4**, App Router, port **3010** |
| Domain | `intrawebtech.com` |
| CMS client | **None** |
| Content | Hardcoded: `lib/site.ts` (nav), `lib/geo-faq.ts` (7 FAQs), `lib/seo-meta.ts`, `components/pages/services-content.tsx`, `work-content.tsx` placeholder, footer |
| Commands | `pnpm --filter @repo/iw-site-q2 {dev,build,lint,check-types,test}` |

### 3.5 Portal (`apps/iw-portal`)

| Item | Value |
|---|---|
| Stack | Next 16.2.2, Clerk + Supabase + Stripe |
| Role | **Operational** — out of Strapi scope |

### 3.6 cms-strapi (`apps/cms-strapi`)

| Item | Value |
|---|---|
| Version | Strapi **5.51.2** |
| DB | `better-sqlite3` (dev); Postgres supported via `config/database.ts` |
| Content-types | **None** (`src/api/.gitkeep` only) |
| Components | **None** |
| Scripts | `npm run develop`, `build`, `start` |

### 3.7 cms-strapi-docs

| Item | Value |
|---|---|
| Path | `E:\IntraWeb-Technologies\10_Repos\cms-strapi-docs` |
| Stack | Next **16.x**, Nextra **4.x**, Mantine, Yarn **4** |
| Content started | Architecture overview, audit summary, ADRs 001–003 + 021, migration stub |
| Remaining | Content-model refs, user manual, API docs, screenshots, remaining ADRs |

### 3.8 Hashnode mirror

| Item | Value |
|---|---|
| Format | Flat `.md` named by Hashnode `cuid` |
| Frontmatter | `title`, `datePublished`, `cuid`, `slug`, `cover`, `ogImage` |
| Count | **27** |
| Body | Markdown (some posts start with stray `/`) |

---

## 4. Content-source matrix

| Repository | Content Type | Current Source | Entry Count | Target Strapi Type | Site Ownership | Media Dependencies | Migration Risk | Notes |
|---|---|---|---:|---|---|---|---|---|
| hashnode-schibelli | Article | Flat cuid `.md` | 27 | Article | personal (default); review if company-relevant | Hashnode CDN covers | Medium | Preserve cuid, slug, canonical |
| portfolio-os | Article | `content/blog/*.md` | 28 | Article | personal | CDN + local | Medium | Includes 1 hand-authored post not in mirror |
| personal-site (runtime) | Article | Hashnode GraphQL | live | Article (cutover) | personal | CDN | Medium | Keep GraphQL fallback during cutover |
| portfolio-os | Case Study | `content/case-studies/*.mdx` | 3 | CaseStudy | personal; IntraWeb may share | Unsplash + local | Medium | Nested personal-site only has tendril |
| personal-site | Project | `data/projects/*.ts` | 5 | Project | personal; IntraWeb project may share | Local/public | Medium | |
| personal-site | Navigation | Hardcoded | 1 | Navigation | personal | — | Low | |
| personal-site | Author | Frontmatter / Person SD | 1 | Author | global | Avatar | Low | Private email not public |
| iw-site-q2 | Service | `services-content.tsx` | multiple packages/tiers | Service | intraweb | — | High (structure) | Model carefully |
| iw-site-q2 | FAQ | `lib/geo-faq.ts` | 7 | FAQ Item | intraweb | — | Low | Drives FAQPage JSON-LD |
| iw-site-q2 | Nav / footer | `lib/site.ts`, footer | 1 set | Navigation + Site Settings | intraweb | logos | Low | |
| iw-site-q2 | Work / blog | Placeholders | 0 | CaseStudy / Article | intraweb / shared | — | Medium later | Shared via Site relation |
| iw-site-q2 | Testimonials | Absent (legacy iw-site) | 0 | Testimonial | intraweb | — | Low | Optional restore from git history |
| iw-portal | Operational | Supabase etc. | n/a | **Out of scope** | — | — | — | |

---

## 5. Media inventory

| Location | Approx. count | Notes |
|---|---:|---|
| personal-site `apps/site/public/` | dozens | PNG/JPG/SVG; blog covers mostly Hashnode CDN |
| iw-site-q2 `public/` | ~44 | Marketing photography + logos |
| Hashnode CDN | per article | Prefer durable reference initially; ADR for R2/S3 re-upload |
| Local Strapi uploads | ephemeral SQLite/dev FS | Must not be production media SoT |

---

## 6. SEO / routes (baseline)

### Personal (`johnschibelli.dev`)

- Key routes: `/`, `/blog`, `/blog/[slug]`, `/projects`, `/projects/[slug]`, `/case-studies`, `/case-studies/[slug]`, `/about`, `/contact`
- Sitemap / RSS / robots / structured data present in site app

### IntraWeb (`intrawebtech.com`)

- Key routes: `/`, `/services`, `/diagnostic`, `/about`, `/work`, `/contact`, `/start`, `/blog`, legal
- JSON-LD: organization, website, services, FAQ, diagnostic HowTo

Full parity table: `docs/strapi-migration/seo-parity.md` (to be filled post-integration).

---

## 7. Agent ownership

See [contracts.md](./contracts.md) and README. Shared contracts are mandatory.

| Agent | Owns |
|---|---|
| Lead Architecture | Contracts, Site model, ADRs, integration gates, audit |
| Strapi Implementation | `apps/cms-strapi` schemas, lifecycles, permissions, media config |
| Migration | Extractors from hashnode / portfolio-os / iw-site-q2 |
| Portfolio Integration | personal-site Strapi client usage |
| IntraWeb Integration | iw-site-q2 Strapi client usage |
| Testing | Site isolation, SEO parity, migration validation |
| Documentation | `cms-strapi-docs` only |

---

## 8. Risks and blockers

| Risk | Severity | Mitigation |
|---|---|---|
| Unknown live schema on cms.intrawebtech.com | High | Inventory before production writes; develop in local app |
| Nested personal-site missing blog MD | Medium | Migrate from hashnode-schibelli + portfolio-os |
| Dual blog sources (Hashnode live + Strapi) | High | Feature-flag cutover; keep GraphQL fallback |
| IntraWeb services pricing complexity | Medium | Service + Feature components first |
| Production DB changes | Critical | Explicit approval + backup + reversible path |
| Media on Hashnode CDN | Medium | Reference first; object storage ADR |

---

## 9. Recommended next steps (no phase gate)

1. Freeze contracts ✅ (`contracts.md`)
2. Implement content-types + components + lifecycles in `apps/cms-strapi`
3. Scaffold `packages/strapi-client`
4. Migration scripts: Hashnode/articles → projects/case studies → IntraWeb extraction
5. Frontend adapters behind fallbacks
6. Expand `cms-strapi-docs` + remaining ADRs + screenshots when UI runs

---

## 10. Validation of this audit

- [x] Workspace roots enumerated (nexus multi-root + siblings)
- [x] Local Strapi located (`apps/cms-strapi` 5.51.2, empty schema)
- [x] Content sources and entry counts measured
- [x] Portal operational boundary stated
- [x] Docs repo confirmed with initial ADRs
- [ ] Live Strapi content-type inventory (blocked on admin/API token)
- [ ] Production backup confirmation before remote schema writes
