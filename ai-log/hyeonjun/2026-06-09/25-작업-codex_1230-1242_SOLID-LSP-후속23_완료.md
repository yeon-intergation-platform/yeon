# SOLID/LSP 후속 23차 — native query 변환 어댑터 공용화

## 목표

- 300개 감사 항목 중 161~174를 처리한다.
- 인증/타자 저장소에 흩어진 native query row/value 타입 분기를 공용 어댑터로 모아 LSP 위반 가능성과 중복 변환 책임을 줄인다.

## 변경

- `world.yeon.backend.common.repository.NativeQueryRow` 추가
  - native query 결과를 컬럼 label이 있는 row 객체로 감싼다.
  - 컬럼 수 부족 시 필요한/실제 컬럼 수를 포함한 예외 메시지를 낸다.
- `NativeQueryValue`, `NativeValueReader` 추가
  - UUID, 숫자, 시간 타입 변환을 저장소별 `instanceof` 분기 대신 공용 reader 목록으로 처리한다.
- `AuthSessionRepository`
  - 내부 private native row/value reader를 제거하고 공용 어댑터에 의존한다.
- `TypingDeckRepository`
  - `toValues`, `asLong`, `asInt`, `asOffsetDateTime` private 변환 분기를 제거하고 공용 어댑터를 사용한다.
- 백로그 항목 161~174를 완료로 표시하고 23차 적용 완료 섹션을 추가했다.

## 검증

- `cd apps/backend && ./gradlew test --tests '*TypingDeck*'`
- `cd apps/backend && ./gradlew test --tests '*Auth*'`

## 결과

- 인증/타자 저장소가 native query 결과의 실제 하위 타입을 직접 검사하지 않고 공용 row/value 인터페이스에 의존한다.
- 잘못된 native row shape는 더 구체적인 메시지로 빠르게 실패한다.
