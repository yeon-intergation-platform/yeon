# Today 중복 카드 제거 작업 로그

## 목표

- `todo-service` 화면에서 날짜 이동 카드와 "지금 할 일" 패널을 제거한다.
- active 상태 task가 화면에서 사라지지 않도록 Today 컬럼에 포함한다.

## 범위

- `apps/web/src/features/todo-service/todo-service-screen.tsx`
- `docs/product/backlog/2026-07-02-todo-remove-redundant-cards.md`
- `ai-log/hyeonjun/2026-07-02/todo-remove-redundant-cards-screenshots/`

## 검증 계획

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts`
- `git diff --check`
- 변경 후 필요 시 `pnpm --filter @yeon/web build`

## 진행 상태

- 완료

## 변경 내용

- 날짜 이동 카드를 제거하고, 날짜 선택은 월간 전체보기 달력에서 처리하도록 화면 설명을 조정했다.
- "지금 할 일" 패널을 제거했다.
- `active` 상태의 task가 사라지지 않도록 Today 컬럼 데이터에 포함했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- Playwright 스크린샷 검증 통과
  - `before-todo-board-desktop.png`
  - `after-todo-board-desktop.png`
  - `before-todo-board-mobile.png`
  - `after-todo-board-mobile.png`
