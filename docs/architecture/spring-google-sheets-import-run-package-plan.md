# Spring Google Sheets Import Run Package Plan

- package
  - `world.yeon.backend.sheet_export.import_run`
- controller
  - `POST /spaces/{spaceId}/sheet-export/import-run`
- service
  - Google sheet read
  - import evaluation 호출
  - blocked/applied branching
  - planned mutation apply
  - export-run 호출
- dependencies
  - `SheetExportImportEvaluationService`
  - `SheetExportImportMutationService`
  - `SheetExportRunService`

## Next에 남는 책임
- Google access token 획득
- Spring import-run 호출
