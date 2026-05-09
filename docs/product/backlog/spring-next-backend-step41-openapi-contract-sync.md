# 차수41 OpenAPI/스펙 동기화
- 생성일시: 2026-05-09T21:42:00+09:00
- 작업내용: Spring 컨트롤러 기준으로 OpenAPI 스펙을 갱신하고 Next 기반 클라이언트/테스트가 참조하는 계약과 차이를 정리한다.
- 논의 필요: 계약 재생성 빈도(도메인 단위 vs 주간 묶음) 운영 방식.
- 선택지:
  1. 도메인 단위 재생성
  2. 전환 완료 후 일괄 재생성
- 추천: 도메인 단위 재생성으로 회귀 지점을 조기에 포착
- 사용자 방향: 추천 기준 진행
- 확장 산출:
  - 대상 artifact: Spring Controller Annotation, api-contract DTO, API client
  - 정합성 항목: `path`, `method`, `request/response`, `error responses`, `401/403/404`
  - 차이 대응 원칙: 운영 영향이 적은 문서 변경은 즉시 반영, 응답 스키마 차이 확대는 라우트별 확인

