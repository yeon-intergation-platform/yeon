# Spring Google Sheets Import Context API Contract

## Endpoint
- `GET /spaces/{spaceId}/sheet-export/import-context?sheetId={sheetId}`
- headers:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`

## Success
```json
{
  "lastSyncedAt": "2026-05-08T00:00:00Z",
  "fieldDefinitions": [
    { "id": "mfd_status", "name": "상태", "fieldType": "select" }
  ],
  "members": [
    {
      "memberId": "mem_1",
      "name": "홍길동",
      "email": null,
      "phone": null,
      "status": "active",
      "initialRiskLevel": null,
      "payload": {
        "core": {
          "name": "홍길동",
          "email": null,
          "phone": null,
          "status": "active",
          "initialRiskLevel": null
        },
        "customFields": {
          "상태": "in_progress"
        }
      }
    }
  ],
  "snapshots": [
    {
      "memberId": "mem_1",
      "basePayload": {
        "core": {
          "name": "홍길동",
          "email": null,
          "phone": null,
          "status": "active",
          "initialRiskLevel": null
        },
        "customFields": {
          "상태": "in_progress"
        }
      },
      "basePayloadHash": "...",
      "exportedAt": "2026-05-08T00:00:00Z"
    }
  ]
}
```

## Error
- top-level `{ code, message }`
- 1차 not found 대상:
  - `SHEET_INTEGRATION_NOT_FOUND`
