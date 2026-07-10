# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"

ARG PNPM_VERSION=11.5.2

RUN corepack enable \
    && corepack prepare "pnpm@${PNPM_VERSION}" --activate \
    && pnpm config set store-dir /pnpm/store --global

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# ── Stage 1: turbo prune ──────────────────────────────────────────────────────
# @yeon/web에 필요한 workspace 패키지만 추출한다.
# 새 packages/* 가 생겨도 이 단계가 자동으로 포함하므로 Dockerfile을 수정하지 않아도 된다.
FROM base AS pruner

WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm dlx turbo@^2 prune @yeon/web --docker

# ── Stage 2: install dependencies ────────────────────────────────────────────
FROM base AS deps

WORKDIR /app

# turbo prune 결과의 json/ 에는 필요한 package.json 파일만 포함된다.
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# turbo prune --docker 의 out/ 에는 .pnpmfile.cjs 가 포함되지 않는다. lockfile 에는
# pnpmfileChecksum 이 박혀 있어, 이 파일이 없으면 --frozen-lockfile 이
# ERR_PNPM_LOCKFILE_CONFIG_MISMATCH 로 실패한다. pruner 루트에서 직접 복사한다.
COPY --from=pruner /app/.pnpmfile.cjs ./.pnpmfile.cjs

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Stage 3: build ───────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/scripts/ ./scripts/

ENV NEXT_TELEMETRY_DISABLED=1
ENV YEON_SKIP_NEXT_TYPECHECK_DURING_DOCKER_BUILD=1

# 플랫폼에 따라 워크플로우에서 --build-arg NODE_MEMORY=<value> 로 조정한다.
ARG NODE_MEMORY=4096

# 타자 레이스 WebSocket 서버 URL (Next.js 빌드 시점에 번들에 인라인된다)
ARG NEXT_PUBLIC_RACE_SERVER_URL
ENV NEXT_PUBLIC_RACE_SERVER_URL=${NEXT_PUBLIC_RACE_SERVER_URL}

RUN --mount=type=cache,id=next-cache,target=/app/apps/web/.next/cache \
    NODE_OPTIONS="--max-old-space-size=${NODE_MEMORY}" \
    pnpm --filter @yeon/web build

# ── Stage 4: production runner ───────────────────────────────────────────────
# shell/package-manager 없는 distroless Node 런타임만 남겨 pull 용량을 줄인다.
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# ffmpeg 는 apt 로 설치하면 libavcodec/x11/opengl 등 196개 의존 패키지가 딸려와
# runner image 빌드가 3분+ 걸린다. 음성 chunk 분할(libmp3lame 인코딩)과 duration 확인(ffprobe)
# 두 용도만 쓰므로 mwader/static-ffmpeg 의 statically-linked binary 를 그대로 복사한다.
# 버전은 major.minor 고정 — 상담 전사 기능이 의존하는 codec (mp3/aac/wav 디코더, libmp3lame 인코더)은
# 이 태그가 모두 포함한다. 만약 특수 codec 이 추가로 필요해지면 별도 runtime image 를 재검토한다.
COPY --from=mwader/static-ffmpeg:7.0 /ffmpeg /usr/local/bin/ffmpeg
COPY --from=mwader/static-ffmpeg:7.0 /ffprobe /usr/local/bin/ffprobe

COPY --from=builder --chown=65532:65532 /app/apps/web/.next/standalone ./
COPY --from=builder --chown=65532:65532 /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=65532:65532 /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=65532:65532 /app/scripts/runtime/runtime-secret-loader.mjs ./scripts/runtime/runtime-secret-loader.mjs
COPY --from=builder --chown=65532:65532 /app/scripts/runtime/run-with-runtime-secrets.mjs ./scripts/runtime/run-with-runtime-secrets.mjs

ENV YEON_RUNTIME_ENTRYPOINT=apps/web/server.js

EXPOSE 3000

CMD ["scripts/runtime/run-with-runtime-secrets.mjs"]
