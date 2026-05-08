# Spring Members CRUD API Contract

- `GET /spaces/{spaceId}/members`
- `POST /spaces/{spaceId}/members`
- `GET /spaces/{spaceId}/members/{memberId}`
- `PATCH /spaces/{spaceId}/members/{memberId}`
- `DELETE /spaces/{spaceId}/members/{memberId}`
- `POST /spaces/{spaceId}/members/bulk-delete`

응답 shape는 현행 Next route 계약을 최대한 유지한다.
