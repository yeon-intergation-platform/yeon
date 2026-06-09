# SOLID SRP 후속 56 — 카드방 로비 상태 훅 분리

## 목표

- 백로그 211번: `CardRoomLobbyScreen`의 데이터/폼/이벤트 hook 책임을 분리한다.

## 진행

- card-service SSOT 확인 완료.
- nextjs-patterns wrapper 확인: `.claude/commands/nextjs-patterns.md`는 현재 worktree에 없어 적용 가능한 범위에서 클라이언트 컴포넌트 기준을 유지했다.
- 카드방 로비의 필터/검색/모달/프로필/목록 query/파생 list state를 `use-card-room-lobby-state.ts`로 분리했다.

## 검증 예정

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 변경

- `CardRoomLobbyScreen`에서 filter/search/modal/profile/settings/list query hook 호출을 제거하고 `useCardRoomLobbyState`로 모았다.
- 검색 필터링과 loading/error/empty/ready list state 파생을 훅 내부 함수로 분리했다.
- JSX에서 query loading/error를 직접 참조하지 않도록 `listState`를 노출했다.
- SOLID/예외 백로그 211번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 진행도 확인: 194/300 완료, 다음 순차 항목 212
