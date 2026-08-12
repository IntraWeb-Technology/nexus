# Strapi multi-site migration — completion status

**Date:** 2026-08-04  
**Branch context:** `redesign` (pushed to `origin/redesign`; many migration artifacts still uncommitted)  
**Honesty rule:** Only commands listed in §19 were executed by the Testing and Validation Agent. Live production migrate and deploy were **not** run.

**Agent reconciliation (2026-08-04):** Competing `scripts/migrate/cli.mjs`/`cli.ts` removed. Canonical migrator is `apps/cms-strapi/scripts/migrate/src/migrate.ts` (npm scripts already pointed here). `@repo/strapi-client` tests: 12/12 pass. Strapi content model build reported green by the Strapi Implementation Agent.

Canonical product docs: sibling repo `E:\IntraWeb-Technologies\10_Repos\cms-strapi-docs` (`content/adr/`, architecture, migration, user-guide).  
Engineering records: this folder ([README](./README.md)).

---

## 1. Executive summary

The multi-site editorial platform foundation is **implementation-complete for local schema + client + soft-fail frontends + migration tooling**, but **not production-complete**. Content has been **validated / dry-run planned only** (0 live upserts). Screenshots, R2 media, production schema deploy, Public permissions UI hardening, and full Hashnode cutover remain deferred.

**Verdict:** Ready for local Strapi bring-up → seed sites → controlled live migrate in a non-prod instance. **Not** ready to declare cutover or production success.

---

## 2. Final architecture

```text
Editorial SoT (planned)     Frontends (soft-fail)           Operational (unchanged)
─────────────────────       ─────────────────────           ──────────────────────
apps/cms-strapi 5.51.1  →   @repo/strapi-client         →   iw-portal (Clerk/Supabase/Stripe)
  Site personal|intraweb    personal-site (Hashnode 3°)     HubSpot / n8n / etc.
  Articles, Projects, CS    iw-site-q2 (hardcoded FB)
  Services, FAQ, Nav…
```

- **Site ownership:** explicit Site relations (not tags) — ADR-003, ADR-021 in sibling `cms-strapi-docs/content/adr/`
- **API:** REST + Zod-normalized client — ADR-004, ADR-017
- **Preview / revalidate:** Draft Mode + webhook routes on both sites — ADR-007, ADR-008 (Accepted)
- Contracts: [architecture-contracts.md](./architecture-contracts.md)

---

## 3. Repository map

| # | Path | Role |
|---|---|---|
| 1 | `E:\IntraWeb-Technologies\10_Repos\nexus` | Turborepo: iw-site-q2, cms-strapi, packages, tools, migration docs |
| 2 | `nexus/apps/personal-site` | johnschibelli.dev (nested Portfolio OS) |
| 3 | `nexus/apps/cms-strapi` | Local content CMS (schema SoT) |
| 4 | `nexus/packages/strapi-client` | Shared typed client |
| 5 | `nexus/tools/strapi-migrate` | Idempotent migrate CLI (outside workspace install) |
| 6 | `E:\IntraWeb-Technologies\10_Repos\cms-strapi-docs` | Canonical Nextra docs + ADRs |
| 7 | `E:\IntraWeb-Technologies\10_Repos\hashnode-schibelli` | Hashnode markdown mirror |
| 8 | Legacy portfolio-os (Desktop) | Extra blog + case-study source |
| 9 | `https://cms.intrawebtech.com` | Live branding CMS — **do not write** without backup/approval |

Full inventory: [audit.md](./audit.md).

---

## 4. Repositories / packages changed (this initiative)

| Area | Change state |
|---|---|
| `apps/cms-strapi` | Content-types, components, lifecycles, health, site bootstrap, scripts |
| `packages/strapi-client` | New package |
| `tools/strapi-migrate` | New migration CLI |
| `apps/iw-site-q2` | Strapi client wiring, preview/revalidate, FAQ/nav/services soft-fail |
| `apps/personal-site/apps/site` | Content API, Strapi resolvers, preview/revalidate, case-studies routes, sitemap |
| `docs/strapi-migration/*` | Audit, contracts, model, setup, reports, SEO, this status |
| `cms-strapi-docs` (sibling) | ADRs 001–011, 015–017, 021–022 + guides (maintained separately) |

---

## 5. Files added (high-level)

