# 26차 작업 — student-board read spring pilot

- 시작: 13:39
- 종료: 13:46
- 상태: 완료

## 목표
- `student-board` GET read path를 Spring으로 이동하고 Next route를 thin BFF로 전환한다.

## 작업내용
- backlog/architecture 문서를 먼저 추가했다.
- backend `student_board_read` package를 추가했다.
- Next `student-board` GET route를 Spring thin BFF로 전환했다.
- route test를 GET/POST 모두 유지하도록 갱신했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.student_board_read.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/student-board/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/spaces/[spaceId]/student-board/route.ts` 기준 direct `student-board-service` import 제거 ✅
- `student-board/[memberId]/route.ts`에는 아직 PATCH용 `upsertMemberBoardStatus` import가 남아 있음

## 다음
- 다음 smallest lane은 `student-board/[memberId] PATCH` Spring cutover다.
