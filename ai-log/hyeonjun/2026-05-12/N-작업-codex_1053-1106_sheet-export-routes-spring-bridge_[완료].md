# sheet export routes Spring bridge cutover 작업 로그

- 목표: sheet/export 관련 route의 `google-sheets-export-service` 직접 import를 제거하고 Spring 실행 BFF helper로 전환한다.
- 범위: CSV/XLSX export, sheet-export sync/import route, helper/test.

## 결과

- `apps/web/src/server/sheet-export-bff.ts`를 추가해 Spring sheet-export rows/export-run/import-run 호출과 Google access token bridge를 분리했다.
- CSV/XLSX export route가 `sheet-export-bff`를 통해 Spring rows 응답을 파일 포맷으로 변환하게 했다.
- sheet-export sync/import route가 `sheet-export-bff`를 통해 Spring run endpoint를 호출하게 했다.
- 기존 `google-sheets-export-service`는 호환 re-export로 축소했다.
- route-level `google-sheets-export-service` import 4개를 제거했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/spaces/[spaceId]/sheet-export/import/__tests__/route.test.ts src/app/api/v1/spaces/[spaceId]/sheet-export/sync/__tests__/route.test.ts src/server/services/__tests__/google-sheets-export-service.test.ts`
- `./gradlew test --tests world.yeon.backend.sheet_export.read.controller.SheetExportReadControllerTests --tests world.yeon.backend.sheet_export.export_run.controller.SheetExportRunControllerTests --tests world.yeon.backend.sheet_export.import_run.controller.SheetExportImportRunControllerTests`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
