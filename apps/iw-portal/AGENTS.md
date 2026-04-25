<!-- BEGIN:nextjs-agent-rules -->
# Monorepo: `@/` path aliases

- **iw-portal**: [tsconfig](tsconfig.json) maps `@/*` to `./src/*` (for example `@/lib/foo` resolves to `src/lib/foo`).
- **iw-site-q2**: [tsconfig](../iw-site-q2/tsconfig.json) maps `@/*` to `./*` at the app root (for example `@/lib/foo` resolves to `lib/foo`). This is intentional; there is no `src/` folder. Shared packages must not assume one layout for both apps.
- If you add cross-app shared code later, use explicit package entry points or align folder layout in a dedicated migration; do not mix `@/` resolution across apps as-is.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
