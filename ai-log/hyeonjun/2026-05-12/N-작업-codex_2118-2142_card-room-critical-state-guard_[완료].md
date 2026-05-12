# 카드방 critical 상태 오염 방지 작업 로그

## 목표

- `origin/main` 기준 critical 코드리뷰에서 확인한 카드방 상태 오염 가능성만 최소 수정한다.

## 리뷰 결과

1. `CardRoomService`가 action 요청의 `participantId`가 해당 `roomId` 소속인지 확인하지 않아, 다른 방 참가자 ID로 메시지/결과/다음 카드/공개/역할 변경을 수행할 수 있다.
2. `useCardRoomProfile`이 localStorage profile/guestId 로드 전 기본값을 반환하고, `CardRoomScreen` join effect가 먼저 실행될 수 있어 잘못된 참가자 또는 중복 참가자가 남을 수 있다.

## 수정 범위

- `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java`
- `apps/web/src/features/card-service/hooks/use-card-room-profile.ts`
- `apps/web/src/features/card-service/card-room-screen.tsx`
- `apps/web/src/features/card-service/card-room-create-screen.tsx`

## 검증 예정

- backend 관련 test 또는 컴파일
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`

## 검증 결과

- `./gradlew test --tests 'world.yeon.backend.card_rooms.service.CardRoomServiceTests'` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과

## 완료 상태

- Spring 카드방 action에서 참가자-방 소속 불일치 시 403으로 차단한다.
- 웹 카드방 입장/생성은 localStorage profile/guestId 로드 후에만 요청한다.
