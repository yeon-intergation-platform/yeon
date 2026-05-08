# Spring Backend JDBC Baseline

`apps/backend`의 JDBC baseline은 기본 profile을 깨지 않도록 **`jdbc` profile 분리 방식**으로 시작한다.

## 목적
- DB 연결/driver/datasource 경계를 먼저 고정한다.
- JPA나 Flyway 없이도 datasource 연결 smoke를 볼 수 있게 한다.
- 기본 profile bootRun이 DB 부재 때문에 깨지지 않도록 유지한다.

## 현재 선택
- starter: `spring-boot-starter-jdbc`
- driver: `org.postgresql:postgresql`
- 활성화 방식: `jdbc` profile에서만 datasource 설정 적용
- env key:
  - `BACKEND_JDBC_DATABASE_URL`
  - `BACKEND_JDBC_DATABASE_USERNAME` (선택)
  - `BACKEND_JDBC_DATABASE_PASSWORD` (선택)

## 이유
- 기본 profile에 datasource를 바로 강제하면 local/dev 환경에서 앱 자체가 부팅 실패할 수 있다.
- 현재 단계에서는 DB 연결 실패와 app 구조 실패를 분리해야 한다.
- profile 분리로 기본 bootRun 성공 증거를 유지하면서 jdbc smoke를 독립 확인할 수 있다.

## smoke 기준
- `SPRING_PROFILES_ACTIVE=jdbc`로 bootRun
- `/actuator/health` 또는 `/actuator/health/db`에서 datasource 상태 확인
- 실패 시 원인을 DB 미기동 / URL 형식 / 인증 실패로 분리
