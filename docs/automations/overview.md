# IntraWeb Nexus automations — overview

**Package source of truth:** `packages/n8n-workflows/`  
**Portal contracts:** `apps/iw-portal/docs/n8n-integration.md`, `docs/architecture/webhook-contracts.md`  
**Audit inventory:** `docs/audit/n8n-workflow-inventory.md`  
**Integration map:** `docs/audit/nexus-n8n-integration-map.md`

## What this system is

n8n is the **orchestration layer** for IntraWeb Nexus. It moves events between HubSpot, Stripe, email/SMS, Google Drive, Supabase OS tables, and the portal webhook API. The portal remains the system of record for client delivery state (projects, documents, invoices, approvals).

It is **not** the product UI. Clients and staff work in `iw-portal`; prospects convert on `iw-site-q2`.

## Business categories (curated)

| Category | Folder | Role |
| --- | --- | --- |
| Lead generation | `01_lead-generation` | Forms, Cal.com, voice qualification, sourcing |
| Outreach | `02_outreach` | Sequences, post-call handling |
| Sales | `03_sales` | Proposals, contracts, invoices, portal provisioning |
| Onboarding | `04_onboarding` | Closed-won logistics and docs |
| Client success | `05_client-success` | Health, weekly updates, privacy, referral |
| Content | `06_content` | LinkedIn pipeline |
| Reporting | `07_reporting` | Internal snapshots |
| Command center | `08_command-center` | Google Chat ops commands |
| Documentation | `09_documentation` | Workflow backup, OS manual |
| Shared | `_subworkflows` | Claude, HubSpot, PDF, Resend, SMS, Chat, logging |

`07_social` is empty in-repo. Portal Social Ops is an **experimental** in-app vertical slice, not an n8n social folder.

## Maturity (honest)

- Many sales/onboarding/client-success workflows are **structurally complete** in curated JSON.
- Several high-value portal paths are **Partially Implemented** (placeholders, secret defects, curated↔runtime drift).
- Portal **emits** outbound webhooks that often have **no curated receiver** — treat those as unimplemented end-to-end until a workflow exists.
- Do not claim “full automation coverage” for every portal event.

## Operator lifecycle

See `packages/n8n-workflows/RUNBOOK.md`:

1. `pull:n8n` → `_synced-from-n8n/`
2. Review drift vs curated
3. `sync:n8n:package` only after authority decision
4. Edit curated JSON (preserve `id`)
5. `push:n8n:workflow` one file at a time
6. Validate side effects

## Doc map

| Doc | Purpose |
| --- | --- |
| [architecture.md](./architecture.md) | Patterns, triggers, data ownership |
| [setup.md](./setup.md) | Local/operator setup |
| [credentials.md](./credentials.md) | Credential naming and rotation |
| [environment.md](./environment.md) | Env vars (apps + n8n) |
| [workflow-catalog.md](./workflow-catalog.md) | Status-labeled catalog |
| [monitoring.md](./monitoring.md) | Observability |
| [error-handling.md](./error-handling.md) | Failure patterns |
| [security.md](./security.md) | Secrets, webhooks, AI data |
| [troubleshooting.md](./troubleshooting.md) | Common failures |
| [workflows/](./workflows/) | Per-workflow deep docs (representative set) |
