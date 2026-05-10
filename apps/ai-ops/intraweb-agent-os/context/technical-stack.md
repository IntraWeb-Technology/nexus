# Technical Stack Context

## Primary Stack
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Supabase
- n8n
- HubSpot
- Stripe
- Resend
- Vercel
- GitHub Actions

## Engineering Priorities
1. Reliability
2. Maintainability
3. Accessibility
4. Performance
5. Observability
6. Documentation

## Frontend Rules
- Use TypeScript.
- Use existing component patterns.
- Prefer JSON/content-driven sections where appropriate.
- Do not introduce new dependencies unless justified.
- Preserve responsive behavior.
- Preserve WCAG AA accessibility.
- Maintain Lighthouse standards.

## Automation Rules
- Every workflow must define success path, failure path, retry logic, logging, and human review points.
- Do not build demo-only workflows.
- Production workflows need observability and recovery paths.

## Documentation Rules
- Every major decision gets captured.
- Every workflow needs a runbook.
- Every integration needs source-of-truth documentation.
