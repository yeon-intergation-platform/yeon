# 28차 작업 — public-check runtime spring pilot

- 시작: 13:54
- 종료: 14:04
- 상태: 완료

## 목표
- 공개 체크인 runtime flow를 Spring으로 이동하고 Next route를 thin BFF로 전환한다.

## 작업내용
- backend `public_check_runtime` package를 추가했다.
- `GET /public-check-sessions/{token}` / `POST verify` / `POST submit` runtime flow를 Spring으로 이동했다.
- Next route는 remembered identity cookie read/write만 담당하도록 thin BFF로 전환했다.
- remembered identity는 `spaceId:memberId` pair 전체를 Spring에 전달하고, Spring이 현재 session space 기준으로 선택하게 만들어 다중 space cookie 오매칭을 방지했다.
- 추가로 `space_access` package와 `GET /spaces/{spaceId}/ownership-check` endpoint를 넣고, `public-check-locations` route의 direct `assertSpaceOwnedByUser` 의존도 제거했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.public_check_runtime.*' --tests 'world.yeon.backend.space_access.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/public-check-sessions/[token]/__tests__/route.test.ts' 'src/app/api/v1/public-check-sessions/[token]/verify/__tests__/route.test.ts' 'src/app/api/v1/public-check-sessions/[token]/submit/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/public-check-locations/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/public-check-sessions/**` 기준 `public-check-service|persistMemberBoardSnapshot|assertSpaceOwnedByUser` no matches ✅
- `apps/web/src/app/api/v1/spaces/[spaceId]/public-check-locations/**` 기준 `assertSpaceOwnedByUser` no matches ✅
