# Refactor safety checklist

Use this before and after any structural change (package moves, env refactors, webhook changes).

## Pre-change

- [ ] Read [architecture-inventory.md](./architecture-inventory.md) for affected apps and touchpoints.
- [ ] Confirm the change is **additive** or has an explicit rollback path.
- [ ] Identify production-critical paths (auth, billing, webhooks, intake forms).
- [ ] Do **not** rename environment variables or workflow IDs unless the task explicitly requires it.
- [ ] Do **not** edit checked-in n8n workflow JSON unless the task requires it.

## During change

- [ ] Keep API route behavior stable unless the PR is dedicated to that behavior change.
- [ ] Preserve webhook auth mechanisms (`svix-*`, `stripe-signature`, `x-intrawebtech-secret`, marketing HMAC headers).
- [ ] Update **all** import paths and `package.json` references when moving files.
- [ ] If touching `turbo.json` env lists, run a **clean** build to validate cache behavior.

## Post-change — required commands

Run from repository root:

```sh
pnpm install
pnpm lint
pnpm check-types
pnpm build
pnpm exec turbo run build --filter=@repo/iw-portal --filter=@repo/iw-site-q2
```

**Package-specific tests (when portal changes touch webhooks / provisioning):**

```sh
pnpm --filter @repo/iw-portal test
```

## Manual smoke tests (staging or local with secrets)

- [ ] Portal: sign-in, load dashboard, `/api/health`.
- [ ] Portal: Stripe test checkout or customer portal (test mode as appropriate).
- [ ] Marketing: contact form and website intake (reCAPTCHA path).
- [ ] n8n: execute a safe test workflow against staging URLs if available.

## Rollback guidance

- Revert the Git commit or redeploy the previous Vercel production deployment.
- If secrets were rotated in error, restore prior values in Vercel and provider dashboards.
- If a migration partially ran, use Supabase/Stripe/HubSpot provider tooling to assess data state before re-running scripts.

## Do not touch (without explicit approval)

- Legacy `apps/iw-site` is no longer in this monorepo; marketing work stays in `apps/iw-site-q2`.
- Production-only destructive scripts (`vercel-prune-dev-env`, HubSpot ensure scripts) on production tenants without a reviewed runbook.
- n8n workflow **IDs** embedded in automation and docs.
- Live customer data without backup and a named owner.

## Related

- [environment-contract.md](./environment-contract.md)
- [webhook-contracts.md](./webhook-contracts.md)
- [deployment-runbook.md](./deployment-runbook.md)