- `apps/cms-strapi/src/api/{article,author,case-study,category,faq-item,health,navigation,page,project,redirect,service,site,site-setting,tag,technology,testimonial}/`
- `apps/cms-strapi/src/components/{shared,blocks}/*.json`
- `packages/strapi-client/**`
- `tools/strapi-migrate/**`
- `apps/iw-site-q2/lib/strapi*.ts`, `app/api/{preview,exit-preview,revalidate}/`
- `apps/personal-site/apps/site/lib/{strapi,strapi-content,content-api,local-blog-loader,...}.ts`, preview/revalidate APIs, case-studies app routes
- `docs/strapi-migration/{architecture-contracts,migration-report,seo-parity,completion-status,reports/...}`

Exact git inventory is large and partially uncommitted; use `git status` on `redesign` for the live list.

---

## 6. Files modified (high-level)

- Env examples (root, cms-strapi, iw-site-q2, personal site)
- IntraWeb pages/components that consume resolved FAQ/nav/services
- Personal blog/projects loaders + RSS
- Migration docs index / audit / content-model / strapi-setup

---

## 7. Content types created

15 collection APIs under `apps/cms-strapi` (plus `health`):

`site`, `site-setting`, `navigation`, `page`, `article`, `author`, `category`, `tag`, `project`, `technology`, `case-study`, `service`, `faq-item`, `testimonial`, `redirect`

See [content-model.md](./content-model.md).

---

## 8. Components created

**shared:** `seo`, `link`, `social-link`, `navigation-item`, `contact-information`, `feature`, `stat-item`  
**blocks:** `hero`, `rich-text`, `cta`, `faq-section`, `media`, `stats`

---

## 9. Dynamic-zone blocks created

`Page.sections` → `blocks.hero | rich-text | cta | faq-section | media | stats` (ADR-015). Unknown blocks: log + skip (frontend contract).

---

## 10. Lifecycle validations created

Present for Article / Project / Case Study (site+slug uniqueness patterns; see `src/api/*/content-types/*/lifecycles.ts`). Site bootstrap seeds `personal` + `intraweb` on startup (`src/index.ts`). Full permissions bootstrap automation is **not** claimed complete — admin UI / token setup still manual (§26).

---

## 11. API and permission configuration

| Item | State |
|---|---|
| REST endpoints | Schema-driven (Strapi 5 Document Service) |
| `GET /api/health` | Custom public health JSON |
| `GET /_health` | Built-in Strapi liveness |
| Public role permissions | **Manual config still required** after first admin login |
| API tokens | **Manual** — `.env.example` documents vars only |
| Live branding CMS | Untouched |

---

## 12. Shared-client functions created

Package `@repo/strapi-client`: `createStrapiClient`, site/sites filters, query builders, Zod schemas, normalizers (`shapeArticle`, `shapeProject`, `shapeCaseStudy`, `shapeService`, `shapeFaqItem`, `shapeNavigation`, `shapePage`, …), preview secret helper, typed errors.

---

## 13. Records migrated by source and content type

**Live migrated: 0.** Latest validate batch `c456b7dc-8088-42cd-9078-c21e809a4354` ([report](./reports/validate-2026-08-04T07-27-08-992Z.md)):

| Type | Planned | Live writes |
|---|---:|---:|
| article | 28 (portfolio 28 / hashnode 27 deduped) | 0 |
| case-study | 3 | 0 |
| project | 6 | 0 |
| navigation | 1 | 0 |
| faq-item | 7 | 0 |
| service | 27 | 0 |
| **plan total** | **72** | **0** |

Review queue: 1 item (services pricing tiers — do not invent prices). Earlier dry-run also flagged case-study body splits — see [migration-report.md](./migration-report.md) / [review-queue.json](./review-queue.json).

---

## 14. Media migration results

**Not run.** Default migrate preserves source image URLs; `--with-media` upload is optional and unvalidated against a live Media Library. R2 provider deferred (ADR-006).

---

## 15. Site-assignment results (planned)

| Rule | Result in validate/dry-run |
|---|---|
| Articles → `personal` | Applied in plan |
| IntraWeb-named projects/CS → `[personal, intraweb]` | Applied when name/slug matches |
| Nav / FAQ / services → `intraweb` | Applied |
| Ambiguous ownership | Review queue (no guessing) |

---

## 16. Hashnode canonical results

Canonical reconstruction documented in migrate tooling / ADR-009 / ADR-010. **Not verified** against live Hashnode publication in this validation pass. Dual-run still uses GraphQL tertiary fallback on personal blog.

---

## 17. Route and SEO parity results

Documented in [seo-parity.md](./seo-parity.md).

- Public URLs **preserved** on both sites.
- Personal content routes: `cms-backed-fallback`.
- IntraWeb `/work`, `/blog`: `placeholder`.
- Admin/login/ops: `deferred`.
- Open risk: personal project metadata host `schibelli.dev` vs sitemap `johnschibelli.dev`.

