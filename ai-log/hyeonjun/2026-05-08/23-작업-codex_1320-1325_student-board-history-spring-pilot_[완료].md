# 23차 작업 — student-board-history spring pilot

- 시작: 13:20
- 종료: 13:25
- 상태: 완료

## 목표
- member board-history route의 direct Next backend logic을 Spring read API로 이관한다.

## 진행
- `public-check-service`는 범위가 커서 보류했다.
- student-board에서도 가장 작은 lane으로 `members/[memberId]/board-history` read를 선택했다.
- backlog / API contract / package plan / skeleton file plan을 먼저 고정했다.
- Spring `student_board_history` package를 추가했다.
  - controller / dto / repository / service / tests
- Next route를 Spring thin BFF로 전환했다.
  - `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/board-history/route.ts`
  - `apps/web/src/server/student-board-history-spring-client.ts`
  - `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/board-history/__tests__/route.test.ts`
- 기존 `student-board-service.ts`는 다른 lane이 남아 있어서 유지했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.student_board_history.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/members/[memberId]/board-history/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- board-history route layer 기준 direct `student-board-service` import 없음
- board-history route layer 기준 direct `getDb()` / `assertSpaceOwnedByUser` / `listMemberStudentBoardHistory` 없음
