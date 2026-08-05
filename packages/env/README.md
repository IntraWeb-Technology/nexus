# `@repo/env`

Centralized **documentation and validation** for environment variables used across Nexus apps and tooling.

## Usage

This package is **not** wired into app startup by default. Import only when you explicitly want to validate a subset of env at tooling boundaries (e.g. a script entrypoint).

```typescript
import { validateIwPortalEnv } from '@repo/env'

const result = validateIwPortalEnv()
if (!result.success) {
  console.error(result.errors)
  process.exit(1)
}
```

## Behavior

- Variables are **not renamed**; keys match code and [docs/architecture/environment-contract.md](../../docs/architecture/environment-contract.md).
- Schemas treat each tracked key as `string | undefined` (optional). This avoids false positives when keys are missing; stricter “required for production” rules can be added in a later PR.
- `validate*` functions only inspect **known** keys; other `process.env` entries are ignored.

## Scripts

- `pnpm build` — emit `dist/` for workspace consumers
- `pnpm check-types` — `tsc --noEmit`
