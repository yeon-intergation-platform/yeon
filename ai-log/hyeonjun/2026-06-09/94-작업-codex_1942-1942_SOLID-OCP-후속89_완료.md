# 94. SOLID OCP 후속 89

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 288
- `apps/race-server/src/rooms/card-room-participant-token.ts`

## 변경

- 참가자 토큰 사용 가능 여부 판정을 `isUsableParticipantToken` type guard로 분리했다.

## 검증

- 완료: `pnpm --filter @yeon/race-server build`
- 완료: `pnpm --filter @yeon/web typecheck`
- 완료: `git diff --check`
