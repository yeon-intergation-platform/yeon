# Spring Google Sheets Export Read Skeleton File Plan

## 차수 A
- `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/dto/SheetExportFieldDefinitionResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/dto/SheetExportPayloadCoreResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/dto/SheetExportPayloadResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/dto/SheetExportRowResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/dto/SheetExportRowsResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/repository/SheetExportReadRepository.java`
- `apps/backend/src/test/java/world/yeon/backend/sheet_export/read/repository/SheetExportReadRepositoryTests.java`

## 차수 B
- `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/service/SheetExportReadService.java`
- `apps/backend/src/test/java/world/yeon/backend/sheet_export/read/service/SheetExportReadServiceTests.java`

## 차수 C
- `apps/backend/src/main/java/world/yeon/backend/sheet_export/read/controller/SheetExportReadController.java`
- `apps/backend/src/test/java/world/yeon/backend/sheet_export/read/controller/SheetExportReadControllerTests.java`

## 차수 D
- `apps/web/src/server/sheet-export-spring-client.ts`
- `apps/web/src/server/services/google-sheets-export-service.ts`
- `apps/web/src/server/services/__tests__/google-sheets-export-service.test.ts`
- `apps/web/src/app/api/v1/spaces/[spaceId]/export/csv/route.ts`
- `apps/web/src/app/api/v1/spaces/[spaceId]/export/xlsx/route.ts`

## 금지
- Google API clear/write transport 이전 금지
- import conflict engine 이전 금지
- snapshot replace 이전 금지
