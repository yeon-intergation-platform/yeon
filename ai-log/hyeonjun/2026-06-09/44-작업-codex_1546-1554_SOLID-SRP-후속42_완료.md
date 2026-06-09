# SOLID SRP 후속 42 — 모바일 카드 세션 Provider 상태 hook 분리

## 목표

- 백로그 197번(`card-session-context.tsx`)의 긴 함수 책임 분리 항목을 완료한다.
- 세션 boot/authenticate/guest/logout 상태 전이와 부수효과를 전용 hook으로 분리한다.

## 제약

- 카드 서비스 web/mobile 패리티를 고려한다.
- 상담 워크스페이스 동결 영역은 건드리지 않는다.
- 변경 후 검증하고 main PR/merge까지 진행한다.

## 진행

- `yeon-4`에서 `origin/main` 기반 브랜치 `codex/solid-exception-followup-42` 생성.
- `use-card-session-state.ts`를 추가해 세션 boot/authenticate/guest/logout 상태 전이와 query/cache/storage 부수효과를 분리했다.
- `card-session-context.tsx`는 Context 생성, 접근 가드, Provider 연결 책임만 갖도록 축소했다.
- 백로그 197번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint` 통과.
- `CI=true pnpm --filter @yeon/mobile typecheck` 통과.
- `CI=true pnpm verify:parity` 통과.
- `git diff --check` 통과.
- 백로그 집계: 300개 중 완료 180개, 다음 미완료 198번.

## 결과

- 모바일 카드 세션 Context 파일은 36라인으로 축소됐다.
- 세션 상태 전이와 부수효과 책임은 `useCardSessionState`가 담당한다.
