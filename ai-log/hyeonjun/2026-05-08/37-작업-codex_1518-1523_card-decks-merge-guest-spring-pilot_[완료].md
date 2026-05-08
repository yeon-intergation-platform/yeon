# 37차 작업 — card-decks merge-guest spring pilot

- 시작: 15:18
- 종료: 15:23
- 상태: 완료

## 목표
- `/api/v1/card-decks/merge-guest`의 direct Next backend logic을 제거하고 Spring으로 이관한다.

## 작업내용
- Spring `card_decks.merge_guest` package를 추가했다.
  - controller / dto / repository / service / tests
- Next route를 Spring thin BFF로 전환했다.
- dead legacy file `merge-guest-card-decks-service.ts`를 삭제했다.
- route test를 추가했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.card_decks.merge_guest.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/card-decks/merge-guest/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/card-decks/merge-guest/route.ts` 기준
  - `mergeGuestCardDecks(`
  - `merge-guest-card-decks-service`
  - no matches ✅

## 남은 것
- repo-wide Next backend full migration 목표는 계속 미완료다.
- 다음 smallest lane은 `typing-decks` 또는 `public-check-location-search-service` 재고정이 필요하다.
