import { pickEnvKeys, optionalStringShape, type EnvValidationResult } from './shared.js'

const N8N_PACKAGE_ENV_KEYS = [
  'N8N_API_KEY',
  'N8N_API_URL',
  'N8N_BASE_URL',
  'N8N_MCP_JSON',
  'N8N_WEBHOOK_SECRET',
  'N8N_WORKFLOWS_PROJECT_ID',
  'N8N_WORKFLOWS_RE_PUBLISH',
] as const

const n8nPackageEnvSchema = optionalStringShape(N8N_PACKAGE_ENV_KEYS)

export type N8nPackageEnv = Record<(typeof N8N_PACKAGE_ENV_KEYS)[number], string | undefined>

export function validateN8nEnv(
  env: NodeJS.ProcessEnv = process.env,
): EnvValidationResult<N8nPackageEnv> {
  const picked = pickEnvKeys(env, N8N_PACKAGE_ENV_KEYS)
  const result = n8nPackageEnvSchema.safeParse(picked)
  if (result.success) {
    return { success: true, data: result.data as N8nPackageEnv }
  }
  return { success: false, errors: result.error.flatten() }
}
