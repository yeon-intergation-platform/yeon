# 카드방 잔존 데이터 정리

## 요청
- 과거에 남은 카드방을 정리하고, 앞으로도 빈 카드방이 계속 남지 않게 후속 처리한다.

## 목표
- Spring 카드방 상태 원천에서 빈 방을 닫는다.
- 주기 cleanup과 테스트를 추가한다.

## 변경
- Spring 스케줄링을 활성화하고 카드방 잔존 정리 스케줄러를 추가했다.
- 활성 참가자가 0명인 방과 TTL보다 오래 갱신되지 않은 미완료 방을 `finished`로 전환한다.
- 기본 TTL은 `PT6H`, 기본 주기는 15분이며 `yeon.card-rooms.cleanup.*` 설정으로 조정 가능하다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.card_rooms.service.CardRoomServiceTests'`
- `git diff --check`
