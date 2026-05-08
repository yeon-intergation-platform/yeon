# google-sheets snapshot spring pilot

- 작업 목표: `google-sheets-export-service.ts`의 snapshot read/write 직접 DB 접근을 Spring internal API로 이동한다.
- 작업 범위: snapshot read API + replace API + Next cutover + 검증.
- 비목표: import conflict engine 전체 이전, Google OAuth/token transport 이전.

## 이번에 한 일
- backlog/architecture SSOT 추가
  - `docs/product/backlog/spring-google-sheets-snapshot-pilot.md`
  - `docs/architecture/spring-google-sheets-snapshot-package-plan.md`
  - `docs/architecture/spring-google-sheets-snapshot-api-contract.md`
  - `docs/architecture/spring-google-sheets-snapshot-skeleton-file-plan.md`
  - `docs/architecture/README.md`
- backend snapshot lane 구현
  - `apps/backend/src/main/java/world/yeon/backend/sheet_export/snapshot/*`
  - `apps/backend/src/test/java/world/yeon/backend/sheet_export/snapshot/*`
- web cutover
  - `apps/web/src/server/sheet-export-spring-client.ts`
  - `apps/web/src/server/services/google-sheets-export-service.ts`
  - `apps/web/src/server/services/__tests__/google-sheets-export-service.test.ts`

## 핵심 결과
- Spring internal API 추가 완료
  - `GET /spaces/{spaceId}/sheet-export/snapshots?sheetId=...`
  - `PUT /spaces/{spaceId}/sheet-export/snapshots`
- `google-sheets-export-service.ts`의 snapshot direct DB read/write 제거 완료
- export 후 snapshot replace는 Spring mutation으로 이동
- import 전 snapshot row 조회는 Spring read로 이동
- Google OAuth/token transport와 import conflict 계산은 여전히 Next에 유지

## 검증
- backend tests
  - `./gradlew test --tests 'world.yeon.backend.sheet_export.snapshot.*'` ✅
- web tests
  - `pnpm --filter @yeon/web exec vitest run 'src/server/services/__tests__/google-sheets-export-service.test.ts'` ✅
- web type/build
  - `pnpm --filter @yeon/web typecheck` ✅
  - `pnpm --filter @yeon/web build` ✅
- direct 제거 확인
  - `rg -n "sheetIntegrationMemberSnapshots|replaceMemberSnapshots\(|\.from\(sheetIntegrationMemberSnapshots\)" apps/web/src/server/services/google-sheets-export-service.ts` → no matches ✅
  - `fetchSheetExportSnapshotsFromSpring / replaceSheetExportSnapshotsInSpring` 호출만 남음 ✅
- SSOT
  - `git diff --check` ✅
  - `bash bin/sync-skills.sh --check` ✅
  - `bash bin/verify-ssot.sh --project-only` ✅

## 다음 작업 추천
1. import coordinator의 current payload / conflict engine inventory 분리
2. both-sides-changed / deleted_on_server / deleted_in_sheet 판단 helper Spring 이동
3. 마지막에 Google API transport / OAuth bridge를 검토