---

## 18. Tests added

| Package / app | Tests |
|---|---|
| `@repo/strapi-client` | `query.test.ts`, `client.test.ts`, `normalize/article.test.ts` (12 cases) |
| `@repo/iw-site-q2` | `strapi.test.ts`, `strapi-secrets.test.ts` (+ existing data-deletion) |
| personal-site | `__tests__/strapi*.test.ts` present (not executed in this agent run) |

---

## 19. Commands executed (this agent)

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @repo/strapi-client test` | **PASS** | 12/12 tests |
| `pnpm --filter @repo/strapi-client build` | **PASS** | `tsc` OK |
| `pnpm --filter @repo/iw-site-q2 test` | **PASS** | 25/25 tests |
| `pnpm --dir tools/strapi-migrate migrate:content:validate` | **PASS** | batch `c456b7dc-…`; 72 planned; 0 live; 1 review |
| Live `migrate:content` (prod/write) | **SKIP** | No env / explicit non-prod requirement |
| `iw-site-q2 check-types` / full app builds | **SKIP** | Not requested; if `next` modules missing, treat as env issue not integration regression |
| Screenshot capture | **SKIP** | Strapi admin not running / no screenshot assets |
| Content deletion | **NOT RUN** | Forbidden |

---

## 20. Build results

| Target | Result |
|---|---|
| `@repo/strapi-client` build | **PASS** (this run) |
| `apps/cms-strapi` admin build | Not re-run by this agent |
| `iw-site-q2` / personal-site production builds | Not run by this agent |

---

## 21. Documentation created

| Location | Status |
|---|---|
| [audit.md](./audit.md) | Done |
| [architecture-contracts.md](./architecture-contracts.md) | Done |
| [content-model.md](./content-model.md) | Done |
| [strapi-setup.md](./strapi-setup.md) | Done |
| [migration-report.md](./migration-report.md) + `reports/` | Done (dry-run/validate) |
| [seo-parity.md](./seo-parity.md) | Done (this pass) |
| [completion-status.md](./completion-status.md) | Done (this pass) |
| Sibling `cms-strapi-docs` ADRs + guides | Present (001–011, 015–017, 021–022) |
| Screenshots | **Deferred** |
| Full admin / SEO / n8n cookbooks | Partial / evolving |

---

## 22. Screenshots captured

**None.** Blocker: no running Strapi admin session + no `docs/assets/screenshots/` tree. Do not fabricate. Capture after `npm run develop` in `apps/cms-strapi`.

---

## 23. ADRs created

In `cms-strapi-docs/content/adr/`:

001, 002, 003, 004, 005, 006, 007, 008 (Proposed), 009, 010, 011, 015, 016, 017, 021, 022.

Still missing vs original ADR list (012–014, 018–020): caching, security model, permissions model, documentation architecture, screenshot maintenance, future multi-tenancy — treat as **doc debt**, not blockers for local migrate.

---

## 24. Documentation validation results

| Check | Result |
|---|---|
| Engineering docs match inspected code | Pass for contracts/model/setup/SEO (this pass) |
| Sibling docs build / lint | Not run here |
| Screenshot refs | N/A (none) |
| Stale “zero content-types” claims | Audit refreshed earlier; schemas now exist under `apps/cms-strapi` |

---

## 25. Remaining risks

1. **No live content in Strapi** — frontends still on fallbacks; cutover unproven.
2. **Production CMS write risk** — branding instance must not receive schema without backup.
3. **Hashnode dual-run SEO** — duplicate indexing until canonicals locked.
4. **Host inconsistency** on personal project pages (`schibelli.dev`).
5. **Services pricing** review queue — incomplete Service modeling.
6. **Media still remote URLs** — link rot / hotlink dependency.
7. **Permissions not automated** — Public role misconfig could leak drafts or block reads.
8. **ADR-008 still Proposed** — webhook/revalidate contract needs production proof.
9. **Uncommitted / large WIP** on `redesign` — review before merge.
10. **`apps/_cms-strapi-build-check/`** untracked — likely local artifact; do not ship accidentally.

---

## 26. Manual configuration still required

1. Create `apps/cms-strapi/.env` from `.env.example` (unique `APP_KEYS`, JWT, admin secrets).
2. First admin user via `strapi develop`.
3. Configure **Public** + authenticated permissions for required REST routes.
4. Create read API token(s); set `STRAPI_URL` / `STRAPI_API_TOKEN` on frontends and migrate tool.
5. Set `STRAPI_PREVIEW_SECRET` / `STRAPI_WEBHOOK_SECRET` on both Next apps + Strapi webhooks.
6. Seed/confirm Site rows (`personal`, `intraweb`) — bootstrap attempts create; verify in admin.
7. Editorial decisions: service prices, case-study section splits, shared-site assignments.
8. Postgres + backups for any non-local target (ADR-005).
9. R2 / durable media when leaving local uploads (ADR-006).
10. Vercel/host env for preview + revalidate endpoints.

---

## 27. Exact deployment order

1. **Backup** target DB + media (if any existing instance).
2. Deploy / start **`apps/cms-strapi`** with v1 schemas (prefer dedicated content instance, not branding CMS).
3. Create admin → permissions → API tokens → webhooks pointing at Next `/api/revalidate`.
4. Confirm Site bootstrap (`personal`, `intraweb`).
5. Run **`migrate:content:validate`** then **`migrate:content:dry-run`** against that instance.
6. Run **live migrate** only with env present and approval (non-prod first).
7. Set frontend env (`STRAPI_URL`, tokens, secrets, feature flags).
8. Deploy **iw-site-q2** and **personal-site**; verify soft-fail still works if CMS down.
9. Spot-check SEO checklist in [seo-parity.md](./seo-parity.md).
10. Only then consider Hashnode demotion / sitemap expansions / R2 cutover.

---

## 28. Backup procedure

Before any live write or production schema change:

1. Snapshot Postgres (or copy SQLite `.tmp/data.db` for local).
2. Archive `public/uploads` (or R2 bucket versioning when enabled).
3. Export Strapi admin/config notes (tokens are secrets — store in vault, not git).
4. Record migrate `migrationBatch` id and report path under `docs/strapi-migration/reports/`.
5. Keep Hashnode + portfolio-os markdown as offline rollback sources.

See ADR-016 (`cms-strapi-docs/content/adr/016-migration-rollback.mdx`).

---

## 29. Rollback procedure

| Layer | Action |
|---|---|
| Frontend | Unset / disable Strapi (`STRAPI_CONTENT_ENABLED=false` or unset URL) → hardcoded / Hashnode / local resume |
| Content | Restore DB snapshot; re-publish known-good batch or unpublish bad entries |
| Schema | Revert cms-strapi deploy to prior release; do not “fix forward” on branding CMS |
| Migrate | Idempotent upserts keyed by hashnodeId/slug — avoid blind re-runs without report review |
| SEO | Keep preserved URLs; use Redirect type only if a path must change |

---

## 30. Post-deployment verification checklist

- [ ] `/api/health` and `/_health` OK on CMS
- [ ] Site keys `personal` + `intraweb` exist exactly once each
- [ ] Public API returns published articles/projects/CS/FAQ/services filtered by site
- [ ] Drafts invisible without preview secret
- [ ] Preview enter/exit works on both Next apps
- [ ] Webhook revalidate updates intended paths only (no cross-site purge mistakes)
- [ ] Personal `/blog/[slug]`, `/projects/[slug]`, `/case-studies/[slug]` render with CMS when enabled
- [ ] IntraWeb FAQ accordion === FAQPage JSON-LD
- [ ] IntraWeb services soft-fail if CMS empty
- [ ] Sitemaps omit drafts; IntraWeb `/blog` stays out until real posts
- [ ] No secrets in client bundles
- [ ] Migrate report archived; review queue cleared or accepted
- [ ] Screenshots captured for docs (login, editor, site assignment, permissions)

---

## What’s done vs deferred

| Done | Deferred |
|---|---|
| Audit + contracts + content model | Live content migrate |
| Strapi v1 schemas + components + lifecycles | Production / branding CMS schema deploy |
| Shared client + unit tests | R2 media provider + media upload migrate |
| Soft-fail frontend integration both sites | Permissions UI automation |
| Preview + revalidate routes | Screenshot pack |
| Migrate validate/dry-run tooling | Hashnode cutover + canonical lock |
| Engineering + ADR docs (partial) | Remaining ADRs 012–014, 018–020 |
| SEO parity table (this pass) | Prod deploy + post-deploy checklist execution |

---

## Related links

- [audit.md](./audit.md)
- [architecture-contracts.md](./architecture-contracts.md)
- [content-model.md](./content-model.md)
- [strapi-setup.md](./strapi-setup.md)
- [migration-report.md](./migration-report.md)
- [seo-parity.md](./seo-parity.md)
- [reports/validate-2026-08-04T07-27-08-992Z.md](./reports/validate-2026-08-04T07-27-08-992Z.md)
- Sibling ADRs: `E:\IntraWeb-Technologies\10_Repos\cms-strapi-docs\content\adr\`
