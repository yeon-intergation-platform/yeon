# Docker 런타임 추가 축소 및 Java 25 전환

## 목표

backend Java SSOT를 25로 맞추고, race-server production image에서 TS 런타임 실행기와 node_modules를 제거해 더 작고 명확한 JS runtime image로 전환한다.

## 구현

- `apps/backend/build.gradle` Java toolchain을 25로 변경했다. 작업 전 SSOT는 21이었다.
- backend Docker builder/runner를 `eclipse-temurin:25-jdk-alpine` / `eclipse-temurin:25-jre-alpine`으로 맞췄다.
- race-server는 `colyseus` meta package 대신 실제 사용 경로인 `@colyseus/core`, `@colyseus/ws-transport`, `@colyseus/schema`를 직접 참조하게 변경했다.
- race-server build를 esbuild ESM bundle로 추가하고 runner에는 `dist/index.js`만 복사한다.
- race-server runner에서 `pnpm deploy`, production `node_modules`, `tsx`, `typescript`, `git` 설치가 모두 빠졌다.
- web은 이미 Next standalone + distroless + cache 제외 구조라 변경 없이 Docker build/runtime smoke로 회귀 검증했다.

## 이미지 크기 확인

- `yeon-race-server:bundle-test`: 153MB
- `yeon-web-app:runtime-regression-test`: 459MB
- `yeon-backend:java25-test`: 346MB

## 검증

- `pnpm --filter @yeon/race-server lint`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/race-server build`
- local JS runtime smoke: `PORT=2571 node apps/race-server/dist/index.js` + `/health`
- `DOCKER_BUILDKIT=1 docker build -f apps/race-server/Dockerfile -t yeon-race-server:bundle-test .`
- race-server Docker runtime smoke: `/health`
- `cd apps/backend && ./gradlew test`
- `DOCKER_BUILDKIT=1 docker build -f apps/backend/Dockerfile -t yeon-backend:java25-test .`
- backend Docker runtime smoke: `java -version` → Temurin 25.0.3
- `DOCKER_BUILDKIT=1 docker build -f Dockerfile -t yeon-web-app:runtime-regression-test --build-arg NODE_MEMORY=4096 --build-arg NEXT_PUBLIC_RACE_SERVER_URL=wss://race.yeon.world .`
- web Docker runtime smoke: `/api/health`
- `pnpm lint`
- `pnpm typecheck`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 남은 위험

- race-server bundle은 smoke에서 정상 동작했지만, Colyseus 내부 미사용 경로까지 모두 번들링했으므로 배포 후 room join까지 확인한다.
- backend Java 25는 Spring Boot 4.0.6 호환 범위지만, 운영 health를 배포 후 확인한다.
