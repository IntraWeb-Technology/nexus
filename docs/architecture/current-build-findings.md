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
- `scripts/vercel-prune-dev-env.ts`: removed unused `iwPortalEnvLocalPath` import.
- `scripts/verify-stack-alignment.ts`: removed dead `anon` env read.

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
- `scripts/verify-stack-alignment.ts` — default **strict**
- `scripts/vercel-align-env.ts` — default **report** (partial `.env.local` must not block sync)
- `scripts/vercel-prune-dev-env.ts` — default **off** (no env file load; opt-in validate)

`validateIwSiteQ2Env` / `validateN8nEnv` were not added here; these scripts are portal-only and do not load site-q2 or n8n-workflows env contracts.

**Commands (root):** `pnpm lint`, `pnpm check-types`, and `pnpm build` — **PASS** (after `pnpm install` and `@repo/env` build).

## Recommended next PR-sized task

Add a **CI workflow** (or extend an existing one) that runs `pnpm lint`, `pnpm check-types`, and `pnpm build` on every PR, with Node 22 and pnpm cache aligned to the repo.
