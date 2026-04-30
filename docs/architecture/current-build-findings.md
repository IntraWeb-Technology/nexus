# Current build findings

Recorded during architecture hardening validation and **Phase 2 quality gates** (lint / `check-types` / build).

## `pnpm lint` — **PASS**

Previously **`@repo/iw-site-q2`** failed ESLint with:

- **`react-hooks/set-state-in-effect`**: synchronous `setState` inside `useEffect` in `components/legal-page-layout.tsx` (TOC headings), `components/nav-bar.tsx` (close menu on route change), and `components/primitives.tsx` (`Counter` when reduced motion).
- **`@typescript-eslint/no-explicit-any`**: `components/shared/website-intake-form.tsx` (`trigger` / `setStep` / error message casts), `lib/gtag.ts`.
- **Unused / style**: `app/api/website-intake/route.ts` (unused `action`, unused destructured omit vars), `components/website-intake/KickoffScheduler.tsx` (unused `submittedData`), `postcss.config.mjs` (anonymous default export).

**Fixes applied (smallest safe):**

- Deferred DOM-derived updates and menu close with `queueMicrotask(() => …)` so effects do not synchronously call `setState` (same user-visible behavior).
- Replaced `any` in the intake form with `FieldPath<WebsiteIntakeFormValues>` for `trigger`, a typed `setStep` cast for `back()`, and `errors.*?.message` for multi-select field errors.
- Typed `window.gtag` in `lib/gtag.ts` with narrow overloads and a typed `event()` payload.
- Dropped unused `action`; built n8n payload with `{ ...parsed.data }` plus `delete` for `recaptchaToken` and `dealStage` (no unused bindings).
- Named default export in `postcss.config.mjs`.
- Kickoff: alias `submittedData` → `_submittedData` with JSDoc + `void _submittedData` so the public prop stays in the API without tripping unused-vars.

**`@repo/iw-portal`** (surfaced once `iw-site-q2` was green / cache invalidated):

- `scripts/update-payment-links.js`: one-line **`eslint-disable-next-line`** for `@typescript-eslint/no-require-imports` (plain `node` CJS script).
- `packages/ops/src/vercel/vercel-prune-dev-env.ts` (migrated from portal in Phase 5; **Phase 8** `vercel/` folder): same logic as before; relative imports use explicit `.js` specifiers for `@repo/ops` `nodenext` (runtime unchanged under `tsx`).
- `packages/ops` `verify-stack-alignment` (formerly `apps/iw-portal/scripts/verify-stack-alignment.ts`): removed dead `anon` env read (historical note; script now lives under `@repo/ops`).

## `pnpm check-types` — **PASS**

Root script runs `turbo run check-types`. **`@repo/iw-portal`** and **`@repo/iw-site-q2`** now define:

```json
"check-types": "tsc --noEmit"
```

so both Next apps participate in the same gate as `@repo/env`, `@repo/integrations`, and `@repo/ops`. `@repo/n8n-workflows` remains a no-op `check-types`.

## `pnpm build` — **PASS**

Full monorepo `turbo run build` succeeds for the current tree.

**Stale `.next` note (unchanged):** If `next build` fails on a type error pointing at a **missing** route under `.next/dev/types/validator.ts`, delete `apps/<app>/.next` and rebuild. Do not commit `.next`.

## Filtered app build

`pnpm exec turbo run build --filter=@repo/iw-portal --filter=@repo/iw-site-q2` should match root `build` for those packages.

## Tooling

[turbo.json](../../turbo.json) `build` outputs include `dist/**` for TS library packages.

## Remaining technical debt / review

- **`queueMicrotask` + `setState`**: Satisfies the lint rule and preserves behavior; a future pass could refactor to derived state / `useLayoutEffect` + subscriptions where React docs recommend it, if you want stricter alignment with “you might not need an effect.”
- **`KickoffScheduler` `submittedData`**: Still unused at runtime; consider using it for prefill or drop from the public props if the contract allows.
- **`update-payment-links.js`**: Still CJS `require`; converting to ESM + `import` would remove the need for the disable comment.

