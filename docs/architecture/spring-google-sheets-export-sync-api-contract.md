# Spring Google Sheets Export Sync API Contract

## Endpoint
- `POST /spaces/{spaceId}/sheet-export/sync`

## Request
```json
{
  "sheetId": "sheet-1",
  "exportedAt": "2026-05-08T05:40:00Z",
  "rows": [
    {
      "memberId": "mem_1",
      "payload": {
        "core": {
          "name": "홍길동",
          "email": "hong@example.com",
          "phone": null,
          "status": "active",
          "initialRiskLevel": null
        },
        "customFields": {
          "메모": "값"
        }
      }
    }
  ]
}
```

## Response
```json
{
  "exportedCount": 1,
  "lastSyncedAt": "2026-05-08T05:40:00Z"
}
```

## Error shape
```json
{
  "code": "SHEET_INTEGRATION_NOT_FOUND",
  "message": "연동된 익스포트 시트를 찾지 못했습니다."
}
```

## Notes
- request rows는 Google write에 성공한 canonical export rows 그대로 보낸다.
- Spring은 snapshot replace와 `sheet_integrations.last_synced_at` 갱신을 함께 처리한다.
