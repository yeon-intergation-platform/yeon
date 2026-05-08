# spring member-fields overview bootstrap api contract

## outward contract

- Next outward API는 새 route를 만들지 않는다.
- 계속:
  - `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
- 내부적으로만 overview bootstrap Spring endpoint를 호출한다.

## Spring internal contract

### endpoint
- `POST /spaces/{spaceId}/member-tabs/{tabId}/bootstrap-overview-fields`

### required headers
- `X-Yeon-User-Id`
- `X-Yeon-Internal-Token`

### request body
- 없음

### success response
```json
{ "ok": true }
```

### error shape
```json
{
  "code": "OVERVIEW_TAB_ONLY",
  "message": "개요 탭에서만 기본 필드 초기화를 수행할 수 있습니다."
}
```

## recommended error codes

- `SPACE_NOT_FOUND`
- `TAB_NOT_FOUND`
- `TAB_SPACE_MISMATCH`
- `OVERVIEW_TAB_ONLY`

## Next translation rule

- overview 탭이 아니면 bootstrap 호출 자체를 생략하는 것이 기본
- 다만 route drift 방지 차원에서 Spring은 `OVERVIEW_TAB_ONLY`를 유지
- Next는 bootstrap endpoint 성공 후에만
  - `fetchMemberFieldsFromSpring(...)`
  - 필요 시 `fetchMemberFieldValuesFromSpring(...)`
  를 호출한다
