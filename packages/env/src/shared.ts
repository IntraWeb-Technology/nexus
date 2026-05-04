import { z } from 'zod'

/** Compatible with `ZodError#flatten()` shape (Zod 3/4). */
export type FlattenedEnvErrors = {
  formErrors: string[]
  fieldErrors: Record<string, string[] | undefined>
}

export type EnvValidationSuccess<T> = { success: true; data: T }

export type EnvValidationFailure = {
  success: false
  errors: FlattenedEnvErrors
}

export type EnvValidationResult<T> = EnvValidationSuccess<T> | EnvValidationFailure

export function pickEnvKeys<K extends string>(
  env: NodeJS.ProcessEnv,
  keys: readonly K[],
): Record<K, string | undefined> {
  const out = {} as Record<K, string | undefined>
  for (const k of keys) {
    out[k] = env[k]
  }
  return out
}

export function optionalStringShape<K extends string>(keys: readonly K[]) {
  return z.object(
    Object.fromEntries(keys.map((k) => [k, z.string().optional()])) as {
      [P in K]: z.ZodOptional<z.ZodString>
    },
  )
}
