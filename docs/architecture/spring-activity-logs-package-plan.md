# spring activity-logs package plan

- package: `world.yeon.backend.activity_logs`
- subpackages
  - `controller`
  - `dto`
  - `repository`
  - `service`

## responsibilities
- repository
  - owned member + owned space 검증용 row 조회
  - activity_logs list/count
  - memo insert
- service
  - limit 검증
  - 메모 텍스트 normalize
  - default authorLabel 처리
- controller
  - GET/POST endpoint
  - 400/404/error translation
