# 92. SOLID OCP 후속 87

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 285~286
- `apps/mobile/src/features/card-service/rooms/card-room-lobby-sections.tsx`

## 변경

- 카드룸 상태 라벨 판정을 `CARD_ROOM_STATUS_LABELS` 계약 상수 맵으로 분리했다.

## 검증

- 완료: `pnpm --filter @yeon/mobile lint`
- 완료: `pnpm --filter @yeon/mobile typecheck`
- 완료: `pnpm verify:parity`
- 완료: `git diff --check`
