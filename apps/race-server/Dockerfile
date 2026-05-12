# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

# ── Stage 1: turbo prune (race-server 전용 workspace 추출) ──────────────────
FROM base AS pruner

WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm dlx turbo@^2 prune @yeon/race-server --docker

# ── Stage 2: install build dependencies ─────────────────────────────────────
FROM base AS deps

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Stage 3: JS runtime bundle ──────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ .

RUN pnpm --filter @yeon/race-server build

# ── Stage 4: production runner ──────────────────────────────────────────────
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=2567
ENV HOME=/tmp

COPY --from=builder --chown=65532:65532 /app/apps/race-server/dist ./dist

EXPOSE 2567

CMD ["dist/index.js"]
