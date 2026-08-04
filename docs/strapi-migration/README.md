# Strapi multi-site migration (engineering)

Engineering-local migration records for the shared Strapi content platform.

**Canonical product documentation** lives in [`cms-strapi-docs`](https://github.com/IntraWeb-Technology/cms-strapi-docs) (Nextra). Keep these files for low-level implementation detail; do not let them diverge on architecture decisions.

| Document | Purpose |
|---|---|
| [audit.md](./audit.md) | Workspace inventory + content-source matrix |
| [content-model.md](./content-model.md) | Frozen schema (TBD) |
| [strapi-setup.md](./strapi-setup.md) | Instance / env / deploy (TBD) |
| [migration-report.md](./migration-report.md) | Run reports (TBD) |
| [seo-parity.md](./seo-parity.md) | Route / SEO parity (TBD) |

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
