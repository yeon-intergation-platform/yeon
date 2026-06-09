# SOLID SRP 후속 57 — 카드방 로비 렌더 섹션 분리

## 목표

- 백로그 212번: `CardRoomLobbyScreen` 긴 함수의 렌더링 책임을 작은 섹션 컴포넌트로 분리한다.

## 진행

- card-service SSOT 확인 완료.
- nextjs-patterns wrapper 확인: `.claude/commands/nextjs-patterns.md`는 현재 worktree에 없어 적용 가능한 범위에서 클라이언트 컴포넌트 기준을 유지했다.
- 카드방 로비 hero, filter/search bar, list surface 상태, room card list, create dialog를 `card-room-lobby-parts.tsx`로 분리했다.

## 검증 예정

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 변경

- `CardRoomLobbyScreen`의 hero/list/dialog 렌더링을 `card-room-lobby-parts.tsx`로 이동했다.
- filter/search bar, loading/error/empty/ready list surface, room list item, create dialog를 작은 컴포넌트로 분리했다.
- 방 상태 라벨 계산을 `getCardRoomLobbyStatusLabel`로 분리했다.
- SOLID/예외 백로그 212번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 진행도 확인: 195/300 완료, 다음 순차 항목 213
