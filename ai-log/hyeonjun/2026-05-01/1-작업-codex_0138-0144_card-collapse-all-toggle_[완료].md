# 카드 전체 접기/열기 토글 작업

- 시작: 2026-05-01 01:38 KST
- 예상 종료: 0208
- 상태: 완료
- 요청: 카드에 전체 접기/열기 토글 추가

## 진행
- 초기 상태 확인 및 관련 카드 UI 탐색 시작.
- 카드 목록 헤더에 전체 접기/전체 열기 토글 상태를 추가.
- CardRow에 isCollapsed prop을 추가해 질문/답변 Markdown 영역 높이를 제한하는 방식으로 전체 접기 동작 구현.
- web typecheck 중 기존 카드 SRS/사용자 스키마 변경에서 발생한 타입 오류를 발견해 import 타입/값 분리와 auth test fixture 필드를 보정.
- DB drift 검증이 기존 schema 변경의 meta 누락으로 실패해 drizzle generate로 0034 snapshot/journal을 생성하고, 운영 idempotent 원칙에 맞춰 migration SQL은 IF EXISTS/IF NOT EXISTS 형태로 유지.
- 검증: web lint/typecheck/build, auth-user 단위 테스트, root lint/typecheck, db drift 확인.

## 완료
- 실제 종료: 2026-05-01 01:44 KST
- 상태: 완료
- 최종 재검증: 카드 전체 접기/열기 변경을 다시 staging한 뒤 web lint/typecheck/build를 통과.
