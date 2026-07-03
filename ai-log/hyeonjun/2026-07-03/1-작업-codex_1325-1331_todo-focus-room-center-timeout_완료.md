# Todo 집중 화면 중앙 타이머 정리

## 목표

- 마음저널 장식 카드와 히어로 문구를 제거한다.
- Todo 집중 타이머 패널을 화면 중앙에 둔다.
- 최소 집중 시간을 1분까지 허용하고 타임아웃 알림음을 추가한다.

## 작업 메모

- 대상: `apps/web/src/features/todo-service/todo-focus-room-screen.tsx`
- 대상: `apps/web/src/features/todo-service/todo-focus-room-screen.module.css`
- 사용하지 않는 `apps/web/public/mooddesk/src/assets/cards/*.png` 자산 제거
- 화면 확인 스크린샷: `ai-log/hyeonjun/2026-07-03/todo-focus-room-centered.png`

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts`
- `pnpm --filter @yeon/web build`
- Playwright: 삭제 대상 텍스트/이미지 0개, `min=1`, `step=1`, 1분 타임아웃 알림음 이벤트 확인, 중앙 배치 오차 0px
