# SOLID/LSP 후속 22

## 목표

- 300개 SOLID/예외 백로그 항목 151~160을 완료한다.
- Spring repository의 native query 날짜/UUID/row 변환에서 직접 하위 타입 분기를 줄인다.

## 변경

- 카드 저장소 날짜 변환을 `NativeTimeValueReader` 목록으로 확장 가능한 구조로 바꿨다.
- 커뮤니티 채팅 저장소 row/time 변환을 `NativeQueryRow`와 `NativeTimeValueReader`로 분리했다.
- 인증 세션 저장소 row/UUID/time 변환을 `NativeQueryRow`, `NativeQueryValue`, `NativeValueReader`로 분리했다.
- row 컬럼 부족 오류 메시지에 필요한 컬럼 수, 실제 컬럼 수, 컬럼 위치를 포함했다.
- 백로그 항목 151~160을 완료 처리했다.

## 검증

- `cd apps/backend && ./gradlew test --tests '*CardDeck*'`
- `cd apps/backend && ./gradlew test --tests '*Community*'`
- `cd apps/backend && ./gradlew test --tests '*Auth*'`
- `git diff --check`
- 백로그 300개 유지 및 항목 151~160 완료, backend LSP 변환 경계 검증 스크립트
- 참고: 최초 병렬 Gradle 테스트는 같은 test-results 파일 경합으로 실패했으며, 동일 테스트를 순차 재실행해 통과했다.
