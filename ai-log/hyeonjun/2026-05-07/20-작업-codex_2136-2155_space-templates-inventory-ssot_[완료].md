# space-templates inventory ssot

- 작업 목표: 첫 파일럿 도메인의 현재 Next 구현 경계를 inventory 문서로 고정
- 작업 범위: route, service export, DB 테이블, 응답 shape, 1차 cutover 범위
- 기준: 코드 수정 없이 docs/ai-log만 추가
- 비목표: Spring controller/repository 구현, Next route cutover, DB schema 변경

## 결정

- 1차 파일럿은 read-only 유지
- 포함 API:
  - `GET /api/v1/space-templates`
  - `GET /api/v1/space-templates/{templateId}`
- source of truth 이전 단위:
  - `space_templates` 테이블 read
  - summary/detail DTO
- 제외 단위:
  - apply/snapshot/duplicate/write 전부
