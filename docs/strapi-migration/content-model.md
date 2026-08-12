# Shared content model (v1)

**Status:** Accepted for implementation  
**Date:** 2026-08-04  
**Strapi major:** 5.51.1 (`apps/cms-strapi`; align with live branding CMS version)  
**Contracts:** [architecture-contracts.md](./architecture-contracts.md)

## Schema deviations from baseline prompt (accepted)

| Item | Decision |
|---|---|
| `redirect.statusCode` | Enum `http_301`…`http_308` (GraphQL-safe); client normalizes to numeric 301–308 |
| `project.projectStatus` | Field renamed from `status` (reserved with Draft & Publish); domain model still exposes `status` |
| `shared.stat-item` | Added for `blocks.stats` repeatable items |
| Nav children | One level of `shared.link` (no recursive component) |
| `blocks.faq-section.items` | Relation to FAQ Item collection |

Only types justified by audited content. Deviations from the baseline prompt are called out above.

## Site keys

| key | name | domain |
|---|---|---|
| `personal` | Personal portfolio | johnschibelli.dev |
| `intraweb` | IntraWeb Technology | intrawebtech.com |

## Collection types (v1)

| Type | Sites | Draft & Publish | Justified by |
|---|---|---|---|
| Site | n/a | No | Multi-site ownership |
| Site Settings | 1:1 Site | Yes | Per-site SEO, logos, contact |
| Navigation | 1 Site | Yes | Header/footer both sites |
| Page | 1 Site | Yes | Editable marketing pages |
| Article | N Sites | Yes | 28 portfolio + Hashnode; future IntraWeb blog |
| Author | global | No | Article authorship |
| Category | global | No | Article classification |
| Tag | global | No | Article/project tagging |
| Project | N Sites | Yes | 6 portfolio TS projects |
| Technology | global | No | Project/service tech |
| Case Study | N Sites | Yes | 3 MDX + future IntraWeb /work |
| Service | 1 Site (intraweb) | Yes | Services page packages/tiers |
| FAQ Item | N Sites or 1 | Yes | 7 IntraWeb GEO FAQs |
| Testimonial | N Sites | Yes | Restore IntraWeb social proof (0 live) |
| Redirect | 1 Site | No | Only if URLs cannot be preserved |

**Deferred (not in v1):** Careers/Job, Pricing Plan as top-level (use Service features), Partner, Client, Announcement, Documentation Page, Industry, Integration, Workflow Template, Release Note.

**Dashboard Prisma articles:** Not a parallel Strapi type. Post-cutover, Strapi is SoT; dashboard may become a Strapi-backed editor or retire.

## Components (v1)

| Component | Used by |
|---|---|
| shared.seo | Page, Article, Project, Case Study, Service, Site Settings |
| shared.link | Navigation, CTAs |
| shared.social-link | Author, Site Settings |
| shared.navigation-item | Navigation |
| shared.contact-information | Site Settings |
| shared.feature | Service |
| blocks.hero | Page dynamic zone |
| blocks.rich-text | Page |
| blocks.cta | Page |
| blocks.faq-section | Page |
| blocks.media | Page |
| blocks.stats | Page (IntraWeb home) |

Dynamic zones only on **Page.sections**. Unknown blocks: log + skip (never crash page).

## Uniqueness / lifecycles

- Site.`key` unique and immutable after create
- Page: compound unique `(site, slug)`
- Article/Project/Case Study: slug unique per site membership (lifecycle validates no two published entries share slug on the same site)
- Site Settings: exactly one entry per Site

## Site assignment rules

| Type | Rule |
|---|---|
| Page, Service, Navigation, Site Settings, Redirect | Exactly one Site |
| Article, Project, Case Study, Testimonial, FAQ | One or many Sites |
| Author, Category, Tag, Technology | Global (no Site) |

## Portal boundary

Do not model: sessions, billing, subscriptions, workflow runs, private portal records, GitHub installs, secrets, audit logs, staff RBAC.
