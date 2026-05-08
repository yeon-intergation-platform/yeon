# google-sheets integration spring boundary

- 작업 목표: `google-sheets-export-service.ts` 전체에서 남아 있는 Next 서버 오케스트레이션/DB ownership을 inventory하고, 가장 작은 다음 Spring extraction lane을 실제 cutover까지 진행한다.
- 작업 범위: export row builder read lane 문서화 → backend read API 구현 → Next `buildSpaceExportData(...)` Spring cutover → 검증.
- 기준: Next는 BFF/Google transport/coordinator만 남기고, export row source of truth는 Spring read API로 이동한다.
- 비목표: 이번 턴에 import conflict engine / snapshot replace / Google API transport를 Spring으로 옮기지 않는다.

## 이번에 한 일
- 문서/설계
  - `docs/product/backlog/spring-google-sheets-integration-boundary.md`
  - `docs/architecture/spring-google-sheets-integration-boundary-inventory.md`
  - `docs/architecture/spring-google-sheets-export-read-package-plan.md`
  - `docs/architecture/spring-google-sheets-export-read-api-contract.md`
  - `docs/architecture/spring-google-sheets-export-read-skeleton-file-plan.md`
- backend read lane 구현
  - `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/controller/SheetExportReadController.java`
  - `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/service/SheetExportReadService.java`
  - `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/repository/SheetExportReadRepository.java`
  - `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/dto/*`
  - `apps/backend/src/test/java/world/yeon/backend/sheet_export/read/*`
- Next cutover
  - `apps/web/src/server/sheet-export-spring-client.ts` 추가
  - `apps/web/src/server/services/google-sheets-export-service.ts`에서 `buildSpaceExportData(...)`가 Spring 응답만 포맷하도록 변경
  - `apps/web/src/server/services/__tests__/google-sheets-export-service.test.ts` 갱신

## 핵심 결과
- `GET /spaces/{spaceId}/sheet-export/rows` Spring internal read API 추가 완료
- `google-sheets-export-service.ts`의 export row builder direct DB read 제거 완료
- Next는 이제 export용 header row / exportedAt 컬럼 덧붙이는 thin formatter만 유지
- 이번 차수에서 남은 direct DB read는 import coordinator / snapshot / integration lookup 영역뿐이고, export row source of truth는 Spring으로 이동 완료

## 검증
- backend tests
  - `./gradlew test --tests 'world.yeon.backend.sheet_export.read.*'` ✅
- web tests
  - `pnpm --filter @yeon/web exec vitest run 'src/server/services/__tests__/google-sheets-export-service.test.ts'` ✅
- web type/build
  - `pnpm --filter @yeon/web typecheck` ✅
  - `pnpm --filter @yeon/web build` ✅
- direct 제거 확인
  - `rg -n "buildSpaceExportRows\(" apps/web/src/server/services/google-sheets-export-service.ts` → no matches ✅
  - `buildSpaceExportData(...)`는 `fetchSheetExportRowsFromSpring(...)`만 호출 ✅
- SSOT
  - `git diff --check` ✅
  - `bash bin/sync-skills.sh --check` ✅
  - `bash bin/verify-ssot.sh --project-only` ✅

## 다음 작업 추천
1. snapshot persistence read/write 경계 inventory
2. import coordinator에서 members/definitions/current payload snapshot 구성의 Spring 이동 후보 분리
3. Google API transport / OAuth bridge는 마지막 단계로 유지
