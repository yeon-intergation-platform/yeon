# Spring Member Field Values Write API Contract

## outward contract 유지
- `PATCH /api/v1/spaces/{spaceId}/members/{memberId}/field-values`

## Spring internal contract
- `PATCH /spaces/{spaceId}/members/{memberId}/field-values`

## required headers
- `X-Yeon-User-Id`
- `X-Yeon-Internal-Token`

## request body
```json
{
  "values": [
    { "fieldDefinitionId": "mfd_1", "value": "hello" }
  ]
}
```

## success shape
```json
{
  "ok": true,
  "values": [
    {
      "fieldDefinitionId": "mfd_1",
      "fieldType": "text",
      "fieldName": "메모",
      "valueText": "hello",
      "valueNumber": null,
      "valueBoolean": null,
      "valueJson": null
    }
  ]
}
```

## error shape
```json
{ "code": "FIELD_DEFINITION_NOT_FOUND", "message": "필드 정의를 찾지 못했습니다." }
```

## 1차 정책
- `null`/`undefined`는 clear semantics 유지
- number/select/multi_select/checkbox/text 등 fieldType별 컬럼 라우팅 유지
- write 후 read-back values 반환 유지
