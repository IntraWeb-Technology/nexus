# Strapi multi-site migration (engineering)

Engineering-local migration records for the shared Strapi content platform.

**Canonical product documentation** lives in [`cms-strapi-docs`](https://github.com/IntraWeb-Technology/cms-strapi-docs) (Nextra) at `E:\IntraWeb-Technologies\10_Repos\cms-strapi-docs`. Keep these files for low-level implementation detail; do not let them diverge on architecture decisions.

Docs now include ADRs (001–011, 015–017, 021–022), content-type pages, developer/frontend/migration guides, and a starter editor manual. Screenshots remain blocked until Strapi admin is running locally.

| Document | Purpose |
|---|---|
| [audit.md](./audit.md) | Workspace inventory + content-source matrix |
| [architecture-contracts.md](./architecture-contracts.md) | Shared UIDs, client API, env, webhook shape |
| [content-model.md](./content-model.md) | Accepted schema v1 |
| [strapi-setup.md](./strapi-setup.md) | Instance / env / deploy |
| [migration-report.md](./migration-report.md) | Latest migration run summary |
| [seo-parity.md](./seo-parity.md) | Route / SEO parity (app trees + sitemaps) |
| [completion-status.md](./completion-status.md) | 30-point handoff: done / deferred / deploy / rollback |
| [reports/](./reports/) | Timestamped dry-run / validate / live reports + review queue |

## Migration tooling

```bash
pnpm --dir tools/strapi-migrate install --ignore-workspace
pnpm --dir tools/strapi-migrate migrate:content:dry-run
```

See [`tools/strapi-migrate/README.md`](../../tools/strapi-migrate/README.md).

## Site keys

| Key | Site |
|---|---|
| `personal` | johnschibelli.dev (Portfolio OS) |
| `intraweb` | intrawebtech.com (iw-site-q2) |

## Boundary

```text
Editorial → Strapi
Operational (portal) → Supabase / Clerk / Stripe / HubSpot
```
