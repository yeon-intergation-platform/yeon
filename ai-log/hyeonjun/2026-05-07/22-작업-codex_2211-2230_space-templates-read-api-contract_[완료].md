# space-templates read api contract

- 작업 목표: 첫 파일럿 read-only의 Next BFF ↔ Spring 내부 계약 문서화
- 작업 범위: endpoint, header, request/response shape, error shape, translation 규칙
- 기준: 코드 수정 없이 docs/ai-log만 추가
- 비목표: 실제 controller 구현, OpenAPI 전체 작성, auth migration

## 결정

- outward contract는 Next가 계속 유지
  - `GET /api/v1/space-templates`
  - `GET /api/v1/space-templates/{templateId}`
- internal contract는 Spring이 제공
  - `GET /space-templates`
  - `GET /space-templates/{templateId}`
- trusted header 초안:
  - `X-Yeon-User-Id`
- outward shape는 기존과 동일 유지
