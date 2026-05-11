# 타자방 room not found / random seed 작업 로그

- 요청:
  - 타자방 생성 후 몇 초 뒤 `room "..." not found` 로그와 함께 터지는 문제 해결.
  - 매번 타자 시작 문장이 같지 않도록 게임 시작마다 덱 문장을 무작위로 섞기.
- 계획:
  - race-server lobby room host leave/disconnect 정책 확인.
  - create room seed를 단일 seed에서 seed 후보 목록으로 확장하되, 모든 참가자 동일 seed 불변 유지.
  - 기존 BGM 표시명 변경은 같은 PR에 포함.

## 진행

- `apps/race-server/src/rooms/typing-race-room.ts`
  - 로비 방은 `autoDispose=false`로 두고, 빈 로비가 되면 10초 유예 후 종료하도록 변경.
  - 방장 이탈 시 참여자가 남아 있으면 다음 참여자에게 방장을 이전하고 즉시 방을 닫지 않음.
  - `ROOM_START` 메시지에 시작 직전 raceSeed를 받을 수 있게 하여 시작마다 새 문장을 브로드캐스트.
- `packages/race-shared/src/typing-race.ts`
  - `RoomStartMessage` 추가.
- `apps/web/src/features/typing-service/use-race-room.ts`, `typing-room-screen.tsx`
  - 방장이 시작 버튼을 누를 때 선택 덱에서 새 race seed를 resolve한 뒤 `ROOM_START`로 전송.
- 검증:
  - `pnpm --filter @yeon/race-shared typecheck` 성공.
  - `pnpm --filter @yeon/race-server typecheck` 성공.
  - `pnpm --filter @yeon/web typecheck` 성공.
