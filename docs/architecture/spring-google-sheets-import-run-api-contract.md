# Spring Google Sheets Import Run API Contract

## Endpoint
- `POST /spaces/{spaceId}/sheet-export/import-run`

## Request
```json
{
  "sheetId": "sheet-1",
  "accessToken": "ya29..."
}
```

## Response
```json
{
  "status": "blocked",
  "summary": { "created": 0, "updated": 0, "unchanged": 0, "skipped": 0, "conflicts": 1 },
  "conflicts": [],
  "lastSyncedAt": "2026-05-08T06:30:00Z"
}
```
또는
```json
{
  "status": "applied",
  "summary": { "created": 1, "updated": 2, "unchanged": 0, "skipped": 0, "conflicts": 0 },
  "conflicts": [],
  "lastSyncedAt": "2026-05-08T06:31:00Z"
}
```
