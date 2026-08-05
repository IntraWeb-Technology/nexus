# Portal — administrator guide

Roles: `admin`, `ops`, `support`, `viewer` (`staff_users`).

## Access

1. Clerk user must pass staff eligibility (email allowlist / domain rules — **configure allowlist; empty allowlist is dangerous**).
2. First visit may upsert a `staff_users` row (see `src/lib/admin/auth.ts` and `apps/iw-portal/docs/admin-bootstrap.md`).
3. Open `/admin`.

## Modules

| Module | Purpose | Notes |
| --- | --- | --- |
| Overview | Queue signals | |
| Operations | At-risk work, pending COs | |
| Clients / Projects | Directory + detail | |
| Messages | Cross-project list | No reply UI yet |
| Change orders | Review / status | Viewers cannot mutate |
| Billing | Invoice reconciliation | |
| Integrations | Failed events | “Mark replayed” ≠ true replay |
| Data health | Integrity findings | |
| OS | Automation log, proposal/contract queues, deals | |
| Settings | Roles, feature flags | Flags not consumed by app code |
| Social Ops | Editorial review | **Experimental** |

## Configuration responsibilities

- Environment variables and Vercel env alignment (`packages/ops`)
- Clerk webhook + satellite domains
- Stripe webhook endpoint
- HubSpot private app + portal webhook secret
- n8n shared secret parity
- Supabase migrations applied per environment

## Operational recovery

- Integration failures: inspect payload in `integration_events`; fix upstream; re-send from source when safe
- Provisioning: use n8n execution replay carefully; rely on provision idempotency
- Privacy deletion: coordinate with marketing request flow + n8n Data Deletion Handler; verify proxy allows internal route

## Security responsibilities

- Keep staff allowlist populated
- Limit `admin` role
- Treat service-role key as production-critical
- Do not expose service role or webhook secrets to the browser
- Review audit findings in `docs/audit/nexus-implementation-audit.md`
