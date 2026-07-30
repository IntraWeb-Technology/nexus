# Automations — error handling

## Patterns in curated workflows

| Pattern | When used | Risk |
| --- | --- | --- |
| No explicit onError | Most parent workflows | Failures stop or surface only in n8n UI |
| `continueRegularOutput` / continue on error | Hunter, HubSpot associations, some HubSpot writes | Downstream may treat failure as empty success |
| Subworkflow success/error outputs | Claude, Resend, SMS, PDF | Better; not always consumed |
| Two-attempt Postgres retries | Website Form Lead Intake, automation log SW | Local improvement only |
| Portal critical retry (1) | Login, invoice paid, subscription sync | App-side only |

## Recovery procedures (generic)

1. Identify failed execution in n8n; capture input JSON.
2. Check whether HubSpot/Supabase/portal side effects partially applied.
3. Prefer **idempotent re-entry** (search-before-create; portal provision idempotency) over blind replay.
4. For portal webhook 401s: verify `x-intrawebtech-secret` matches `WEBHOOK_SECRET` (known defect on add-invoice workflow).
5. For privacy deletion: verify Clerk proxy allows the internal route and secret auth reaches the handler.

## Recommended improvements (not implemented here)

- Shared error workflow + Google Chat/Resend notification.
- Explicit dead-letter logging to automation log on every parent failure.
- Atomic outbox claiming for social-ops dispatch.
