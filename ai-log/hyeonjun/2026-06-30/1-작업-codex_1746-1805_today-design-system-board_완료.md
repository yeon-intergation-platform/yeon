# Today 디자인 시스템 보드 개편 작업 로그

## 목표

- `todo.yeon.world` Today 화면을 스크린샷형 작업 보드로 개편한다.
- 새 색상을 임의로 추가하지 않고 Yeon 흰 배경 서비스 디자인 시스템 정규 색만 사용한다.

## 범위

- `apps/web/src/features/todo-service/todo-service-screen.tsx`
- `apps/web/src/features/todo-service/todo-service-model.ts`
- `apps/web/src/features/todo-service/todo-service-model.test.ts`
- 로컬 Playwright smoke와 스크린샷

## 설계 판단

- 저장 모델은 유지하고 추천/필터는 파생 UI로 계산한다.
- 기존 날짜 이동과 월간 달력 기능은 유지한다.
- 색상은 `bg-white`, `#111`, `#666`, `#aaa`, `#e5e5e5`, `#fafafa`, 검정 CTA만 사용한다.

## 검증 계획

- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- Playwright로 `/todo-service`에서 입력/필터/추천/날짜 달력/컬럼 동작 확인

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- `pnpm --filter @yeon/web build` 통과
- Playwright smoke 통과: 추천 영역, 우선순위 필터, task 시작 CTA, 낮은 우선순위 미루기 추천, 월간 달력 확인
- 색상 스캔 통과: todo 화면 신규 직접 hex는 `#111`, `#666`, `#aaa`, `#e5e5e5`, `#fafafa`만 사용

## 화면 증거

- before desktop: `ai-log/hyeonjun/2026-06-30/today-design-system-board-screenshots/before-todo-board-desktop.png`
- before mobile: `ai-log/hyeonjun/2026-06-30/today-design-system-board-screenshots/before-todo-board-mobile.png`
- after desktop: `ai-log/hyeonjun/2026-06-30/today-design-system-board-screenshots/after-todo-board-desktop.png`
- after mobile: `ai-log/hyeonjun/2026-06-30/today-design-system-board-screenshots/after-todo-board-mobile.png`

## 완료 조건

- 스크린샷의 핵심 보드 구성이 실제 화면에 반영된다.
- 디자인 시스템 정규 색상 범위를 넘는 신규 색상이 없다.
- main PR merge와 운영 배포 워크플로 확인까지 완료한다.
