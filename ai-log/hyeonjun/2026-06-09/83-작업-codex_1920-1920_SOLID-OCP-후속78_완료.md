# 83. SOLID OCP 후속 78

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 268-270
- `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java`

## 변경

- 방 상태 기반 guard를 `CardRoomStatePolicy`로 모았다.
- 호스트 승계 역할 재배정 가능 여부를 정책 메서드로 분리했다.
- 열린 방/진행 가능 방 검증을 정책 메서드로 분리했다.

## 검증

- `cd apps/backend && ./gradlew test --tests world.yeon.backend.card_rooms.service.CardRoomServiceTests`
- `git diff --check`
