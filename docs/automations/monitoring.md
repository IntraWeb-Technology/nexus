# Automations — monitoring

## What exists

| Signal | Where |
| --- | --- |
| n8n execution history | n8n UI |
| Automation log rows | Supabase OS tables / admin OS page |
| Portal integration_events | Admin → Integrations |
| Social ops outbox status | Admin → Social Ops (experimental) + cron |
| Google Chat alerts | Via SW - Send Google Chat Alert (when wired) |
| Workflow backup to Drive | SYS 09 automated backup |

## Gaps

- No unified SLO dashboard across portal + n8n.
- Admin “replay” does not re-execute providers.
- Many workflows lack dedicated error workflows.
- Portal fire-and-forget outbound failures only hit server logs.

## Operator checklist

1. After deploy: spot-check last successful executions for SYS 03 provisioning and invoice paths.
2. Compare curated vs `_synced-from-n8n` for drifted IDs.
3. Review failed `integration_events` in portal admin.
4. Confirm Vercel cron for social-ops outbox if that slice is enabled in the environment.
