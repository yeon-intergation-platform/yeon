# typing room lifecycle grace 완료

## 목표

타자방 자동 삭제 정책에서 명시적 나가기와 일시적 disconnect를 분리한다.

## 범위

- `packages/race-shared/src/typing-race.ts`
- `apps/race-server/src/rooms/typing-race-room.ts`
- `apps/web/src/features/typing-service/use-race-room.ts`
- `apps/web/src/features/typing-service/use-typing-room-lobby.ts`
- `apps/web/src/features/typing-service/typing-room-screen.tsx`
- `apps/web/src/features/typing-service/typing-room-labels.ts`

## 구현 결과

- 공유 프로토콜에 `TYPING_ROOM_LIFECYCLE`와 `ROOM_LEAVE` 이벤트를 추가했다.
- race-server lobby room은 `ACTIVE` / `EMPTY_GRACE` / `CLOSED` lifecycle을 metadata와 snapshot에 포함한다.
- `ROOM_LEAVE`는 explicit leave로 처리하고 마지막 참가자가 나가면 즉시 closed/disconnect한다.
- 일반 React cleanup/브라우저 disconnect는 `room.leave(false)`로 보내고, 서버는 30초 participant cleanup timer 동안 `EMPTY_GRACE`로 숨겨 둔다.
- 같은 `playerId`가 grace 안에 같은 `roomId`로 돌아오면 cleanup timer를 해제하고 `ACTIVE`로 복구한다.
- 로비 목록은 `ACTIVE`이고 연결 참가자 수가 1명 이상인 공개 대기방만 보여준다.

## 검증 결과

- `pnpm --filter @yeon/race-shared typecheck` 통과
- `pnpm --filter @yeon/race-server typecheck` 통과
- `pnpm --filter @yeon/race-server build` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `pnpm --filter @yeon/race-server lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
