# IntraWeb Nexus — Audit Index

**Initiative:** Nexus automation audit, documentation, and Portfolio OS presentation  
**Audit date:** 2026-07-30  
**Source of truth:** Implementation (apps, migrations, APIs, curated n8n JSON) — not marketing copy  

## Documents in this folder

| Document | Purpose |
| --- | --- |
| [nexus-implementation-audit.md](./nexus-implementation-audit.md) | Portal capability inventory, status classification, reliability/security, UX |
| [n8n-workflow-inventory.md](./n8n-workflow-inventory.md) | Curated workflow catalog, status, quality risks |
| [nexus-n8n-integration-map.md](./nexus-n8n-integration-map.md) | Verified portal ↔ n8n interfaces and gaps |
| [documentation-gap-analysis.md](./documentation-gap-analysis.md) | Existing docs vs required deliverables |
| [portfolio-content-gap-analysis.md](./portfolio-content-gap-analysis.md) | Portfolio OS IntraWeb content gaps and design risks |

## Related existing docs (do not duplicate blindly)

- `docs/architecture/` — system overview, inventory, webhooks, environment, social-ops
- `docs/portfolio/intraweb-platform-case-study.md` — engineering narrative draft
- `docs/intraweb-platform-product-dossier.md` — product dossier
- `packages/n8n-workflows/RUNBOOK.md` / `STAGES.md` — operator lifecycle
- `apps/iw-portal/docs/n8n-integration.md` — portal webhook contracts

## Capability status vocabulary

| Status | Meaning |
| --- | --- |
| **Implemented** | Code or workflow definition clearly supports the capability |
| **Partially Implemented** | Core path exists; material gaps, placeholders, or incomplete consumers |
| **Experimental** | Runnable vertical slice; not claimed as production-complete |
| **Disabled** | Present but turned off / unreachable |
| **Deprecated** | Explicitly superseded (e.g. redirects) |
| **Planned** | Stub, placeholder, or documented intent without working path |
| **Unverified** | Referenced but not confirmed in active runtime path |

Do not present Planned, Experimental, Disabled, Deprecated, or Unverified as currently available product features.
