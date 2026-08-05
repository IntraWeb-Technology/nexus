# Portal — architecture

Authoritative diagrams also live in `docs/architecture/system-overview.md`.

## Frontend

- Next.js App Router route groups: `(auth)`, `(portal)`, `(admin)`
- Portal and admin layouts provide navigation shells
- Client components for Realtime messages, uploads, interactive billing

## Backend

- Route handlers under `src/app/api/**`
- Server actions for some portal/admin mutations
- Lib modules by domain: `billing`, `hubspot`, `n8n`, `admin`, `social-ops`, `privacy`, `os-data`

## Data

- Supabase Postgres + Storage
- 19 numbered migrations through Social Ops core
- RLS policies exist; **server path often uses service role** — application filters are the practical tenancy control today

## AuthZ

- Clerk session for humans
- Staff RBAC in `staff_users`
- Machine: shared secret and provider signatures on webhooks

## API boundaries

See [api.md](./api.md). Public-to-Clerk webhook allowlist is defined in `src/proxy.ts`.

## Deployment

- Vercel app root `apps/iw-portal`
- Cron: social-ops outbox dispatch (~3 minutes) when enabled
- Dual deploy with marketing site (`iw-site-q2`) as separate Vercel project

## Security model (honest)

Strong: Clerk, Stripe signatures, Svix, staff audit log for many admin mutations, private document storage.  
Limitations: service-role bypass, staff bootstrap edge case, social-ops RPC grants, incomplete member model, n8n inbound validation uneven — see audit.
