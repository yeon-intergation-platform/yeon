# Docker 이미지 크기 축소 작업

## 목표

배포 pull 병목 완화를 위해 race-server, web, backend 최종 Docker 이미지를 순서대로 축소한다.

## 구현

- race-server runner가 `deps` stage를 그대로 사용해 devDependencies와 빌드 도구를 포함하던 구조를 `pnpm deploy --prod --legacy` 산출물 + distroless Node runtime으로 분리했다.
- race-server 런타임이 TypeScript 소스를 `tsx`로 실행하므로 `tsx`를 production dependency로 승격했다.
- web runner를 `node:22-bookworm-slim`에서 `gcr.io/distroless/nodejs22-debian12:nonroot`로 전환하고 Next standalone/static/public/ffmpeg만 복사하게 정리했다.
- backend runner를 `eclipse-temurin:21-jre-alpine`으로 전환하고 Alpine 방식으로 curl과 spring user를 구성했다.

## 이미지 크기 확인

- `yeon-race-server:size-test`: 382MB
- `yeon-web-app:size-test`: 460MB
- `yeon-backend:size-test`: 325MB

## 검증

- `DOCKER_BUILDKIT=1 docker build -f apps/race-server/Dockerfile -t yeon-race-server:size-test .`
- race-server runtime smoke: `GET http://127.0.0.1:2568/health` → `{"ok":true,"rooms":["typing_race_public","card_room"]}`
- `DOCKER_BUILDKIT=1 docker build -f Dockerfile -t yeon-web-app:size-test --build-arg NODE_MEMORY=4096 --build-arg NEXT_PUBLIC_RACE_SERVER_URL=wss://race.yeon.world .`
- web runtime smoke: `GET http://127.0.0.1:3001/api/health` → `{"status":"ok","service":"web"...}`
- `DOCKER_BUILDKIT=1 docker build -f apps/backend/Dockerfile -t yeon-backend:size-test .`
- backend runtime smoke: `docker run --rm --entrypoint java yeon-backend:size-test -version`
- `pnpm --filter @yeon/race-server lint`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm lint`
- `pnpm typecheck`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 남은 위험

- distroless 이미지는 shell이 없어 운영 컨테이너 내부 디버깅은 로그/새 debug image 중심으로 해야 한다.
- backend Alpine JRE는 운영 배포 후 health를 확인한다.
