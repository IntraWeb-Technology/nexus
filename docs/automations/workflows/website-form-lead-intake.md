# Workflow: Website Form Lead Intake

| Field | Value |
| --- | --- |
| File | `packages/n8n-workflows/01_lead-generation/SYS 01 - Website Form Lead Intake.json` |
| ID | `JzghCkfPxT5CV1iT` |
| Status | **Implemented** (structural) |
| Trigger | Webhook `hubspot-website-form-lead` |
| Business purpose | Normalize website form leads into HubSpot contact/deal, log to Supabase, send acknowledgment and reminder email |

## Systems

HubSpot App Token; Supabase OS Postgres; Resend (via email path/subworkflow as wired).

## Error handling

Postgres writes use two-attempt retries in curated export.

## Portal impact

Does not provision portal access by itself. Downstream sales stage workflows handle provisioning when deals qualify.

## Related

Marketing site contact / website-intake API fan-out (`N8N_CONTACT_WEBHOOK_URL`).
