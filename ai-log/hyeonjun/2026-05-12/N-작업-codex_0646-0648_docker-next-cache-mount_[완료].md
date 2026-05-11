# Docker Next.js cache mount 적용

- 시작: 2026-05-12 06:46 KST
- 목표: 루트 Dockerfile의 Next.js 빌드 단계에 `/app/apps/web/.next/cache` BuildKit cache mount만 추가하고 main PR로 머지한다.
- 제약: 기존 로컬 미완료 변경분은 stash로 보존했고, 이번 커밋에는 Dockerfile/백로그/작업로그만 포함한다.
- 검증 완료:
  - `git diff --check`
  - `DOCKER_BUILDKIT=1 docker build --target builder --build-arg NODE_MEMORY=4096 --build-arg NEXT_PUBLIC_RACE_SERVER_URL=wss://race.yeon.world -t yeon-web-builder-cache-test .`

- 완료: 2026-05-12 06:48 KST
