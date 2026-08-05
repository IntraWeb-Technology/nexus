# `@repo/strapi-client`

**Server-only** typed Strapi 5 REST client for the multi-site editorial migration (`personal` | `intraweb`).

> Never import this package into Client Components, `"use client"` modules, or any browser bundle. Tokens must come from server env (`STRAPI_API_TOKEN`), never `NEXT_PUBLIC_*`.

## Install (workspace)

```json
{
  "dependencies": {
    "@repo/strapi-client": "workspace:*"
  }
}
```

## Env

| Variable | Sent to Strapi? | Notes |
|---|---|---|
| `STRAPI_URL` | Yes (as `baseUrl`) | No trailing slash required |
| `STRAPI_API_TOKEN` | Yes (Bearer) | Server-only; optional only if Public role has find permissions |
| `STRAPI_PREVIEW_SECRET` | No | App-level draft-mode guard via `client.verifyPreviewSecret()` |

## Usage

```ts
import { createStrapiClient } from "@repo/strapi-client";

const strapi = createStrapiClient({
  baseUrl: process.env.STRAPI_URL!,
  token: process.env.STRAPI_API_TOKEN!,
  previewSecret: process.env.STRAPI_PREVIEW_SECRET,
  defaultTimeoutMs: 15_000,
});

const settings = await strapi.getSiteSettings("intraweb");
const articles = await strapi.getArticles("personal", { page: 1, pageSize: 10 });
const draft = await strapi.getArticleBySlug("personal", "my-slug", { preview: true });
```

`preview: true` sets Strapi 5 `status=draft`. The API token must be allowed to read drafts.

## Public API

- `createStrapiClient({ baseUrl, token?, previewSecret?, defaultTimeoutMs? })`
- `verifyPreviewSecret(secret)` on the client instance
- `getSiteSettings`, `getNavigation`, `getPageBySlug`
- `getArticles`, `getArticleBySlug`
- `getProjects`, `getProjectBySlug`
- `getServices`, `getCaseStudies`, `getCaseStudyBySlug`
- `getTestimonials`, `getFaqItems`, `getRedirect`

Site filters:

- **one Site** (`site-setting`, `navigation`, `page`, `service`, `redirect`): `filters[site][key][$eq]=…`
- **many Sites** (`article`, `project`, `case-study`, `testimonial`, `faq-item`): `filters[sites][key][$eq]=…`

Responses are normalized then Zod-validated into domain models (never raw Strapi DTOs).

## Scripts

```bash
pnpm --filter @repo/strapi-client build
pnpm --filter @repo/strapi-client check-types
pnpm --filter @repo/strapi-client test
```

## Assumptions (Strapi 5)

- Flat document REST shape (`data` / `meta`). v4 `{ attributes }` wrappers are accepted when normalizing.
- Deep filters use LHS bracket notation (`filters[sites][key][$eq]`).
- Draft preview uses `status=draft` (not v4 `publicationState`).
- Plural REST paths match Content-Type Builder defaults (`/api/articles`, `/api/case-studies`, …).
- Field names follow the shared content-model schemas in this package (`featuredImage`, `publishedDate`, `body`, …). Align Strapi schemas with these names.
