# Spring Google Sheets Export Run API Contract

## Endpoint
- `POST /spaces/{spaceId}/sheet-export/export-run`

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
  "exportedCount": 12,
  "lastSyncedAt": "2026-05-08T06:00:00Z"
}
```

## Error shape
```json
{
  "code": "GOOGLE_SHEETS_API_ERROR",
  "message": "구글 시트 쓰기에 실패했습니다: ..."
}
```
