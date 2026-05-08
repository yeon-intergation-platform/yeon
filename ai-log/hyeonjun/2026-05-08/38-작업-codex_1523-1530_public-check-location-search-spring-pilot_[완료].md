# 38차 작업 — public-check-location-search spring pilot

- 시작: 15:23
- 종료: 15:30
- 상태: 완료

## 목표
- `/api/v1/spaces/[spaceId]/public-check-locations`의 direct Next backend logic을 제거하고 Spring으로 이관한다.

## 작업내용
- Spring `public_check_locations` package를 추가했다.
  - controller / dto / repository / service / gateway / tests
- owned-space check와 Kakao local search를 Spring으로 이동했다.
- Next route를 Spring thin BFF로 전환했다.
- dead legacy file `public-check-location-search-service.ts`와 관련 test를 삭제했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.public_check_locations.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/public-check-locations/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/spaces/[spaceId]/public-check-locations/route.ts` 기준
  - `searchPublicCheckLocations`
  - `requireOwnedSpaceInSpring`
  - `SpaceAccessSpringBackendHttpError`
  - no matches ✅

## 남은 것
- repo-wide Next backend full migration 목표는 계속 미완료다.
- 다음 smallest lane은 `member-risk-service` 또는 `typing-decks` 재고정이 필요하다.
