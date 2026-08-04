# Strapi content migration tooling

Standalone Node package that discovers and plans upserts from:

| Source | Path (defaults) |
|---|---|
| Portfolio blog / case studies / projects | `C:/Users/jschi/OneDrive/Desktop/Projects/2025_portfolio/portfolio-os/apps/site` |
| Hashnode mirror | `E:/IntraWeb-Technologies/10_Repos/hashnode-schibelli` |
| IntraWeb marketing | `nexus/apps/iw-site-q2` |

Does **not** delete source files. Does **not** guess ambiguous site ownership.

## Setup

```bash
# Install in isolation (package is outside pnpm-workspace.yaml)
pnpm --dir tools/strapi-migrate install --ignore-workspace
```

> pnpm 10 may skip esbuild's postinstall unless allowed. This package sets
> `pnpm.onlyBuiltDependencies: ["esbuild"]`. If `tsx` hangs, reinstall with
> `--ignore-workspace` after that setting is present.

## Commands

```bash
# Discover + plan + write reports (no Strapi calls)
pnpm --dir tools/strapi-migrate migrate:content:dry-run

# Validate expected discovery counts (~28 / 27 / 3 / 6)
pnpm --dir tools/strapi-migrate migrate:content:validate

# Live upsert (requires env + ready schemas)
pnpm --dir tools/strapi-migrate migrate:content

# Best-effort delete by migrationBatch
pnpm --dir tools/strapi-migrate migrate:content:rollback -- <batch-uuid>
# or: MIGRATION_BATCH=<uuid> pnpm --dir tools/strapi-migrate migrate:content:rollback
```

## Environment

| Variable | Required for | Description |
|---|---|---|
| `STRAPI_URL` | live / rollback | Strapi base URL (no trailing slash required) |
| `STRAPI_API_TOKEN` | live / rollback | Server API token |
| `MIGRATION_BATCH` | rollback (alt) | Batch UUID to delete |
| `PORTFOLIO_SITE_ROOT` | optional | Override portfolio-os `apps/site` |
| `HASHNODE_MIRROR_ROOT` | optional | Override Hashnode `.md` directory |
| `IW_SITE_ROOT` | optional | Override `iw-site-q2` root |
| `MIGRATION_REPORTS_DIR` | optional | Default `docs/strapi-migration/reports` |
| `MIGRATION_REPORT_PATH` | optional | Default `docs/strapi-migration/migration-report.md` |
| `REVIEW_QUEUE_PATH` | optional | Default `docs/strapi-migration/reports/review-queue.json` |

Dry-run and validate work **without** Strapi env or schemas.

Live migrate requires:
1. Running `apps/cms-strapi` with v1 content-types
2. Seeded Site entries (`personal`, `intraweb`) via `scripts/seed-sites.ts`
3. `STRAPI_URL` + `STRAPI_API_TOKEN`

**Canonical package:** this directory (`tools/strapi-migrate`). Do not run parallel migrate trees under `apps/cms-strapi/scripts/migrate` unless consolidating into this package.

## Outputs

- `docs/strapi-migration/reports/dry-run-<timestamp>.md`
- `docs/strapi-migration/migration-report.md` (latest summary)
- `docs/strapi-migration/reports/review-queue.json`

## Site assignment

- **Articles** → `personal`
- **Projects / case studies** with `intraweb` in name/slug/client → `["personal","intraweb"]`
- **IntraWeb nav / FAQ / services** → `intraweb`
- Ambiguous ownership → review queue (never guessed)

## Idempotency

Upsert key:

- Articles with Hashnode `cuid` → `article:cuid:<cuid>`
- Else → `<type>:slug:<slug>` (or namespaced for services)

Live mode looks up by `hashnodeId` then `slug` before POST/PUT, and stamps `migrationBatch` on every write.

## Live mode status

If Strapi content-types are not deployed yet, live migrate exits with a clear “schema not ready” error list (no silent success). Dry-run remains fully functional.
