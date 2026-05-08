# Spring Google Sheets Import Mutation API Contract

## Endpoint
- `POST /spaces/{spaceId}/sheet-export/import-mutation`

## Request
```json
{
  "sheetId": "sheet-1",
  "plannedCreates": [
    {
      "memberPublicId": null,
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
      },
      "customValues": [
        {
          "fieldDefinitionId": "mfd_status",
          "value": "in_progress"
        }
      ]
    }
  ],
  "plannedUpdates": []
}
```

## Response
```json
{
  "createdCount": 1,
  "updatedCount": 0
}
```

## Error shape
```json
{
  "code": "SHEET_INTEGRATION_NOT_FOUND",
  "message": "연동된 익스포트 시트를 찾지 못했습니다."
}
```

## Behavior notes
- request의 `sheetId`는 linked export integration 존재 확인에 사용한다.
- update mutation에서 `payload.core.status = null`은 기존 Next 동작과 동일하게 **status 미변경**으로 해석한다.
- create mutation에서 `payload.core.status = null`이면 DB 기본값 `active`를 사용한다.
