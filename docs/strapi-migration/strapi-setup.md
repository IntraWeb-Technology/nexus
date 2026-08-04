# Strapi setup notes

**Status:** Active (local content CMS)  
**Date:** 2026-08-04

## Local instance (`apps/cms-strapi`)

| Item | Value |
|---|---|
| App | `apps/cms-strapi` |
| Version | Strapi **5.51.1** |
| Default DB | SQLite (`.tmp/data.db`) |
| Postgres | Set `DATABASE_CLIENT=postgres` + `DATABASE_*` (see `.env.example`) |

### Run locally

```bash
cd apps/cms-strapi
cp .env.example .env   # then set unique APP_KEYS / secrets
npm install
npm run develop        # http://localhost:1337/admin
```

Build admin + server:

```bash
npm run build
npm run start
```

### Health checks

| Route | Behavior |
|---|---|
| `GET /_health` | Built-in Strapi liveness → **204** |
| `GET /api/health` | JSON `{ ok: true, service, version, timestamp }` (auth disabled) |

### Seed site keys

Dry-run (no writes):

```bash
npm run seed:sites:dry
```

Create `personal` + `intraweb` Site rows via REST (requires running Strapi + `STRAPI_API_TOKEN` with Site create permission):

```bash
# in .env or shell
export STRAPI_URL=http://127.0.0.1:1337
export STRAPI_API_TOKEN=...
npm run seed:sites
```

Embedded mode (loads Strapi in-process; needs a prior `npm run build`):

```bash
npx tsx scripts/seed-sites.ts --embedded
```

### Content model

v1 collection types and components are code-first under:

- `src/api/*/content-types/*/schema.json`
- `src/components/{shared,blocks}/*.json`

After schema changes, regenerate types:

```bash
npm run strapi ts:generate-types
```

Contracts: [`architecture-contracts.md`](./architecture-contracts.md), [`content-model.md`](./content-model.md).

### Schema notes (v1 deviations / clarifications)

| Item | Note |
|---|---|
| `redirect.statusCode` | Enum values are `http_301` / `http_302` / `http_307` / `http_308` (GraphQL-safe; not bare `301`) |
| `project.projectStatus` | Renamed from `status` — reserved when Draft & Publish is enabled |
| `shared.stat-item` | Helper component for `blocks.stats` items (not listed in contracts UID table) |
| `navigation-item.children` | Nested as repeatable `shared.link` (one level; avoids recursive component) |
| `blocks.faq-section.items` | Relation to `api::faq-item.faq-item` |

---

## Live branding instance (do not conflate)

| Item | Value |
|---|---|
| URL | `https://cms.intrawebtech.com` |
| Version | Strapi **5.51.1** (Elestio `elestio/strapi-production`) |
| VPS | Hostinger id `1343086` (`srv1343086.hstgr.cloud`, Ubuntu 24.04 + Docker) |
| Compose project | `strapi-mmex` |
| Containers | `strapi-mmex-strapi-1` (running), `strapi-mmex-db-1` (Postgres 16 Alpine, running) |
| Branding source | `portfolio-os/apps/cms` |

**Do not write production schemas without backup + inventory + explicit approval.**

## Co-located VPS services (do not conflate)

| Project | Role |
|---|---|
| `traefik-3adk` | Ingress 80/443 |
| `postgresql-aihh` | Separate Postgres 17 |
| `n8n-sdaa` | n8n automation |
| `postiz-t8bc` | Postiz (currently stopped) |

## Safety before schema changes (production)

1. Snapshot / dump `strapi-mmex` Postgres volume
2. Inventory existing content-types via admin (API token)
3. Resolve ADR-002 (reuse `cms.intrawebtech.com` vs dedicated content instance)
4. Obtain explicit approval for production schema writes

## Proposed env (frontends — no secrets in NEXT_PUBLIC)

```bash
STRAPI_URL=https://cms.intrawebtech.com
STRAPI_API_TOKEN=  # server-only
STRAPI_PREVIEW_SECRET=
STRAPI_WEBHOOK_SECRET=
```

## Frontend preview + revalidation webhooks

Each Next.js site exposes:

| Route | Method | Purpose |
|---|---|---|
| `/api/preview` | GET | Enable Draft Mode (`?secret=` or `x-strapi-preview-secret` / Bearer) → redirect to `?path=` |
| `/api/exit-preview` | GET | Disable Draft Mode → redirect |
| `/api/revalidate` | POST | On-demand `revalidatePath` for published content |

### Secrets (server-only)

| Env | Used by | Header / query |
|---|---|---|
| `STRAPI_PREVIEW_SECRET` | `/api/preview` | Query `secret`, or `x-strapi-preview-secret`, or `Authorization: Bearer …` |
| `STRAPI_WEBHOOK_SECRET` | `/api/revalidate` | `x-strapi-webhook-secret` or `Authorization: Bearer …` |

Never use `NEXT_PUBLIC_` for these values.

### Site filtering

Webhook body (architecture contract):

```json
{
  "event": "entry.publish",
  "uid": "api::article.article",
  "entryId": "string",
  "siteKeys": ["personal"],
  "slugs": { "article": "slug-here" },
  "paths": ["/blog/slug-here"]
}
```

- `apps/iw-site-q2` acts when `siteKeys` includes `intraweb` (or `paths` is non-empty).
- `apps/personal-site/apps/site` acts when `siteKeys` includes `personal` (or `paths` is non-empty).
- Wrong secret → **401**; invalid body → **400**; other site → `{ revalidated: false, paths: [] }`.

### Strapi Admin webhook setup (local or candidate CMS)

1. **Settings → Webhooks → Create new webhook**
2. **URL** (one per frontend deployment):
   - IntraWeb: `https://<intraweb-host>/api/revalidate`
   - Personal: `https://<personal-host>/api/revalidate`
3. **Headers**: `x-strapi-webhook-secret` = same value as frontend `STRAPI_WEBHOOK_SECRET`  
   (or set `webhooks.defaultHeaders` in `config/server` to `Authorization: Bearer ${STRAPI_WEBHOOK_SECRET}`)
4. **Events**: `entry.publish`, `entry.unpublish`, `entry.update`, `entry.delete` (optionally `entry.create`)
5. Prefer a custom lifecycle / middleware that enriches the payload with `siteKeys`, `uid`, `slugs`, and `paths` per [architecture-contracts.md](./architecture-contracts.md). Stock Strapi webhooks send `event` + `model` + `entry`; until enrichment exists, include explicit `paths` in a thin proxy or accept that the Next route falls back by `uid` only when the contract-shaped body is posted.

**Do not configure production CMS webhooks without approval.**

## Local branding deploy

See `portfolio-os/apps/cms/docs/BRANDING.md` and `docker/generate-compose.js`.
