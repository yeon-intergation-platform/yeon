# 36차 작업 — spaces CRUD spring pilot

- 시작: 15:10
- 종료: 15:18
- 상태: 완료

## 목표
- `/api/v1/spaces`와 `/api/v1/spaces/[spaceId]`의 direct Next backend logic을 제거하고 Spring으로 이관한다.

## 작업내용
- Spring `spaces` package를 추가했다.
  - controller / dto / repository / service / tests
- space 생성 시 default system tabs 5개와 overview fields 8개 bootstrap도 Spring transaction 안에서 처리하도록 옮겼다.
- `apps/web/src/server/spaces-spring-client.ts`를 추가했다.
- Next spaces route를 Spring thin BFF로 전환했다.
- route tests를 추가했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.spaces.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/spaces/**` 기준
  - `spaces-service`
  - `createDefaultSystemTabs`
  - no matches ✅

## 남은 것
- repo-wide Next backend full migration 목표는 계속 미완료다.
- 다음 smallest lane은 `typing-decks` / `card-decks` / `counseling-records` / `analyze flow` 중 재실측이 필요하다.
