# 82. SOLID OCP 후속 77

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 259-267
- `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java`

## 변경

- 참가자 갱신 잠금 필드 판정을 `ParticipantUpdateChange`로 분리했다.
- 카드방 시작 상태/역할 guard를 `requireStartAllowed`, `requireStartRolesAssigned`, `CardRoomRoleCoverage`로 분리했다.
- reveal/next/submitResult의 IN_PROGRESS 검증을 `requireRoomInProgress`로 통일했다.
- 결과 제출자 역할 검증을 `requireResultSubmitterRole`로 분리했다.

## 검증

- `cd apps/backend && ./gradlew test --tests world.yeon.backend.card_rooms.service.CardRoomServiceTests`
- `git diff --check`
