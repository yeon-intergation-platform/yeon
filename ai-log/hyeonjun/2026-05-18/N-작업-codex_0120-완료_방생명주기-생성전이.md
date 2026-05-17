# 방 생명주기/생성 전이 안정화

## 증상
- 카드방은 만든 뒤 사용자가 나가도 그대로 존재한다.
- 타자방 생성 시 가끔 방으로 이동하지 않고 생성 모달이 열린 상태로 남는다.

## 목표
- 타자방/카드방 정리 로직 차이를 코드로 확인한다.
- 카드방 자동삭제와 타자방 생성 전이 잠재 레이스를 수정한다.

## 확인한 원인
- 타자방 자동 정리는 Spring 도메인 내부가 아니라 race-server `TypingRaceRoom`의 로비 생명주기에서 수행된다.
- 카드방은 race-server `CardRoom.onLeave`가 Spring 참가자 퇴장 API를 호출하지 않아 `left_at`이 남지 않았고, Spring 목록 조회는 `finished`가 아닌 방을 계속 노출했다.
- 타자방 생성 화면은 생성 중 프로필/캐릭터 상태 변경이 `useRaceRoom` 생성 의존성을 흔들 수 있었고, 성공 시 모달을 명시적으로 닫지 않았다.

## 변경
- 카드방 마지막 참가자 퇴장 시 Spring 방 상태를 `finished`로 전환해 로비 목록에서 제외한다.
- race-server 카드방 `onLeave`에서 Spring 퇴장 API를 호출하고, 연결 참가자가 0명이면 Colyseus 방을 private/disconnect 처리한다.
- 타자방 생성 시 참가자 식별자를 생성 요청 시점에 고정하고, 생성 성공 시 모달을 즉시 닫는다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.card_rooms.service.CardRoomServiceTests'`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/race-server lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
