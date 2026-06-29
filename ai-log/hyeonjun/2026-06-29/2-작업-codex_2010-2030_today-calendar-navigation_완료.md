# Today 날짜 이동과 달력 전체보기 작업 로그

## 목표

- `todo.yeon.world` Today 서비스에 날짜별 이동을 추가한다.
- 월간 달력에서 전체 일정을 확인하고 날짜를 선택할 수 있게 한다.

## 범위

- `apps/web/src/features/todo-service/todo-service-model.ts`
- `apps/web/src/features/todo-service/todo-service-screen.tsx`
- `apps/web/src/features/todo-service/todo-service-model.test.ts`
- 로컬 Playwright smoke와 스크린샷

## 설계 판단

- 실제 오늘 날짜(`actualToday`)와 화면 선택 날짜(`selectedDate`)를 분리한다.
- 기존 localStorage 구조는 유지하고, 이미 있는 `plannedFor`/`completedOn` 필드를 날짜별 source of truth로 쓴다.
- Spring API/DB/알림/반복 일정은 이번 차수에서 제외한다.
- 디자인은 기존 Today 화면의 흰 배경, restrained productivity UI를 유지하고 달력만 compact하게 추가한다.

## 검증 계획

- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- Playwright로 `/todo-service`에서 날짜 이동, 달력 선택, 다른 날짜 할 일 추가/완료 확인

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- `pnpm --filter @yeon/web build` 통과
- Playwright smoke 통과: 2026-06-29에서 2026-06-30으로 이동, 선택 날짜 할 일 추가, 완료 처리, 달력 남은 일/완료 카운트 확인

## 화면 증거

- `ai-log/hyeonjun/2026-06-29/today-calendar-navigation-screenshots/desktop-date-navigation-calendar.png`
- `ai-log/hyeonjun/2026-06-29/today-calendar-navigation-screenshots/desktop-today-after-return.png`
- `ai-log/hyeonjun/2026-06-29/today-calendar-navigation-screenshots/mobile-calendar-overview.png`

## 완료 조건

- 날짜 이동과 달력 전체보기가 모두 동작한다.
- main PR merge와 운영 배포 후 `https://todo.yeon.world`에서 확인한다.
