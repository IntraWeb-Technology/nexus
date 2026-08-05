# Automations — credentials

## Principles

- Store secrets in n8n credentials or instance env — **never** in committed workflow JSON.
- Prefer one canonical display name per system per environment.
- Rotate immediately if a secret appears in git history.

## Known credential display names (inconsistent)

| System | Names observed in curated JSON |
| --- | --- |
| HubSpot | `HubSpot App Token`, `HubSpot App Token account`, `HubSpot account`, `HubSpot Developer account` |
| Supabase | `Supabase IW-Portal`, `Supabase OS Postgres` |
| Anthropic | `Anthropic API` |
| Resend | `Resend API` |
| Twilio | `Twilio account` |
| Google Drive | `Google Drive account 2` |
| n8n API | `n8n account` |

Normalize names when touching a workflow; document mapping in your password manager / ops vault.

## Critical finding

Google Chat **webhook URL keys/tokens** were found committed inside:

- `02_outreach/SYS 02 - ElevenLabs Post-Call Handler.json`
- `03_sales/SYS 03 - Pre-Call Diagnostic Brief.json`

**Action:** rotate Chat incoming webhooks; replace with credential/config references; scrub history as appropriate.

## Portal add-invoice defect

`Portal - HubSpot invoice → add_invoice` currently sets `x-intrawebtech-secret` to an n8n URL rather than the shared secret. Fix before relying on invoice sync in production.
