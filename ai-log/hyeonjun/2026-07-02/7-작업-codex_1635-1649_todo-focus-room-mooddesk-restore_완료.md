# Todo 집중 화면 MoodDesk 감성 복구

## 목표

- Todo 보드의 생성 기본값/필터 혼선을 제거한다.
- Today 카드에서 바로 집중 화면을 시작할 수 있게 한다.
- 삭제 전 MoodDesk 화면 자산을 Todo 집중 화면으로 복구한다.

## 범위

- `apps/web/src/features/todo-service`
- `apps/web/src/app/todo-service/focus`
- `apps/web/public/mooddesk/src/assets`

## 검증 예정

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- Todo 관련 단위 테스트 또는 웹 테스트
- Playwright 시각 확인

## 완료 내용

- 우선순위 드롭다운과 우선순위/예상 시간 필터 로직을 제거했다.
- 우선순위/예상 시간 버튼은 새 할 일 생성 기본값으로만 동작하게 했다.
- 추천 카드와 Today 카드의 시작 버튼을 Todo 집중 화면 이동으로 연결했다.
- 아이콘 버튼 hover/focus 툴팁을 추가했다.
- `/todo-service/focus` 화면을 추가하고 삭제 전 MoodDesk 영상/카드 자산을 Todo 집중 화면에 복구했다.
- focus 화면에서 시간 설정, 시작/정지, 리셋, 뒤로가기, 작업 완료 처리를 지원한다.

## 검증 결과

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts` 통과
- `git diff --check` 통과
- `pnpm --filter @yeon/web build` 통과
- Playwright 흐름 검증 통과: 기본값 버튼 비필터 동작, 아이콘 툴팁, 시작 화면 이동, MoodDesk 영상 자산 로드, 작업 완료 후 Done 저장 확인

## 스크린샷

- `ai-log/hyeonjun/2026-07-02/todo-home-after-default-setting.png`
- `ai-log/hyeonjun/2026-07-02/todo-icon-tooltip.png`
- `ai-log/hyeonjun/2026-07-02/todo-focus-room.png`
- `ai-log/hyeonjun/2026-07-02/todo-after-focus-complete.png`
