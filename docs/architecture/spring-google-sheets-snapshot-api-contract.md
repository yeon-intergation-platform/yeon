# Spring Google Sheets Snapshot API Contract

## Read
- `GET /spaces/{spaceId}/sheet-export/snapshots?sheetId={sheetId}`
- headers:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- success:
  - `lastSyncedAt: string | null`
  - `snapshots: [{ memberId, basePayload, basePayloadHash, exportedAt }]`

## Replace
- `PUT /spaces/{spaceId}/sheet-export/snapshots`
- headers:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- body:
  - `sheetId: string`
  - `exportedAt: string`
  - `rows: [{ memberId, payload }]`
- success:
  - `replacedCount: number`

## Error
- top-level `{ code, message }`
- 1차 not found 대상:
  - `SPACE_NOT_FOUND`
  - `SHEET_INTEGRATION_NOT_FOUND`
