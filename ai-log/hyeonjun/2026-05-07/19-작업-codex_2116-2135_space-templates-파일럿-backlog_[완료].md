# space-templates 파일럿 backlog

- 작업 목표: Spring 첫 실제 파일럿 도메인을 문서로 고정
- 작업 범위: 후보 비교, 선택 근거, 차수별 작은 이전 계획
- 기준: 코드 수정 없이 backlog/ai-log만 추가
- 비목표: 실제 controller/service 구현, route cutover, DB schema 수정

## 결정

- 첫 파일럿 도메인: `space-templates`
- 첫 구현 범위: `GET /api/v1/space-templates`, `GET /api/v1/space-templates/{templateId}`
- 제외:
  - duplicate
  - apply-template
  - snapshot-template
  - counseling/public-check/auth
