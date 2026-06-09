# SOLID SRP 후속 38 — 모바일 카드 학습 화면 책임 분리

## 목표

- 백로그 192번(`card-deck-play-screen.tsx`)의 큰 파일 책임 분리 항목을 완료한다.
- 화면 파일에서 학습 모드 렌더링과 입력 검증 helper 책임을 분리해 SRP 위반 가능성을 줄인다.

## 제약

- 카드 서비스 web/mobile 패리티를 고려한다.
- 상담 워크스페이스 동결 영역은 건드리지 않는다.
- 변경 후 검증하고 main PR/merge까지 진행한다.

## 진행

- 현재 상태 확인 및 대상 파일 구조 확인 완료.
- `card-deck-play-helpers.ts`를 추가해 operation 상수, 입력 예외, deckId 검증, 모드 배지 책임을 분리했다.
- `card-deck-play-mode-panels.tsx`를 추가해 segmented control, 복습 패널, 플래시카드 패널 렌더링 책임을 분리했다.
- 백로그 192번 완료 표시를 갱신했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint` 통과.
- `CI=true pnpm --filter @yeon/mobile typecheck` 통과.
- `CI=true pnpm verify:parity` 통과.
- `git diff --check` 통과.
- 백로그 집계: 300개 중 완료 175개, 다음 미완료 193번.

## 결과

- 모바일 카드 학습 화면 파일은 333라인으로 축소됐다.
- helper와 복습/플래시카드 패널 렌더링이 분리되어 화면 컴포넌트는 세션/query/mutation 상태 조정에 더 집중한다.
