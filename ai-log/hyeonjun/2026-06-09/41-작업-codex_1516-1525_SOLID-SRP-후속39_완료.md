# SOLID SRP 후속 39 — 모바일 카드 학습 화면 hook 책임 분리

## 목표

- 백로그 193번(`card-deck-play-screen.tsx`)의 컴포넌트 hook 책임 분리 항목을 완료한다.
- 화면 컴포넌트 인근의 세션/query/mutation/학습 상태 hook들을 전용 hook으로 분리해 화면 렌더링 책임과 상태 조정 책임을 나눈다.

## 제약

- 카드 서비스 web/mobile 패리티를 고려한다.
- 상담 워크스페이스 동결 영역은 건드리지 않는다.
- 변경 후 검증하고 main PR/merge까지 진행한다.

## 진행

- `yeon-2`에서 `origin/main` 기반 브랜치 `codex/solid-exception-followup-39` 생성.
- `use-card-deck-play-state.ts`를 추가해 세션 부팅, 상세 query, repository/mutation, 학습 이동/복습 이벤트 상태를 전용 hook으로 분리했다.
- `card-deck-play-screen.tsx`는 router와 `useCardDeckPlayState` 결과를 조합하는 렌더링 책임 중심으로 축소했다.
- 백로그 193번과 194번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint` 통과.
- `CI=true pnpm --filter @yeon/mobile typecheck` 통과.
- `CI=true pnpm verify:parity` 통과.
- `git diff --check` 통과.
- 백로그 집계: 300개 중 완료 177개, 다음 미완료 195번.

## 결과

- 모바일 카드 학습 화면 파일은 126라인으로 축소됐다.
- 세션/query/mutation/이벤트 상태 책임은 `useCardDeckPlayState`가 담당한다.
