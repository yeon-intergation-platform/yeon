# spring member-fields write api contract

## outward contract 유지

- `POST /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
- `PATCH /api/v1/spaces/{spaceId}/member-fields/{fieldId}`
- `DELETE /api/v1/spaces/{spaceId}/member-fields/{fieldId}`

## Spring internal contract

### create
- `POST /spaces/{spaceId}/member-tabs/{tabId}/fields`

### update
- `PATCH /spaces/{spaceId}/member-fields/{fieldId}`

### delete
- `DELETE /spaces/{spaceId}/member-fields/{fieldId}`

## required headers

- `X-Yeon-User-Id`
- `X-Yeon-Internal-Token`

## response

### create/update
```json
{ "field": { "...": "..." } }
```

### delete
- `204 No Content`

## error shape

```json
{
  "code": "FIELD_NOT_FOUND",
  "message": "필드를 찾지 못했습니다."
}
```

## expected error codes

- `SPACE_NOT_FOUND`
- `TAB_NOT_FOUND`
- `FIELD_NOT_FOUND`
- `FIELD_PROTECTED`
- `INVALID_REQUEST`

## Next translation

- Next는 zod validation과 auth를 유지
- Spring top-level `{ code, message }`를 `jsonError`로 번역
