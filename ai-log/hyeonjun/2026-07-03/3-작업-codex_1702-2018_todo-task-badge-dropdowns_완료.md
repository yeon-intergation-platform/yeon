# Todo 할 일 카드 뱃지 드롭다운 편집

## 목표

- 할 일 카드의 `높음`, `1시간` 뱃지를 클릭해 우선순위와 예상 시간을 바로 바꾸게 한다.
- 변경값은 Todo task 원본 상태에 저장한다.

## 작업 메모

- 대상: `apps/web/src/features/todo-service/todo-service-model.ts`
- 대상: `apps/web/src/features/todo-service/todo-service-screen.tsx`
- 대상: `apps/web/src/features/todo-service/todo-service-model.test.ts`
- 할 일 카드의 우선순위/예상 시간 뱃지를 native select 기반 드롭다운으로 변경했다.
- 변경값은 원본 task의 `priority`, `estimate`, `updatedAt`에 저장한다.
- 스크린샷: `ai-log/hyeonjun/2026-07-03/todo-task-badge-dropdowns.png`

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts`
- Playwright 수동 검증: 옵션 `높음/보통/낮음`, `15분/30분/1시간/2시간+` 확인 및 localStorage 원본 task 저장 확인
- `git diff --check`
