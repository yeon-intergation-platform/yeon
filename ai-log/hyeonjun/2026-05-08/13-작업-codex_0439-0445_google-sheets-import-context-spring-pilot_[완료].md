# google-sheets import-context spring pilot

- 작업 목표: `google-sheets-export-service.ts` import coordinator가 직접 조합하는 current payload / field definitions / snapshot read를 Spring internal API로 이동한다.
- 작업 범위: import context read API + Next cutover + 검증.
- 비목표: import conflict engine 전체 이전, Google OAuth/token transport 이전.

## 이번에 한 일
- backlog/architecture SSOT 추가
  - `docs/product/backlog/spring-google-sheets-import-context-pilot.md`
  - `docs/architecture/spring-google-sheets-import-context-package-plan.md`
  - `docs/architecture/spring-google-sheets-import-context-api-contract.md`
  - `docs/architecture/spring-google-sheets-import-context-skeleton-file-plan.md`
- backend import-context lane 구현
  - `apps/backend/src/main/java/world/yeon/backend/sheet_export/import_context/*`
  - `apps/backend/src/test/java/world/yeon/backend/sheet_export/import_context/*`
- web cutover
  - `apps/web/src/server/sheet-export-spring-client.ts`
  - `apps/web/src/server/services/google-sheets-export-service.ts`

## 핵심 결과
- Spring internal API 추가 완료
  - `GET /spaces/{spaceId}/sheet-export/import-context?sheetId=...`
- `google-sheets-export-service.ts` import path의 direct members/member_field_definitions/current payload 조합 제거 완료
- snapshot read는 import context 응답으로 일원화 완료
- import conflict 계산 / create-update orchestration / Google transport는 여전히 Next 유지

## 검증
- backend tests
  - `./gradlew test --tests 'world.yeon.backend.sheet_export.import_context.*'` ✅
- web type/build
  - `pnpm --filter @yeon/web typecheck` ✅
  - `pnpm --filter @yeon/web build` ✅
- direct 제거 확인
  - `rg -n "const existingMembers = await db|from\(members\)|from\(memberFieldDefinitions\)|fetchMemberFieldValuesFromSpring\(|fetchSheetExportSnapshotsFromSpring\(" apps/web/src/server/services/google-sheets-export-service.ts` → no matches ✅
- SSOT
  - `git diff --check` ✅
  - `bash bin/sync-skills.sh --check` ✅
  - `bash bin/verify-ssot.sh --project-only` ✅

## 다음 작업 추천
1. import conflict engine helper(`buildCanonicalPayload/diffPayloadFields/buildConflict`) Spring 이동
2. blocked/applied decision 자체를 Spring service로 이동
3. 마지막에 Google API transport / OAuth bridge 검토
