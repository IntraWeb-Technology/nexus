# Workflow: Proposal and Contract Delivery

| Field | Value |
| --- | --- |
| File | `packages/n8n-workflows/03_sales/SYS 03 - Proposal and Contract Delivery.json` |
| ID | `1aX9pLXOuVelq3sK` |
| Status | **Partially Implemented** |
| Trigger | Webhook `hubspot-deal-proposal-stage` |
| Business purpose | Generate proposal/contract artifacts with AI + PDF, store in Drive/Supabase queues, attach to portal project, notify via email/HubSpot |

## Processing

1. HubSpot deal enters proposal-related stage.
2. Gather line items / deal properties (one fetch node is disconnected in curated graph — verify).
3. Claude generates content; PDF subworkflow renders HTML.
4. Store in Google Drive; write OS approval/queue rows in Supabase.
5. Call portal `attach_project_document`.
6. Email / HubSpot follow-up.

## AI usage

Claude via Anthropic credential / Call Claude API subworkflow pattern — output should be reviewed operationally; portal document attach makes artifacts client-visible.

## Safeguards / limitations

- Material **curated vs synced node-count drift** (43 vs 26) — high overwrite risk.
- Associated line-item call may continue on error.
- Human review expected via OS queue / portal proposal UX where configured.

## Related

- Contract Generation workflow
- Portal proposal decision API
