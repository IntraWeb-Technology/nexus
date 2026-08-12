# Blog markdown content

This directory is the **local fallback** for blog posts when Strapi is disabled
or empty (`lib/local-blog-loader.ts`).

## Status in this nexus copy

Posts are often **missing** here. Canonical files live in portfolio-os:

`C:\Users\jschi\OneDrive\Desktop\Projects\2025_portfolio\portfolio-os\apps\site\content\blog`

Sync `.md` / `.mdx` files into this folder before relying on local-only mode.

## Resolution order

1. Strapi (`STRAPI_URL` + site key `personal`) when enabled
2. Local markdown in this directory
3. Hashnode GraphQL (tertiary so the site never blanks)
