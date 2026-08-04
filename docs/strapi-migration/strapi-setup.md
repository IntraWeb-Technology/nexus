# Strapi setup notes

**Status:** Draft  
**Date:** 2026-08-03

## Live instance

| Item | Value |
|---|---|
| URL | `https://cms.intrawebtech.com` |
| Version | Strapi **5.51.1** (Elestio `elestio/strapi-production`) |
| VPS | Hostinger id `1343086` (`srv1343086.hstgr.cloud`, Ubuntu 24.04 + Docker) |
| Compose project | `strapi-mmex` |
| Containers | `strapi-mmex-strapi-1` (running), `strapi-mmex-db-1` (Postgres 16 Alpine, running) |
| Branding source | `portfolio-os/apps/cms` |

## Co-located VPS services (do not conflate)

| Project | Role |
|---|---|
| `traefik-3adk` | Ingress 80/443 |
| `postgresql-aihh` | Separate Postgres 17 |
| `n8n-sdaa` | n8n automation |
| `postiz-t8bc` | Postiz (currently stopped) |

## Safety before schema changes

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

## Local branding deploy

See `portfolio-os/apps/cms/docs/BRANDING.md` and `docker/generate-compose.js`.
