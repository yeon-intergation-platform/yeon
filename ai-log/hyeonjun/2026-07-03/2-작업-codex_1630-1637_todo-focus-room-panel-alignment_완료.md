# Todo 집중 화면 패널 정렬 보정

## 목표

- 사용자가 준 스크린샷처럼 Todo 집중 화면 패널을 더 넓고 안정적인 카드 정렬로 맞춘다.
- 기능 로직은 유지하고 CSS 정렬만 보정한다.

## 작업 메모

- 대상: `apps/web/src/features/todo-service/todo-focus-room-screen.module.css`
- 데스크톱 스크린샷: `ai-log/hyeonjun/2026-07-03/todo-focus-room-alignment-desktop.png`
- 모바일 스크린샷: `ai-log/hyeonjun/2026-07-03/todo-focus-room-alignment-mobile.png`

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- Playwright: 데스크톱/모바일 패널 중앙 정렬, 외곽 버튼 정렬, 내부 컨트롤 기준선, 가로 overflow 없음 확인
