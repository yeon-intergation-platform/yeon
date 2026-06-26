# 2 작업 codex code-principle-refactor 55 batch 2 완료

## 목표

- 카드방 lobby/status/role 중복 정책을 shared SSOT로 이동해 21~24번 원칙 위반을 닫는다.

## 변경

- `packages/race-shared/src/card-room.ts`에 lobby filter, search, room end 가능 조건, participant role count 정책을 추가.
- web/mobile 카드방 lobby filter가 shared `filterCardRoomLobbyRooms`를 사용하도록 변경.
- web 카드방 header의 종료 가능 조건과 waiting 판정을 shared 정책으로 변경.
- web 카드방 study panel의 role count 중복 filter를 shared helper로 변경.

## 검증

- `pnpm --filter @yeon/race-shared test -- card-room.test.ts`
- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/race-shared lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/mobile lint`

## 결과

- 완료 태스크: 21~24
- 누적 완료: 16/55
- 상태: 완료.
