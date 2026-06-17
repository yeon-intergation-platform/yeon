# 공개 콘텐츠 admin Next BFF 연결

## 목표

- Spring public content admin read API를 Next admin API route로 연결한다.
- admin 기능은 현재 정책대로 읽기 전용으로 유지한다.
- 글 생성, 수정, 삭제, 발행 API/UI는 추가하지 않는다.

## 범위

- `apps/web/src/server/public-content-spring-client.ts`
- `apps/web/src/app/api/v1/admin/content/**`
- 관련 route/client 테스트

## 진행 로그

- 15:38 작업 시작.
- 기존 공개 콘텐츠 BFF 패턴과 Spring admin controller를 확인했다.
- 15:42 Next admin read-only BFF route와 Spring client 연결을 완료했다.

## 검증

- `pnpm --dir apps/web exec vitest run src/server/__tests__/public-content-spring-client.test.ts --reporter verbose`
- `pnpm --dir apps/web exec vitest run src/app/api/v1/admin/content/__tests__/route.test.ts 'src/app/api/v1/admin/content/[articleId]/__tests__/route.test.ts' --reporter verbose`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
