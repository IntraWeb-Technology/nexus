/**
 * Non-runtime scripts: validate loaded env against `@repo/env` portal key shapes.
 *
 * `IW_PORTAL_ENV_VALIDATE`:
 * - unset → use the caller’s default (`strict` | `report` | `off`)
 * - `strict` → exit 1 on schema failure
 * - `report` → print issues, continue
 * - `0` / `off` / `false` → skip
 */
import { validateIwPortalEnv } from '@repo/env'

export type IwPortalEnvValidateDefault = 'strict' | 'report' | 'off'

function resolvedMode(defaultWhenUnset: IwPortalEnvValidateDefault): 'strict' | 'report' | 'off' {
  const raw = process.env.IW_PORTAL_ENV_VALIDATE?.trim().toLowerCase()
  if (raw === '0' || raw === 'off' || raw === 'false') return 'off'
  if (raw === 'strict') return 'strict'
  if (raw === 'report') return 'report'
  return defaultWhenUnset
}

export function applyIwPortalEnvValidation(defaultWhenUnset: IwPortalEnvValidateDefault, label = 'Portal env'): void {
  const mode = resolvedMode(defaultWhenUnset)
  if (mode === 'off') return

  const result = validateIwPortalEnv()
  if (result.success) return

  const { formErrors, fieldErrors } = result.errors
  console.error(`--- ${label} (@repo/env) ---`)
  if (formErrors.length) console.error(formErrors.join('\n'))
  for (const [key, msgs] of Object.entries(fieldErrors)) {
    if (msgs?.length) console.error(`${key}: ${msgs.join('; ')}`)
  }
  if (mode === 'strict') {
    console.error(`Set IW_PORTAL_ENV_VALIDATE=report to warn only.`)
    process.exit(1)
  }
}
