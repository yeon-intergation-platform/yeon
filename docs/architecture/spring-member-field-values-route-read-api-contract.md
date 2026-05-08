# Spring Member Field Values Route Read API Contract

## 범위
### Spring internal contract
- `GET /spaces/{spaceId}/members/{memberId}/field-values`

### Next outward contract 유지
- `GET /api/v1/spaces/{spaceId}/members/{memberId}/field-values`

## Header 규칙
필수 header:
- `X-Yeon-User-Id`
- `X-Yeon-Internal-Token`

## Query
- `fieldDefinitionId: string` repeated optional

## Success response
HTTP 200

```json
{
  "values": [
    {
      "fieldDefinitionId": "mfd_status",
      "fieldType": "select",
      "fieldName": "상태",
      "valueText": null,
      "valueNumber": null,
      "valueBoolean": null,
      "valueJson": ["in_progress"]
    }
  ]
}
```

## Error response
```json
{
  "code": "MEMBER_NOT_FOUND",
  "message": "수강생을 찾지 못했습니다."
}
```

## 1차 에러 코드
- `SPACE_NOT_FOUND`
- `MEMBER_NOT_FOUND`
- `INVALID_REQUEST`

## Next translation 규칙
- Next는 auth/BFF 유지
- Spring 오류는 top-level `message`를 `jsonError`로 번역
- 이 단계가 끝나면 route GET에서 `getFieldValues/getFieldValuesForDefinitions` direct 호출을 제거한다.
