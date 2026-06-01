# 서비스 도움말 모달 스크롤바 정리 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: 도움말 모달 기본 스크롤바가 바깥 선처럼 보이는 문제를 단정한 내부 스크롤 디자인으로 수정한다.
- 범위: service-help-dialog, globals.css, docs/product/backlog, ai-log
- 원칙: 기존 상담 워크스페이스 스크롤바 스타일은 건드리지 않는다.

## 변경

- 도움말 모달의 스크롤을 외부 카드가 아니라 내부 콘텐츠 영역으로 이동했다.
- 흰 배경 서비스 톤에 맞춰 얇고 둥근 전용 스크롤바 클래스를 추가했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- Playwright: `http://localhost:3000/typing-service` 도움말 모달에서 내부 스크롤 영역과 thin scrollbar 스타일 확인
