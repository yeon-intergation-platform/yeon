# MoodDesk Study Desk 리팩터링 작업 로그

## 목표

- 첨부된 전역 코드 검증 원칙을 기준으로 Study Desk 코드를 리팩터링한다.
- 동작 보존, 최소 변경, 테스트 검증을 우선한다.
- 다른 에이전트 평가 95점 이상을 받을 때까지 반복한다.

## 근거

- `apps/web/src/features/focus-desk/focus-desk-screen.tsx`는 1,076라인으로, query 처리와 세션 상태, 덱 선택, 모드 선택, 실행 화면, 요약 화면을 모두 포함한다.
- 적용 원칙: SRP, SoC, 작은 함수, 테스트 가능성, 제한적 리팩터링, 회귀 방지.

## 범위

- `apps/web/src/features/focus-desk/**`
- `docs/product/backlog/2026-07-01-mooddesk-study-desk-refactor.md`

## 계획

- 포맷터를 순수 함수 파일로 분리한다.
- 화면 표시 섹션을 별도 컴포넌트 파일로 분리한다.
- `FocusDeskScreen`은 query, hook, 세션 상태 전이 orchestration만 담당하게 줄인다.
- 포맷터 테스트를 추가한다.

## 진행

- `focus-desk-format.ts`로 query text normalization과 시간 표시 함수를 분리했다.
- 시간 표시 함수의 음수·소수 보정은 의도된 표시 경계값 처리다. 세션 상태나 저장 정책은 바꾸지 않고, UI 문자열만 0 이상 정수 초 기준으로 안정화한다.
- `focus-desk-format.test.ts`를 추가해 공백 query, 음수/소수 시간, 한국어 경과 시간 표시 경계를 검증했다.
- `focus-desk-mode-options.ts`로 모드 label/description과 label lookup을 분리했다.
- `focus-desk-hero.tsx`, `focus-desk-timer-panel.tsx`, `focus-desk-sidebar.tsx`, `focus-desk-workspace.tsx`로 표시 섹션을 분리했다.
- `focus-desk-screen.tsx`는 1,076라인에서 298라인으로 줄이고, query 읽기, 데이터 hook, 세션 상태 전이, handler wiring만 맡게 했다.
- 1차 평가에서 지적된 timer nested ternary를 제거하고, 새 top-level 함수 반환 타입을 명시했다.
- 불필요한 같은 폴더 barrel인 `focus-desk-screen-sections.tsx`를 제거하고 직접 import로 바꿨다.

## 1차 외부 평가 반영

- code-simplifier 평가: 91/100, FAIL.
  - `focus-desk-timer-panel.tsx`의 nested ternary 제거 필요.
  - 새 top-level 함수 반환 타입 명시 필요.
  - 시간 포맷터의 경계 보정 의도 명확화 필요.
  - `focus-desk-screen-sections.tsx` barrel은 YAGNI 우려.
- verifier 평가: 90/100, PARTIAL.
  - 95점 이상 외부 평가 증거 없음.
  - Playwright console error 0 증거가 전역 community-chat 503 때문에 불명확.
- 반영:
  - timer 조건 렌더링을 `isRunning`/`showStartButton`으로 분리했다.
  - split 파일과 session helper의 top-level 함수 반환 타입을 명시했다.
  - 표시 전용 시간 보정을 backlog/log에 의도된 경계값 처리로 남겼다.
  - barrel 파일을 삭제했다.

## 재검증 결과

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm vitest run apps/web/src/features/focus-desk/focus-desk-session.test.ts apps/web/src/features/focus-desk/focus-desk-format.test.ts apps/web/src/lib/__tests__/platform-services.test.ts apps/web/src/lib/__tests__/study-desk-links.test.ts apps/web/src/features/card-service/hooks/use-card-mutations.test.ts` 통과. 5개 파일, 17개 테스트.
- `pnpm verify:parity` 통과.
- `git diff --check` 통과.
- Playwright smoke 재실행 통과: timer `25:00`, start disabled, todo title 표시, 1280px horizontal overflow 없음, 전체 console error 1건은 기존 `/api/v1/community-chat/messages` 503 noise, Study Desk 관련 relevant console error 0.

## 2차 외부 평가

- code-simplifier 재평가: 97/100, PASS. 남은 blocker 없음. `FocusDeskWorkspace` prop surface는 non-blocker로 판단.
- verifier 재평가: 96/100, PASS. 첨부 원칙 반영, SRP/SoC 리팩터링, 1차 지적 반영, 테스트/검증, Playwright smoke, 95점 이상 조건 모두 통과로 판단.

## 검증 결과

- `pnpm vitest run apps/web/src/features/focus-desk/focus-desk-session.test.ts apps/web/src/features/focus-desk/focus-desk-format.test.ts` 통과. 2개 파일, 8개 테스트.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm vitest run apps/web/src/features/focus-desk/focus-desk-session.test.ts apps/web/src/features/focus-desk/focus-desk-format.test.ts apps/web/src/lib/__tests__/platform-services.test.ts apps/web/src/lib/__tests__/study-desk-links.test.ts apps/web/src/features/card-service/hooks/use-card-mutations.test.ts` 통과. 5개 파일, 17개 테스트.
- `pnpm verify:parity` 통과.
- `git diff --check` 통과.
- Playwright smoke 통과: `/card-service/study-desk?minutes=25&mode=review&todoTaskId=refactor-smoke&todoTitle=Refactor%20Smoke`에서 timer `25:00`, start disabled, todo title 표시, 1280px horizontal overflow 없음, 관련 console error 0.

## 검증 예정

- `pnpm vitest run apps/web/src/features/focus-desk/focus-desk-session.test.ts apps/web/src/features/focus-desk/focus-desk-format.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm verify:parity`
- `git diff --check`
