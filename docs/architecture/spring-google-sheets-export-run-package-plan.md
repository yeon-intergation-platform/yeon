# Spring Google Sheets Export Run Package Plan

- package
  - `world.yeon.backend.sheet_export.export_run`
- controller
  - `POST /spaces/{spaceId}/sheet-export/export-run`
- service
  - export integration 존재 확인
  - export rows 조회
  - Google Sheets clear/write
  - sync finalize 호출
- dependencies
  - `SheetExportReadService`
  - `SheetExportSnapshotRepository` or `SheetExportSnapshotService`

## Next에 남는 책임
- Google access token 획득
- Spring export-run 호출
- import read transport는 아직 Next 유지
