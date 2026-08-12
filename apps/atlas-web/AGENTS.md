<!-- BEGIN:nextjs-agent-rules -->
# Monorepo: `@/` path aliases

- **atlas-web**: [tsconfig](tsconfig.json) maps `@/*` to `./src/*` (for example `@/lib/foo` resolves to `src/lib/foo`).
- Other Nexus apps differ (`iw-portal` → `src/*`, `iw-site-q2` → app root). Do not assume shared `@/` semantics across apps.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
