# SOLID SRP 후속 48 — 모바일 카드방 연결 훅 책임 분리

## 목표

- 백로그 203번: `useCardRoomConnection`의 연결 오류 정규화, Colyseus 세션 effect, room send 액션 생성을 작은 책임으로 분리한다.
- 공개 hook 표면은 유지해 기존 화면 동작을 바꾸지 않는다.

## 진행

- 작업 워크트리 `yeon-4`를 `origin/main` 기준 `codex/solid-exception-followup-48`로 초기화했다.
- 카드 서비스 SSOT(`docs/agent-rules/card-service.md`)를 확인했다.

## 변경

- `card-room-connection-errors.ts`를 추가해 네트워크 오류 패턴과 사용자 메시지 정규화를 분리했다.
- `use-card-room-realtime-session.ts`를 추가해 Colyseus join, state/error message 구독, leave cleanup을 전담하게 했다.
- `use-card-room-connection-actions.ts`를 추가해 roomRef 기반 send 액션 생성을 전담하게 했다.
- `useCardRoomConnection`은 세션 hook과 액션 hook을 조립해 기존 반환 표면을 유지한다.
- 백로그 203번을 완료 처리했다.

## 검증

- 진행률 스크립트: 300개 중 186개 완료, 다음 연속 후속 항목 204번.
- 라인 수: `use-card-room-connection.ts` 38라인, `card-room-connection-errors.ts` 18라인, `use-card-room-realtime-session.ts` 112라인, `use-card-room-connection-actions.ts` 79라인.
- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
