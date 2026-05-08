# Spring Google Sheets Import Evaluation API Contract

## Endpoint
- `POST /spaces/{spaceId}/sheet-export/import-evaluation`
- headers:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- body:
  - `sheetId: string`
  - `rows: string[][]`

## Success
- blocked:
  - `status: "blocked"`
  - `summary`
  - `conflicts`
  - `lastSyncedAt`
- applied-plan:
  - `status: "applied"`
  - `summary`
  - `conflicts: []`
  - `lastSyncedAt`
  - `plannedCreates`
  - `plannedUpdates`

## Notes
- Spring은 이번 차수에서 DB mutation을 수행하지 않는다.
- `plannedCreates/Updates`는 Next가 그대로 실행 가능한 payload/customValues shape를 반환한다.
