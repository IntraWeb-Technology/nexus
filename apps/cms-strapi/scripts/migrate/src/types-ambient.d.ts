/**
 * Minimal ambient typing for `js-yaml` so editors/tsc don't complain when
 * `@types/js-yaml` hasn't been installed yet (it is a transitive dependency
 * of Strapi already present on disk; `js-yaml` itself ships no types).
 * Safe to delete once `pnpm install` has run and pulled in real types.
 */
declare module "js-yaml" {
  export function load(input: string, options?: unknown): unknown;
  export function dump(obj: unknown, options?: unknown): string;
  const _default: { load: typeof load; dump: typeof dump };
  export default _default;
}
