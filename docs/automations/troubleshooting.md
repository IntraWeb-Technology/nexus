# Automations — troubleshooting

| Symptom | Likely cause | Check |
| --- | --- | --- |
| Portal returns 401 on n8n call | Wrong/missing `x-intrawebtech-secret` | Compare to portal `WEBHOOK_SECRET`; inspect add-invoice workflow header |
| Portal returns 404/redirect on internal route | Clerk proxy protecting `/api/internal/*` | `src/proxy.ts` public route list vs docs |
| Provision creates duplicate projects | Idempotency key mismatch | HubSpot deal id linkage; portal provision tests |
| Workflow push fails | Missing/changed `id` or activeVersion drift | RUNBOOK + n8n 2.x guardrails |
| “Works in curated JSON, not in n8n” | Curated↔synced drift | Diff node counts for Proposal, Qualified to Buy, Referral |
| Emails contain PLACEHOLDER_* | Partial onboarding workflow | Onboarding Logistics JSON |
| Chat alerts 404 | Rotated webhook or committed stale URL | Credentials doc; rotate |
| Marketing intake never hits n8n | Env URL unset | `N8N_CONTACT_WEBHOOK_URL` on site |
| Outbound portal events “do nothing” | No curated receiver | Integration map orphan list |

Incident restore: `packages/n8n-workflows/RUNBOOK.md` (pull → known-good curated → push by id).
