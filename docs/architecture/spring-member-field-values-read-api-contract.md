# Spring Member Field Values Read API Contract

## 문서 목적
- `member-field-values` read 1차 파일럿의 Spring 내부 계약과 Next 조합 계약을 고정한다.

## 범위
### Spring internal contract 신설
- `GET /spaces/{spaceId}/member-tabs/{tabId}/field-values?memberId=...`

### Next outward contract 유지
- `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields?memberId=...`
- Next는 기존처럼 `{ fields, values }`를 유지하고, 내부적으로 fields read + values read를 조합한다.

## Header 규칙
필수 header:
- `X-Yeon-User-Id`
- `X-Yeon-Internal-Token`

## Request
### path params
- `spaceId: string`
- `tabId: string`

### query params
- `memberId: string` (required)

## Success response (Spring internal)
HTTP 200

```json
{
  "values": [
    {
      "fieldDefinitionId": "mfd_123",
      "valueText": null,
      "valueNumber": null,
      "valueBoolean": null,
      "valueJson": ["in_progress"]
    }
  ]
}
```

## Value item shape
- `fieldDefinitionId: string`
- `valueText: string | null`
- `valueNumber: string | null`
- `valueBoolean: boolean | null`
- `valueJson: unknown`

## Error response
Top-level shape:

```json
{
  "code": "MEMBER_NOT_FOUND",
  "message": "수강생을 찾지 못했습니다."
}
```

### 1차 에러 코드 초안
- `SPACE_NOT_FOUND`
- `TAB_NOT_FOUND`
- `TAB_SPACE_MISMATCH`
- `MEMBER_NOT_FOUND`
- `INVALID_REQUEST`

## Next BFF translation 규칙
- Next는 session/auth를 유지
- Next는
  - `fields` Spring read
  - `field-values` Spring read
  두 결과를 합쳐 기존 outward shape를 유지
- 이 단계가 끝나면 `memberId` branch에서
  - `getFieldValuesForDefinitions(...)`
  direct 호출을 제거할 수 있다.

## 비목표
- overview lazy backfill 이식
- field value write/upsert
- fields GET 전체 경로를 한 번에 재설계
