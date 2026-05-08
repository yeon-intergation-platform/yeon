# Spring Member Fields Reorder API Contract

## outward contract 유지
- `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`

## Spring internal contract
- `PATCH /spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`

## required headers
- `X-Yeon-User-Id`
- `X-Yeon-Internal-Token`

## request body
```json
{ "order": ["mfd_a", "mfd_b"] }
```

## success shape
```json
{ "ok": true }
```

## error shape
```json
{ "code": "SPACE_NOT_FOUND", "message": "스페이스를 찾지 못했습니다." }
```
