# google-sheets import-evaluation spring pilot

- 작업 목표: `google-sheets-export-service.ts`에 남은 import conflict engine을 Spring internal API로 이동한다.
- 작업 범위: import evaluation API + Next cutover + 검증.
- 비목표: mutation orchestration 전체 이전, Google OAuth/token transport 이전.

## 이번에 한 일
- backlog/architecture SSOT 추가
  - `docs/product/backlog/spring-google-sheets-import-evaluation-pilot.md`
  - `docs/architecture/spring-google-sheets-import-evaluation-package-plan.md`
  - `docs/architecture/spring-google-sheets-import-evaluation-api-contract.md`
  - `docs/architecture/spring-google-sheets-import-evaluation-skeleton-file-plan.md`
- backend import-evaluation lane 구현
  - `apps/backend/src/main/java/world/yeon/backend/sheet_export/import_evaluation/*`
  - `apps/backend/src/test/java/world/yeon/backend/sheet_export/import_evaluation/*`
- web cutover
  - `apps/web/src/server/sheet-export-spring-client.ts`
  - `apps/web/src/server/services/google-sheets-export-service.ts`

## 핵심 결과
- Spring internal API 추가 완료
  - `POST /spaces/{spaceId}/sheet-export/import-evaluation`
- `google-sheets-export-service.ts`의 import conflict evaluation / planned create-update 계산 Spring 이동 완료
- Next import path는 이제
  - sheet read
  - Spring evaluation 호출
  - planned mutation 실행
  - re-export
  수준으로 축소됨
- dead helper 제거 완료
  - `buildCanonicalPayload`
  - `diffPayloadFields`
  - `buildConflict`
  - unused import-context/snapshot client helper

## 검증
- backend tests
  - `./gradlew test --tests 'world.yeon.backend.sheet_export.import_evaluation.*'` ✅
- web type/build
  - `pnpm --filter @yeon/web typecheck` ✅
  - `pnpm --filter @yeon/web build` ✅
- direct/helper 제거 확인
  - `rg -n "buildCanonicalPayload|diffPayloadFields|buildConflict|fetchSheetExportImportContextFromSpring|fetchSheetExportSnapshotsFromSpring|evaluateSheetExportImportInSpring" apps/web/src/server/services/google-sheets-export-service.ts apps/web/src/server/sheet-export-spring-client.ts` → evaluation helper만 남음 ✅
- SSOT
  - `git diff --check` ✅
  - `bash bin/sync-skills.sh --check` ✅
  - `bash bin/verify-ssot.sh --project-only` ✅

## 다음 작업 추천
1. planned create/update mutation orchestration 자체를 Spring write API로 이동
2. Next import path에서 `createMember/updateMember/bulkUpsertMemberFieldValuesInSpring` direct orchestration 제거
3. 마지막에 Google API transport / OAuth bridge 검토