## Phase 3 — `@repo/env` in portal scripts only

**Scope:** `apps/iw-portal` tsx tooling imports `@repo/env` for `validateIwPortalEnv`. No Next.js runtime / route / middleware imports.

**Wiring:**

- `scripts/lib/iw-portal-env-check.ts` — shared helper reading `IW_PORTAL_ENV_VALIDATE`
- `packages/ops/src/diagnostics/verify-stack-alignment.ts` — default **strict** (migrated from `scripts/verify-stack-alignment.ts` in Phase 8)
- `packages/ops/src/vercel/vercel-align-env.ts` — default **report** (partial `.env.local` must not block sync)
- `packages/ops/src/vercel/vercel-prune-dev-env.ts` — default **off** (no env file load; opt-in validate)
- `scripts/test-n8n-add-invoice.ts` — default **report** (webhook smoke test after `dotenv`)

`validateIwSiteQ2Env` / `validateN8nEnv` were not added to these entrypoints; portal scripts use the iw-portal contract only. Use `validateN8nEnv` from `@repo/env` in `packages/n8n-workflows` or other n8n-specific scripts when those are migrated.

**Commands (root, re-verified 2026-04-29):** `pnpm lint`, `pnpm check-types`, and `pnpm build` — **PASS**.

## Phase 5 — `vercel:prune-dev-env` in `@repo/ops`

**Scope:** Move the Vercel development-target prune script out of `apps/iw-portal/scripts` into `packages/ops` without changing behavior, env var names, or CLI usage from the operator’s perspective.

**Implementation:**

- Entry: `packages/ops/src/vercel/vercel-prune-dev-env.ts` (same control flow and `npx vercel env rm … development` loop; `cwd` remains `apps/iw-portal`). **Phase 8** moved ops sources into `vercel/`, `env/`, and `repo/` folders; behavior unchanged.
- Supporting modules: `env/iw-portal-env-check.ts`, `repo/repo-root.ts`, `vercel/vercel-kv-list.ts` — required so `@repo/ops` typechecks with `rootDir: src` and runs standalone. **Phase 7** removed the duplicate `apps/iw-portal/scripts/vercel-kv-list.ts`; `PORTAL_ENV_KEYS` is canonical in ops only.
- Portal script: `vercel:prune-dev-env` → `pnpm --filter @repo/ops vercel:prune-dev-env`.
- **Behavior differences:** None intended. `@repo/env` validation (`applyIwPortalEnvValidation('off')` plus `IW_PORTAL_ENV_VALIDATE` overrides) is unchanged.
- **Execution notes:** Run from repo root with `pnpm --filter @repo/ops vercel:prune-dev-env` or `pnpm --filter @repo/iw-portal vercel:prune-dev-env`. Still invokes the Vercel CLI per key (slow); requires the same Vercel project link as when run from the app directory.

**Commands (root, re-verified 2026-04-29):** `pnpm lint`, `pnpm check-types`, and `pnpm build` — **PASS** after migration.

## Phase 6 — `vercel:align-env` in `@repo/ops`

**Scope:** Move `vercel-align-env` from `apps/iw-portal/scripts` into `packages/ops` without changing control flow, env var names, Vercel CLI flags, or `@repo/env` validation defaults.

**Implementation:**

- Entry: `packages/ops/src/vercel/vercel-align-env.ts` — same loop, `cwd` still `apps/iw-portal`, same `dotenv` → `applyIwPortalEnvValidation('report', 'vercel:align-env')` → production / optional preview branch targets.
- **Imports:** Reuses ops modules with explicit `.js` specifiers under `env/`, `repo/`, and `vercel/` (no logic refactor).
- **Consolidation:** No new helper merges; align-env shares the same ops-side modules as `vercel-prune-dev-env`, including `vercel-kv-list.ts` (see Phase 7 for dedupe).
- **Dependencies:** `@repo/ops` declares `dotenv@^17.4.0` (same range as `@repo/iw-portal`) so `pnpm --filter @repo/ops vercel:align-env` resolves `config()` identically when the portal package is not the cwd.
- Portal: `vercel:align-env` → `pnpm --filter @repo/ops vercel:align-env`.
- **Behavior:** None intended vs pre-migration portal `tsx` entry (validated by running ops and portal filters against the same `.env.local` / Vercel project).

