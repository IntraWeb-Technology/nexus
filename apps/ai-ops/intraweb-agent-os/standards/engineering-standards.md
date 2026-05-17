# Engineering Standards

## General
- Preserve existing architecture.
- Prefer minimal, targeted changes.
- Avoid introducing dependencies unless justified.
- Keep code readable and maintainable.
- Update docs when behavior changes.

## TypeScript
- Avoid `any` unless justified.
- Use explicit types for public interfaces.
- Keep validation close to boundaries.

## React / Next.js
- Prefer server components unless interactivity requires client components.
- Use client components intentionally.
- Keep components focused.
- Avoid unnecessary state.

## Accessibility
- Maintain semantic HTML.
- Preserve keyboard navigation.
- Use proper labels and ARIA only when needed.
- Respect reduced motion.
- Maintain color contrast.

## Performance
- Avoid heavy client-side code.
- Lazy-load where appropriate.
- Preserve image optimization.
- Avoid layout shifts.

## Validation
Run available checks:
- lint
- typecheck
- tests
- Lighthouse when relevant
