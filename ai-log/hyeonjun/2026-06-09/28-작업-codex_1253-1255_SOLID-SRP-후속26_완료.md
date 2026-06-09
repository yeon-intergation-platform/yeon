# SOLID/SRP 후속 26차 — AuthSessionRepository row mapper 분리

## 목표

- 300개 감사 항목 중 180을 처리한다.
- `AuthSessionRepository`의 SQL 실행 책임과 native query row 매핑 책임을 분리한다.

## 변경

- `AuthSessionRowMapper` 추가
  - `SessionRow`, `UserRow`, `IdentityRow` 조립을 담당한다.
  - 공용 `NativeQueryRow`를 사용해 컬럼 변환 책임을 mapper로 집중시킨다.
- `AuthSessionRepository`
  - 하단 private `toSessionRow`/`toUserRow`/`toIdentityRow`를 제거했다.
  - 조회 결과 매핑을 `rowMapper`에 위임했다.
- 백로그 항목 180을 완료 처리했다.

## 검증

- `cd apps/backend && ./gradlew test --tests '*Auth*'`
- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'`

## 결과

- 인증 저장소는 DB 접근과 SQL 실행에 집중하고, row 변환은 별도 Spring 컴포넌트로 확장 가능하게 분리됐다.
