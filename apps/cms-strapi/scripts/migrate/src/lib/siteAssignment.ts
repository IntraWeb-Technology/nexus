/**
 * Site assignment rules (frozen — see task brief / contracts.md).
 *
 * - Hashnode/portfolio articles -> `personal` only, always. If the title or
 *   body strongly reads like IntraWeb company marketing, we still ship it as
 *   `personal` but ALSO drop it in the review queue so a human decides
 *   whether it should be duplicated/moved to `intraweb`. We never auto-add
 *   `intraweb` to an article's sites — that would be guessing.
 * - Projects: `personal`; slug/name `intraweb` -> [personal, intraweb].
 * - Case studies: `personal`; `intraweb` case study -> [personal, intraweb].
 * - FAQ + services content -> `intraweb`.
 */

const STRONG_INTRAWEB_MARKETING_PATTERN =
  /\b(intraweb technologies|intrawebtech\.com)\b[\s\S]{0,200}\b(our (services|team|clients|agency)|we (offer|build|specialize|provide)|hire us|contact us|book a (call|diagnostic)|schedule a call)\b/i;

export function detectStrongIntrawebMarketing(title: string, body: string): boolean {
  const haystack = `${title}\n${body}`;
  return STRONG_INTRAWEB_MARKETING_PATTERN.test(haystack);
}

export function isIntrawebSlug(slugOrName: string): boolean {
  return /intraweb/i.test(slugOrName);
}
