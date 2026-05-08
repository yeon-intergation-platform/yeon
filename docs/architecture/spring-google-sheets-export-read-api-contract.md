# Spring Google Sheets Export Read API Contract

## 범위
### Spring internal contract
- `GET /spaces/{spaceId}/sheet-export/rows`

### Next consumer
- `buildSpaceExportData(spaceId, userId)`
- 이후 CSV/XLSX route, `exportSpaceToSheet(...)`가 이 결과를 사용한다.

## Header 규칙
필수 header:
- `X-Yeon-User-Id`
- `X-Yeon-Internal-Token`

## Success response
HTTP 200

```json
{
  "fieldDefinitions": [
    {
      "id": "mfd_status",
      "name": "상태",
      "fieldType": "select"
    }
  ],
  "rows": [
    {
      "memberId": "mem_123",
      "values": ["홍길동", "", "", "수강중", "", "2026-05-08", "in_progress"],
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
  ]
}
```

## Error response
```json
{
  "code": "SPACE_NOT_FOUND",
  "message": "스페이스를 찾지 못했습니다."
}
```

## 1차 에러 코드
- `SPACE_NOT_FOUND`
- `INVALID_REQUEST`

## Next translation 규칙
- Next는 auth/BFF 유지
- Spring 응답을 그대로 받아 header row + exportedAt column만 덧붙인다.
- 이 단계가 끝나면 `google-sheets-export-service.ts`의 direct `buildSpaceExportRows` DB logic을 제거한다.
