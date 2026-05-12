# Spring Backend Testcontainers Baseline

## 문서 목적

- `apps/backend`의 DB smoke를 로컬 개발자 DB 상태에서 분리한다.
- Spring backend의 repository/Flyway/JPA 검증을 **재현 가능한 컨테이너 기반 테스트**로 고정한다.

## 이번 baseline의 범위

- `spring-boot-testcontainers`
- `testcontainers-junit-jupiter`
- `testcontainers-postgresql`
- JPA repository smoke test 1건의 컨테이너 전환

## 이번 baseline에서 하지 않는 것

- Testcontainers를 production runtime에 사용하지 않는다.
- Docker Compose 기반 개발 DB를 대체하지 않는다.
- counseling/auth/spaces 같은 실제 업무 도메인 테스트는 아직 옮기지 않는다.
- CI 워크플로 변경은 이번 단계 범위에 포함하지 않는다.

## 채택 이유

- 기존 JPA smoke는 로컬 `apps/web/.env`의 DB URL 형식과 계정 분리에 의존했다.
- 이 방식은 사람마다 환경 차이가 커서 bootstrap lane의 재현성을 떨어뜨린다.
- Testcontainers PostgreSQL은 Flyway + JPA + repository round-trip을 한 번에 검증하기 좋다.

## baseline 설계

- 테스트는 `dev.local` profile을 사용한다.
- 운영/배포 datasource source of truth는 `DATABASE_URL`이다.
- Testcontainers는 호환 fallback인 `BACKEND_JDBC_DATABASE_*` 키로 값을 공급한다.
  차이는 값 공급 방식만 바꾼다.
  - 이전: 로컬 shell env
  - 이후: `PostgreSQLContainer` → `@DynamicPropertySource`

## 첫 smoke 대상

- `BootstrapHeartbeatRepositoryTests`
- 보장해야 하는 것:
  1. PostgreSQL container 기동
  2. Flyway `V1`, `V2` 적용
  3. JPA EntityManagerFactory 기동
  4. repository save/find 왕복 성공

## 검증 기준

- `cd apps/backend && ./gradlew test`
- 기대 결과:
  - 로컬 DB env 없이 통과
  - Testcontainers PostgreSQL이 자동 기동
  - JPA smoke 1건 성공

## 다음 단계로 넘기는 의미

- 이제 Spring backend의 persistence smoke는 “개발자 로컬 Postgres 우연히 살아있음”이 아니라
  “테스트가 필요한 DB를 스스로 띄우고 검증함” 기준으로 올라간다.
