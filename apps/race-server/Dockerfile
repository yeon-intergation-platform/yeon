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
# turbo prune --docker 의 out/ 에는 .pnpmfile.cjs 가 포함되지 않는다. lockfile 에는
# pnpmfileChecksum 이 박혀 있어, 이 파일이 없으면 --frozen-lockfile 이
# ERR_PNPM_LOCKFILE_CONFIG_MISMATCH 로 실패한다. pruner 루트에서 직접 복사한다.
COPY --from=pruner /app/.pnpmfile.cjs ./.pnpmfile.cjs

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Stage 3: JS runtime bundle ──────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/scripts/runtime ./scripts/runtime

RUN pnpm --filter @yeon/race-server build

# ── Stage 4: production runner ──────────────────────────────────────────────
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=2567
ENV HOME=/tmp

COPY --from=builder --chown=65532:65532 /app/apps/race-server/dist ./dist
COPY --from=builder --chown=65532:65532 /app/scripts/runtime/runtime-secret-loader.mjs ./scripts/runtime/runtime-secret-loader.mjs
COPY --from=builder --chown=65532:65532 /app/scripts/runtime/run-with-runtime-secrets.mjs ./scripts/runtime/run-with-runtime-secrets.mjs

ENV YEON_RUNTIME_ENTRYPOINT=dist/index.js

EXPOSE 2567

CMD ["scripts/runtime/run-with-runtime-secrets.mjs"]
