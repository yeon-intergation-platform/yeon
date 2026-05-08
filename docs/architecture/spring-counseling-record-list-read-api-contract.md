# spring-counseling-record-list-read api contract

- `GET /counseling-records`
- headers:
  - `X-Yeon-User-Id`
- query:
  - `spaceId?: string`
  - `unlinked?: boolean`
  - `limit?: int`
  - `before?: ISO datetime`
- response:
  - `ListCounselingRecordsResponse` shape 유지
- precedence:
  - `spaceId`가 있으면 `unlinked`보다 우선
- 제외 규칙:
  - demo placeholder record는 응답에서 제외
