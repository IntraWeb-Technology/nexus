# Content migration tooling

Parses offline content sources (Hashnode mirror, legacy portfolio-os blog/case
studies, hardcoded project data, IntraWeb FAQ/nav constants) and idempotently
upserts them into the shared multi-site Strapi instance (`apps/cms-strapi`),
per `nexus/docs/strapi-migration/contracts.md`.

**Default posture is safe: dry-run only, no writes, no deletes, no secrets in
logs.** You must explicitly pass `--write` to touch Strapi.

## Quick start

```bash
cd apps/cms-strapi

# 1. Parse everything, print a full plan, write the report. No network calls
#    are required — this works even if Strapi isn't running.
npm run migrate:content:dry-run

# 2. Same parsing, plus required-field checks. Also works offline.
npm run migrate:content:validate

# 3. Actually upsert to Strapi. Requires STRAPI_URL + STRAPI_API_TOKEN in the
#    environment (or apps/cms-strapi/.env). Idempotent — safe to re-run.
npm run migrate:content

# Rollback is a documented stub, not an automated delete (see src/rollback.ts).
npm run migrate:content:rollback
```

Every run writes/overwrites:

- `nexus/docs/strapi-migration/migration-report.md` — human-readable report
- `nexus/docs/strapi-migration/review-queue.json` — ambiguous-ownership items
- `apps/cms-strapi/scripts/migrate/out/<mode>-<batch>.json` — full machine-readable dump of the run (gitignored)

## What's covered

| Source | Files | Target content type | Default site(s) |
|---|---|---|---|
| `hashnode-schibelli/*.md` | 27 | Article | `personal` |
| legacy portfolio-os `content/blog/*.md` | 28 (27 mirror + 1 hand-authored) | Article | `personal` |
| legacy portfolio-os `content/case-studies/*.mdx` | 3 | Case Study | `personal` (`personal`+`intraweb` for the `intraweb` case study) |
| `personal-site/.../data/projects/*.ts` | 5 | Project | `personal` (`personal`+`intraweb` for the `intraweb` project) |
| `iw-site-q2/lib/geo-faq.ts` | 7 items | FAQ Item | `intraweb` |
| `iw-site-q2/lib/site.ts` (`navLinks`) | 1 nav set | Navigation | `intraweb` |

Article de-duplication: Hashnode mirror is treated as canonical; the legacy
portfolio-os copy of the same post (same Hashnode `cuid`) is detected as a
duplicate and skipped, so the two 27-file sources collapse into 28 unique
articles total (27 shared + 1 hand-authored post that only exists in
portfolio-os).

Real filesystem paths are in `src/config.ts` and are all overridable via env
vars (`MIGRATE_HASHNODE_DIR`, `MIGRATE_PORTFOLIO_BLOG_DIR`,
`MIGRATE_CASE_STUDIES_DIR`, `MIGRATE_PROJECTS_DIR`, `MIGRATE_INTRAWEB_FAQ_FILE`,
`MIGRATE_INTRAWEB_NAV_FILE`) if content moves.

## Site assignment (frozen rules — do not extend)

- Hashnode/portfolio articles → `personal` only, always. If the title/body
  strongly reads like IntraWeb company marketing, the article is still
  shipped as `personal` but also added to the review queue — ownership is
  never guessed.
- Projects: `personal`; slug/name `intraweb` → `[personal, intraweb]`.
- Case studies: `personal`; `intraweb` case study → `[personal, intraweb]`.
- FAQ + IntraWeb nav → `intraweb`.

## Canonical / Hashnode URLs (documented assumption)

Hashnode canonical/original URLs are reconstructed as
`https://mindware.hashnode.dev/<slug>` (see `HASHNODE_HOST` in
`src/config.ts`), based on the publication host noted in
`nexus/docs/strapi-migration/audit.md`. Override with
`MIGRATE_HASHNODE_HOST` if that host is wrong for a given batch — this tool
does not call the live Hashnode API to verify it.

## Idempotency & duplicate detection

- Articles: matched by `hashnodeId` first, then by `slug` + primary site.
- Projects / Case Studies / FAQ items / Navigation: matched by `slug` /
  `question` / `(site, location)` respectively.
- All many-relations (`sites`, `tags`, `technologies`) are written with
  Strapi v5's `{ set: [...] }` form so re-running a batch fully replaces
  membership instead of accumulating duplicates.
- Every article upsert is stamped with `migrationBatch` (ISO timestamp) —
  see `src/api/article/content-types/article/schema.json`. Other content
  types don't have this field yet (see `src/rollback.ts` for why rollback
  isn't automated).

## Flags

| Flag | Effect |
|---|---|
| `--dry-run` (default) | Parse + plan only, no writes |
| `--validate` | Parse + required-field validation only, no writes |
| `--write` | Actually upsert to Strapi (falls back to dry-run behavior with a logged blocker if Strapi is unreachable) |
| `--types=articles,projects,...` | Limit the run to specific domains: `sites,articles,projects,case-studies,faq,nav` |
| `--with-media` | Best-effort: download cover/og images and upload them to the Strapi Media Library. Off by default — see limitations below. |

## Known limitations / assumptions (see also the report's own "Assumptions" section)

- **Media is not uploaded by default.** Source image URLs (`cover`,
  `ogImage`, `coverImage`) are captured in each plan but only attached if you
  pass `--with-media` (which downloads + POSTs to `/api/upload` — untested
  against a live instance, best-effort, failures are logged and skipped, never
  fatal).
- **Case study Challenge/Solution/Results** are split from the MDX body using
  a heading-keyword heuristic (`## Problem`, `## Solution`, `## Results`,
  etc.). Where that heuristic can't find all three sections, the short
  frontmatter fields (`challenges`/`solution`/`results`) are used as a
  fallback and the item is flagged in the review queue for a manual pass.
- **Projects/FAQ/Nav are extracted via dynamic `import()`** of the real
  `.ts` source files (this tool runs under `tsx`, so that "just works" — no
  transpilation step needed). A regex-based fallback exists for each in case
  dynamic import fails on a given file, and is flagged in the review queue as
  `regex-fallback-partial-extraction` when used.
- **Rollback is a stub, not automated** — see `src/rollback.ts` for the full
  rationale (schema doesn't stamp `migrationBatch` on every type yet; a
  batch-delete could also clobber manual admin edits). Use the JSON artifact
  under `out/` to manually identify and review documents in the Strapi admin.

## Safety

- Never logs `STRAPI_API_TOKEN` — only whether it's present.
- Never deletes or modifies any source content file.
- `--dry-run` and `--validate` never make a network call that could crash
  the run — connectivity is checked once for reporting and any failure is
  swallowed. `--write` degrades to a reported blocker (no partial writes) if
  Strapi is unreachable rather than throwing.

## Canonical entrypoint

`npm run migrate:content*` resolves to `scripts/migrate/src/migrate.ts` (this
tool). A simpler concurrent `cli.mjs` / `cli.ts` scaffold was removed after
reconciliation. Prefer this `src/` implementation for all migration work.

`seed-sites.ts` remains complementary (standalone Site seeder). This tool also
self-seeds `Site` records for `personal` and `intraweb` on demand via
`TaxonomyCache.ensureSite`.

There is a separate exploratory package at `nexus/tools/strapi-migrate` —
treat `apps/cms-strapi/scripts/migrate` as the authoritative migrator wired to
npm scripts.
