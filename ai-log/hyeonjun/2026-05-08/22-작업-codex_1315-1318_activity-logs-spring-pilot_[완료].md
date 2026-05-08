# 22차 작업 — activity-logs spring pilot

- 시작: 13:15
- 종료: 13:18
- 상태: 완료

## 목표
- member activity-logs route의 direct Next backend logic을 Spring read/create API로 이관한다.

## 진행
- `activity-logs`와 `student-board`를 비교했고, 더 작은 lane으로 `activity-logs`를 선택했다.
- backlog / API contract / package plan / skeleton file plan을 먼저 고정했다.
- Spring `activity_logs` package를 추가했다.
  - controller / dto / repository / service / tests
- Next route를 Spring thin BFF로 전환했다.
  - `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/route.ts`
  - `apps/web/src/server/activity-logs-spring-client.ts`
  - `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/__tests__/route.test.ts`
- `activity-logs-service.ts`는 다른 도메인 재사용 가능성을 고려해 이번 차수에서는 제거하지 않았다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.activity_logs.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- activity-logs route layer 기준 direct `activity-logs-service` import 없음
- activity-logs route layer 기준 direct `getDb()` / `requireSpaceInternalIdByPublicId` / `getMemberByIdForUser` 없음
