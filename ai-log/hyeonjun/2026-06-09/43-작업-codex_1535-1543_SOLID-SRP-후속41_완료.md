# SOLID SRP 후속 41 — 모바일 카드 온보딩 게이트 상태 hook 분리

## 목표

- 백로그 196번(`card-onboarding-gate.tsx`)의 긴 함수 책임 분리 항목을 완료한다.
- 이메일/소셜 로그인/회원가입 브라우저 오픈 부수효과와 입력 상태를 전용 hook으로 분리한다.

## 제약

- 카드 서비스 web/mobile 패리티를 고려한다.
- 상담 워크스페이스 동결 영역은 건드리지 않는다.
- 변경 후 검증하고 main PR/merge까지 진행한다.

## 진행

- `yeon-2`에서 `origin/main` 기반 브랜치 `codex/solid-exception-followup-41` 생성.
- `use-card-onboarding-gate-state.ts`를 추가해 이메일 로그인 mutation, 소셜 로그인, 회원가입 브라우저 오픈, 입력/sheet 상태를 분리했다.
- `card-onboarding-gate.tsx`는 hook 결과를 섹션 컴포넌트에 연결하는 렌더링 조립 책임으로 축소했다.
- 백로그 196번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint` 통과.
- `CI=true pnpm --filter @yeon/mobile typecheck` 통과.
- `CI=true pnpm verify:parity` 통과.
- `git diff --check` 통과.
- 백로그 집계: 300개 중 완료 179개, 다음 미완료 197번.

## 결과

- 모바일 카드 온보딩 게이트 화면 파일은 62라인으로 축소됐다.
- 인증/회원가입 부수효과와 입력 상태 책임은 `useCardOnboardingGateState`가 담당한다.
