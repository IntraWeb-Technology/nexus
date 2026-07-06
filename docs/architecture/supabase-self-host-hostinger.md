# Supabase self-host on Hostinger (Nexus runbook)

Move the Nexus monorepo from **managed Supabase** (`*.supabase.co`) to **self-hosted Supabase on Docker** on a Hostinger VPS.

Official references:

- [Self-Hosting overview](https://supabase.com/docs/guides/self-hosting)
- [Self-Hosting with Docker](https://supabase.com/docs/guides/self-hosting/docker)
- [Configure HTTPS](https://supabase.com/docs/guides/self-hosting/configure-https)
- [CLI `db push` with `--db-url`](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Hostinger Supabase VPS](https://www.hostinger.com/vps/supabase-hosting)

## Decision summary

| Hosting | Self-host Supabase? |
| --- | --- |
| Hostinger **VPS** (KVM, root, Docker) | **Yes** |
| Hostinger **shared / web** hosting | **No** |

Self-hosted Supabase is **one project per stack**, community-supported, and omits platform features (branching, managed PITR, analytics, vector buckets, etc.). You own backups, TLS, SMTP, updates, and monitoring.

## Current Nexus inventory

| Item | Value / location |
| --- | --- |
| Managed project (linked CLI) | `lrdovtfendpgntcouddz` (`apps/iw-portal/supabase/.temp/linked-project.json`) |
| `db:link` script ref | `wvjwibsomjecolcigjgr` (`apps/iw-portal/package.json`) — align to one project before migration |
| Migrations | `apps/iw-portal/supabase/migrations/001`–`018` |
| Apps using Supabase REST | `iw-portal` (primary), `iw-site-q2` (data deletion via service role) |
| Storage buckets | `client-uploads`, `change-order-packets` (see `005`, `006`) |
| Auth model | **Clerk** (not Supabase Auth users); RLS reads `auth.jwt()->>'sub'` |
| n8n | Direct **Postgres** credential `OS_SUPABASE_POSTGRES` (not REST) |
| Deploy target for apps | **Vercel** (Supabase stays on VPS; only env URLs change) |

## Hostinger VPS (already provisioned)

| Field | Value |
| --- | --- |
| Plan | **KVM 2** — 8 GB RAM, 2 vCPU, 100 GB NVMe (meets Supabase recommended spec) |
| Template | Ubuntu 24.04 with Docker |
| IPv4 | `187.77.0.115` |
| Hostname | `srv1343086.hstgr.cloud` |
| State | running |

Do **not** recreate this VPS unless you intend to wipe it. Supabase installs alongside existing Docker workloads if any.

Suggested public API hostname (example): `https://supabase.intrawebtech.com` — replace with your domain.

---

## Phase 0 — Pre-flight

- [ ] Pick maintenance window (API downtime during cutover).
- [ ] Confirm managed project ref in `.env.local` matches production (`pnpm --filter @repo/ops diagnostics:verify-stack`).
- [ ] Full managed backup: Supabase Dashboard → Database → Backups, plus manual `pg_dump`.
- [ ] Hostinger VPS snapshot: hPanel → VPS → Snapshots (before installing Supabase).
- [ ] DNS: create `A` record for API subdomain → `187.77.0.115`.
- [ ] SMTP provider ready (Resend/SES) for self-hosted Auth emails if you use Supabase Auth later (Clerk handles user auth today).

---

## Phase 1 — Install Supabase on the VPS

SSH as root (or sudo user):

```sh
ssh root@187.77.0.115
```

### Option A — Official quick start (recommended)

```sh
curl -fsSL https://supabase.link/setup.sh | sh
cd supabase-project
# Interactive: set SUPABASE_PUBLIC_URL=https://supabase.intrawebtech.com
#               API_EXTERNAL_URL=https://supabase.intrawebtech.com
#               SITE_URL=https://portal.intrawebtech.com  (or your portal URL)
sh run.sh start
sh run.sh secrets   # save output to password manager — never commit
```

Or use the repo bootstrap script (same steps, adds firewall hints):

```sh
# From your laptop — copy script to VPS, then on VPS:
bash bootstrap-supabase-vps.sh
```

Script path: [`apps/iw-portal/scripts/self-host/bootstrap-supabase-vps.sh`](../../apps/iw-portal/scripts/self-host/bootstrap-supabase-vps.sh).

### Option B — Hostinger template (fresh VPS only)

On a **new** VPS purchase, choose **Ubuntu 22.04 with Supabase** in hPanel. Your current box already runs **Ubuntu 24.04 with Docker** — use Option A instead.

### Post-install security (required before production)

1. **HTTPS** — Put Caddy or Nginx in front of Kong (`:8000`). See [Configure HTTPS](https://supabase.com/docs/guides/self-hosting/configure-https).
2. **Firewall** — Allow `22`, `80`, `443` publicly. Restrict Postgres `5432` / pooler `6543` to trusted IPs (Vercel, n8n, your office) only.
3. **Secrets** — Never use `.env.example` defaults; `setup.sh` generates new ones.
4. **Studio** — Basic auth via `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` in `.env`.

Verify health on the VPS:

```sh
cd ~/supabase-project   # or your install path
docker compose ps       # all services Up (healthy)
curl -sS http://127.0.0.1:8000/rest/v1/ -H "apikey: $ANON_KEY" | head
```

---

## Phase 2 — Schema on self-hosted

From your dev machine (repo root), with VPS Postgres reachable (VPN, firewall allowlist, or SSH tunnel):

```sh
# SSH tunnel example (keep open in another terminal):
# ssh -L 54322:127.0.0.1:5432 root@187.77.0.115

cd apps/iw-portal
pnpm exec supabase db push \
  --db-url "postgresql://postgres.[POOLER_TENANT_ID]:[POSTGRES_PASSWORD]@187.77.0.115:5432/postgres?sslmode=disable"
```

Notes:

- Use credentials from `sh run.sh secrets` on the VPS (`POSTGRES_PASSWORD`, `POOLER_TENANT_ID` default `your-tenant-id`).
- Prefer **session mode** port `5432` through Supavisor for DDL.
- `--dry-run` first: add flag to preview.
- `apps/iw-portal/scripts/apply-portal-schema-postgres.ts` only applies through `008` — prefer **`supabase db push`** for the full `001`–`018` chain.

Fresh empty DB alternative: push all migrations without restoring data (staging only).

---

## Phase 3 — Data migration (managed → self-hosted)

On a machine with `pg_dump` / `pg_restore` and access to both databases:

```sh
# Managed (from Supabase Dashboard → Database → Connection string, direct 5432)
pg_dump "$MANAGED_DATABASE_URL" \
  --format=custom --no-owner --no-acl \
  --exclude-schema=auth --exclude-schema=storage \
  -f nexus-portal.dump

# Self-hosted
pg_restore --no-owner --no-acl --clean --if-exists \
  -d "postgresql://postgres.[TENANT]:[PASSWORD]@187.77.0.115:5432/postgres?sslmode=disable" \
  nexus-portal.dump
```

Then migrate **Storage** objects separately (managed Dashboard or `supabase storage` CLI → re-upload to self-hosted bucket `client-uploads` and `change-order-packets`).

Helper script (documents commands, does not run without env): [`apps/iw-portal/scripts/self-host/migrate-managed-to-self-hosted.sh`](../../apps/iw-portal/scripts/self-host/migrate-managed-to-self-hosted.sh).

After restore:

```sh
pnpm exec supabase migration list --db-url "$SELF_HOSTED_DB_URL"
# Repair if history table diverged: supabase migration repair --db-url ...
```

---

## Phase 3b — Vercel DNS (domain registrar)

`intrawebtech.com` uses **Vercel nameservers**. Self-hosted Supabase is **not** a Vercel deployment — only DNS points at the VPS.

### Required DNS record (already configured)

| Type | Name | Value | Resolves to |
| --- | --- | --- | --- |
| **A** | `supabase` | `187.77.0.115` | `supabase.intrawebtech.com` |

Verify from your machine:

```sh
vercel dns ls intrawebtech.com | rg supabase
nslookup supabase.intrawebtech.com
```

### Do **not** do this on Vercel

- Do **not** add `supabase.intrawebtech.com` as a **Custom Domain** on `nexus-iw-portal`, `iw-site-q2`, or any Vercel project. That would route the hostname to Vercel Edge, not your Hostinger VPS.
- Do **not** use a CNAME to `*.vercel-dns-*.com` for Supabase.

Compare with other subdomains on the same VPS (same A record pattern):

| Name | Type | Value |
| --- | --- | --- |
| `n8n` | A | `187.77.0.115` |
| `postiz` | A | `187.77.0.115` |
| `supabase` | A | `187.77.0.115` |

Vercel-hosted apps stay on CNAME (e.g. `portal` / `dashboard` → `*.vercel-dns-*.com`).

HTTPS for `supabase.intrawebtech.com` is terminated on the **VPS** (n8n Caddy → Kong `:8000`), not in Vercel.

---

## Phase 4 — Environment variable mapping

Update **Vercel** (both projects) and local `.env.local`. Self-hosted keys come from VPS `sh run.sh secrets`.

| Variable | Managed | Self-hosted |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | `https://supabase.intrawebtech.com` (your HTTPS URL) |
| `SUPABASE_URL` | same | same |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard anon key | `SUPABASE_PUBLISHABLE_KEY` from self-hosted `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role JWT | `SUPABASE_SECRET_KEY` from self-hosted `.env` |
| `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` | `db.<ref>.supabase.co` | `postgres://postgres.[tenant]:[pass]@187.77.0.115:5432/postgres` |
| `POSTGRES_HOST` | `db.<ref>.supabase.co` | `187.77.0.115` or pooler host |
| `SUPABASE_JWT_SECRET` | Dashboard JWT secret | `JWT_SECRET` from self-hosted `.env` (only if something still verifies HS256) |
| `SUPABASE_ACCESS_TOKEN` | CLI PAT for cloud | **Remove** — not used for self-hosted |
| `SUPABASE_DB_PASSWORD` | managed DB password | `POSTGRES_PASSWORD` from self-hosted |

Example snippet: [`apps/iw-portal/scripts/self-host/.env.self-hosted.example`](../../apps/iw-portal/scripts/self-host/.env.self-hosted.example).

**Turbo / build:** keys are already on `tasks.build.env` in `turbo.json`; redeploy after Vercel env changes.

---

## Phase 5 — Clerk + RLS

Portal RLS uses `auth.jwt()->>'sub'` as Clerk user id (`001_initial.sql`).

Server routes primarily use **service role** (`createServiceSupabase()` in `server.ts`), which bypasses RLS — cutover works even before Clerk JWT verification is perfect.

For **RLS paths** (anon + Clerk bearer token):

1. Clerk Dashboard → enable **Supabase** integration; note Clerk domain / JWKS URL.
2. Self-hosted PostgREST must verify Clerk JWTs via **`JWT_JWKS`** (include Clerk JWKS). See [Self-hosted auth keys](https://supabase.com/docs/guides/self-hosting/self-hosted-auth-keys) and [Clerk + Supabase](https://clerk.com/docs/integrations/databases/supabase).
3. Keep `CLERK_SUPABASE_JWT_TEMPLATE=supabase` unless you migrate to session-token-only client pattern.

Test after cutover:

```sh
pnpm --filter @repo/iw-portal verify:stack
```

`verify-stack-alignment` checks `*.supabase.co` refs — expect **MISMATCH** on self-hosted URLs; validate manually: URL loads, service key works, `SELECT 1` via `POSTGRES_URL`.

---

## Phase 6 — n8n Postgres credential

Workflows use credential **`OS_SUPABASE_POSTGRES`** (direct SQL, not REST):

- Update host to `187.77.0.115` (or internal hostname).
- Port `5432` (session) or `6543` (transaction pooler).
- User `postgres.[POOLER_TENANT_ID]`, password `POSTGRES_PASSWORD`.
- Allow n8n egress IP in VPS firewall.

Affected workflows include lead intake, contract generation, client health monitoring, automation log sheet.

---

## Phase 7 — Cutover checklist

### Before switching traffic

- [ ] Self-hosted `docker compose ps` all healthy.
- [ ] HTTPS valid on API URL; Studio behind basic auth.
- [ ] All migrations applied; row counts spot-checked vs managed.
- [ ] Storage files copied; signed URL upload/download tested.
- [ ] n8n credential updated and test workflow run.

### Switch

- [ ] Update Vercel env vars for `iw-portal` and `iw-site-q2`.
- [ ] Redeploy both apps (production).
- [ ] Smoke: sign-in, `/api/health`, document upload, data deletion form, billing webhook path.

### After cutover

- [ ] Monitor VPS RAM (`docker stats`); KVM 2 is adequate for small/medium load.
- [ ] Schedule weekly `pg_dump` + off-VPS storage (Hostinger weekly backup ≠ PITR).
- [ ] Pin Docker image tags on update; follow [Supabase docker CHANGELOG](https://github.com/supabase/supabase/tree/master/docker).
- [ ] Keep managed project read-only 7–14 days, then decommission.

---

## Phase 8 — Ongoing operations

| Task | Frequency | Command / location |
| --- | --- | --- |
| Update stack | ~monthly | VPS: `git pull` / re-copy docker dir, `sh run.sh pull`, `sh run.sh recreate` |
| DB backup | daily | `pg_dump` cron → S3 or second region |
| VPS snapshot | before changes | hPanel |
| Migrations | per release | `pnpm exec supabase db push --db-url "$SELF_HOSTED_DB_URL"` from `apps/iw-portal` |
| Secret rotation | as needed | `sh utils/db-passwd.sh`, update Vercel + n8n |

---

## Rollback

1. Revert Vercel env vars to managed `*.supabase.co` URLs and keys.
2. Redeploy apps.
3. Managed DB was unchanged if you did not delete it — traffic returns immediately.
4. Re-sync any writes that landed on self-hosted during the window (manual or point-in-time if you kept managed primary).

---

## Related docs

- [deployment-runbook.md](./deployment-runbook.md)
- [environment-contract.md](./environment-contract.md)
- [integration-map.md](./integration-map.md)
