# Current build findings

Recorded during architecture hardening validation (Phase 6). **These issues were not introduced by the docs/scaffolding PR** unless noted.

## `pnpm lint` — **FAIL** (pre-existing)

`@repo/iw-site-q2` ESLint exits with errors:

- `react-hooks/set-state-in-effect` in `components/legal-page-layout.tsx`, `components/nav-bar.tsx`, `components/primitives.tsx`
- `@typescript-eslint/no-explicit-any` in `components/shared/website-intake-form.tsx`, `lib/gtag.ts`
- Warnings: unused vars in `app/api/website-intake/route.ts`, `components/website-intake/KickoffScheduler.tsx`, `postcss.config.mjs`

**Next step (suggested PR):** Fix or selectively disable rules after reviewing React 19 / Next 16 guidance; `@repo/iw-portal` lint passes.

## `pnpm check-types` — **PASS**

Includes new packages `@repo/env`, `@repo/ops`, `@repo/integrations` and existing `@repo/n8n-workflows` no-op.

## `pnpm build` — **PASS** (after local cache hygiene)

**First run note:** `next build` for `@repo/iw-portal` failed with a type error referencing missing `src/app/api/notifications/mark-all-read/route.js` from generated `.next/dev/types/validator.ts`. The route does not exist in source (stale `.next` artifact). **Removing `apps/iw-portal/.next` and rebuilding** resolved the failure.

CI and other developers should use clean builds when routes are removed, or ensure `.next` is not committed (it is normally gitignored).

## Filtered app build — **PASS**

`pnpm exec turbo run build --filter=@repo/iw-portal --filter=@repo/iw-site-q2` succeeds after the cache clean above.

## Tooling change (this PR)

[turbo.json](../../turbo.json) `build` outputs now include `dist/**` so TypeScript library packages emit outputs recognized by Turborepo (removes “no output files” warnings for `@repo/env`, `@repo/ops`, `@repo/integrations`).

## Recommended next PR-sized task

Add `check-types` scripts to `@repo/iw-portal` and `@repo/iw-site-q2` (e.g. `tsc --noEmit` with appropriate project references) so `pnpm check-types` matches `next build` typing without a full Next build, and progressively fix `@repo/iw-site-q2` lint errors.
