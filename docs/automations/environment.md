# Automations — environment

## App / monorepo (names only)

| Variable | Used by | Purpose |
| --- | --- | --- |
| `N8N_BASE_URL` | Portal outbound client | Webhook base |
| `N8N_API_URL` / `N8N_BASE_URL` | Workflow sync scripts | API base |
| `N8N_API_KEY` | Sync scripts | n8n API auth |
| `N8N_WORKFLOWS_PROJECT_ID` | Sync scripts | Project scope |
| `WEBHOOK_SECRET` | Portal ↔ n8n | `x-intrawebtech-secret` |
| `PORTAL_PROPOSAL_LIFECYCLE_WEBHOOKS_ENABLED` | Portal | Gate proposal lifecycle fan-out |
| `N8N_CONTACT_WEBHOOK_URL` | Marketing site | Intake fan-out |
| `N8N_KICKOFF_BOOKED_WEBHOOK_URL` | Marketing site | Kickoff fan-out |
| `MARKETING_N8N_WEBHOOK_SECRET` | Marketing site | Separate trust boundary |

Full portal/marketing matrix: `docs/architecture/environment-contract.md`.

## Inside n8n

Workflows also rely on instance env for Stripe keys and config nodes. Treat n8n env as production-sensitive; do not duplicate values into Portfolio OS or public docs.
