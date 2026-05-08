# 27차 작업 — student-board patch spring pilot

- 시작: 13:46
- 종료: 13:53
- 상태: 완료

## 목표
- `student-board/[memberId] PATCH` path를 Spring으로 이동하고 route layer direct backend logic를 제거한다.

## 작업내용
- backend `student_board_write` package를 추가했다.
- mutation 후 응답은 `student_board_read` service를 재사용해 full board shape를 유지하게 만들었다.
- `assignmentLink`의 미전송/명시적 null 차이를 유지하도록 presence-tracking request DTO를 적용했다.
- Next PATCH route를 Spring client 기반 thin BFF로 전환했다.
- web PATCH route test를 추가했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.student_board_write.*' --tests 'world.yeon.backend.student_board_read.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/student-board/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/student-board/[memberId]/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/spaces/[spaceId]/student-board/**` 기준 `student-board-service|upsertMemberBoardStatus|listSpaceStudentBoard` no matches ✅

## 다음
- `student-board` route layer thin BFF화는 GET/PATCH 기준 완료로 본다.
- 다음 smallest lane은 `public-check-locations` 또는 `student-board-service.ts` 잔존 helper consumer inventory 재실측이다.
