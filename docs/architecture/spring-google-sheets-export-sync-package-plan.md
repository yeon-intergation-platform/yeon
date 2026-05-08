# Spring Google Sheets Export Sync Package Plan

- package
  - `world.yeon.backend.sheet_export.sync`
- controller
  - `POST /spaces/{spaceId}/sheet-export/sync`
- service
  - linked export integration 확인
  - `last_synced_at` / `updated_at` 갱신
  - snapshot replace 재사용
  - 단일 transactional finalize
- repository reuse
  - `sheet_export.snapshot.SheetExportSnapshotRepository`

## Next에 남는 책임
- Google access token 획득
- Google Sheets clear/write/read transport
- export rows read 호출
- import evaluation/mutation 호출
