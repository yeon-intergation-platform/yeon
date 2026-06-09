# 95. SOLID OCP 후속 90

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 289
- `apps/race-server/src/rooms/card-room.ts`

## 변경

- WebRTC SDP 입력 검증을 공용 `isNonEmptyString` type guard로 통일했다.

## 검증

- 완료: `pnpm --filter @yeon/race-server build`
- 완료: `pnpm --filter @yeon/web typecheck`
- 완료: `git diff --check`
