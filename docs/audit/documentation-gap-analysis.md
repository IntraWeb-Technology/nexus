# Documentation gap analysis

**Date:** 2026-07-30  

## Existing strengths

| Area | Location | Quality |
| --- | --- | --- |
| System overview / inventory | `docs/architecture/` | Strong engineering baseline |
| Webhook + environment contracts | `docs/architecture/webhook-contracts.md`, `environment-contract.md` | Strong |
| Social Ops domain/API | `docs/architecture/social-ops-*.md` | Strong (ahead of maturity) |
| Portal n8n integration notes | `apps/iw-portal/docs/n8n-integration.md` | Useful; needs sync with orphan outbound paths |
| n8n operator lifecycle | `packages/n8n-workflows/RUNBOOK.md`, `STAGES.md` | Strong ops; weak catalog |
| Portfolio case study draft | `docs/portfolio/intraweb-platform-case-study.md` | Good narrative; must stay status-honest |
| Product dossier | `docs/intraweb-platform-product-dossier.md` | Broad; validate against audit |

## Gaps vs initiative requirements

| Required deliverable | Gap |
| --- | --- |
| Nexus user documentation | Missing end-to-end client workflows |
| Nexus administrator documentation | Partial (`admin-bootstrap.md` incomplete vs code) |
| Nexus API documentation | Scattered; no full route catalog |
| Nexus troubleshooting | Partial in README; not consolidated |
| n8n automation overview + catalog | Missing under `docs/automations/` |
| Per-workflow docs | Missing |
| n8n credentials / security / monitoring docs | Missing as dedicated pages |
| Portfolio IntraWeb entry | Stale unpublished marketing-site card |
| IntraWeb case study in Portfolio OS | Linked but **file missing** |
| Capability status labels in public docs | Inconsistent |

## Priority order for Milestone 3–4

1. Audit folder (this initiative) — **done as source for docs**
2. `docs/automations/` overview + catalog + architecture + security/troubleshooting
3. Portal docs: overview, getting-started, user, admin, architecture cross-links, API index, troubleshooting
4. Align case study + portfolio copy with status vocabulary
5. Do **not** rewrite architecture docs that already match code; extend and cross-link
