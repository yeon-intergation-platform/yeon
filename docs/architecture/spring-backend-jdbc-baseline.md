# Spring Backend JDBC Baseline

`apps/backend`의 JDBC baseline은 **dev.local/staging/prod 서비스 profile**을 기준으로 관리한다.

## 목적

- DB 연결/driver/datasource 경계를 먼저 고정한다.
- JPA나 Flyway 없이도 datasource 연결 smoke를 볼 수 있게 한다.
- DB 없는 health-only default profile은 운영 혼선을 만들 수 있으므로 사용하지 않는다.

## 현재 선택

- starter: `spring-boot-starter-jdbc`
- driver: `org.postgresql:postgresql`
- 활성화 방식: 공통 datasource 설정을 사용하고, 환경 구분은 `dev.local` / `staging` / `prod` profile로 한다.
- env key:
  - `DATABASE_URL` 또는 `BACKEND_DATABASE_URL` (`postgresql://...`)
  - Spring 내부에서 JDBC URL로 변환한다.
  - 아래 `BACKEND_JDBC_DATABASE_*` 키는 테스트/레거시 호환용 fallback이다.
  - `BACKEND_JDBC_DATABASE_URL`
  - `BACKEND_JDBC_DATABASE_USERNAME` (선택)
  - `BACKEND_JDBC_DATABASE_PASSWORD` (선택)

## 이유

- 현재 Spring backend는 실제 서비스 API를 담당하므로 DB 없는 부팅 성공을 정상 상태로 보지 않는다.
- `dev.local`은 로컬 개발, `staging`은 스테이징 서버, `prod`는 운영 서버의 source of truth다.
- `pnpm dev:all`은 `dev.local` profile을 기본으로 주입한다.

## smoke 기준

- `SPRING_PROFILES_ACTIVE=dev.local`로 local bootRun
- `/actuator/health` 또는 `/actuator/health/db`에서 datasource 상태 확인
- 실패 시 원인을 DB 미기동 / URL 형식 / 인증 실패로 분리
