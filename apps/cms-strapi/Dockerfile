# syntax=docker/dockerfile:1.7
#
# Multi-stage Strapi image for the nexus monorepo.
# Prefer building after `pnpm exec turbo prune cms-strapi --docker` from repo root
# (produces out/json + out/full). This Dockerfile also works from the full repo context.

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

FROM base AS deps
# Pruned lockfile graph when present; otherwise full monorepo manifests.
COPY out/json/ ./
COPY out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/ ./
COPY out/full/ ./
COPY turbo.json ./turbo.json
RUN pnpm exec turbo run build --filter=cms-strapi

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --system --user-group --create-home strapi

COPY --from=builder --chown=strapi:strapi /app/ ./

USER strapi
WORKDIR /app/apps/cms-strapi
EXPOSE 1337
CMD ["pnpm", "start"]
