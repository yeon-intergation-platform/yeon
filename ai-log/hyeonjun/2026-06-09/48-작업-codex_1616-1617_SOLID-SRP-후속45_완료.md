# SOLID SRP 후속 45 — 모바일 카드방 로비 화면 책임 분리

## 목표

- 백로그 200번: `CardRoomLobbyScreen`의 필터/검색/목록 파생/라우팅/카드 UI/스타일 책임을 작은 hook/section/style 파일로 분리한다.

## 진행

- 작업 워크트리 `yeon-4`를 `origin/main` 기준 `codex/solid-exception-followup-45`로 초기화했다.
- 대상 파일 `apps/mobile/src/features/card-service/rooms/card-room-lobby-screen.tsx` 확인 완료.

## 변경

- `CardRoomLobbyScreen`의 query/filter/search/create/openRoom 상태를 `useCardRoomLobbyState`로 이동했다.
- 헤더, 필터 칩, 검색 필드, 목록 상태, 방 카드 UI를 `card-room-lobby-sections.tsx`로 분리했다.
- 스타일과 route helper를 각각 `card-room-lobby-styles.ts`, `card-room-lobby-route.ts`로 분리했다.
- 백로그 200번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 진행률 스크립트: 300개 중 183개 완료, 다음 미완료 201번.
- 라인 수: `card-room-lobby-screen.tsx` 52라인, state 92라인, sections 186라인, styles 101라인, route 9라인.
