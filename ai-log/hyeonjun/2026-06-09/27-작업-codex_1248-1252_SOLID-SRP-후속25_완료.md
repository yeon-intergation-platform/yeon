# SOLID/SRP 후속 25차 — CardRoomService 책임 분리

## 목표

- 300개 감사 항목 중 179를 처리한다.
- `CardRoomService`의 큰 파일/다중 책임 중 public id 생성과 참가자 토큰 응답 조립 책임을 별도 컴포넌트로 분리한다.

## 변경

- `CardRoomPublicIdService` 추가
  - 카드방 public id 생성과 unique 충돌 재시도 책임을 담당한다.
  - `DuplicateKeyException` 처리를 서비스 유스케이스 흐름 밖으로 이동했다.
- `CardRoomParticipantResponseFactory` 추가
  - 입장/참가자 갱신 응답의 participant token 조립 책임을 담당한다.
- `CardRoomService`
  - public id 생성/재시도와 participant token 직접 발급 의존을 제거했다.
- `CardRoomServiceTests`
  - 새 의존성 조합으로 fixture를 갱신했다.
- 백로그 항목 179를 완료 처리했다.

## 검증

- `cd apps/backend && ./gradlew test --tests '*CardRoom*'`
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'`

## 결과

- 카드방 서비스는 유스케이스 조율에 집중하고, id 생성/토큰 응답 조립은 확장 가능한 별도 Spring 컴포넌트로 분리됐다.