**Commands (root, re-verified 2026-04-29):** `pnpm lint`, `pnpm check-types`, and `pnpm build` — **PASS** after migration.

## Phase 7 — `PORTAL_ENV_KEYS` / `vercel-kv-list` single source of truth

**Scope:** Remove duplicate `apps/iw-portal/scripts/vercel-kv-list.ts`; `@repo/ops` owns `PORTAL_ENV_KEYS` with no behavior or key-list changes.

**Parity:** `apps/iw-portal/scripts/vercel-kv-list.ts` and `packages/ops/src/vercel/vercel-kv-list.ts` (path after Phase 8; previously `packages/ops/src/vercel-kv-list.ts`) were **identical** (exported `PORTAL_ENV_KEYS` only) before deletion.

**References:** No TypeScript imports referenced the portal path; only docs and ops internals used the list (`vercel-align-env`, `vercel-prune-dev-env` already import `./vercel-kv-list.js`).

**Ops:** `vercel:list-env-keys` → `tsx src/vercel/vercel-kv-list.ts` in `packages/ops/package.json` (module load smoke; same as prior ad-hoc `tsx` on the portal file). **Phase 8** moved this path under `src/vercel/`.

**Docs:** [architecture-inventory.md](./architecture-inventory.md) updated (`vercel:align-env` command, ad-hoc list, Vercel integration row); [environment-contract.md](./environment-contract.md) and [ops README](../../packages/ops/README.md) note the canonical module and script.

**Commands (root, re-verified 2026-04-29):** `pnpm lint`, `pnpm check-types`, and `pnpm build` — **PASS**.

## Phase 8 — `verify-stack-alignment` in `@repo/ops` + internal layout

**Scope:** Move `verify-stack-alignment` from `apps/iw-portal/scripts` into `@repo/ops`, harden `packages/ops/src/` into responsibility folders (`diagnostics/`, `vercel/`, `env/`, `repo/`), and delegate `verify:stack` from the portal package without changing Next.js runtime or env var names.

**Implementation:**

- Entry: `packages/ops/src/diagnostics/verify-stack-alignment.ts` — same read-only checks (Supabase ref alignment, optional Postgres `os_*` listing, PostgREST head count, HubSpot / Clerk reachability, static n8n credential note). Loads `apps/iw-portal/.env.local` via `repo/repo-root.ts`; `applyIwPortalEnvValidation('strict')`; Supabase URL/key resolution via `env/supabase-script-env.ts` (parity with former `scripts/lib/supabase-env.ts`).
- **Structure:** Vercel scripts under `src/vercel/`; portal env validation + script env helpers under `src/env/`; monorepo path helpers under `src/repo/`; stack verification under `src/diagnostics/`. No generic `utils/` folder.
- **Portal:** `verify:stack` → `pnpm --filter @repo/ops diagnostics:verify-stack`. App-owned `scripts/verify-stack-alignment.ts` removed.
- **Logging:** `[ops:diagnostics] verify-stack-alignment starting|complete` on **stderr** only so stdout lines stay identical for piping.
- **Dependencies:** `@supabase/supabase-js` and `pg` added to `@repo/ops` only (scripts package; apps unchanged).

**Behavior differences:** None intended for validation logic or exit codes vs the pre-migration portal `tsx` entry.

**Commands (root, re-verified 2026-04-30):** `pnpm --filter @repo/ops diagnostics:verify-stack`, `pnpm --filter @repo/iw-portal verify:stack`, `pnpm lint`, `pnpm check-types`, `pnpm build` — **PASS**.

## Recommended next PR-sized task

Add a **CI workflow** that runs `pnpm lint`, `pnpm check-types`, and `pnpm build` on every PR with Node 22 and pnpm cache aligned to the repo, or migrate additional portal scripts in a scoped phase.
