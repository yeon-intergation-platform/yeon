# Spring Backend JPA Baseline

`apps/backend`의 JPA baseline은 **전용 schema(`yeon_backend`) 안의 dummy entity/repository smoke**로 시작한다.

## 목적
- JPA/Hibernate가 현재 boot/runtime/flyway/jdbc 조합에서 정상 동작하는지 먼저 검증한다.
- 실제 업무 aggregate 이전 전에 repository 표준선을 확보한다.

## 현재 선택
- dependency: `spring-boot-starter-data-jpa`
- dummy entity: `BootstrapHeartbeat`
- repository: `BootstrapHeartbeatRepository`
- schema: `yeon_backend`
- migration: `V2__create_bootstrap_heartbeat.sql`

## 이유
- 실제 업무 도메인을 바로 옮기면 schema ownership과 domain boundary가 섞인다.
- 작은 entity 1개로 JPA startup / DDL 정합성 / repository save/find 흐름을 먼저 증명하는 편이 안전하다.

## 현재 규칙
- JPA 첫 smoke는 `yeon_backend` 전용 schema 안에서만 수행한다.
- 실제 business aggregate 이전은 이후 파일럿 선정 뒤에 시작한다.
- 첫 JPA bundle에서 복수 aggregate를 동시에 도입하지 않는다.
