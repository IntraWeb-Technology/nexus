# Automations — security

## Trust boundaries

| Boundary | Mechanism |
| --- | --- |
| Portal inbound n8n | `x-intrawebtech-secret` == `WEBHOOK_SECRET` |
| Marketing → n8n | Separate marketing secret / header |
| Stripe → portal | Stripe signature |
| Clerk → portal | Svix signature |
| HubSpot → portal | Shared IntraWeb secret (not HubSpot native signature scheme) |
| n8n credentials | Instance-stored; must not appear in git |

## Rules

1. Never commit API keys, Chat webhook tokens, or Stripe secrets into workflow JSON.
2. Do not put production `WEBHOOK_SECRET` values in documentation or Portfolio OS.
3. Treat AI prompts as potentially containing PII (deal notes, call transcripts) — limit logging retention.
4. Prefer least-privilege HubSpot private app scopes.
5. Rotate credentials after any accidental commit.

## Open issues from audit

- Committed Google Chat webhook material in two workflows.
- Mis-set portal secret on invoice → `add_invoice` workflow.
- Internal privacy/social-ops routes vs Clerk proxy mismatch.
- Social-ops SECURITY DEFINER execute grants may be overly broad (`PUBLIC`).

## Public documentation

Portfolio and public case studies must describe security **controls and limitations** without exposing internal URLs that are meant to stay private, credential names with embedded secrets, or exact production webhook paths that enable abuse — high-level path names used in architecture docs are acceptable for engineering audiences inside the private monorepo.
